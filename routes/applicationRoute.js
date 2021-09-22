var applicationConnection		=	require('../config/database');
var fileSystem					=	require('fs');
var logoPath					= 	'public/Images/appLogo/';
var bannerPath					= 	'public/Images/appBanner/';

// This function will get all application from application tables and send to application page
exports.application 		=	function(req,res,next){
	if(req.session.email){
		res.locals.userRole = req.session.role;
		var applicationQuery	= 	'select appId, appName,appPackage,appUrl,appAdvId,appAdvBannerId,appAdvInterstitialId,appAdvRewardId,appAdvNativeId,appLogo,appStatus from application where isDelete = 1';
	applicationConnection.query(applicationQuery,function(error,allApplication){
		if(error){
			console.log('applicationRoute |	Error In Getting Application Details'+ error);
		}else{
			res.render('application',{page:'Application',menuId:'application',allApplication:allApplication,message:req.flash()});
		}
	});
	}else{
		res.redirect('/');
	}	
}
// This function will add category details into category table
exports.addApplication 		=	function(req,res,next){
	var inputAppName		=	req.body.txtAppName.toLowerCase().trim();
	var checkQuery			= 	"select count(*) AS count from application WHERE LOWER(appName)='"+ inputAppName
	 + "' ";
	applicationConnection.query(checkQuery,function(error,result){
		if(error){
			console.log('applicationRoute |  Error In Adding Application'+ error);
			req.flash('error', 'Error In Adding Application ');
      		res.redirect('/application');
		}else{
			if(result[0].count>0){
				req.flash('error', 'Application already exists. Please try with another one');
				res.redirect('/application');
			}else{
				var insertData			=	{
					appName					:	req.body.txtAppName,
					appPackage				:	req.body.txtAppPackage,
					appUrl					:	req.body.txtAppUrl,
					appVersion				:   req.body.txtAppVersion,
					appAdvId				: 	req.body.txtAdvId,
					isAppAdvIdDelete		: 	req.body.chkAdvId?1:0,
					appAdvBannerId 			:   req.body.txtBannerId,
					isAppBanIdDelete		: 	req.body.chkBanId?1:0,
					appAdvInterstitialId	:   req.body.txtIntId,
					isAppInsIdDelete		: 	req.body.chkInsId?1:0,
					appAdvRewardId			: 	req.body.txtRewId,
					isAppRewIdDelete		: 	req.body.chkRewId?1:0,
					appAdvNativeId 			:   req.body.txtNatId,
					isAppNatIdDelete		: 	req.body.chkNatId?1:0,
					appStatus				: 	req.body.rdbAppStatus
				}
				var query 			= 'insert into application SET ?';
				var logoFile	 	= req.files.txtAppLogo;
				var bannerFile	 	= req.files.txtBanImage;
			    var logoImageName	= new Date().getTime() +'_'+ req.files.txtAppLogo.name;
			    var bannerImageName	= new Date().getTime() +'_'+ req.files.txtBanImage.name;
				if (!req.files || Object.keys(req.files).length === 0) {
			   	 	return res.status(400).send('No files were uploaded.');
			  	}

			    if(logoFile.mimetype !='image/jpeg' && logoFile.mimetype !='image/jpg' && logoFile.mimetype !='image/png'){
					req.flash('error', 'Error In File Format While Uploading Logo Image |  Allowed Image Format Is PNG | JPEG | JPG ');
			      	res.redirect('/application');
			    }else if(bannerFile.mimetype !='image/jpeg' && bannerFile.mimetype !='image/jpg' && bannerFile.mimetype !='image/png'){
			    	req.flash('error', 'Error In File Format While Uploading Banner Image | Allowed Image Format Is PNG | JPEG | JPG ');
			      	res.redirect('/application');
				}else if(logoFile.size > 1000000 ){
					req.flash('error', 'Error In File Size While Uploading Logo Image  | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
			      	res.redirect('/application');
				}else if(bannerFile.size > 1000000){
					req.flash('error', 'Error In File Format While Uploading Banner Image | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
			      	res.redirect('/application');
				}else{
					logoFile.mv(logoPath+logoImageName, function(error,success) {
					    if (error){
					      	console.log('applicationRoute |  Error In Uploading Logo Image'+ error);
					      	req.flash('error', 'Error While Uploading Logo Image ');
			  				res.redirect('/application');
					    }else{
				    		 bannerFile.mv(bannerPath+bannerImageName, function(error,success) {
				    		 	if(error){
				    		 		console.log('applicationRoute |  Error In Uploading Banner Image'+ error);
				    		 		req.flash('error', 'Error While Uploading Banner Image ');
			  						res.redirect('/application');
				    		 	}else{
				    		 		insertData.appLogo 	=	logoImageName;
									insertData.bannerImage =	bannerImageName;
									applicationConnection.query(query,insertData,function(error,success){
										if(error){
											console.log('applicationRoute |  Error In Adding application' + error);
											req.flash('error', 'Error While Adding Application');
					      					res.redirect('/application');
										}else{
											req.flash('success', 'Application Added Successfully');
											res.redirect('/application');
										}
									});
				    		 	}
					    	});
				    	}
			  		});
				}
			}
		}
	});	
}
// This function will remove applicaton and all 2 images from their folders
exports.removeApplication	=	function(req,res,next){
	var applicatonId		=	req.query.applicatonId;
	var selectQuery 		=   'SELECT appName,appLogo, bannerImage from application where appId='+ applicatonId ;
	var deleteQuery			=	'UPDATE application set isDelete ='+ 0 +' WHERE appId='+ applicatonId;
	applicationConnection.query(selectQuery,function(error,appDetails){
		if(error){
			console.log('applicationRoute |  Error In Removing Application Logo' + error);
			req.flash('error', 'Error While Removing Application');
			res.send(error);
		}else{
			fileSystem.unlink(logoPath+appDetails[0].appLogo, function(error,success) {
			  if (error) {
				    console.log('applicationRoute |  Error In Removing Application Logo' + error);
					req.flash('error', 'Error While Removing Application');
					res.send(error);
			  	}else{
				  	fileSystem.unlink(bannerPath+appDetails[0].bannerImage, function(error,success) {
				  		if (error) {
						    console.log('applicationRoute |  Error In Removing Application BannerImage' + error);
							req.flash('error', 'Error While Removing Application');
							res.send(error);
				 		}else{
				 			applicationConnection.query(deleteQuery,function(error,success){
				 				if(error){
				 					console.log('applicationRoute |  Error In Removing Application ' + error);
									req.flash('error', 'Error While Removing Application');
									res.send(error);
				 				}else{
									req.flash('success','Application Removed Successfully');
									res.send(result);
								}
				 			});
				  		}
				  	});
			 	}
			});
		}
	});	
}
// This function will update application details by Id
exports.editApplication		=	function(req,res,next){
	var applicatonId		=	req.query.applicatonId;
	var logoFile	 		= 	req.files.txtAppLogo;
	var bannerFile	 		= 	req.files.txtBanImage;
    var logoImageName		= 	new Date().getTime() +'_'+ req.files.txtAppLogo.name;
    var bannerImageName		= 	new Date().getTime() +'_'+ req.files.txtBanImage.name;
	if(logoFile.mimetype !='image/jpeg' && logoFile.mimetype !='image/jpg' && logoFile.mimetype !='image/png'){
		req.flash('error', 'Error In File Format While Uploading Logo Image |  Allowed Image Format Is PNG | JPEG | JPG ');
      	res.redirect('/application');
    }else if(bannerFile.mimetype !='image/jpeg' && bannerFile.mimetype !='image/jpg' && bannerFile.mimetype !='image/png'){
    	req.flash('error', 'Error In File Format While Uploading Banner Image | Allowed Image Format Is PNG | JPEG | JPG ');
      	res.redirect('/application');
	}else if(logoFile.size > 1000000 ){
		req.flash('error', 'Error In File Size While Uploading Logo Image  | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
      	res.redirect('/application');
	}else if(bannerFile.size > 1000000){
		req.flash('error', 'Error In File Format While Uploading Banner Image | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
      	res.redirect('/application');
	}else{
		var selectQuery 		=   'SELECT appLogo, bannerImage from application where appId='+ applicatonId ;
		applicationConnection.query(selectQuery,function(error,appDetails){
			if(error){
				console.log('applicationRoute |  Error In Upladting Application' + error);
				req.flash('error', 'Error While Updating Application');
				res.redirect('/application');
			}else{
				fileSystem.unlink(logoPath+appDetails[0].appLogo, function(error,success) {
					if (error) {
						    console.log('applicationRoute |  Error In Upladting Application' + error);
							req.flash('error', 'Error While Updating Application');
							res.redirect('/application');
					}else{
					  	fileSystem.unlink(bannerPath+appDetails[0].bannerImage, function(error,success) {
					  		if (error) {
							    console.log('applicationRoute |  Error In Upladting Application' + error);
								req.flash('error', 'Error While Updating Application');
								res.redirect('/application');
					 		}else{
					 			logoFile.mv(logoPath+logoImageName, function(error,success) {
								    if (error){
								      	console.log('applicationRoute |  Error In Uploading Logo Image'+ error);
								      	req.flash('error', 'Error While Uploading Logo Image ');
						  				res.redirect('/application');
								    }else{
							    		 bannerFile.mv(bannerPath+bannerImageName, function(error,success) {
							    		 	if(error){
							    		 		console.log('applicationRoute |  Error In Uploading Banner Image'+ error);
							    		 		req.flash('error', 'Error While Uploading Banner Image ');
						  						res.redirect('/application');
							    		 	}else{
							    		 		var updateQuery			=	"UPDATE application SET appName='"+req.body.txtAppName+"', appPackage='"+req.body.txtAppPackage+"',appUrl='"+req.body.txtAppUrl+"', appVersion='"+req.body.txtAppVersion+"', appAdvId='"+req.body.txtAdvId+"', isAppAdvIdDelete='"+(req.body.chkAdvId ? 1 : 0)+"', appAdvBannerId='"+req.body.txtBannerId+"', isAppBanIdDelete='"+(req.body.chkBanId ? 1 : 0 )+"', appAdvInterstitialId='"+req.body.txtIntId+"', isAppInsIdDelete='"+(req.body.chkInsId ? 1 : 0 )+"', appAdvRewardId='"+req.body.txtRewId+"', isAppRewIdDelete='"+(req.body.chkRewId ? 1 : 0 )+"', appAdvNativeId='"+req.body.txtNatId+"', isAppNatIdDelete='"+(req.body.chkNatId ? 1 : 0 )+"', appLogo='"+ logoImageName +"',bannerImage='"+bannerImageName +"',appStatus='"+req.body.rdbAppStatus+"' WHERE appId="+applicatonId;
												applicationConnection.query(updateQuery,function(error,result){
													if(error){
														console.log('applicationRoute |  Error While Updaing Application Details'+ error);
														req.flash('error', 'Error While Updating Application Details ');
														res.redirect('/application');
													}else{
														req.flash('success','Application Updated Successfully');
														res.redirect('/application');
													}
												});
							    		 	}
								    	});
							    	}
						  		});
					 		}
					 	});
			 		}
				});
			}
		});
	}
}
// This function will get all application details by Id
exports.getApplicationDetailsById	=	function(req,res,next){
	var applicatonId		=	req.query.applicatonId;
	var query 				=	'SELECT * from application WHERE appId='+applicatonId;
	applicationConnection.query(query,function(error,applicationDetails){
		if(error){
			console.log('applicationRoute |  Error In Retrieving Application Details'+ error);
			req.flash('error', 'Error While Retrieving Application Details ');
			res.send(error);
		}else{
			res.send(applicationDetails);
		}
	});
}