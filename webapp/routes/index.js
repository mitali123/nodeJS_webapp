var express = require('express');
var router = express.Router();
const multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
const path = require('path');
var aws = require('aws-sdk');
var multerS3 = require('multer-s3');
const env = 'development';
require('dotenv').config();
var s3 = new aws.S3({ /* ... */ });
const applog = require('../controllers/logger').applog;
statsd = require('statsd-client');
statsd_client = new statsd();
var start_time_s3_upload;

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
var upload = multer({
  			storage: multerS3({
    			s3: s3,
    			bucket: BUCKET_NAME,
			    acl: 'public-read',
    			metadata: function (req, file, cb) {
      				cb(null,{fieldName: file.fieldname});
    			},
    				key: function (req, file, cb) {
      				cb(null, file.originalname);
    			}
        })
});

var start_timer = function(req, res, next) {
  applog.info('timer start for uploading to S3');
  start_time_s3_upload = new Date().getTime();
  next();
};

var stop_timer = function(req, res, next) {
  var end_time_s3_upload = new Date().getTime();
  var exec_time_s3_upload = end_time_s3_upload - start_time_s3_upload; 
  applog.info('start time for s3 upload'+start_time_s3_upload);
  applog.info('exc time for s3 upload'+exec_time_s3_upload);
  statsd_client.timing('s3_timer_upload_images_seller',exec_time_s3_upload);
  applog.info('stop timer for s3 upload');
  next();
};

/* get controller */
let login = require('../controllers/login');
let buy = require('../controllers/buy');
let sell = require('../controllers/sell');
let cart = require('../controllers/cart');

router.get('/',login.get_login_info);
router.post('/get_login_info', login.get_login_info);
router.post('/login', login.auth_login);
router.post('/register', login.register_new_user);
router.post('/add_new_user_info', login.add_new_user_info);
router.post('/homepage', login.display_homepage);
router.post('/logout', login.logout);
router.post('/viewAccountDetails', login.view_account_details);
router.post('/change_account_details', login.change_account_details);
router.post('/update_account_details', login.update_account_details);
router.post('/change_password', login.update_password);
router.post('/change_password_details', login.change_password_details);
router.post('/sell_books', sell.display_seller_page);
// router.post('/view_cart', cart.display_cart);
router.post('/seller_view_books', sell.display_books);
router.post('/seller_add_books', sell.display_add_books_page);
router.post('/seller_update_books', sell.update_books);
router.post('/seller_update_book_details', sell.update_book_details);
router.post('/seller_delete_books', sell.delete_books);
router.post('/add_book', sell.add_book);
router.post('/buy_books', buy.display_buyer_page);
router.post('/buyer_view_books', buy.view_books);
router.post('/add_to_cart', buy.add_to_cart);
router.post('/view_cart', cart.view_cart);
router.post('/remove_from_cart', cart.remove_from_cart);
router.post('/place_order', cart.place_order);
router.post('/seller_add_image',sell.add_book_image);
// router.post('/add_images',upload.array('images',15),sell.add_images);
router.post('/add_images',start_timer,upload.array('images',15),stop_timer,sell.add_images);
router.post('/seller_view_images',sell.view_images);
router.post('/delete_image', sell.delete_image);
router.post('/buyer_view_images', buy.view_images);
router.post('/reset_password', login.reset_password);
router.post('/forgot_password_new', login.change_password);
module.exports = router;
