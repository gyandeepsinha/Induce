var categoryConnection			=	require('../config/database');
var fileSystem					=	require('fs');
var categoryPath				=	'public/Images/category/';

// This function will get all categories from category tables and send to category page
exports.category 	=	function(req,res,next){
	if(req.session.email){
		res.locals.userRole 	= req.session.role;
		var languageQuery		= 'select langId,langName,langDisplayName from language where isDelete=1';
		var categoryQuery		= 'select language.langDisplayName, category.catId,category.catName,category.catDescription,category.catStatus from language INNER JOIN category ON language.langId = category.langId WHERE category.isDelete=1';
		categoryConnection.query(languageQuery,function(error,alllanguage){
			if(error){
				console.log('categoryRoute |	Error In Getting Language Details'+ error);
			}else{
				categoryConnection.query(categoryQuery,function(error,allCategory){
					if(error){
						console.log('categoryRoute |	Error In Getting Category Details'+ error);
					}else{
						res.render('category',{page:'Category',menuId:'category',allCategory:allCategory,alllanguage:alllanguage,message:req.flash()});
					}
				});
			}
		});
	}else{
		res.redirect('/');
	}	
}
// This function will add category details into category table
exports.addCategory =	function(req,res,next){
	var inputCategoryName;
	var insertQuery={};
	var selectQuery	= 'select LOWER(language.langDisplayName) As displayName from language WHERE langId='+req.body.drpLanguage;
	var query 	= 'insert into category SET ?';
	
	// Add category details
	function checkCategory(){
		categoryConnection.query(selectQuery,function(error,result){
			if(error){
				console.log('categoryRoute |  Error In Checking Category'+ error);
		      	req.flash('error', 'Error While Adding Category');
		      	res.redirect('/category');
			}else{
				inputCategoryName	=	req.body.txtCategory.toLowerCase().trim()+'-'+result[0].displayName;
				var checkQuery		= 	"select count(*) AS count from category WHERE LOWER(catName)='"+ inputCategoryName + "' ";
				categoryConnection.query(checkQuery,function(error,result){
					if(error){
						console.log('categoryRoute |  Error In Checking Category'+ error);
				      	req.flash('error', 'Error While Adding Category');
				      	res.redirect('/category');
					}else{
						if(result[0].count>0){
							req.flash('error', 'Category already exists. Please try with another one');
			      			res.redirect('/category');
						}else{
							insertQuery.catName			=	req.body.txtCategory+'-'+req.body.txtLangDisplayName;
							insertQuery.catDescription	=	req.body.txtDescription;
							insertQuery.catStatus		= 	req.body.rdbStatus;
							insertQuery.langId 			=   req.body.drpLanguage;
							insertQuery.catCreationDate	=   new Date() ;

							if(req.files){
								var CatImageName	=	new Date().getTime() +'_'+ req.files.txtImage.name;
								req.files.txtImage.mv(categoryPath+CatImageName, function(error,success) {
								    if (error){
								      	console.log('categoryRoute |  Error In Uploading Category Image'+ error);
								      	req.flash('error', 'Error While Uploading Category Image');
								      	res.redirect('/category');
								    }else{
								    	insertQuery.catImage =	CatImageName;
								    	addCategoryDetails();
								    }
								});
							}else{
								addCategoryDetails();
							}
						}
					}
				});
			}
		});
	}
	// This function will make actual entry in category table
	function addCategoryDetails(){
   	 	categoryConnection.query(query,insertQuery,function(error,success){
			if(error){
				console.log('categoryRoute |  Error In Adding Category' + error);
				req.flash('error', 'Error While Adding Category');
				res.redirect('/category');
			}else{
				req.flash('success','Category Added Successfully');
				res.redirect('/category');
			}
		});
	}
	if (!req.files || Object.keys(req.files).length === 0) {
		// It will add category without category Image
		checkCategory();
  	}else{
  		// It will add category with category Image
  		if(checkImage(req,res))
  		checkCategory();
	}
}
// This function will remove category based on given categoryID
exports.removeCategory	=	function(req,res,next){
	var categoryID		=	req.query.categoryID;
	var selectQuery 	=  	'SELECT catImage,catName from category where catId='+ categoryID ;
	var deleteQuery		= 	'UPDATE category set isDelete=0 WHERE catID='+categoryID;
	categoryConnection.query(selectQuery,function(error,catResult){
		if(error){
			console.log('categoryRoute |  Error In Removing Category Image' + error);
			req.flash('error', 'Error While Removing Category');
			res.send(error);
		}else{
			if(catResult[0].catImage!=null){
				fileSystem.unlink(categoryPath+catResult[0].catImage, function(error,success) {
				  	if (error) {
					    console.log('categoryRoute |  Error In Removing Category Image' + error);
						req.flash('error', 'Error While Removing Category');
						res.send(error);
				  	}else{
				  		removeCategory();
				  	}
				});
			}else{
				removeCategory();
			}
		}
	});
	function removeCategory(){		
  		categoryConnection.query(deleteQuery,function(error,result){
			if(error){
				console.log('categoryRoute |  Error In Deleting Category'+ error);							
				req.flash('error', 'Error While Removing Category');
				res.send('/category');
			}else{
				req.flash('success','Category Removed Successfully');
				res.send(result);
			}
		});
	}	
}
// This function will edit category based on given categoryID
exports.editCategory	=	function(req,res,next){
	var categoryID		=	req.query.categoryID;
	var selectQuery 	=  	'SELECT catName,catImage from category where catId='+ categoryID ;
	var categoryImage	=	req.files!=null?req.files.txtImage:null;
	var updateQuery,CatImageName;
	updateQuery			="UPDATE category SET catName='"+req.body.txtCategory+"', catDescription='"+req.body.txtDescription+"',catStatus='"+req.body.rdbStatus+"' WHERE catId="+categoryID;
	// Add or Update category image
	function addUpdateImage(){
		CatImageName 	=	new Date().getTime() +'_'+ req.files.txtImage.name;
  		req.files.txtImage.mv(categoryPath+CatImageName, function(error,success) {
		    if (error){
		      	console.log('categoryRoute |  Error In Uploading Category Image'+ error);
		      	req.flash('error', 'Error While Upading Category');
		      	res.redirect('/category');
		    }else{
		    	updateQuery 	= 	"UPDATE category SET catName='"+req.body.txtCategory+"', catDescription='"+req.body.txtDescription+"',catImage='"+CatImageName+"',catStatus='"+req.body.rdbStatus+"' WHERE catId="+categoryID;
		    	updateCategory();
		    }
		});
	}
	//function will update category details
	function updateCategory(){		
    	categoryConnection.query(updateQuery,function(error,result){
			if(error){
				console.log('categoryRoute |  Error In Updating Category'+ error);
				req.flash('error', 'Error While Updating Category');
				res.redirect('/category');
			}else{
				req.flash('success','Category Updated Successfully');
				res.redirect('/category');
			}
		});
	}	
	// It will add category without category Image
	if (!req.files || Object.keys(req.files).length === 0) {		
		updateCategory();
	// It will add category with category Image	
  	}else{  		
  		if(checkImage(req,res)){
  			categoryConnection.query(selectQuery,function(error,catResult){
				if(error){
					console.log('categoryRoute |  Error In Upading Category Image' + error);
					req.flash('error', 'Error While Upading Category');
					res.redirect('/category');
				}else{
					if(catResult[0].catImage!=null){
						fileSystem.unlink(categoryPath+catResult[0].catImage, function(error,success) {
						  	if (error) {
							    console.log('categoryRoute |  Error In Upading Category Image' + error);
								req.flash('error', 'Error While Upading Category');
								res.redirect('/category');
						  	}else{
								addUpdateImage();
							}			  		
						});
					}else{
						addUpdateImage();
					}
				}	
			});
  		}  		
	}	
}
// This function will fetch category details by given categoryID
exports.getCategoryDetailsByID	=	function(req,res,next){
	var categoryID				=	req.query.categoryID;
	var query					= 'select catId,catName,catDescription,catStatus,langId from category WHERE catId='+categoryID;
	categoryConnection.query(query,function(error,result){
		if(error){
			console.log('categoryRoute |  Error In Getting Category Details'+ error);
			req.flash('error', 'Error While Updating Category');
			res.send(error);
		}else{
			res.send(result);
		}
	});
}
// This function will fetch category details by given languageID
exports.getCategoryDetailsByLanguageID	=	function(req,res,next){
	var languageID						=	req.query.languageID;
	var query							= 'select catId,catName from category WHERE langId='+languageID + " AND isDelete="+ 1 ;
	categoryConnection.query(query,function(error,result){
		if(error){
			console.log('categoryRoute |  Error In Getting Category Details By languageID'+ error);
			req.flash('error', 'Error While Updating Category');
			res.send(error);
		}else{
			res.send(result);
		}
	});
}
// This function will check image type
function checkImage(req,res){
	if(req.files.txtImage.mimetype !='image/jpeg' && req.files.txtImage.mimetype !='image/jpg' && req.files.txtImage.mimetype !='image/png'){
		req.flash('error', 'Allowed Image Format Is PNG | JPEG | JPG ');
      	res.redirect('/category');
	}else if(req.files.txtImage.size > 1000000 ){
		req.flash('error', 'Allowed Image Size Is 1 MB  | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
      	res.redirect('/category');
    }else{
    	return true;
    }
}