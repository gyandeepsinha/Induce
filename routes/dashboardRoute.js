var dashboardConnection			=	require('../config/database');

// This file contains all server side code for Dashboard
exports.dashboard=function(req,res,next){
	if(req.session.email){
		res.locals.userRole = req.session.role;
		var selectQuery		= 'SELECT (SELECT COUNT(*) FROM language WHERE isDelete=1) as LangCount, (SELECT COUNT(*) FROM category WHERE isDelete=1) as catCount,(SELECT COUNT(*) FROM status WHERE isDelete=1 ) as staCount';
		var selectQueryApp	=  'SELECT count(*) AS appCount from application where isDelete=1';
		dashboardConnection.query(selectQuery,function(error,dashResult){
			if(error){
				console.log('dashboardRoute |	Error In Getting Dashboard Details'+ error);
			}else{
				dashboardConnection.query(selectQueryApp,function(error,dashResultApp){
					if(error){
						console.log('dashboardRoute |	Error In Getting Dashboard Details'+ error);
					}else{
						res.render('dashboard',{page:'Dashboard',menuId:'dashboard','result':dashResult,'dashResultApp':dashResultApp});
					}
				});
			}
		});
	}else{
		res.redirect('/');
	}	
}