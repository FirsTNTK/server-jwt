var passport = require('passport');                     // การเรียกใช้ passport
var { User } = require('../models');


// CREATE LOCAL STRATEGY
const LocalStrategy = require('passport-local')                                                                                         // สร้างตัวแปรแล้ว require passport-local
const userSignIn = new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {   // แล้วสร้าง localstrategy เก็บไว้ตัวแปร userSihnIn ด้านขวาเป็นการกำหนดค่าให้กับ localstrategy
    User.findOne({ where: { email } }).then(data => {      // ใช้ user.findOne และใช้ where ในการกรอง email ที่ส่งมา และได้ข้อมูลมาแล้วเช็คต่อ            // ตัวแรกเป็น object ที่มี usernamefield ที่ส่งมาคืออะไร passwordfield ตอนมันเรียกใช้มาจะมี3อย่างที่ส่งมา
        if (!data) {                                                            // ถ้าไม่มี data ให้ส่งกลับไปไม่ผ่านตัว done จะบอก
            return done(null, false);
        }
        if (data.password != password) {                   // ถ้า data กับ password ที่ส่งมาไม่ตรงกันก็ส่งกลับไป
            return done(null, false);
        }
        data.password = undefined;                          // เราเอาข้อมูลพาสออกโดยการใช้คำสั่งนี้
        return done(null, data);                            // ถ้ามันผ่านส่งค่ากลับไปเป็นดาต้า
    });
});










// //CREATE JWT STRATEGY
const JwtStrategy = require('passport-jwt').Strategy;                                                                   // ประกาศตัวมารับค่า
const ExtractJwt = require('passport-jwt').ExtractJwt;                                                                  // ประกาศตัวมารับค่าตัว extract จะบอกเราว่าเอา token ที่ไหนของ req
const jwtOptions = { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrkey: "secret" };         // ให้ส่งค่ากลับไป jwtOption โดยreq token ที่ไหน และใส่ secretkeyที่เราตั้งไว้้ authRoute
const jwtSignIn = new JwtStrategy(jwtOptions, (payload, done) => {                // ตัว stretegy (เมื่อโคดถูกถอดออกมาคือได้ payload แล้วก็ done )
    User.findByPk(payload.id).then(data => {                                    // ข้อมูล payload จะได้จาก id ที่เราใส่ไว้ใน token และนำมาหาในฐานข้อมูล เราจะได้ data
        if (data) {                                                             // ถ้ามีก็ผ่าน
            data.password = undefined;                                          // ไม่ให้ส่งข้อมูลกลับไป     
            return done(null, data);                                             // ผ่าน
        } else {
            return done(null, false);                                            // ถ้าไม่มีก็ไม่ผ่าน
        }
    });
});



passport.use('user-local', userSignIn);                     // การใช้ stratigy นี้ต้องผ่านตัวนี้
// ต่อด้วยการเขียนรูทให้ผู้ใช้ sighin เข้ามา
passport.use(jwtSignIn);                                    // jwt ไม่ต้องใส่ชื่อ แต่ local ต้องใส่


module.exports = passport;