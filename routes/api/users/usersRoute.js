var express = require('express');
var { body, validationResult } = require('express-validator');                                      // เรียกการใช้งาน validation แต่ต้องลง npm ก่อน
var router = express.Router();
var moment = require('moment')                  // ไว้ดึงวันเวลาได้
var excel = require('exceljs')                  // ไว้ใช้กับไฟล์ excel


var { User } = require("../../../models")      // เราเรียกใช้ user ของ sequelize

// Passport
const passport = require('passport')
const requireJwt = passport.authenticate('jwt', { session: false});       // การนำ passport เข้ามาเพื่อจะได้ติดต่อกับฐานข้อมูล



// MULTER | UPLOAD FILE
var multer = require('multer');
var path = require('path');                           // ในกรณีที่เราจะไม่เอาชื่อของไฟล์แต่เอาแค่ประเภทของไฟล์ให้require path มา แล้วใส่เพิ่มไปใน filename โดยใช้คำสั่ง path.extname คลอบคำสั่ง file.original
var shell = require('shelljs')                        // ไว้สำหรับสร้างโฟล์เด้อ
var storageFile = multer.diskStorage({
  destination: (req, file, cb) => {                   // ตำแหน่งของโฟล์เด้อเก็บไฟล์ แล้วเอาตัวนี้ไปแทน ที่ใน multer 
    const dir = `uploads/profile/${moment().format(`YYYYMM`)}`;         // สร้างตัวแปร dir มารับ และใส่ ตำแหน่งไฟล์พร้อมคำสั่ง ดึงเวลาวันที่ พร้อมรูปแบบที่แสดง format ํ
    shell.mkdir('-p', dir);                                             // ให้สร้างไฟล์อัตโนมัติโดยใช้ shell และก็คำสั่ง สร้าง dir อยู่ข้างหลังเพราะว่าถ้ามันไม่มี dir มันจะสร้างขึ้นมาให้                  
    cb(null, dir)                                                       // และนำ dir ลงมากำหนดให้ในส่วนของข้างล่าง
  },
  filename: (req, file, cb) => {                      // คุณสมบัติ ชื่อไฟล์  จะเป็น function รับค่า req file cb  callback   เราจะกำหนดชื่อไฟล์ผ่าน cb          
    cb(null, Date.now() + path.extname(file.originalname));                      // ใส่ null ตัวแรกเพราะไม่มี error และตัวที่ 2 คือชื่อไฟลฺ์ของมัน ในกรณีที่ชื่อซ้ำกันมันจะเซฟทับเลยต้องใช้คำสั่ง Date.now ในการช่วยเซฟ
  }
});
var uploadProfileImage = multer({                                                                               // เราสามารถใส่ filter กี่ตัวก็ได้ ผ่านตัว all || file.mimetype เป็นคำสั่งไว้กรองชนิดไฟล์                           
  storage: storageFile, fileFilter: (req, file, cb) => {                                                        // เราสามารถใช่ fileFilter ผ่านตัว multer ได้เลย โดยประกาศลงแล้ว ใส่ function
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {                      //  ถ้า file ที่ส่งมา เป็น png jpg jpeg ถึงจะถูกต้องและส่งต่อไปได้
      cb(null, true);
    } else {
      cb(null, false);                                                          //ถ้าข้อมูลที่ส่งมาไม่ถูกต้องให้ส่งข้อความerror ไปหาผู้ใช้ (แต่ในกรณีนี้มันจะส่ง error กลับมาเป็น htmlเพราะมันทำงานผ่านตัว middleware)
      return cb(new Error("Only .jpg .jpeg .png format allowed!"));             //   ต้องแก้ในส่วน app.js เพราะมันแสดง error เป็น html
    }
  }
});  // สร้างตัวแปรให้มารับค่า ให้เก็บไฟล์ multer ใน โฟล์เด้อ uploads  และนำตัวแปรที่มีค่าที่รับมาไปใส่เป็น middleware




// Fetch all user เป็นการดึงทั้งหมด
router.get('/',  function (req, res, next) {
  let { page = 1, limit = 10, sort = "id", order = "asc", ...filter } = req.query;                   //เป็นการเพิ่มเงื่อนไขในการ filter
  page = parseInt(page);                                                                             // กำหนดให้เป็นตัวเลขไม่เป็น string
  limit = parseInt(limit);                                                                           // กำหนดให้เป็นตัวเลขไม่เป็น string
  let offset = (page - 1) * limit;                                                                    // สูตรคำนวณ


  User.findAll({                                              //แล้วนำตัวแปรuserมาหาข้างในทั้งหมดในmodelนี้ สามารถใส่ filter ได้้ 
    where: filter,                                             // และใช้ where filter ที่ อยู่ข้างบน  และนำมาใส่ offset สูตรที่ทำมา
    offset,
    limit: limit <= 0 ? undefined : limit,                   // การเซ็ทลิมิทแต่ต้องเช็คด้วยถ้า limit <= 0 ให้เป็น undefined ดึงมาทั้งหมดเลย : แต่ถ้าไม่ใช่ 0ให้ใส่ค่าเดิมของมัน
    order: [[sort, order]]                                    // การ sort จะผ่านตัว order และเป็น array เป็นการเรียงคอลัม แบบไหน อันดับ แบบไหน                                      
  }).then(data => {                                           // ข้อมูลที่ส่งออกมาจะผ่าน method then (data)
    res.send(data);                                           // เมื่อได้ data ก็ส่งกลับไป
  }).catch((err) => {                                                             // sequelize จะส่ง error กลับมาผ่าน method catch เลยใช้ตัวนี้กับ => err
    const { original: { code, sqlMessage } } = err;                               // การกำหนด code sqlMessage ถ้ามัน err 
    res.status(400).send({ error: { name: code, message: sqlMessage } });         // ให้ส่งเหตุผลที่มัน error และชื่อที่ error ออกมา พร้อม status
  })
});



// Fetch by id หาที่ละตัว 
router.get('/:id',  function (req, res, next) {
  User.findByPk(req.params.id).then(data => {                                   // ให้เอาตัว User. method findByPk (primalrykey)
    if (data) {
      res.send(data);                                                           // ถ้าเจอ data ให้ส่งค่าออกมา
    } else {
      res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })         // ถ้าไม่เจอให้ส่ง หาไม่เจอ
    }
  })
});


// Create ข้อมูล  
router.post('/',  uploadProfileImage.single('file'),                             // นำ uploadProfileImageมาเป็น middleware .single คือมาไฟล์เดียว ('ชื่อตัวแปร') และนำ file ที่ส่งมาไปอยู่ในไฟล์ upload
  body('firstName').notEmpty().trim().escape(),
  body('lastName').notEmpty().trim().escape(),                                           // กำหนดชื่อและนามสกุลต้องใส่ลงมาตลอด   
  body('birthDate').if(body('birthDate').exists()).isDate(),                  // กำหนดแพทเทิลเป็นวันเวลา     if(body('birthDate').exists()) ถ้ามีค่าค่อยไปเช็ค isDate ถ้าไม่มีปล่อยผ่าน
  body('password').notEmpty().isLength({ min: 4, max: 20 })
    .withMessage('must be at 4 to 20 chars long').trim(),                 // isLength เป็นการกำหนดจำนวนข้อความ
  body('email').notEmpty().isEmail().normalizeEmail(),
  (req, res, next) => {                                                   // เรียกmiddleware validation มากรองเพิ่ม คือ body('email').isEmail() .notEmpty คือต้องค่าไม่ว่าง

    console.log(req.file);


    const errors = validationResult(req);                                                // สร้างตัวแปร errors ที่มารับค่า req validationResult ขึ้นมา
    if (!errors.isEmpty()) {                                                            // ถ้าค่า errors ตรงนี้มันไม่ว่าง
      res.status(400).send({ errors: errors.array() });                                   // ให้ส่ง errorsกลับไปในพวกนี้ errors.array() 
    } else {
      if (req.file != undefined || req.file != null) {               // เช็คว่ามีการส่งรูปมารึป่าวใช้ req.file คือที่ส่งมา ไม่เท่ากับ != ว่างเปล่า หรือ req.file ไม่เท่ากับ != ไม่มีค่าอะไรเลย
        req.body.profileImage = req.file.path;                       // ให้ส่งตัวที่ส่งจาก req.file.path มาให้กับ req.body.profileImage  และตัว Req.body จะส่งค่าไปให้กับ User.create
      }
      User.create(req.body).then(data => {                                              // ใช้ model user และใช้ method create จะรับตัว object เป็น req.body แล้วเพิ่มข้อมูลเสร็จก็จะส่ง data กลับมา
        res.send({ success: { message: "Insert successfully.", result: data } })
      }).catch((err) => {                                                              // sequelize จะส่ง error กลับมาผ่าน method catch เลยใช้ตัวนี้กับ => err
        const { original: { code, sqlMessage } } = err;                               // การกำหนด code sqlMessage ถ้ามัน err 
        res.status(400).send({ error: { name: code, message: sqlMessage } });
      })                                                                              // เมื่อใส่ข้อมูลที่ไม่ถูกต้องก็จะไม่ถูกเพิ่มลงในฐานข้อมูล
    }
  });



// // Update ข้อมูล        express-validator                                           // .trim คือให้ไม่มีช่องว่างเลย นิยมใส่ในชุดข้อมูลที่เป็น string ถ้าอยากให้ด้านไหนด้านเดียวก็พิม r หรือ l ด้านหน้า
router.put('/:id',  uploadProfileImage.single('file'),
  body('firstName').if(body('firstName').exists()).notEmpty().trim().escape(),               // .escape ไว้แปลงอักขระพิเศษเพื่อการแสดงผลที่ถูกต้อง
  body('lastName').if(body('lastName').exists()).notEmpty().trim().escape(),                                          // กำหนดชื่อและนามสกุลต้องใส่ลงมาตลอด   
  body('birthDate').if(body('birthDate').exists()).isDate(),                         // กำหนดแพทเทิลเป็นวันเวลา     if(body('birthDate').exists()) ถ้ามีค่าค่อยไปเช็ค isDate ถ้าไม่มีปล่อยผ่าน
  body('password').if(body('password').exists()).notEmpty().isLength({ min: 4, max: 20 })                         // isLength เป็นการกำหนดจำนวนข้อความ
    .withMessage('must be at 4 to 20 chars long').trim(),                                           // ในกรณี่จะบอกกับคนที่ใช้ในกรณี error ให้ส่ง message นี้กลับไป
  body('email').if(body('email').exists()).notEmpty().isEmail().normalizeEmail(),                   // คำสั่ง normalizeEmail คือการรับค่าทั้งหมดเป็นตัวเล็ก ถ้าไม่มีค่าที่ใส่มาในฐานข้อมูลจะเป็นตามที่ใส่มา
  (req, res, next) => {
    const errors = validationResult(req);                                                // สร้างตัวแปร errors ที่มารับค่า req validationResult ขึ้นมา
    if (!errors.isEmpty()) {                                                            // ถ้าค่า errors ตรงนี้มันไม่ว่าง
      res.status(400).send({ errors: errors.array() });                                   // ให้ส่ง errorsกลับไปในพวกนี้ errors.array() 
    } else {
      if (req.file != undefined || req.file != null) {
        req.body.profileImage = req.file.path;
      }                                      // เรียกmiddleware validation มากรองเพิ่ม คือ body('email').isEmail() .notEmpty คือต้องค่าไม่ว่าง
      User.update(req.body, { where: { id: req.params.id } }).then(data => {                   // ให้เอา model และใช้ method update และ ตัวที่ข้อมูลทำการอัปเดตลงไป และใช้ where ในการกรอง เอาแต่ id
        // และส่งข้อมูลที่ได้ต่อไป
        if (data[0] > 0) {                                                                    // ถ้ามีค่ามากกว่า 0 จะเท่ากับว่ามันเช็คได้ว่ามีการอัดเดตข้อมูล
          User.findByPk(req.params.id).then(data => {                                         // หลังจากการอัพเดตค่าใหม่เข้าไปก็ให้แสดงมันออกมาส่งกลับมา
            res.send({ success: { message: "Update successfully", result: data } });
          });
        } else {                                                                                              // ในกรณีที่หามันไม่เจอมันจะโชว์ error หาไม่เจอ data not found
          res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
        }
      }).catch((err) => {                                                                                 // ในกรณีที่มัน error จะบอกในส่งที่มัน error กับเรา
        const { original: { code, sqlMessage } } = err;
        res.status(400).send({ error: { name: code, message: sqlMessage } });
      });

    };
  });


// // Patch แก้ไชช้อมูลบางส่วน            ในกรณีใช้เราต้องมีการเช็คค่าไม่งั้นส่งค่ากลับไปจะ error เพราะมันว่างเปล่าเพราะมันมีการใช้ trim กับ escape ถ้ามันมีค่าค่อยทำไม่มีปล่อยผ่าน
router.patch('/:id',  uploadProfileImage.single('file'),          // Validation & Constraints ใช้ผ่าน model ที่เราเขียนขึ้นมา   เราจะใช้ sanitizer ไม่ได้ ในกรณีที่ใช้ model ในการ validation แต่เลือกใช้ได้บางอย่างเช่น trim escape
  body('firstName').if(body('firstName').exists()).trim().escape(),               // .escape ไว้แปลงอักขระพิเศษเพื่อการแสดงผลที่ถูกต้อง
  body('lastName').if(body('lastName').exists()).trim().escape(),                                          // กำหนดชื่อและนามสกุลต้องใส่ลงมาตลอด   
  body('password').if(body('password').exists()).trim(),
  body('email').if(body('email').exists()).normalizeEmail(),                   // คำสั่ง normalizeEmail คือการรับค่าทั้งหมดเป็นตัวเล็ก ถ้าไม่มีค่าที่ใส่มาในฐานข้อมูลจะเป็นตามที่ใส่มา
  (req, res, next) => {
    const errors = validationResult(req);                                                // สร้างตัวแปร errors ที่มารับค่า req validationResult ขึ้นมา
    if (!errors.isEmpty()) {                                                            // ถ้าค่า errors ตรงนี้มันไม่ว่าง
      res.status(400).send({ errors: errors.array() });                                   // ให้ส่ง errorsกลับไปในพวกนี้ errors.array() 
    } else {                                        // เรียกmiddleware validation มากรองเพิ่ม คือ body('email').isEmail() .notEmpty คือต้องค่าไม่ว่าง
      if (req.file != undefined || req.file != null) {
        req.body.profileImage = req.file.path;
      }
      User.update(req.body, { where: { id: req.params.id } }).then(data => {                   // ให้เอา model และใช้ method update และ ตัวที่ข้อมูลทำการอัปเดตลงไป และใช้ where ในการกรอง เอาแต่ id
        if (data[0] > 0) {                                                                    // ถ้ามีค่ามากกว่า 0 จะเท่ากับว่ามันเช็คได้ว่ามีการอัดเดตข้อมูล
          User.findByPk(req.params.id).then(data => {                                         // หลังจากการอัพเดตค่าใหม่เข้าไปก็ให้แสดงมันออกมาส่งกลับมา
            res.send({ success: { message: "Update successfully", result: data } });
          });
        } else {                                                                                              // ในกรณีที่หามันไม่เจอมันจะโชว์ error หาไม่เจอ data not found
          res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } })
        }
      }).catch((err) => {
        // ในกรณีที่มัน error จะบอกในส่งที่มัน error กับเรา
        const { errors: [ValidationErrorItem], original } = err;     // ส่งกลับผ่านเป็น array                         //**ใช้ validation ผ่านตัว model และนำมันมาใช้จาก model  */
        res.status(400).send({                                                                                    // เมื่อมีการ validation และ error กลับมามันจะส่งผ่านตัวแปร [ValidationErrorItem]
          error: {
            name: original ? original.code : ValidationErrorItem.type,                        // เช็ค original ด้วยว่ามีมามั้ยถ้ามีมาให้.codeมันแต่ถ้าไม่มีให้ใช้ validaitonErrorItem.type
            message: original ? original.sqlMessage : ValidationErrorItem.message             //  ถ้ามให้ใช้ original ถ้าไม่มีก็ใช้ validationErrorItem.message
          }
        });
      });

    };
  });




// Delete ลบข้อมูลในฐานข้อมูล
router.delete('/:id',  (req, res, next) => {
  User.findByPk(req.params.id).then(data => {                // เอา model แล้วทำการ findByPk หา และส่งตัวไอดีไปให้มัน แล้วมันจะส่งกลับมาตัวที่เราจะลบ
    if (data != null) {                                         // ต้องเช็ค dataตัวนี้ ไม่เท่ากับ null  (ไม่เท่ากับ null = มันยังมี data)
      data.destroy().then(result => {           // result คือข้อมูล affected row แต่เราไม่ได้ใช้ เราแค่อยากส่งข้อมูลที่ลบให้กับคนที่เรียกเลยตั้งชื่อไม่เหมือนกันถ้าชื่อตัวแปรเหมือนกันมันเอาจะค่าซ้ำกันก็เป็นได้     // ให้ใช้ method ที่เรียกว่า destroy ตัวdataด้านบนจะได้ rowมาrowจะมีmethod ที่เรียกว่า destroyการลบ
        res.send({ success: { message: "Delete successfully", result: data } });                     // เมื่อลบเสร็จให้ส่งข้อมูลกลับไป result คือข้อมูลที่ลบ
      });
    } else {                                                  // แต่ถ้าส่งค่ากลับไปแล้วหาไม่เจอก็จะทำงานตัวนี้
      res.status(400).send({ error: { name: "DataNotFound", message: "DataNotFound" } });
    }
  });
});



// EXPORT EXCEL
router.get('/report/excel', (req, res, next) => {
  let { page = 1, limit = 10, sort = "id", order = "asc", ...filter } = req.query;                   //เป็นการเพิ่มเงื่อนไขในการ filter
  page = parseInt(page);                                                                             // กำหนดให้เป็นตัวเลขไม่เป็น string
  limit = parseInt(limit);                                                                           // กำหนดให้เป็นตัวเลขไม่เป็น string
  let offset = (page - 1) * limit;                                                                    // สูตรคำนวณ


  User.findAll({                                              //แล้วนำตัวแปรuserมาหาข้างในทั้งหมดในmodelนี้ สามารถใส่ filter ได้้ 
    where: filter,                                             // และใช้ where filter ที่ อยู่ข้างบน  และนำมาใส่ offset สูตรที่ทำมา
    offset,
    limit: limit <= 0 ? undefined : limit,                   // การเซ็ทลิมิทแต่ต้องเช็คด้วยถ้า limit <= 0 ให้เป็น undefined ดึงมาทั้งหมดเลย : แต่ถ้าไม่ใช่ 0ให้ใส่ค่าเดิมของมัน
    order: [[sort, order]]                                    // การ sort จะผ่านตัว order และเป็น array เป็นการเรียงคอลัม แบบไหน อันดับ แบบไหน                                      
  }).then(data => {                                           // ข้อมูลที่ส่งออกมาจะผ่าน method then (data)
    // EXCEL
    var workbook = new excel.Workbook();                      // สร้างไฟล์ excel โดยใช้ workbook
    var worksheet = workbook.addWorksheet('USERS');           // สร้างตัว sheet ใน excel และตั้งชื่อ sheet ชื่อ users

    // HEADER    ส่งกลับไปเป็น excel ต้องส่ง header เพิ่ม
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');                  // ไฟล์ excel contenttype เป็น 'application/vnd.openxmlformats' กำหนม format ให้มัน
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx')      // res และใส่ชื่อไฟล์ ไฟล์เนม + users.xlsx เป็นตระกูลไฟล์

    // EXCEL : HEADER
    let columns = [];                     // กำหนดตัวแปร columns ให้รับค่าที่เป็น array
    let paths = ['firstName', 'lastName', 'email', 'profileImage', 'password', 'birthDate'];        // ใน paths ก็จะมีประเภทหัวข้อมูลที่เป็น array
    paths.forEach(path => {                     // และนำpaths มาใช้และใส่ forEach ให้มันวนรูปทำงานทั้งหมดใน array ของ paths
      columns.push({ header: path, key: path })            // เก็บลงใน columns จะประกอบไปด้วย header และ key ใช้ path ที่รับค่ามาเซทให้ columns
    });

    // COLUMNS
    worksheet.columns = columns;                         // เรากำหนดว่าค่าที่ได้จาก columns ที่เป็น object ให้ใส่ใน worksheet
    worksheet.columns.forEach(column => {                // เรากำหนดความกว้างของแต่ละช่องใน sheet ให้กำหนด column มีความกว้าง = 20
      column.width = 20;
    });


    // AUTOFILTERS  เพื่อจะใช้ตัว auto จะได้คัดกรองได้ง่าย จากแถวที่1คอลัมที่1 ไปถึง แถวที่1คอลัมสุดท้าย
    worksheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: worksheet.actualColumnCount } };



    // STYLES  การเพิ่ม styles ให้กับตัว header getRow1 คือแถวที่ 1 eachCell คือทุกอันทุกอัน  จะมีตัวแปร 2 ตัว คือ cell กับ colNumber
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFF' } };                         // ขนาดของตัวอักษรcell.font
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };       // เส้นขอบ
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC61633' } };                                      // การเพิ่มสีของbg pattern คือสีเดียว gradiant จะไล่เฉด
      cell.alignment = { vertical: ' top', wrapText: true };                                                                // เป็นการเซทข้อความชิดไปทางไหน อยู่ด้านบน และ ถ้าข้อความยาวจะขึ้นบรรทัดใหม่ wrapText
    })


    // BODY
    data.forEach(row => {                                           // นำข้อมูลทั้งหมดจากฐานข้อมูลมาใส่ใน row ใน worksheet
      const row_ = worksheet.addRow(row);                                       // สามารถใส่ style ในเนื้อหาได้นอกจาก header
      row_.eachCell({ includeEmpty: true }, (cell, colNumber) => {             // ในการวิ่งไปแต่ละเซลมันจะไม่เข้าเซลค่าว่างๆถ้าเราจะให้มันทำทั้งหมดต้องเพิ่ม {includeEmpty: true} ตัวแปร
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      })
    });




    // WRITE EXCEL FILE AND SEND
    workbook.xlsx.write(res).then(function () {             // ส่งไฟล์ excel ออกไป
      res.end();
    })


  }).catch((err) => {                                                             // sequelize จะส่ง error กลับมาผ่าน method catch เลยใช้ตัวนี้กับ => err
    const { original: { code, sqlMessage } } = err;                               // การกำหนด code sqlMessage ถ้ามัน err 
    res.status(400).send({ error: { name: code, message: sqlMessage } });         // ให้ส่งเหตุผลที่มัน error และชื่อที่ error ออกมา พร้อม status
  })
});



// EXPORT CSV                 สามารถใช้ข้อมูลนอกจาก excel เป็น csv ได้ สะดวกสำหรับคนไม่มี excel
router.get('/report/csv', requireJwt , (req, res, next) => {
  let { page = 1, limit = 10, sort = "id", order = "asc", ...filter } = req.query;                   //เป็นการเพิ่มเงื่อนไขในการ filter
  page = parseInt(page);                                                                             // กำหนดให้เป็นตัวเลขไม่เป็น string
  limit = parseInt(limit);                                                                           // กำหนดให้เป็นตัวเลขไม่เป็น string
  let offset = (page - 1) * limit;                                                                    // สูตรคำนวณ


  User.findAll({                                              //แล้วนำตัวแปรuserมาหาข้างในทั้งหมดในmodelนี้ สามารถใส่ filter ได้้ 
    where: filter,                                             // และใช้ where filter ที่ อยู่ข้างบน  และนำมาใส่ offset สูตรที่ทำมา
    offset,
    limit: limit <= 0 ? undefined : limit,                   // การเซ็ทลิมิทแต่ต้องเช็คด้วยถ้า limit <= 0 ให้เป็น undefined ดึงมาทั้งหมดเลย : แต่ถ้าไม่ใช่ 0ให้ใส่ค่าเดิมของมัน
    order: [[sort, order]]                                    // การ sort จะผ่านตัว order และเป็น array เป็นการเรียงคอลัม แบบไหน อันดับ แบบไหน                                      
  }).then(data => {                                           // ข้อมูลที่ส่งออกมาจะผ่าน method then (data)
    // EXCEL
    var workbook = new excel.Workbook();                      // สร้างไฟล์ excel โดยใช้ workbook
    var worksheet = workbook.addWorksheet('USERS');           // สร้างตัว sheet ใน excel และตั้งชื่อ sheet ชื่อ users

    // HEADER    ส่งกลับไปเป็น CSV ต้องส่ง header เพิ่ม
    res.setHeader('Content-Type', 'text/csv');                  // ไฟล์ csv contenttype เป็น 'text/csv' กำหนม format ให้มัน
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.csv')      // res และใส่ชื่อไฟล์ ไฟล์เนม + users.csv เป็นตระกูลไฟล์

    // CSV : HEADER
    let columns = [];                     // กำหนดตัวแปร columns ให้รับค่าที่เป็น array
    let paths = ['firstName', 'lastName', 'email', 'profileImage', 'password', 'birthDate'];        // ใน paths ก็จะมีประเภทหัวข้อมูลที่เป็น array
    paths.forEach(path => {                     // และนำpaths มาใช้และใส่ forEach ให้มันวนรูปทำงานทั้งหมดใน array ของ paths
      columns.push({ header: path, key: path })            // เก็บลงใน columns จะประกอบไปด้วย header และ key ใช้ path ที่รับค่ามาเซทให้ columns
    });

    // COLUMNS
    worksheet.columns = columns;                         // เรากำหนดว่าค่าที่ได้จาก columns ที่เป็น object ให้ใส่ใน worksheet
    worksheet.columns.forEach(column => {                // เรากำหนดความกว้างของแต่ละช่องใน sheet ให้กำหนด column มีความกว้าง = 20
      column.width = 20;
    });


    // BODY
    data.forEach(row => {                                           // นำข้อมูลทั้งหมดจากฐานข้อมูลมาใส่ใน row ใน worksheet
      const row_ = worksheet.addRow(row);                                       // สามารถใส่ style ในเนื้อหาได้นอกจาก header
    });


    // WRITE EXCEL FILE AND SEND
    workbook.csv.write(res).then(function () {             // ส่งไฟล์ excel ออกไป
      res.end();
    })


  }).catch((err) => {                                                             // sequelize จะส่ง error กลับมาผ่าน method catch เลยใช้ตัวนี้กับ => err
    const { original: { code, sqlMessage } } = err;                               // การกำหนด code sqlMessage ถ้ามัน err 
    res.status(400).send({ error: { name: code, message: sqlMessage } });         // ให้ส่งเหตุผลที่มัน error และชื่อที่ error ออกมา พร้อม status
  })
});






module.exports = router;
