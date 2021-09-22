var apiConnection					=	require('../config/database');
var imagePath						=	require('../app.js');

// API will give all category , mostViewed category and latest added category
exports.getHomeDetails				=	function(req,res,next){
	var languageId 				=	req.params.Id;
	if(languageId==-1){
		// var catQuery				=	'SELECT catId as Id , catName as Name , CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS Image  from category WHERE catStatus=1 AND isDelete= 1  LIMIT 10';

		var catQuery = 'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c WHERE  c.catStatus=1 AND  c.isDelete=1 AND c.statusCount > 0 LIMIT 10 ';

		// var mostViewCatQuery		=	'SELECT catId as Id, catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS Image from category WHERE catStatus=1 AND isDelete= 1  ORDER BY mostViewedCategory DESC LIMIT 10';

		var mostViewCatQuery= 'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c WHERE c.catStatus=1 AND c.isDelete=1 AND c.statusCount > 0 ORDER BY mostViewedCategory DESC LIMIT 10';

		// var dateWiseCatQuery		=	'SELECT catId as Id, catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS Image FROM (SELECT * FROM category ORDER BY catId DESC LIMIT 10)latestCategory WHERE isDelete=1';

		var dateWiseCatQuery		=	'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c  WHERE c.catStatus=1 AND c.isDelete=1 AND c.statusCount > 0 ORDER BY catCreationDate LIMIT 10';
	}else{
		// var catQuery				=	'SELECT catId as Id , catName as Name , CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS Image  from category WHERE langId=' + languageId +' AND catStatus=1 AND isDelete= 1  LIMIT 10';

		var catQuery = 'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c WHERE c .langId='+languageId +' AND c.catStatus=1 AND  c.isDelete=1 AND c.statusCount > 0 LIMIT 10 ';

		// var mostViewCatQuery		=	'SELECT catId as Id, catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS Image from category WHERE langId=' + languageId +' AND catStatus=1 AND isDelete= 1  ORDER BY mostViewedCategory DESC LIMIT 10';

		var mostViewCatQuery= 'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c WHERE c.langId='+ languageId +' AND c.catStatus=1  AND c.isDelete=1 AND c.statusCount > 0 ORDER BY mostViewedCategory DESC LIMIT 10';

		// var dateWiseCatQuery		=	'SELECT catId as Id, catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS Image FROM (SELECT * FROM category WHERE langId='+ languageId +' ORDER BY catId DESC LIMIT 10)latestCategory';

		var dateWiseCatQuery		=	'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c  WHERE langId='+ languageId +' AND c.catStatus=1 AND c.isDelete=1 AND c.statusCount > 0 ORDER BY catCreationDate DESC LIMIT 10';
	}
	var homeResult;
	apiConnection.query(catQuery,function(error,catDetails){
		if(error){
			homeResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			apiConnection.query(mostViewCatQuery,function(error,viewedCatResult){
				if(error){
					homeResult	= {
						status 	: 	500,
						error 	:  error,
						response:  null
					}
				}else{
					apiConnection.query(dateWiseCatQuery,function(error,latestCatResult){
						if(error){
							homeResult	= {
								status 	: 	500,
								error 	:  error,
								response:  null
							}
						}else{
							homeResult	= {
								status 				: 	200 ,
								error 				: 	null,
								slider				:   [],
								categoryDetails		: 	catDetails,
								mostViewedCategory 	:   viewedCatResult,
								latestCategory 		:   latestCatResult
							}
						}
						res.send(homeResult);
					});
				}
			});
		}		
	});
}
// API will get all application details by appId
exports.getApplicationDetails		=	function(req,res,next){
	var appId 					=	req.params.Id;
	var applicationResult;
	var query 					=	'SELECT appName as Name , appPackage as Package , appUrl as Url , appAdvId as AdvId, isAppAdvIdDelete as AdvStatus , appAdvBannerId as BannerId , isAppBanIdDelete as banStatus , appAdvInterstitialId as interstitialId , isAppInsIdDelete as insStatus , appAdvRewardId as RewardId , isAppRewIdDelete as rewStatus , appAdvNativeId as NativeId , isAppNatIdDelete as natStatus , CONCAT("'+imagePath.basePath+imagePath.appLogoPath+'",appLogo) as logo , CONCAT("'+imagePath.basePath+imagePath.bannerImagesPath+'",bannerImage) as banner from application WHERE appStatus=1 AND isDelete=1 AND appId='+ appId ;
	apiConnection.query(query,function(error,appDetails){
		if(error){
			applicationResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}			
		}else{
			applicationResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	appDetails
			}
		}
		res.json(applicationResult);
	});
}
// API will get all 1 languages
exports.getAllLanguages				=	function(req,res,next){
	var languageResult;
	// var query 				= 'SELECT langId as Id , langName as Name, langDisplayName as DisplayName, IF (DATE(langCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM language WHERE langStatus=1 AND isDelete=1';

	var query='SELECT langId as Id , langName as Name, langDisplayName as DisplayName , IF (DATE(langCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM  language WHERE  isDelete=1 AND langStatus=1 AND  statusCount > 0';
	apiConnection.query(query,function(error,langDetails){
		if(error){
			languageResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			languageResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	langDetails
			}
		}
		res.json(languageResult);	
	});
}
// API will give language details by categoryId
exports.getLanguageByCategoryId		=	function(req,res,next){
	var categoryId 					=	req.params.Id;
	var languageResultByCategory;
	var query						=	'SELECT language.langId as ID , language.langName as Name, language.langDisplayName as DisplayName,IF (DATE(langCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag from language INNER JOIN category ON language.langId = category.langId WHERE language.langStatus=1 AND language.isDelete=1 AND category.catId='+categoryId;
	apiConnection.query(query,function(error,langByCatResult){
		if(error){
			languageResultByCategory	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			languageResultByCategory	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	langByCatResult
			}
		}
		res.json(languageResultByCategory);
	});
}
// API will get all 1 categories from category table
exports.getAllCategoriesByLangId	=	function(req,res,next){
	var categoryResult,selectQuery;
	var langId 						=	req.params.Id;
	
	if(langId==-1){
		selectQuery		=	'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c WHERE c.catStatus=1 AND  c.isDelete=1 AND statusCount > 0 ';
	}else{
	selectQuery		=	'SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount FROM category c WHERE c.catStatus=1 AND  c.isDelete=1 AND statusCount > 0 AND  langId = '+langId;
	}
	apiConnection.query(selectQuery,function(error,categoryDetails){
	 	if(error){
			categoryResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			categoryResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	categoryDetails
			}
		}
		res.json(categoryResult);
	});
}
// API will get all status based on categoryID from status table
exports.getStausByCategoryId  		=	function(req,res,next){
	var statusResult;
	var categoryId 			  = req.params.Id;
	var pageNo 			  	  = req.params.index;
	var statusType			  =	req.params.type;
	var size				  = 20;
	var selectQuery;
	
	if(statusType==1){
		selectQuery='SELECT staId as Id , staMessage as Message , staColor as color , staCreationDate as Date, CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staImage) as Url,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM status WHERE catId='+ categoryId + ' AND staType=1 AND staStatus=1 AND isDelete =1 ORDER BY RAND() LIMIT ' + (pageNo * 20) + ','+  size ;
	}else if(statusType==2){
		selectQuery='SELECT staId as Id , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staImage) as Url , staCreationDate as Date,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM status WHERE catId='+ categoryId + ' AND staType=2 AND staStatus=1 AND isDelete =1 ORDER BY RAND() LIMIT ' + (pageNo * 20) + ','+  size ;
	}else if(statusType==3){
		selectQuery='SELECT staId as Id , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staVideo) as Url , staCreationDate as Date,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM status WHERE catId='+ categoryId + ' AND staType=3 AND staStatus=1 AND isDelete =1 ORDER BY RAND() LIMIT ' + (pageNo * 20) + ','+  size ;
	}else{
		selectQuery		=	'SELECT staId as Id , staType as Type ,staMessage as Message , staColor as color , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staImage) as Url , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staVideo) as videoUrl ,staCreationDate as Date,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag from status WHERE catId='+ categoryId + ' AND staStatus=1 AND isDelete =1 ORDER BY RAND() LIMIT ' + (pageNo * 20) + ','+  size ;
	}
	// send count of category on first time call
	if(pageNo==0){
		apiConnection.query('UPDATE category set mostViewedCategory = mostViewedCategory + 1 WHERE catId='+categoryId,function(error,success){
			if(error)
			console.log('statusApiRoute	|	Error In Updating mostViewedCategory in Category'+error);
		});
		var countQuery		= 	'SELECT count(*) As count from status where catId ='+ categoryId + ' AND staStatus=1 AND isDelete = 1';		
		apiConnection.query(countQuery,function(error,countResult){
			if(error){
				statusResult	= {
					status 	: 	500,
					error 	:  error,
					response:  null
				}
			}else{
				apiConnection.query(selectQuery,function(error,statussDetails){
					if(error){
						statusResult	= {
							status 	: 	500,
							error 	:  error,
							response:  null
						}
					}else{
						statusResult	=	{
							status 		: 	200,
							count 		: 	countResult[0].count,
							error 		: 	null,
							response 	:  	statussDetails
						}
						
					}
					res.json(statusResult);
				});				
			}
		});
	}else{
		apiConnection.query(selectQuery,function(error,statussDetails){
			if(error){
				statusResult	= {
					status 	: 	500,
					error 	:  error,
					response:  null
				}
			}else{
				statusResult	=	{
					status 		: 	200,
					error 		: 	null,
					response 	:  	statussDetails
				}
			}
			res.json(statusResult);
		});
	}	
}
// API willget all status based on language ID from status table
exports.getStausByLangId			=	function(req,res,next){
	var statusResult;
	var languageId 			  = req.params.Id;
	var pageNo 			  	  = req.params.index;
	var statusType			  = req.params.type;
	var size				  = 50;
	var selectQuery;
	
	if(statusType==1){
		selectQuery='SELECT staId as Id , staMessage as Message , staColor as color , staCreationDate as Date,CONCAT("'+imagePath.basePath+imagePath.fixStatusImage+'",staImage) as Url,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM status WHERE langId='+ languageId + ' AND staStatus=1 AND isDelete =1 ORDER BY RAND()LIMIT ' + (pageNo * 20) + ','+  size ;
	}else if(statusType==2){
		selectQuery='SELECT staId as Id , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staImage) as Url , staCreationDate as Date,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM status WHERE langId='+ languageId + ' AND staStatus=1 AND isDelete =1 ORDER BY RAND()LIMIT ' + (pageNo * 20) + ','+  size ;
	}else if(statusType==3){
		selectQuery='SELECT staId as Id , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staImage) as Url , staCreationDate as Date,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM status WHERE langId='+ languageId + ' AND staStatus=1 AND isDelete =1 ORDER BY RAND()LIMIT ' + (pageNo * 20) + ','+  size ;
	}else{
		selectQuery		=	'SELECT staId as Id , staType as Type ,staMessage as Message , staColor as color , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staImage) as Url , CONCAT("'+imagePath.basePath+imagePath.statusImage+'",staVideo) as videoUrl ,staCreationDate as Date,IF (DATE(staCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag from status WHERE langId='+ languageId + ' AND staStatus=1 AND isDelete =1 ORDER BY RAND()LIMIT ' + (pageNo * 20) + ','+  size ;
	}
	apiConnection.query(selectQuery,function(error,statussDetails){
		if(error){
			statusResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			statusResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	statussDetails
			}			
		}
		res.json(statusResult);
	});
}
// API will return most viewed category in descending order
exports.getMostViewedCategory		=	function(req,res,next){
	var viewedResult	;
	// var query 	=	'SELECT catId as Id, catName as Name , CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage,  IF (DATE(catCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag from category ORDER BY mostViewedCategory DESC LIMIT 5';
	var mostViewCatQuery='SELECT c.catId,c.catName as Name,CONCAT("'+imagePath.basePath+imagePath.categoryPath+'", catImage) AS catImage, (select count(*) from status where catId=c.catID and staType=1 and staStatus=1 and isDelete=1) as textCount,(select count(*) from status where catId=c.catID and staType=2 and staStatus=1 and isDelete=1) as imageCount,(select count(*) from status where catId=c.catID and staType=3 and staStatus=1 and isDelete=1) as videoCount,IF (DATE(catCreationDate) > (NOW() - INTERVAL 14 DAY),true,false) AS flag FROM category c WHERE c.catStatus=1 AND c.isDelete=1 ORDER BY mostViewedCategory DESC LIMIT 10';
	apiConnection.query(mostViewCatQuery,function(error,viewdResultt){
		if(error){
			viewedResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			viewedResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	viewdResultt
			}
		}
		res.json(viewedResult);
	});
}
// API will get status by statusId 
exports.statusByStatusId			=	function(req,res,next){
	var statusResult;
	var statusId			=	req.params.Id;		
	var query				=	'SELECT staMessage as Message from status where staId='+ statusId;
	apiConnection.query(query,function(error,staDetails){
		if(error){
			statusResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			statusResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	staDetails
			}
		}
		res.json(statusResult);
	});
}
// API will set status favorite value by statusId
exports.setFavoriteStatusById		=	function(req,res,next){
	var updateResult;
	var statusId 		=	req.params.Id;
	var flag			=	req.params.flag;	
	var updateQuery		=	(flag=="true"?'UPDATE status set favoriteStatus = favoriteStatus + 1 WHERE staId='+statusId:'UPDATE status set favoriteStatus = favoriteStatus - 1 WHERE staId='+statusId);
	apiConnection.query(updateQuery,function(error,result){
		if(error){
			var updateResult	= {
				status 	: 	500,
				error 	:  error,
				response:  null
			}
		}else{
			var updateResult	=	{
				status 		: 	200,
				error 		: 	null,
				response 	:  	'success'
			}
		}
		res.json(updateResult);
	});
}