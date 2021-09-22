var statusConnection			=	require('../config/database');
var fileSystem					=	require('fs');
// var sharp						=	require('sharp');
var statusPath					=	'public/Images/status/';
var tempImagePath				=	'public/Images/temp_Images/'

// This function will get all category details from category collection and send it to status page
exports.status 					=	function(req,res,next){
	if(req.session.email){
		res.locals.userRole = req.session.role;
		var languageQuery	= 'SELECT langId , langDisplayName from language WHERE isDelete=1';
		var statusQuery		= 'SELECT category.catName , status.staId,status.staType,status.staMessage,status.staImage,status.staVideo,status.staStatus,status.catId,status.langId from category INNER JOIN status ON category.catId = status.catId WHERE status.isDelete=1';

		statusConnection.query(languageQuery,function(error,allLanguage){
			if(error){
				console.log('statusRoute |  Error in getting language details for status page'+	error);
			}else{
				statusConnection.query(statusQuery,function(error,statusDetails){
					if(error){
						console.log('statusRoute | Error in getting status details'+ error);
					}else{
						res.render('status',{page:'Status',menuId:'status',allLanguage:allLanguage,statusDetails:statusDetails,message:req.flash()});
					}
				});			
			}		
		});
	}else{
		res.redirect('/');
	}	
}
// This function will add status details in status collection
exports.addStatus				=		function(req,res,next){
	// var insertArray		=	[];
	var insertQuery 	=   {
		staType				: 	req.body.drpStatusType,	
	 	staMessage			: 	req.body.txtMessage,
		staColor			: 	req.body.txtColorCode,
		staStatus			: 	req.body.rdbStatus,
		catId 				: 	req.body.drpCategory,
		langId 				:   req.body.drpLanguage,
		staCreationDate 	: 	new Date()
	};
	var query 				= 'insert into status SET ?';
	var updateStatusCount	= 'UPDATE language , category set language.statusCount = language.statusCount + 1,category.statusCount= category.statusCount + 1 where language.langId='+ insertQuery.langId +' AND category.catId='+insertQuery.catId;
	// This function will add status
	function addStatus(){
		statusConnection.query(query,insertQuery,function(error,success){
			if(error){
				console.log('statusRoute |  Error in adding status details'+ error);
				req.flash('error', 'Error While Adding Status');
		      	res.redirect('/status');
			}else{
				statusConnection.query(updateStatusCount,function(error,success){
					if(error){
						console.log('statusRoute |  Error in adding status details'+ error);
						req.flash('error', 'Error While Adding Status');
				      	res.redirect('/status');
				    }else{
						req.flash('success', 'Status Added Successfully');
						res.redirect('/status');
				    }
				});
			}
		});
	}
	// checks weather image is uploaded or not
	if (insertQuery.staType==1) {
		// Generate random number and add it with jpg 
		var fixImageName 		= 'FixImages/'+ (Math.floor(Math.random() * 5) + 1) + '.jpg';
		insertQuery.staImage 	=  fixImageName;
		addStatus();// It will add status without status Image
  	}else{
  		// condition will excecute when user uploads video file
  		if(insertQuery.staType==3){
  			if(checkFileType(req,res,insertQuery.staType)){
  				var staVideoName	= 'video/'+ new Date().getTime() +'_'+ req.files.txtVideo.name;
				req.files.txtVideo.mv(statusPath+staVideoName, function(error,success) {
				    if (error){
				      	console.log('statusRoute |  Error In Uploading Status Image'+ error);
				      	req.flash('error', 'Error While Uploading Status Image');
				      	res.redirect('/status');
				    }else{			    	
						insertQuery.staColor	=	"";
				    	insertQuery.staVideo 	=	staVideoName;
				    	addStatus();
				    }
				});
  			}
  		}else{
  			// condition will excecute when user uploads image file
	  		if(checkFileType(req,res,insertQuery.staType)){
	  			var staImageName	=	new Date().getTime() +'_'+ req.files.txtImage.name;
				req.files.txtImage.mv(statusPath+staImageName, function(error,success) {
				    if (error){
				      	console.log('statusRoute |  Error In Uploading Status Image'+ error);
				      	req.flash('error', 'Error While Uploading Status Image');
				      	res.redirect('/status');
				    }else{			    	
						insertQuery.staColor	=	"";
				    	insertQuery.staImage 	=	staImageName;
				    	addStatus();
				    }
				});
				//-------------------------Multiple File Upload code 95% working-------------------------------------------
		        //var staImageName,count=0;
				// var file 	=	req.files.txtImage;
				// console.log('Length |'+file.length);
				// for(var i = 0 ; i < file.length; i++){
				// 	staImageName	=	new Date().getTime() +'_'+ file[count].name;
				// 	file[i].mv(statusPath+staImageName, function(error,success) {
				// 	    if (error){
				// 	      	console.log('statusRoute |  Error In Uploading Category Image'+ error);
				// 	      	req.flash('error', 'Error While Uploading Category Image');
				// 	      	res.redirect('/status');
				// 	    }else{
				// 	    	console.log('count ||'+count);
				// 	    	insertQuery.push(file[count].name);
				// 	    	insertArray.push(insertQuery);
				// 	    	count++;
				// 	    	if(count==file.length){
				// 	    		console.log('count |'+count);
				// 	    		addStatus();
				// 	    	}else{
				// 	    		console.log('count ||'+count);
				// 	    		insertQuery.pop();
				// 	    	}
				// 	    }			    
				// 	});
				// 	console.log('\n'+i);
				// }

				// ----------------------------Image Resize using jimp error : marker was not found----------------------------
	  			// var staImageName	=	new Date().getTime() +'_'+ req.files.txtImage.name;
	  			// console.log('Temp |'+req.files.txtImage.tempFilePath);
	  			// Jimp.read(req.files.txtImage.tempFilePath, function (error, image) {
		    // 		if (error){
		    // 			console.log('Error While resizing image'+error);
		    // 		}else{
		    // 			image.resize(256, 256)
		    //           	.quality(50)                 
		    //          	.write(statusPath+staImageName); 
		    //         }
	    	// 	});

	    	//----------Image resize using sharp module working perfectly fine but sometimes send awkward error------------------
	  		// 	sharp(req.files.txtImage.tempFilePath)
			  //   .resize(null,400)
			  //   .toBuffer()
			  //   .then( data => {
			  //       fileSystem.writeFileSync(statusPath+staImageName, data);
			  //       insertQuery.staColor	=	"";
			  //   	insertQuery.staImage 	=	staImageName;
			  //   	fileSystem.readdir(tempImagePath, function(error, files){
					//   	if(error){
					//   		console.log('statusRoute |  Error While Deleting Temp Image'+ error);
					//       	req.flash('error', 'Error While Deleting Temp Image');
					//       	res.redirect('/status');
					//   	}else{
					//   		for (var file of files) {
					// 	    	fileSystem.unlink((tempImagePath+file), function(error,result) {
					// 		      if (error){
					// 		      	console.log('statusRoute |  Error While Deleting Temp Image'+ error);
					// 		      	req.flash('error', 'Error While Deleting Temp Image');
					// 		      	res.redirect('/status');
					// 		      }else{
							      	
					// 		      }
					// 	    	});
					//   		}
					//   		addStatus();
					//   	}
					// });
			  //   })
			  //   .catch( error => {
			  //   	console.log ('Type'+req.files.txtImage.mimetype);
			  //       console.log('statusRoute |  Error In Uploading Status Image'+ error);
			  //     	req.flash('error', 'Error While Uploading Status Image');
			  //     	res.redirect('/status');
		   //  	});	   				
	  		}
	  	}
	}
}
// This function will delete status details in status collection based on status ID
exports.removeStatus			=	function(req,res,next){
	var statusID 				=	req.params.staId;
	var categoryId 				=	req.params.catId;
	var languageId 				=	req.params.langId;
	var selectQuery 			=  	'SELECT staImage,staVideo,staType from status where staId='+ statusID ;
	var deleteQuery				=   'UPDATE status set isDelete='+ 0 +' WHERE staId='+statusID;
	var updateStatusCount		= 	'UPDATE language , category set language.statusCount = language.statusCount - 1,category.statusCount= category.statusCount - 1 where language.langId='+ languageId +' AND category.catId='+categoryId;
	statusConnection.query(selectQuery,function(error,statusResult){
		if(error){
			console.log('statusRoute | Error in removing status details'+ error);
			req.flash('error', 'Error While Removing Status');
	      	res.send(error);
		}else{
			if(statusResult[0].staType!=1){
				fileSystem.unlink(statusPath+(statusResult[0].staImage!=null?statusResult[0].staImage:statusResult[0].staVideo), function(error,success) {
				  	if (error) {
					    console.log('statusRoute |  Error In Removing status Image' + error);
						req.flash('error', 'Error While Removing Status');
						res.send(error);
				  	}else{
				  		removeStatus();
				  	}
				});
			}else{
				removeStatus();
			}
		}
	});
	//Function will remove status
	function removeStatus(){
		statusConnection.query(deleteQuery,function(error,result){
			if(error){
				console.log('statusRoute | Error in removing status details'+ error);
				req.flash('error', 'Error While Removing Status');
		      	res.send(error);
			}else{
				statusConnection.query(updateStatusCount,function(error,success){
					if(error){
						console.log('statusRoute |  Error in adding status details'+ error);
						req.flash('error', 'Error While Removing Status');
				      	res.redirect('/status');
				    }else{				    
						req.flash('success', 'Status Removed Successfully');
						res.send(result);
					}
				});
			}
		});
	}	
};
// This function will update status details in status collection based on status ID
exports.editStatus				=	function(req,res,next){
	var updateQuery,staImageName,updateStatusCount;	
	var statusID 	=	req.query.statusID;
	var languageId	=	req.body.txtLangId;
	var categoryId	=	req.body.txtCatId;
	var selectQuery =  	'SELECT staImage,staVideo,staType,staStatus from status where staId='+ statusID ;	
	updateQuery 	= 	"UPDATE status SET staMessage='"+ req.body.txtMessage +"', staColor='"+ req.body.txtColorCode +"', staStatus='"+ req.body.rdbStatus +"' WHERE staId="+ statusID;

	statusConnection.query(selectQuery,function(error,statusResult){
		if(error){
			console.log('statusRoute | Error in removing status details'+ error);
			req.flash('error', 'Error While Removing Status');
	      	res.redirect('/status');
		}else{
			if(statusResult[0].staType==1){
				updateStatus(statusResult[0].staStatus);
			}else if(statusResult[0].staType==3){
				if(req.files.txtVideo.name==""){
                   updateStatus(statusResult[0].staStatus);
				}else{
					if(checkFileType(req,res,statusResult[0].staType)){
						fileSystem.unlink(statusPath+statusResult[0].staVideo, function(error,success) {
					  	    if (error) {
						        console.log('statusRoute |  Error In Removing status Image' + error);
							    req.flash('error', 'Error While Removing Status');
							    res.redirect('/status');
					  	    }else{
					  		    addUpdateImage(statusResult[0].staType,statusResult[0].staStatus);
					  	    }
					    });
					 }
				}				
			}else{
				if(req.files.txtImage.name==""){
					updateStatus(statusResult[0].staStatus);
				}else{
				    if(checkFileType(req,res,statusResult[0].staType)){
					    fileSystem.unlink(statusPath+statusResult[0].staImage, function(error,success) {
					  	    if (error) {
						        console.log('statusRoute |  Error In Removing status Image' + error);
							    req.flash('error', 'Error While Removing Status');
							    res.redirect('/status');
					  	    }else{
					  		    addUpdateImage(statusResult[0].staType,statusResult[0].staStatus);
					  	    }
					    });
				    }
				}
				
			}				
		}
	});
	
	//Function will update this status
	function updateStatus(staStatus){
		statusConnection.query(updateQuery,function(error,result){
			if(error){
				console.log('statusRoute | Error in updating status details'+ error);
				req.flash('error', 'Error While updating Status');
		      	res.redirect('/status');
			}else{
				if(staStatus==req.body.rdbStatus){
					req.flash('success', 'Status updated Successfully');
					res.redirect('/status');
				}else{
                    if(req.body.rdbStatus==0){
		 				updateStatusCount		= 	'UPDATE language , category set language.statusCount = language.statusCount - 1,category.statusCount= category.statusCount - 1 where language.langId='+ languageId +' AND category.catId='+categoryId;
		            }else{
		                updateStatusCount		= 	'UPDATE language , category set language.statusCount = language.statusCount + 1,category.statusCount= category.statusCount + 1 where language.langId='+ languageId +' AND category.catId='+categoryId;
	                }
					statusConnection.query(updateStatusCount,function(error,result){
						if(error){
							console.log('statusRoute | Error in updating status details'+ error);
							req.flash('error', 'Error While updating Status');
					      	res.redirect('/status');
					    }else{
					    	req.flash('success', 'Status updated Successfully');
							res.redirect('/status');
					    }
					});
				}
			}
		});
	}

	// This will update or add image of status
	function addUpdateImage(statusType,staStatus){
		if(statusType==2){
			staImageName	=	new Date().getTime() +'_'+ req.files.txtImage.name;
			req.files.txtImage.mv(statusPath+staImageName, function(error,success) {
			    if (error){
			      	console.log('statusRoute |  Error In Uploading Status Image'+ error);
			      	req.flash('error', 'Error While Uploading Status Image');
			      	res.redirect('/status');
			    }else{
			    	updateQuery = 	"UPDATE status SET staImage='"+ staImageName +"',staStatus='"+ req.body.rdbStatus +"' WHERE staId="+ statusID;
			    	updateStatus(staStatus);
			    }
			});
		}else{
			var staVideoName	= 'video/'+ new Date().getTime() +'_'+ req.files.txtVideo.name;
			req.files.txtVideo.mv(statusPath+staVideoName, function(error,success) {
			    if (error){
			      	console.log('statusRoute |  Error In Uploading Status Image'+ error);
			      	req.flash('error', 'Error While Uploading Status Image');
			      	res.redirect('/status');
			    }else{
			    	updateQuery = 	"UPDATE status SET staVideo='"+ staVideoName +"',staStatus='"+ req.body.rdbStatus +"' WHERE staId="+ statusID;
			    	updateStatus(staStatus);
			    }
			});
		}
		
		//------------------------Image resize using sharp module -------------------------------------
		// sharp(req.files.txtImage.tempFilePath)
	 //    .resize(null,400)
	 //    .toBuffer()
	 //    .then( data => {
	 //        fileSystem.writeFileSync(statusPath+staImageName, data);
	 //    	fileSystem.readdir(tempImagePath, function(error, files){
		// 	  	if(error){
		// 	  		console.log('statusRoute |  Error While Deleting Temp Image'+ error);
		// 	      	req.flash('error', 'Error While Deleting Temp Image');
		// 	      	res.redirect('/status');
		// 	  	}else{
		// 	  		for (var file of files) {
		// 		    	fileSystem.unlink((tempImagePath+file), function(error,result) {
		// 			      if (error){
		// 			      	console.log('statusRoute |  Error While Deleting Temp Image'+ error);
		// 			      	req.flash('error', 'Error While Deleting Temp Image');
		// 			      	res.redirect('/status');
		// 			      }else{
					      	
		// 			      }
		// 		    	});
		// 	  		}
		// 	  		updateQuery = 	"UPDATE status SET staImage='"+ staImageName +"',staStatus='"+ req.body.rdbStatus +"' WHERE staId="+ statusID;
		//     		updateStatus();
		// 	  	}
		// 	});
	 //    })
	 //    .catch( error => {
	 //        console.log('statusRoute |  Error In Uploading Status Image'+ error);
	 //      	req.flash('error', 'Error While Uploading Status Image');
	 //      	res.redirect('/status');
  //   	});
	}	
}
// This function will fetch status details by given status ID
exports.getStatusDetailsByID	=	function(req,res,next){
	var statusID		=	req.query.statusID;
	var query			= 'select category.catName, status.staType, status.staMessage ,status.staColor ,status.staStatus ,status.staImage ,status.catId,status.langId from category INNER JOIN status ON category.catId = status.catId WHERE staId='+statusID;
	statusConnection.query(query,function(error,result){
		if(error){
			console.log('statusRoute | Error In Getting Status Details'+ error);
			req.flash('error', 'Error While updating Status');
			res.send(error);
		}else{
			res.send(result);
		}
	});
}
// This function will check image type
function checkFileType(req,res,statusType){
	if(statusType==2){
		if(req.files.txtImage.mimetype !='image/jpeg' && req.files.txtImage.mimetype !='image/jpg' && req.files.txtImage.mimetype !='image/png'){
			req.flash('error', 'Allowed Image Format Is PNG | JPEG | JPG ');
	      	res.redirect('/status');
		}else if(req.files.txtImage.size > 1048576 ){
			req.flash('error', 'Allowed Image Size Is 1 MB  | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
	      	res.redirect('/status');
	    }else{
	    	return true;
	    }
	}else{
		if(req.files.txtVideo.mimetype !='video/mp4'){
			req.flash('error', 'Allowed Video Format Is MP4 ');
	      	res.redirect('/status');
		}else if(req.files.txtVideo.size > 5242880 ){
			req.flash('error', 'Allowed Video Size Is 5 MB  | Please Upload Video Of Size 5MB Or Lesser Then 5MB');
	      	res.redirect('/status');
	    }
	    else{
	    	return true;
	    }
	}
}