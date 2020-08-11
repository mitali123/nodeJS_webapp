const models = require('../models');
const{Op} = require("sequelize");
const applog = require('./logger').applog;
statsd = require('statsd-client');
statsd_client = new statsd();

let display_buyer_page = function(req, res, next) {
	var start_time_display_buyer_page = new Date().getTime();
	applog.info('timer start for display_buyer_page api');
	var end_time_display_buyer_page = new Date().getTime();  //seconds since epoch in milliseconds
	var exec_time_display_buyer_page = end_time_display_buyer_page - start_time_display_buyer_page; 
	statsd_client.timing('api_timer_display_buyer_page',exec_time_display_buyer_page);
	applog.info('timer stop for display_buyer_page api');
	res.render("buyer_page");
};

let view_books = function(req, res, next) {
	//api timer start
	var start_time_view_books_buyer = new Date().getTime();
	applog.info('timer start for view_books_buyer api');
	applog.info('increment counter for view_books_buyer page');
	statsd_client.increment('view_books_invocations_buyer');
	let user_email = req.session.email;
	let user_id;
	//db timer start
	var start_time_get_books_db_buyer = new Date().getTime();  
	applog.info('timer start for get_books_db to fetch books');
	models.Users.findOne({ where: { email: user_email } })
		.then(user => {
			user_id = user.id;
			applog.info('id:'+ user_id);
			models.Books.findAll({ where: { [Op.not]: [{ Seller_id:[user_id]}] , Quantity:{[Op.gt]: 0} }, order: [['Price', 'ASC'],['Quantity', 'ASC'],]})
				.then(result => {
					applog.info('result:'+result);
					//db timer stop
					var end_time_get_books_db_buyer = new Date().getTime();
					var exec_time_get_books_db_buyer = end_time_get_books_db_buyer - start_time_get_books_db_buyer;
					statsd_client.timing('db_timer_get_books_buyer',exec_time_get_books_db_buyer);
					applog.info('timer stop for get_books_db');
					//api timer stop
					var end_time_view_books_buyer = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_view_books_buyer = end_time_view_books_buyer - start_time_view_books_buyer; 
					statsd_client.timing('api_timer_view_books_buyer',exec_time_view_books_buyer);
					applog.info('timer stop for view_books_buyer api');
					res.render('view_books',{ books : result } );
				})
				.catch((e) => { err => console.error(err.message)});	
		})
		.catch((e) => { err => console.error(err.message)});
};

let add_to_cart = function(req, res, next) {
	//api timer start
	var start_time_add_to_cart_buyer = new Date().getTime();
	applog.info('timer start for add_to_cart_buyer api');
	let book_id = req.body.book_id;
	let user_email = req.session.email;
	let reqd_quantity = req.body.quantity;
	let db_quantity;
	let updated_db_quantity;
	let t_price;
	let db_price;
	//applog.info("in cart");
	//db timer start
	var start_time_add_to_cart_db_buyer = new Date().getTime();
	applog.info('timer start for add_to_cart_db_buyer');
	models.Users.findOne({ where: { email: user_email } })
		.then(user => {
			user_id = user.id;
			applog.info('id:'+ user_id);
			models.Books.findOne({ where: { id: book_id } })
			.then(book => {
					db_quantity = parseInt(book.Quantity);
					//reqd quantity should be less than quantity present in db
					applog.info('db_quantity:'+db_quantity);
					applog.info('reqdquantity:'+reqd_quantity);
					if(db_quantity >= reqd_quantity)
					{
						db_price = parseFloat(book.Price);
						t_price = db_price * reqd_quantity; 
						updated_db_quantity = db_quantity - reqd_quantity;
						//add updated quantity to db books table
						models.Books.update({ Quantity: updated_db_quantity },{
							where: {
								id: book_id
							}
						})
						.then(result => {
							//update cart
							models.Cart.create({
								User_id: user_id,
								Book_id: book_id,
								Quantity: reqd_quantity,
								Price: t_price,
								Payment_Done: false
							})
							.then(() => {
								//stop db timer
								var end_time_add_to_cart_db_buyer = new Date().getTime();  //seconds since epoch in milliseconds
								var exec_time_add_to_cart_db_buyer = end_time_add_to_cart_db_buyer - start_time_add_to_cart_db_buyer; 
								statsd_client.timing('db_timer_add_to_cart_buyer',exec_time_add_to_cart_db_buyer);
								applog.info('timer stop for add_to_cart_db_buyer');
								//stop timer api
								var end_time_add_to_cart_buyer = new Date().getTime();  //seconds since epoch in milliseconds
								var exec_time_add_to_cart_buyer = end_time_add_to_cart_buyer - start_time_add_to_cart_buyer; 
								statsd_client.timing('api_timer_add_to_cart_buyer',exec_time_add_to_cart_buyer);
								applog.info('timer stop for add_to_cart_buyer api');
								res.render("add_to_cart_success");
							})
							.catch((e) => { err => console.error(err.message)});
						})
						.catch((e) => { err => console.error(err.message)});
					}
					else
					{
						//quantity error
						var end_time_add_to_cart_buyer = new Date().getTime();  //seconds since epoch in milliseconds
						var exec_time_add_to_cart_buyer = end_time_add_to_cart_buyer - start_time_add_to_cart_buyer; 
						statsd_client.timing('api_timer_add_to_cart_buyer',exec_time_add_to_cart_buyer);
						applog.info('timer stop for add_to_cart_buyer api');
						res.render("quantity_add_to_cart_error");
					}
			})
			.catch((e) => { err => console.error(err.message)});
		})
		.catch((e) => { err => console.error(err.message)});
}

let view_images = function(req, res, next) {
	//api timer start 
	var start_time_view_images_buyer = new Date().getTime();
	applog.info('timer start for view_images_buyer api');
	var book_id = req.body.book_id;
	var title;
	//db timer start
	var start_time_get_images_db_buyer = new Date().getTime();
	applog.info('timer start for get_images_db_buyer ');
	models.Books.findOne({
  				where: {id: book_id},
			})
			.then( result => {
				title = result.Title;
				//s3 timer start
				var start_time_get_images_s3_buyer = new Date().getTime();
				applog.info('timer start for view_images_s3_buyer');
				models.Images.findAll({
  					include: [{
    					model: models.Books,
    					where: {Title: title},
   					}]
				})
				.then( result => {
				// applog.info(result);
					//s3 timer stop
					var end_time_get_images_s3_buyer = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_get_images_s3_buyer = end_time_get_images_s3_buyer - start_time_get_images_s3_buyer; 
					statsd_client.timing('s3_timer_get_images_buyer',exec_time_get_images_s3_buyer);
					applog.info('timer stop for get_images_s3_buyer ');
					//db timer stop
					var end_time_get_images_db_buyer = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_get_images_db_buyer = end_time_get_images_db_buyer - start_time_get_images_db_buyer; 
					statsd_client.timing('db_timer_get_images_buyer',exec_time_get_images_db_buyer);
					applog.info('timer stop for get_images_db_buyer ');
					//api timer stop
					var end_time_view_images_buyer = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_view_images_buyer = end_time_view_images_buyer - start_time_view_images_buyer; 
					statsd_client.timing('api_timer_view_images_buyer',exec_time_view_images_buyer);
					applog.info('timer stop for view_images_buyer api');
					res.render("buyer_view_images",{images : result});
				})
			})

}
exports.display_buyer_page = display_buyer_page;
exports.view_books = view_books;
exports.add_to_cart = add_to_cart;
exports.view_images = view_images;

