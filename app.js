	var express			=	require('express');
	var routes			=	require('routes');
	var url				=	require('url');
	var http			=	require('http');
	var static			=	require('serve-static');
	var path			=	require('path');
	var bodyParser		=	require('body-parser');
	var fileupload 		= 	require("express-fileupload");
	var expressSession 	= 	require("express-session");
  	var	cookieParser 	= 	require("cookie-parser");
  	var connectFlash 	= 	require("connect-flash");
	var jsonParser		=	bodyParser.json();
	var fileSystem		=	require('fs');
	var app				=	express();

	// Local configurations for Server port , file type and directory details
	app.set('port',process.env.PORT || 7070);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(express.static('public'));
	app.use(express.static('routes'));
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(fileupload());
	app.use(cookieParser("kjbuifbiufnnf"));
	app.use(expressSession({
	  secret: "secret_passcode",
	  cookie: {
	    maxAge: 3600000
	  },
	  resave: false,
	  saveUninitialized: false
	}));
	app.use(connectFlash());
	app.use(function(req, res, next){
	    res.locals.success 	= req.flash('success');
	    res.locals.errors 	= req.flash('error');
	    res.locals.userRole	= req.usersRole || null;
    	next();
	});
	exports.basePath			=	'http://13.58.32.242';
	exports.categoryPath		=	'/Images/category/';
	exports.appLogoPath			=	'/Images/application/appLogo/';
	exports.bannerImagesPath	=	'/Images/application/appBanner/';
	exports.statusImage			=	'/Images/status/';
	// exports.fixStatusImage		=	'/Images/status/FixImages/';	

	//Route files details which will use in performing different operations
	var dashboardRoute		=	require('./routes/dashboardRoute');
	var categoryRoute		=	require('./routes/categoryRoute');
	var statusRoute			=	require('./routes/statusRoute');
	var languageRoute		=	require('./routes/languageRoute');
	var applicationRoute	=	require('./routes/applicationRoute');
	var usersRoute			=	require('./routes/usersRoute');	

	//Route for status app API's
	var statusApiRoute	=	require('./routes/statusApiRoute');
	
	//Dashboard route operations
	app.get('/dashboard',dashboardRoute.dashboard);

	//Category route operations
	app.get('/category',categoryRoute.category);
	app.post('/addCategory',categoryRoute.addCategory);
	app.get('/removeCategory',categoryRoute.removeCategory);
	app.get('/getCategoryDetailsByID',categoryRoute.getCategoryDetailsByID);
	app.post('/editCategory',categoryRoute.editCategory);
	app.get('/getCategoryDetailsByLanguageID',categoryRoute.getCategoryDetailsByLanguageID);

	//Status route operations
	app.get('/status',statusRoute.status);
	app.post('/addStatus',statusRoute.addStatus);
	app.get('/getStatusDetailsByID',statusRoute.getStatusDetailsByID);
	app.post('/editStatus',statusRoute.editStatus);
	app.get('/removeStatus/:staId/:catId/:langId',statusRoute.removeStatus);

	//Language route operations
	app.get('/language',languageRoute.language);
	app.post('/addLangauge',languageRoute.addLangauge);
	app.get('/getLanguageDetailsByID',languageRoute.getLanguageDetailsByID);
	app.post('/editLanguage',languageRoute.editLanguage);
	app.get('/removeLanguage',languageRoute.removeLanguage);

	//Application route operations
	app.get('/application',applicationRoute.application);
	app.post('/addApplication',applicationRoute.addApplication);
	app.get('/removeApplication',applicationRoute.removeApplication);
	app.post('/editApplication',applicationRoute.editApplication);
	app.get('/getApplicationDetailsById',applicationRoute.getApplicationDetailsById);


	app.get('/',usersRoute.login);
	app.get('/users',usersRoute.users);
	app.post('/addUser',usersRoute.addUser);
	app.post('/userLogin',usersRoute.userLogin);
	app.get('/logout',usersRoute.logout);
	app.get('/logs',usersRoute.logs);

	//APIs for status app
	app.get('/getHomeDetails/:Id',statusApiRoute.getHomeDetails);
	app.get('/getApplicationDetails/:Id',statusApiRoute.getApplicationDetails);
	app.get('/getAllLanguages',statusApiRoute.getAllLanguages);
	app.get('/getLanguageByCategoryId/:Id',statusApiRoute.getLanguageByCategoryId);
	app.get('/getAllCategoriesByLangId/:Id',statusApiRoute.getAllCategoriesByLangId);
	app.get('/getStausByLangId/:Id/:index/:type',statusApiRoute.getStausByLangId);
	app.get('/getStausByCategoryId/:Id/:index/:type',statusApiRoute.getStausByCategoryId);
	app.get('/getMostViewedCategory',statusApiRoute.getMostViewedCategory);
	app.get('/statusByStatusId/:Id',statusApiRoute.statusByStatusId);
	app.post('/setFavoriteStatusById/:Id/:flag',statusApiRoute.setFavoriteStatusById);

	//Creating server for program which will run on port 7070
	http.createServer(app).listen(app.get('port'),function(){
		console.log('The Server Is Running On Port:'+app.get('port'));
	});
