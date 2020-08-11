const models = require('../models');
const multer = require('multer');
const helpers = require('./helpers');
require('dotenv').config();
var upload = multer({ dest: 'public/uploads/' });
const path = require('path');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
const applog = require('./logger').applog;
statsd = require('statsd-client');
statsd_client = new statsd();

var s3 = new aws.S3({ /* ... */ });

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
let display_seller_page = function(req, res, next) {
	res.render('seller_page');
};

let display_books = function(req, res, next) {
	//api timer start
	var start_time_view_books_seller = new Date().getTime();
	applog.info('timer start for view_books_seller api');
	let user_email = req.session.email;
	let user_id;
	applog.info('increment counter for view_books_seller page');
	statsd_client.increment('view_books_invocations_seller');
	//db timer start
	var start_time_get_books_db_seller = new Date().getTime();  
	applog.info('timer start for get_books_db to fetch books for seller');
	models.Users.findOne({ where: { email: user_email } })
		.then(user => {
			user_id = user.id;
			applog.info('id:'+ user_id);
			models.Books.findAll({ where: { Seller_id: user_id } })
				.then(result => {
					applog.info('result:'+result);
					//db timer stop
					var end_time_get_books_db_seller = new Date().getTime();
					var exec_time_get_books_db_seller = end_time_get_books_db_seller - start_time_get_books_db_seller;
					statsd_client.timing('db_timer_get_books_seller',exec_time_get_books_db_seller);
					applog.info('timer stop for get_books_db_seller');
					//api timer stop
					var end_time_view_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_view_books_seller = end_time_view_books_seller - start_time_view_books_seller; 
					statsd_client.timing('api_timer_view_books_seller',exec_time_view_books_seller);
					applog.info('timer stop for view_books_seller api');
					res.render('view_added_books',{ added_books: result } );
				})
				.catch((e) => { err => console.error(err.message)});	
		})
		.catch((e) => { err => console.error(err.message)});
};

let display_add_books_page = function(req, res, next) {
	res.render('seller_add_books');
};

let update_books = function(req, res, next) {
	let book_id_new  = req.body.book_id;
	models.Books.findOne({ where: { id: book_id_new } })
		.then(book => {
			applog.info('res:'+book.Title);
			res.render("seller_update_book",{ bookdetails: book });
		})
		.catch((e) => { err => console.error(err.message)});
	
};

let update_book_details = function(req, res, next) {
	//api timer start
	var start_time_update_books_seller = new Date().getTime();
	applog.info('timer start for update_books_seller api');
	let book_id_new = req.body.book_id;
	let ISBN_new = req.body.ISBN;
	let Title_new = req.body.Title;
	let Authors_new = req.body.Authors;
	let PublicationDate_new = req.body.PublicationDate;
	let Price_new = req.body.Price;
	let Quantity_new = req.body.Quantity;
	
	// applog.info("in update:"+book_id_new+ISBN_new+Title_new+Authors_new+PublicationDate_new+Price_new+Quantity_new);
	if(Quantity_new < 0 || Quantity_new > 999)
	{
				//error
				//api timer stop
				var end_time_update_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
				var exec_time_update_books_seller = end_time_update_books_seller - start_time_update_books_seller; 
				statsd_client.timing('api_timer_update_books_seller',exec_time_update_books_seller);
				applog.info('timer stop for update_books_seller api');
				res.render("update_error");
	}
	else
	{
				//price for the book with minimum of 0.01 and maximum of 9999.99
				if(Price_new < 0.01 || Price_new > 9999.99 || isNaN(Price_new))
				{
					//error
					//api timer stop
					var end_time_update_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_update_books_seller = end_time_update_books_seller - start_time_update_books_seller; 
					statsd_client.timing('api_timer_update_books_seller',exec_time_update_books_seller);
					applog.info('timer stop for update_books_seller api');
					res.render("update_error_price");
				}
				else
				{
					if(new Date(req.body.PublicationDate) > new Date())
					{
						//date error
						//api timer stop
						var end_time_update_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
						var exec_time_update_books_seller = end_time_update_books_seller - start_time_update_books_seller; 
						statsd_client.timing('api_timer_update_books_seller',exec_time_update_books_seller);
						applog.info('timer stop for update_books_seller api');

						res.render("update_date_error");

					}
					else
					{
						//db timer start
						var start_time_update_books_db_seller = new Date().getTime();  
						applog.info('timer start for update_books_db to update books for seller');
						models.Books.update({ ISBN: ISBN_new, Title: Title_new, Authors: Authors_new, PublicationDate: PublicationDate_new, Price: Price_new, Quantity: Quantity_new }, {
  						where: {
    						id: book_id_new
  						}
						})
						.then((result) => {
							applog.info("Updated successfully");
							//db timer stop
							var end_time_update_books_db_seller = new Date().getTime();
							var exec_time_update_books_db_seller = end_time_update_books_db_seller - start_time_update_books_db_seller;
							statsd_client.timing('db_timer_update_books_seller',exec_time_update_books_db_seller);
							applog.info('timer stop for update_books_db_seller');
							//api timer stop
							var end_time_update_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
							var exec_time_update_books_seller = end_time_update_books_seller - start_time_update_books_seller; 
							statsd_client.timing('api_timer_update_books_seller',exec_time_update_books_seller);
							applog.info('timer stop for update_books_seller api');
							res.render("update_success");
						})
						.catch(err => console.error(err.message));						
					}

				}	
	}
	
};

let delete_books = function(req, res, next) {
	//api timer start
	var start_time_delete_books_seller = new Date().getTime();
	applog.info('timer start for delete_books_seller api');
	let book_id = req.body.book_id;
	let img_path;

	//db timer start
	var start_time_delete_books_db_seller = new Date().getTime();  
	applog.info('timer start for delete_books_db to delete books for seller');
	models.Images.findAll({ where: { Book_id: book_id } })
		 .then(images => {
		 	//s3 timer start
			var start_time_delete_images_s3_seller = new Date().getTime();
			applog.info('timer start for delete_images_s3_seller');
		 	images.forEach(image => {
		 		img_path = image.path;
		 		//delete image from s3
		 		var filename = img_path.substring(img_path.lastIndexOf('/')+1);
				applog.info("deleting file:"+filename);
		 		var bucketInstance = new aws.S3();
    			var params = {
       				Bucket: BUCKET_NAME ,
        			Key: filename
    			};
    			bucketInstance.deleteObject(params, function (err, data) {
        			if (data) {
        				//s3 timer stop
						var end_time_delete_images_s3_seller = new Date().getTime();  //seconds since epoch in milliseconds
						var exec_time_delete_images_s3_seller = end_time_delete_images_s3_seller - start_time_delete_images_s3_seller; 
						statsd_client.timing('s3_timer_delete_images_seller',exec_time_delete_images_s3_seller);
						applog.info('timer stop for delete_images_s3_seller');
            			applog.info("File deleted successfully");
        			}
        			else {
            			applog.info("Check if you have sufficient permissions : "+err);
            			//s3 timer stop
						var end_time_delete_images_s3_seller = new Date().getTime();  //seconds since epoch in milliseconds
						var exec_time_delete_images_s3_seller = end_time_delete_images_s3_seller - start_time_delete_images_s3_seller; 
						statsd_client.timing('s3_timer_delete_images_seller',exec_time_delete_images_s3_seller);
						applog.info('timer stop for delete_images_s3_seller');
        			}
    			})
		 		models.Images.destroy({ where: { id: image.id} })
					.then(result => {
						applog.info("deleted");
					});
		 	}); 	 
		 })
		.then( resu => {
			models.Books.destroy({ where: { id: book_id} })
				.then(result => { 
     					applog.info('Deleted successfully');
     					//db timer stop
						var end_time_delete_books_db_seller = new Date().getTime();
						var exec_time_delete_books_db_seller = end_time_delete_books_db_seller - start_time_delete_books_db_seller;
						statsd_client.timing('db_timer_delete_books_seller',exec_time_delete_books_db_seller);
						applog.info('timer stop for delete_books_db_seller');
     					//api timer stop
						var end_time_delete_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
						var exec_time_delete_books_seller = end_time_delete_books_seller - start_time_delete_books_seller; 
						statsd_client.timing('api_timer_delete_books_seller',exec_time_delete_books_seller);
						applog.info('timer stop for delete_books_seller api');
     					res.render("delete_success");
				})
				.catch(err => console.error(err.message));
			});
};

let add_book = function(req, res, next) {
	//api timer start
	var start_time_add_books_seller = new Date().getTime();
	applog.info('timer start for add_books_seller api');
	let user_email = req.session.email;
	let user_id;

	
	 models.Users.findOne({ where: { email: user_email } })
		 .then(user => { 
		 	user_id = user.id;
			applog.info('id:'+user.id);
			//for entries in db equal to quantity
			var i = 0;
			applog.info("p:"+req.body.Price);
			var price = parseFloat(req.body.Price);
			let quantity = req.body.Quantity;  
			let q = parseInt(quantity);
			//quantity should be between 0 and 999
			if(q < 0 || q > 999)
			{
				//error
				//api timer stop
				var end_time_add_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
				var exec_time_add_books_seller = end_time_add_books_seller - start_time_add_books_seller; 
				statsd_client.timing('api_timer_add_books_seller',exec_time_add_books_seller);
				applog.info('timer stop for add_books_seller api');
				res.render("add_error");
			}
			else
			{
				//price for the book with minimum of 0.01 and maximum of 9999.99
				applog.info("price:"+price);
				if(price < 0.01 || price > 9999.99 || isNaN(price))
				{
					//error
					//api timer stop
					var end_time_add_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_add_books_seller = end_time_add_books_seller - start_time_add_books_seller; 
					statsd_client.timing('api_timer_add_books_seller',exec_time_add_books_seller);
					applog.info('timer stop for add_books_seller api');
					res.render("add_error_price");
				}
				else
				{
					if(new Date(req.body.PublicationDate) > new Date())
					{
						//date error
						//api timer stop
						var end_time_add_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
						var exec_time_add_books_seller = end_time_add_books_seller - start_time_add_books_seller; 
						statsd_client.timing('api_timer_add_books_seller',exec_time_add_books_seller);
						applog.info('timer stop for add_books_seller api');
						res.render("date_error");
					}
					else
					{
        					//add books to db
        					//db timer start
							var start_time_add_books_db_seller = new Date().getTime();  
							applog.info('timer start for add_books_db to add books for seller');
						models.Books.create({
								ISBN: req.body.ISBN,
								Title: req.body.Title,
								Authors: req.body.Authors,
								PublicationDate: req.body.PublicationDate,
								Price: price,
								Quantity: q,
								Seller_id: user_id,
						})
    					.then(() => {
    							//db timer stop
								var end_time_add_books_db_seller = new Date().getTime();
								var exec_time_add_books_db_seller = end_time_add_books_db_seller - start_time_add_books_db_seller;
								statsd_client.timing('db_timer_add_books_seller',exec_time_add_books_db_seller);
								applog.info('timer stop for add_books_db_seller');
    							//api timer stop
								var end_time_add_books_seller = new Date().getTime();  //seconds since epoch in milliseconds
								var exec_time_add_books_seller = end_time_add_books_seller - start_time_add_books_seller; 
								statsd_client.timing('api_timer_add_books_seller',exec_time_add_books_seller);
								applog.info('timer stop for add_books_seller api');
        						res.render('add_success'); 
        				}
    					)
    					.catch((e) => { err => console.error(err.message)});
        			}
        					
    			}
			}

		});
}

let add_book_image = function(req, res, next) {
//display pg to get image details
	let book_id_new  = req.body.book_id;
	res.render('seller_add_image',{book_id: book_id_new});
}

let add_images = function(req, res, next) {	
			//api timer start
			var start_time_add_images_seller = new Date().getTime();
			applog.info('timer start for add_images_seller api');
			let book_id  = req.body.book_id;
			const files = req.files;
			if (!files) {
    			res.render("choose_files_error",{book_id: book_id});
  			}
			else
			{
				//db timer start
				var start_time_add_images_db_seller = new Date().getTime();  
				applog.info('timer start for add_images_db to add images for seller');
				files.forEach(file => {
		 			models.Images.create({
						path: file.location, 
						Book_id: book_id,	
						key: file.key	
					})
    				.then(() => {
        				applog.info("added file"+file.location+"to db");
        			}
    				)
    				.catch((e) => { err => console.error(err.message)});
    			})
    			//db timer stop
				var end_time_add_images_db_seller = new Date().getTime();
				var exec_time_add_images_db_seller = end_time_add_images_db_seller - start_time_add_images_db_seller;
				statsd_client.timing('db_timer_add_images_seller',exec_time_add_images_db_seller);
				applog.info('timer stop for add_images_db_seller');
    			//api timer stop
				var end_time_add_images_seller = new Date().getTime();  //seconds since epoch in milliseconds
				var exec_time_add_images_seller = end_time_add_images_seller - start_time_add_images_seller; 
				statsd_client.timing('api_timer_add_images_seller',exec_time_add_images_seller);
				applog.info('timer stop for add_images_seller api');
    			res.render('image_add_success',{book_id:book_id});
			}	
}

let view_images = function(req, res, next) {
	//api timer start
	var start_time_view_images_seller = new Date().getTime();
	applog.info('timer start for view_images_seller api');
	let book_id = req.body.book_id;
	//db timer start
	var start_time_view_images_db_seller = new Date().getTime();  
	applog.info('timer start for view_images_db to view images for seller');
	//s3 timer start
	var start_time_get_images_s3_seller = new Date().getTime();
	applog.info('timer start for view_images_s3_seller');
	models.Images.findAll({
  				where: {Book_id: book_id},
  				include: [{
    				model: models.Books
   				}]
			})
			.then( result => {
				// applog.info(result);
				//s3 timer stop
				var end_time_get_images_s3_seller = new Date().getTime();  //seconds since epoch in milliseconds
				var exec_time_get_images_s3_seller = end_time_get_images_s3_seller - start_time_get_images_s3_seller; 
				statsd_client.timing('s3_timer_get_images_seller',exec_time_get_images_s3_seller);
				applog.info('timer stop for get_images_s3_seller');
				//db timer stop
				var end_time_view_images_db_seller = new Date().getTime();
				var exec_time_view_images_db_seller = end_time_view_images_db_seller - start_time_view_images_db_seller;
				statsd_client.timing('db_timer_view_images_seller',exec_time_view_images_db_seller);
				applog.info('timer stop for view_images_db_seller');
				if(result.length == 0)
				{
					//api timer stop
					var end_time_view_images_seller = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_view_images_seller = end_time_view_images_seller - start_time_view_images_seller; 
					statsd_client.timing('api_timer_view_images_seller',exec_time_view_images_seller);
					applog.info('timer stop for view_images_seller api');
					res.render("no_images_added",{ book_id: book_id});
				}
				else
				{
					//api timer stop
					var end_time_view_images_seller = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_view_images_seller = end_time_view_images_seller - start_time_view_images_seller; 
					statsd_client.timing('api_timer_view_images_seller',exec_time_view_images_seller);
					applog.info('timer stop for view_images_seller api');
					res.render("view_added_images",{images : result});
				}
			})
		
}

let delete_image = function(req, res, next) {
	//api timer start
	var start_time_delete_images_seller = new Date().getTime();
	applog.info('timer start for delete_images_seller api');
	let image_id = req.body.image_id;
	let img_path;
	models.Images.findOne({ where: { id: image_id } })
		 .then(image => {
		 	img_path = image.path;
		 	//delete image from s3
		 	//s3 timer start
			var start_time_delete_images_s3_seller = new Date().getTime();
			applog.info('timer start for delete_images_s3_seller');
		 	var filename = img_path.substring(img_path.lastIndexOf('/')+1);
			applog.info("deleting file:"+filename);
		 	var bucketInstance = new aws.S3();
    		var params = {
       			Bucket: BUCKET_NAME ,
        		Key: filename
    		};
    		bucketInstance.deleteObject(params, function (err, data) {
        	if (data) {
        		//s3 timer stop
				var end_time_delete_images_s3_seller = new Date().getTime();  //seconds since epoch in milliseconds
				var exec_time_delete_images_s3_seller = end_time_delete_images_s3_seller - start_time_delete_images_s3_seller; 
				statsd_client.timing('s3_timer_delete_images_seller',exec_time_delete_images_s3_seller);
				applog.info('timer stop for delete_images_s3_seller');
            	applog.info("File deleted successfully");
        	}
        	else {
        		//s3 timer stop
				var end_time_delete_images_s3_seller = new Date().getTime();  //seconds since epoch in milliseconds
				var exec_time_delete_images_s3_seller = end_time_delete_images_s3_seller - start_time_delete_images_s3_seller; 
				statsd_client.timing('s3_timer_delete_images_seller',exec_time_delete_images_s3_seller);
				applog.info('timer stop for delete_images_s3_seller');
            	applog.info("Check if you have sufficient permissions : "+err);
        	}
    		});

    		//db timer start
			var start_time_delete_images_db_seller = new Date().getTime();  
			applog.info('timer start for delete_images_db to delete images for seller');
		 	models.Images.destroy({ where: { id: image_id} })
				.then(result => {
					//db timer stop
					var end_time_delete_images_db_seller = new Date().getTime();
					var exec_time_delete_images_db_seller = end_time_delete_images_db_seller - start_time_delete_images_db_seller;
					statsd_client.timing('db_timer_delete_images_seller',exec_time_delete_images_db_seller);
					applog.info('timer stop for delete_images_db_seller');
					//api timer stop
					var end_time_delete_images_seller = new Date().getTime();  //seconds since epoch in milliseconds
					var exec_time_delete_images_seller = end_time_delete_images_seller - start_time_delete_images_seller; 
					statsd_client.timing('api_timer_delete_images_seller',exec_time_delete_images_seller);
					applog.info('timer stop for delete_images_seller api');
					res.render("delete_image_success");


				});
		 }); 
}

exports.display_seller_page = display_seller_page;
exports.display_books = display_books;
exports.display_add_books_page = display_add_books_page;
exports.update_books = update_books;
exports.update_book_details = update_book_details;
exports.delete_books = delete_books;
exports.add_book = add_book;
exports.add_book_image = add_book_image;
exports.add_images = add_images;
exports.view_images = view_images;
exports.delete_image = delete_image;
// exports.upload = upload;


