const models = require('../models');
const applog = require('./logger').applog;
statsd = require('statsd-client');
statsd_client = new statsd();

let view_cart = function(req, res, next) {
	//api timer start
	var api_start_time_view_cart = new Date().getTime();
	applog.info('timer start for api view_cart');
	let user_email = req.session.email;
	let user_id;
	let t_price = 0;
	applog.info("in cart");
	//db timer start
	var db_start_time_view_cart = new Date().getTime();
	applog.info('timer start for db view_cart');
	models.Users.findOne({ where: { email: user_email } })
		.then(user => {
			user_id = user.id;
			applog.info("user_id:"+user_id);
		
			models.Cart.findAll({
  				where: {User_id: user_id},
  				include: [{
    				model: models.Books
   				}]
			})
			.then( result => {
					// applog.info("success");

					if(result.length === 0)
					{
						//db timer stop
						var db_end_time_view_cart = new Date().getTime();
						var db_exec_time_view_cart = db_end_time_view_cart - db_start_time_view_cart;
						statsd_client.timing('db_timer_view_cart',db_exec_time_view_cart);
						applog.info('timer stop for db view_cart');
						//cart empty
						res.render("cart_empty");
					}
					else
					{
						result.forEach(item => {
							if(item.Book_id != null)
							{
								t_price = t_price + item.Price;
							}
                        
                  		});
                  		//db timer stop
						var db_end_time_view_cart = new Date().getTime();
						var db_exec_time_view_cart = db_end_time_view_cart - db_start_time_view_cart;
						statsd_client.timing('db_timer_view_cart',db_exec_time_view_cart);
						applog.info('timer stop for db view_cart');
						//api timer stop
						var api_end_time_view_cart = new Date().getTime();
						var api_exec_time_view_cart = api_end_time_view_cart - api_start_time_view_cart;
						statsd_client.timing('api_timer_view_cart',api_exec_time_view_cart);
						applog.info('timer stop for api view_cart');
						res.render("view_cart",{ cart_items : result , total_price: t_price});
					}
					
			})
			.catch((e) => { err => console.error(err.message)});
		})
		.catch((e) => { err => console.error(err.message)});
}

let remove_from_cart = function(req, res, next) {
	//api timer start
	var api_start_time_remove_from_cart = new Date().getTime();
	applog.info('timer start for api remove_from_cart');
	let user_email = req.session.email;
	let user_id;
	let cart_q;
	let actual_q;
	let Book_id = req.body.Book_id;
	let cart_id = req.body.Cart_id;

	applog.info("book_id:"+Book_id);
	//update quantity in book table
	if(Book_id)
	{
		applog.info("in detelebjdbjd");
		applog.info("cartid:"+cart_id);
		//db timer start
		var db_start_time_remove_from_cart = new Date().getTime();
		applog.info('timer start for db remove_from_cart');
		models.Cart.findOne({ where: { id: cart_id } })
			.then(item => {
				cart_q = item.Quantity;
				applog.info("cart_q:"+ cart_q);
				models.Books.findOne({ where: {id: Book_id}})
					.then(book => {
						actual_q = book.Quantity;
						applog.info("book_q:"+actual_q);
						actual_q = actual_q + cart_q;
						models.Books.update({ Quantity: actual_q}, {where: { id: Book_id }})
							.then(() => {
								models.Cart.destroy({ where: { id: cart_id} })
									.then(result => {
										applog.info("deleted");
										//db timer stop
										var db_end_time_remove_from_cart = new Date().getTime();
										var db_exec_time_remove_from_cart = db_end_time_remove_from_cart - db_start_time_remove_from_cart;
										statsd_client.timing('db_timer_remove_from_cart',db_exec_time_remove_from_cart);
										applog.info('timer stop for db remove_from_cart');
										//api timer stop
										var api_end_time_remove_from_cart = new Date().getTime();
										var api_exec_time_remove_from_cart = api_end_time_remove_from_cart - api_start_time_remove_from_cart;
										statsd_client.timing('api_timer_remove_from_cart',api_exec_time_remove_from_cart);
										applog.info('timer stop for api remove_from_cart');
										res.render("cart_update_success");
									})
									.catch((e) => { err => console.error(err.message)});
							})
							.catch((e) => { err => console.error(err.message)});
					})
					.catch((e) => { err => console.error(err.message)});
			}
			)
			.catch((e) => { err => console.error(err.message)});
	}
	else
	{
		models.Cart.destroy({ where: { id: cart_id} })
		.then(result => {
			applog.info("deleted");
			res.render("cart_update_success");

		})
		.catch((e) => { err => console.error(err.message)});
	}
}

let place_order = function(req, res, next) {
	//api timer start
	var api_start_time_place_order = new Date().getTime();
	applog.info('timer start for api place_order');
	let user_email = req.session.email;
	let user_id;
	// let t_price = 0;
	// applog.info("in cart");
	//db timer start
	var db_start_time_place_order = new Date().getTime();
	applog.info('timer start for db place_order');
	models.Users.findOne({ where: { email: user_email } })
		.then(user => {
			user_id = user.id;
			applog.info("user_id:"+user_id);
		
			models.Cart.update({ Payment_Done : true }, {
  						where: {
    						User_id : user_id
  						}
				})
				.then(() => {
					//db timer stop
					var db_end_time_place_order = new Date().getTime();
					var db_exec_time_place_order = db_end_time_place_order - db_start_time_place_order;
					statsd_client.timing('db_timer_place_order',db_exec_time_place_order);
					applog.info('timer stop for db place_order');
					//api timer stop
					var api_end_time_place_order = new Date().getTime();
					var api_exec_time_place_order = api_end_time_place_order - api_start_time_place_order;
					statsd_client.timing('api_timer_place_order',api_exec_time_place_order);
					applog.info('timer stop for api place_order');
					res.render("order_success");
				})
				.catch((e) => { err => console.error(err.message)});
		})
		.catch((e) => { err => console.error(err.message)});

}
exports.view_cart = view_cart;
exports.remove_from_cart = remove_from_cart;
exports.place_order = place_order;