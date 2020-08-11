const models = require('../models');
/*for password encryption */
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const applog = require('./logger').applog;
statsd = require('statsd-client');
statsd_client = new statsd();
const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
var sns = new aws.SNS({});

/*display login pages*/
var get_login_info = function(req, res, next) {
	res.render('login');
};

/* get login details and authenticate login*/
var auth_login = function(req, res, next) {
	//api timer start
	var api_start_time_auth_login = new Date().getTime();
	applog.info('timer start for api auth_login');
	let email_auth = req.body.email;
	let user_provided_password = req.body.password;
	//applog.info("mail:"+email_auth);
	//db timer start
	var db_start_time_auth_login = new Date().getTime();
	applog.info('timer start for db auth_login');
	if(email_auth != "" &&  req.body.password != "")
	{
	models.Users.findOne({ where: { email: email_auth } })
	.then(user => { 
		/*match user password and authenticate*/
		if(user!=null)
		{
			//user exists
			//db timer stop
			var db_end_time_auth_login = new Date().getTime();
			var db_exec_time_auth_login = db_end_time_auth_login - db_start_time_auth_login;
			statsd_client.timing('db_timer_auth_login',db_exec_time_auth_login);
			applog.info('timer stop for db auth_login');
			
			let valid_password_hash = user.password;
			let user_email = user.email;
			bcrypt.compare(user_provided_password, valid_password_hash)
  			.then(result => {
    			//applog.info(result);
    			if(result == true)
    			{
    				/*password correct*/
    				//start session
    			
					//set email for session
					req.session.email = user_email;
					//api timer stop
					var api_end_time_auth_login = new Date().getTime();
					var api_exec_time_auth_login = api_end_time_auth_login - api_start_time_auth_login;
					statsd_client.timing('api_timer_auth_login',api_exec_time_auth_login);
					applog.info('timer stop for api auth_login');
					res.render('login_successful',{email: user_email});
    			}
    			else
    			{
    				/*password incorrect */
    				//api timer stop
					var api_end_time_auth_login = new Date().getTime();
					var api_exec_time_auth_login = api_end_time_auth_login - api_start_time_auth_login;
					statsd_client.timing('api_timer_auth_login',api_exec_time_auth_login);
					applog.info('timer stop for api auth_login');
    				res.render('login_error');
    			}
  			})
  			.catch(err => console.error(err.message));
		}
		else
		{
			//user doesnt exist
			//db timer stop
			var db_end_time_auth_login = new Date().getTime();
			var db_exec_time_auth_login = db_end_time_auth_login - db_start_time_auth_login;
			statsd_client.timing('db_timer_auth_login',db_exec_time_auth_login);
			applog.info('timer stop for db auth_login');
			//api timer stop
			var api_end_time_auth_login = new Date().getTime();
			var api_exec_time_auth_login = api_end_time_auth_login - api_start_time_auth_login;
			statsd_client.timing('api_timer_auth_login',api_exec_time_auth_login);
			applog.info('timer stop for api auth_login');
			res.render("loginerror_userdoesnotexists");
		}
		

		//applog.info(`user_email: ${user.email}`); 
	});
	}
	else
	{
		//api timer stop
		var api_end_time_auth_login = new Date().getTime();
		var api_exec_time_auth_login = api_end_time_auth_login - api_start_time_auth_login;
		statsd_client.timing('api_timer_auth_login',api_exec_time_auth_login);
		applog.info('timer stop for api auth_login');
		res.status(401);
		res.render("login_error");

	}
	//res.render('login');
};


/* display register new user page */
var register_new_user = function(req, res, next) {
	res.render('register');
};

/* add new user registration info to db */
var add_new_user_info = function(req, res, next) {
	/* validate password strength */
	//api timer start
	var api_start_time_add_new_user_info = new Date().getTime();
	applog.info('timer start for api add_new_user_info');

	 var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
	 var password = req.body.password;
	 var nameRegex = /^[A-Za-z]+$/;
	 //check fname and lname should be letters only
	 if(passwordRegex.test(password))
	 {
	 	/*strong password*/

	 	//search db to find any user with same email
		let user_email = req.body.email;
		models.Users.findOne({ where: { email: user_email } })
		.then(user => { 
			//applog.info("user"+user.email);
			if(user!=null)
			{
				//user exist in db
				applog.info('user exists');
				//api timer stop
				var api_end_time_add_new_user_info = new Date().getTime();
				var api_exec_time_add_new_user_info = api_end_time_add_new_user_info - api_start_time_add_new_user_info;
				statsd_client.timing('api_timer_add_new_user_info',api_exec_time_add_new_user_info);
				applog.info('timer stop for api add_new_user_info');
				res.render('loginerror_userexists');
			}
			else
			{
				//user with same email doesnt exist
				//check fname and lname
				if((req.body.firstname.match(nameRegex))&&(req.body.lastname.match(nameRegex)))
				{
					/*encrypt password using bcrypt*/
	 				bcrypt.genSalt(saltRounds)
	 					.then(salt => {
    						applog.info(`Salt: ${salt}`);
    						return bcrypt.hash(password, salt);
  						})
  						.then(hash => {
    						applog.info(`Hash: ${hash}`);
    						// Store hash in your password DB.
    					//db timer start
    					var db_start_time_add_new_user_info = new Date().getTime();
						applog.info('timer start for db add_new_user_info');
    					return models.Users.create({
							email: req.body.email,
							password: hash,
							firstname: req.body.firstname,
							lastname: req.body.lastname
						})
						.then(Users => {
							//db timer stop
							var db_end_time_add_new_user_info = new Date().getTime();
							var db_exec_time_add_new_user_info = db_end_time_add_new_user_info - db_start_time_add_new_user_info;
							statsd_client.timing('db_timer_add_new_user_info',db_exec_time_add_new_user_info);
							applog.info('timer stop for db add_new_user_info');
							//api timer stop
							var api_end_time_add_new_user_info = new Date().getTime();
							var api_exec_time_add_new_user_info = api_end_time_add_new_user_info - api_start_time_add_new_user_info;
							statsd_client.timing('api_timer_add_new_user_info',api_exec_time_add_new_user_info);
							applog.info('timer stop for api add_new_user_info');
							res.render('registration_successful');
						})
  					})
  					.catch(err => console.error(err.message));
				}
				else
				{
					//api timer stop
					var api_end_time_add_new_user_info = new Date().getTime();
					var api_exec_time_add_new_user_info = api_end_time_add_new_user_info - api_start_time_add_new_user_info;
					statsd_client.timing('api_timer_add_new_user_info',api_exec_time_add_new_user_info);
					applog.info('timer stop for api add_new_user_info');
					res.render("registration_incorrectname");
				}
				
			}
		
  		})
  		.catch(err => console.error(err.message));	 	
	 }
	 else
	 {
	 	/*create new password*/
	 	//api timer stop
		var api_end_time_add_new_user_info = new Date().getTime();
		var api_exec_time_add_new_user_info = api_end_time_add_new_user_info - api_start_time_add_new_user_info;
		statsd_client.timing('api_timer_add_new_user_info',api_exec_time_add_new_user_info);
		applog.info('timer stop for api add_new_user_info');
	 	res.render('registration_incorrectpassword');
	 }
	
};

/* display homepage */
var display_homepage = function(req, res, next) {
	//Check if session exists
	
	var sess = req.session;
	applog.info(req.session.email);
	 if (sess.email) 
	 { 
	 	applog.info('session set');
	 	res.render('homepage',{email: sess.email});
    	
    }
	else 
	{
		applog.info('session not set');
    	res.render('login');
  	}
	
};

/* logout user and end session */
var logout = function(req, res, next) {
//	req.session = null;
	// var sess = req.session;
	//api timer start
	var api_start_time_logout = new Date().getTime();
	applog.info('timer start for api logout');
	applog.info('in logout:req.sess.email:'+req.session.email);
	req.session.email = "";
	applog.info('in logout:req.sess.email:'+req.session.email);
	req.session.destroy((err) => {
		//api timer stop
		var api_end_time_logout = new Date().getTime();
		var api_exec_time_logout = api_end_time_logout - api_start_time_logout;
		statsd_client.timing('api_timer_logout',api_exec_time_logout);
		applog.info('timer stop for api logout');
        if(err) {
            return applog.info(err);
        }
        
        if(!req.session) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.redirect('/');  
    }
  });  
};

// /* view user info from database */
var view_account_details = function(req, res, next) {
	let user_email = req.session.email;
	//search db to find any user with same email
		 models.Users.findOne({ where: { email: user_email } })
		 .then(user => { 
			applog.info('email:'+user.email);
			res.render('account_details', { id: user.id, email: user.email, firstname: user.firstname, lastname:user.lastname});
		 })
		 .catch(err => console.error(err.message));
}



//get new info to update the account details
var change_account_details = function(req, res, next) {
	let user_email = req.session.email;
	models.Users.findOne({ where: { email: user_email } })
		.then(user => {
			//applog.info('res:'+book.Title);
			res.render("get_new_account_details",{ userdetails : user });
		})
		.catch((e) => { err => console.error(err.message)});
} 

//update user account details
var update_account_details = function(req, res, next) {
	let user_email = req.session.email;
	let user_firstname = req.body.firstname;
	let user_lastname = req.body.lastname;

	models.Users.update({ firstname: user_firstname , lastname: user_lastname}, {
  		where: {
    		email: user_email
  		}
	})
	.then((result) => {
		applog.info(result);
	})
	.catch(err => console.error(err.message));
	res.render('details_updated');	
}

//get new password from user
var update_password = function(req, res, next) {
	res.render('get_new_password');
}

//change password for user  
var change_password_details = function(req, res, next) {
	/* validate password strength */
	 var passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
	 var password = req.body.password;
	 var user_email = req.session.email;

	
	 if(password)
	 {
	 	//not null
	 	 //check for same password
	 	 models.Users.findOne({ where: { email: user_email } })
			.then(user => { 
				/*match user password and authenticate*/
					let valid_password_hash = user.password;
					let user_email = user.email;
					bcrypt.compare(password, valid_password_hash)
  					.then(result => {
    				//applog.info(result);
    				if(result == true)
    				{ 
    					//same password
    					res.render('password_same');
    				}
    				else
    				{
    					if(passwordRegex.test(password))
	 					{
	 						/*strong password*/
							/*encrypt password using bcrypt*/
	 						bcrypt.genSalt(saltRounds)
	 						.then(salt => {
    							applog.info(`Salt: ${salt}`);
    							return bcrypt.hash(password, salt);
  							})
  							.then(hash => {
    							applog.info(`Hash: ${hash}`);
    							// Store hash in your password DB.
    							models.Users.update({ password: hash}, {
									where: {
										email: user_email
									}
								}).then((result) => {
									applog.info(result);
									res.render('login_with_new_password');
								})
  								})
  							.catch(err => console.error(err.message));
	 					}
	 					else
	 					{
	 						/*create new password*///does not meet requirement
	 						res.render('incorrectpassword');
	 					}
    				}
				 })
  			})
	}
	 else
	 {
	 	//password is empty
	 	res.render('password_empty');
	 }
	 
	 
	
} 

//forgot password
var reset_password = function(req, res, next) {
	res.render('forgot_password');
}

//forgot password
var change_password = function(req, res, next) {
	//validate user exists
	let user_email = req.body.email;
		models.Users.findOne({ where: { email: user_email } })
		.then(user => { 
			//applog.info("user"+user.email);
			if(user!=null)
			{
				//user exist in db
				applog.info('user exists');
				var params = {Name: 'password_reset'};
                sns.createTopic(params, (err, data) => { 
                          // http://example.com/reset?email=user@somedomain.com&token=4e163b8b-889a-4ce7-a3f7-61041e323c23
                        let reset_link = 'http://'+process.env.DOMAIN_NAME+'/reset?email=' + user_email + '&token=' + uuidv4();
                        applog.info("reset_link:"+reset_link);
                        let payload = {
                            data: {
                                email: user_email,
                                link: reset_link
                            }
                        };
                        payload.data = JSON.stringify(payload.data);
                        payload = JSON.stringify(payload);

                        let publish_params = {Message: payload, TopicArn: data.TopicArn};
                        sns.publish(publish_params, (err, data) => { 
                                applog.info('published to sns topic');
                                res.render('check_mail');
                        }
                        )
                    })
			}
			else
			{
				//user does not exist
				res.render('change_password_error');
			}
		})
}


exports.get_login_info = get_login_info;
exports.auth_login = auth_login;
exports.register_new_user = register_new_user;
exports.add_new_user_info = add_new_user_info;
exports.display_homepage = display_homepage;
exports.logout = logout;
exports.view_account_details = view_account_details;
exports.change_account_details = change_account_details;
exports.update_account_details = update_account_details;
exports.update_password = update_password;
exports.change_password_details = change_password_details;
exports.reset_password = reset_password;
exports.change_password = change_password;