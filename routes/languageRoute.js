var languageConnection			=	require('../config/database');

//This function will get all language details and render to language page
exports.language 	=	function(req,res,next){
	if(req.session.email){
		res.locals.userRole = req.session.role;
		var selectQuery	=	'select * from language where isDelete=1';
		languageConnection.query(selectQuery,function(error,languageDetails){
			if(error){
				console.log('languageRoute |	Error In Getting Language Details'+ error);
			}else{
				res.render('language',{page:'Language',menuId:'language',allLanguage:languageDetails,message:req.flash()});
			}
		});
	}else{
		res.redirect('/');
	}
}
//This function will add language in language table
exports.addLangauge	=	function(req,res,next){
	var inputLanName		=	req.body.txtLanguageName.toLowerCase().trim();
	var checkQuery			= 	"select count(*) AS count from language WHERE langStatus=1 AND isDelete=1 AND LOWER(langName)='"+ inputLanName + "' ";
	languageConnection.query(checkQuery,function(error,result){
		if(error){
			console.log('languageRoute |  Error In Adding Language' + error);
	      	req.flash('error', 'Error While Adding Language');
	      	res.redirect('/language');
		}else{
			if(result[0].count>0){
				req.flash('error', 'Language already exists. Please try with another one');
      			res.redirect('/language');
			}else{
				var insertQuery	= {
					langName			:	req.body.txtLanguageName.trim(),
					langDisplayName		:	req.body.txtDisplayLanguageName.trim(),
					langStatus			: 	req.body.rdbStatus,
					langCreationDate	:   new Date()
				};
				var query 	= 'insert into language SET ?';
				languageConnection.query(query,insertQuery,function(error,success){
					if(error){
						console.log('languageRoute |  Error In Adding Language' + error);
						req.flash('error', 'Error While Adding Language');
				      	res.redirect('/language');
					}else{
						req.flash('success', 'Language Added Successfully');
						res.redirect('/language');
					}
				});
			}
		}
	});	
}
// This function will remove language based on given languageID
exports.removeLanguage	=	function(req,res,next){
	var languageID		=	req.query.languageID;
	var deleteQuery		=   'UPDATE language set isDelete=0 WHERE langId='+languageID;
	languageConnection.query(deleteQuery,function(error,result){
		if(error){
			console.log('languageRoute |  Error In Deleting Language'+ error);
			req.flash('error', 'Error While Adding Language');
			res.send(error);
		}else{
			req.flash('success', 'Language Removed Successfully');
			res.send(result);
		}
	});
}
// This function will edit language based on given languageID
exports.editLanguage	=	function(req,res,next){
	var languageID		=	req.query.languageID;
	var updateQuery 	= 	"UPDATE language SET langName='"+req.body.txtLanguageName.trim()+"', langDisplayName='"+req.body.txtDisplayLanguageName.trim()+"',langStatus='"+req.body.rdbStatus+"' WHERE langId="+languageID;

	languageConnection.query(updateQuery,function(error,result){
		if(error){
			console.log('languageRoute |  Error In Updating Language'+ error);
			req.flash('error', 'Error While Updating Language');
			res.redirect('/language');
		}else{
			req.flash('success', 'Language Updated Successfully');
			res.redirect('/language');
		}
	});
}
// This function will fetch language details by given languageID
exports.getLanguageDetailsByID	=	function(req,res,next){
	var languageID				=	req.query.languageID;
	var query					= 'select langId,langName,langDisplayName,langStatus from language WHERE langId='+languageID;
	languageConnection.query(query,function(error,result){
		if(error){
			console.log('languageRoute |  Error In Getting Language Details'+ error);
			req.flash('error', 'Error While Updating Language');
			res.send(error);
		}else{
			res.send(result);
		}
	});
}