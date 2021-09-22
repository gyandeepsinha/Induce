var usersConnection		=	require('../config/database');
var usersLogConnection	=	require('../config/database');
var crypto 				= 	require('crypto'); 
var userPath			=	'public/Images/users/';


// This function encrypts the entered password
function setPassword(password){
	// Creating a unique salt for a particular user 
   	var cipher 		=  crypto.createCipher('aes-256-cbc','d6F3Efeq');
	var crypted 	=  cipher.update(password,'utf8','hex')
	crypted 		+= cipher.final('hex');
  	return crypted;
}
// This function checks table's password and entered password
function validPassword(password,storedPassword){
	var decipher =  crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  	var dec  	 =  decipher.update(storedPassword,'hex','utf8')
	dec  		 += decipher.final('utf8');
	return dec==password;
}

// This funciton will render to login page
exports.login		=	function(req,res,next){	
	res.render('login');
}
// This function will make use log into application
exports.userLogin	=	function(req,res,next){
	var email 		=	req.body.txtEmail;
	var password 	=	req.body.txtPassword;
	var selectQuery =   "SELECT count(*) AS count,userId,password,userRole from users WHERE email='"+ req.body.txtEmail + "' ";
	usersConnection.query(selectQuery,function(error,result){
		if(error){
			console.log('userRoute |  Error In login' + error);
			req.flash('error', 'Error While login');			
			res.redirect('/');
		}else{
			if(result[0].count==0){
				req.flash('error', 'E-mail Id  does not exists. Please try with another one');			
				res.redirect('/');
			}else{
				if(validPassword(password,result[0].password)){
					req.session.uId 	=	result[0].userId;
					req.session.email 	=	email;
					req.session.role 	=	result[0].userRole;
					res.redirect('/dashboard');
				}else{
					req.flash('error', 'Password is wrong . Please try with another one');			
					res.redirect('/');
				}
			}
		}
	});
}
// This function will destroy the session and make user logout
exports.logout		=	function(req,res,next){
	req.session.destroy(function(error,result){
		if(error){
			console.log('userRoute |  Error In Destroying User Session'+ error);
		}else{
			res.redirect('/');
		}
	});
}
// This function will get all details from users table
exports.users		=	function(req,res,next){
	if(req.session.email && req.session.role=='Admin'){
		res.locals.userRole = req.session.role;
		var selectQuery	=	'SELECT name, email, image, userRole , userStatus from users WHERE userStatus="Active" && isDelete=1';
		usersConnection.query(selectQuery,function(error,userDetails){
			if(error){
				console.log('userRoute |  Error In Checking User'+ error);
			}else{
				var logViewObject	=	{
					userId			: 	req.session.uId,
					task			:   'Viewed Users Page',
					taskDate		: 	new Date()
				}
				var logViewQuery	=	'INSERT into userslog SET ? ';
				usersLogConnection.query(logViewQuery,logViewObject,function(error,result){
					if(error){
						console.log('userRoute |	Error In Adding User Log Details'+ error);
					}else{
						res.render('users',{page:'Users',menuId:'users',userDetails:userDetails,message:req.flash()});
					}
				});	
				
			}
		});
	}else{
		res.redirect('/dashboard');
	}
}
// This function will add users
exports.addUser		=	function(req,res,next){
	var insertUser	=	{
		name				:  	req.body.txtName,
		email				: 	req.body.txtEmail,
		password			: 	setPassword(req.body.txtpassword),
		creationDate		: 	new Date(),
		modificationDate	: 	new Date(),
		userRole			: 	req.body.drpUsers,
		userStatus			: 	req.body.rdbUsersStatus
	}
	var userImage		=	req.files.imgProfilePicture;
	var userImageName	=	new Date().getTime() +'_'+ req.files.imgProfilePicture.name;
	var selectQuery 	=   "SELECT count(*) AS count from users WHERE email='"+ req.body.txtEmail + "' ";
	usersConnection.query(selectQuery,function(error,result){
		if(error){
			console.log('userRoute |  Error In Adding User' + error);
			req.flash('error', 'Error While Adding Category');			
			res.redirect('/users');
		}else{
			if(result[0].count>0){
				req.flash('error', 'E-mail Id already exists. Please try with another one');			
				res.redirect('/users');
			}else{
				if(userImage.mimetype !='image/jpeg' && userImage.mimetype !='image/jpg' && userImage.mimetype !='image/png'){
					req.flash('error', 'Allowed Image Format Is PNG | JPEG | JPG ');
			      	res.redirect('/users');
				}else if(userImage.size > 1000000 ){
					req.flash('error', 'Allowed Image Size Is 1 MB  | Please Upload Image Of Size 1MB Or Lesser Then 1MB');
			      	res.redirect('/users');
				}else{
					var query 	= 'insert into users SET ?';
					userImage.mv(userPath+userImageName, function(error,success) {
					    if (error){
					      	console.log('userRoute |  Error In Uploading User Image'+ error);
					      	req.flash('error', 'Error While Uploading User Image');
					      	res.redirect('/users');
					    }else{
					    	insertUser.image =	userImageName;
							usersConnection.query(query,insertUser,function(error,success){
								if(error){
									console.log('userRoute |  Error In Adding User' + error);
									req.flash('error', 'Error While Adding Category');			
									res.redirect('/users');
								}else{
									var logAddObject	=	{
										userId			: 	req.session.uId,
										task			:   'Added  | ' + insertUser.name + '  User , Role  ' + insertUser.userRole + ' |',
										taskDate		: 	new Date()
									}
									var logAddQuery	=	'INSERT into userslog SET ? ';
									usersLogConnection.query(logAddQuery,logAddObject,function(error,result){
										if(error){
											console.log('userRoute |  Error In Adding User Log Details' + error);
											req.flash('error', 'Error While Adding User Log Details');			
											res.redirect('/users');
										}else{
											req.flash('success','User Added Successfully');
											res.redirect('/users');	
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
// This function will get all details from user log table
exports.logs 		=	function(req,res,next){
	if(req.session.email && req.session.role=='Admin'){
		res.locals.userRole = req.session.role;
		var selectQuery	=	'SELECT users.name,userslog.task,userslog.taskDate from users INNER JOIN userslog ON users.userId=userslog.userId';
		usersConnection.query(selectQuery,function(error,logsDetails){
			if(error){
				console.log('userRoute |  Error In Getting Users Log' + error);
				req.flash('error', 'Error While Getting Users Log');			
				res.redirect('/logs');
			}else{
				res.render('logs',{page:'Logs',menuId:'logs',logsDetails:logsDetails,message:req.flash()});
			}
		});
	}else{
		res.redirect('/dashboard');
	}
}