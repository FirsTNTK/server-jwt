var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var index = require('./routes/api/users/indexRoute');
var authApi = require('./routes/api/users/authRoute')
var userApi = require('./routes/api/users/usersRoute');
var productApi = require('./routes/api/product/productRoute');
require('./services/passport');                                                       // ทำให้ express รู้จัก passport ถ้าเราต้องมีมาใช้ในนี้อีกให้ใส่ไปในตัวแปรนึงก็ได้


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/auth', authApi)
app.use('/api/users', userApi);
app.use('/api/products', productApi);

// Upload File
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))                 // ให้กำหนด.ใช้ตัวเป็น url uplodas แล้วใช้คำสั่ง express.static เพราะเป็นรูปภาพ และบอกว่ารูปอยู่ที่ไหนให้ใช้ path.join
                                                                                    // __dirname มันจะได้ตำแหน่งตัวที่ app.js อยู่ และ , ชื่อไฟล์ เพราะมันจะเอาไฟล์ในนั้นไปเซทให้กับลิ้งนี้
                                                                                    // ในกรณีที่เราไม่เซทตรงนี้ภายนอกก็จะเข้ามาดูไม่ได้


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const { name, message } = err;                  // ประกาศตัวแปรมารับค่า error ไว้ คือ name, message

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error: { name, message } });         //  format ที่เราสร้างขึ้นมาใหม่จะบอกชื่อและเหตุผลที่มีปัญหาที่เราตั้งไว้ในแต่ละอัน
  // res.render('error');
});

module.exports = app;
