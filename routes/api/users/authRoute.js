var express = require('express');
var router = express.Router();


// PASSPORT
const passport = require('passport');


// JWT
var jwt = require('jsonwebtoken')                   // ตัวสร้าง token
var requireUserSignIn = passport.authenticate('user-local', { session: false });                        // เราสามารถนำ middleware มาทำเป็นตัวแปรแล้วยัดค่ากลับไปเพื่อความสวยงาม
var requireJwt = passport.authenticate('jwt', {session : false });



// Sign in | user                                                                                               // มาแบบ user-local ไม่เก็บข้อมูลใน session
router.post('/user', requireUserSignIn , (req, res, next) => {              // เมื่อมันวิ่งเข้ามาผ่าน passport.authenticate มันจะวิ่งไปทำงานที่ passport.js
    var token = jwt.sign({ id: req.user.id }, "secret", { expiresIn: '1y' });                         // id : req.user.id จะได้ข้อมูลจาก stategy ใน passport.js data  api-development เป็น secret key jwt เป็น string 
    res.send({success: {message : 'Sign in successfully.', token, token_type : 'bearer', user: req.user}});     // { expiresIn เป็นออฟชั่นให้หมด 1 ปี}   เป็น object ของออฟชั่น                               
});         // ส่งค่ากลับออกไป ทั้ง message และ token และ token ชนิดไหน bearer ข้อมูลของ user

                // route profile authen ด้วยใช้ jwt session false เพราะจะไม่เก็บอะไรไว้
router.get('/profile', requireJwt , (req, res) => {
    res.send(req.user);                                                                            // req.user ได้จาก  passport.authenticate('jwt', {seesion : false }) แล้วมันจะเข้าไปเรียกใน passport.js            
});



module.exports = router;