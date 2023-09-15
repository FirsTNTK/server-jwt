var express = require('express');
var router = express.Router();

let users = require('../../../data/users.json')


// Fetch all user เป็นการดึงทั้งหมด
router.get('/', function (req, res, next) {
  res.send(users);
});



// Fetch by id หาที่ละตัว 
router.get('/:id', function (req, res, next) {                                   // เราสามารถกำหนดได้ว่าจะหาส่วนไหนของข้อมูลอย่างอันนี้ผ่าน id  สามารถหาได้หลากหลายกว่านี้ user age 
  const user = users.find(element => element.id == req.params.id)               // เรากำหนดค่าขึ้นมา user ให้หาค่าจาก users.find จากค่าในนั้น method จ่าก array คือ find คำว่า element จะได้ใช้คำอื่นก็ได้
  res.send(user);         // เป็นการส่งผลลัพกลับไปจาก user ที่ได้รับค่ามา               // element คือตัวแปรที่สร้างมาไว้เก็บค่าจะใช้ชื่ออะไรก็ได้ มาเช็ค id => element.id == req.params.id เป็นคำสั่งว่าเท่ากันถึงส่งค่า
});                                                                             // สามารถอ้างอิงจาก user ก็เปลี่ยนทั้งหมดให้เข้าuser                                              // ตัวนั้นกลับไป


// Insert ข้อมูล
router.post('/', (req, res, next) => {
  let found = users.some(element => element.username == req.body.username || element.id == req.body.id);  // คำสั่งนี้จะส่งกลับมาเป็น true เลย
  if (found) {                                                                                            // ถ้าเจอหรือมีอยู่แล้วจะเพิ่มเข้าไปไม่ได้
    res.send({ error: { message: "Duplicated data", result: req.body } })
  } else {                                                                                  // ในกรณีที่ไม่มีจะเพิ่มเข้าไป จะทำคำสั่งนี้
    users.push(req.body);                                            // req.body ได้ข้อมูลเพราะ middleware ของ app.js         users.push เป็นการเพิ่มข้อมูล
    res.send({ success: { message: "Inserted successfully", result: req.body } })
  }
});



// Update ข้อมูล
router.put('/:id', (req, res, next) => {
  users.forEach((user, index) => {                   // forEach จะเข้าไปหาข้อมูลทุกตัวใน users (users, index) มันจะเข้าไปหาข้อมูลทุกตัวในusers indexทีละตัว0-1-2-3
    if (user.id == req.params.id) {                    // เป็นการเช็คว่ามีตัวไหนใน users ตรงกับไอดีที่รับมาจาก client ( link ที่พิมมา req.body.id)
      users[index] = req.body;                        // เอาข้อมูลที่รับมาจากลิ้งแล้วแทนที่เข้าไปจากเลขที่อ้างอิงตาม index
    }
  });
  res.send({ success: { message: "Updated successfully", result: req.body } })   // log ผลลัพออกมา
})


// Patch แก้ไชช้อมูลบางส่วน
router.patch('/:id', (req, res, next) => {
  users.forEach((user, index) => {                   // forEach จะเข้าไปหาข้อมูลทุกตัวใน users (user = เป็นตัวแปรที่มารับต้องกำหนดให้ตัวที่เหลือ, index) มันจะเข้าไปหาข้อมูลทุกตัวในusers indexทีละตัว0-1-2-3
    if (user.id == req.params.id) {                    // เป็นการเช็คว่ามีตัวไหนใน users ตรงกับไอดีที่รับมาจาก client ( link ที่พิมมา req.body.id)
      let keys = Object.keys(req.body);               // สร้างตัวแปรมารับ ชื่อ keys มารับ methodที่ชื่อ Object.keys คีของออฟเจก
      keys.forEach(key => {                           // keys วนกลับไปแก้ ส่วน key ช้างในคือตัวแปรมารับ ค่าที่รับมา
        user[key] = req.body[key];                    // user[ค่าใหม่ที่เข้ามา] = สิ่งที่ส่งมา ค่าใหม่ชอง key
      })
    }
  });
  res.send({ success: { message: "Updated successfully", result: req.body } })   // log ผลลัพออกมา
})




// Delete ลบข้อมูลในฐานข้อมูล
router.delete('/:id', (req,res, next) => {
    let user = users.find(user => user.id == req.params.id);    // ประกาศตัวแปรมารับใช้ find หาภายในid ที่ client ส่งมาต้องตรงกับในตัวฐานข้อมูล
    users = users.filter(user => user.id != req.params.id);     // อันนี้กรองโดยใช้ method filter เพื่อกรองเฉพาะที่ไม่ตรงกับid ที่ส่งมาเพื่อตัวที่ไม่ถูกลบตัวที่ถูกลบจะหายไป
    res.send({success: {message: "Delete successfully", result: user}}) // Log ผลลัพออกมาส่งกลับมาเป็นข้อมูลที่เปลี่ยนแปลงไป
});


module.exports = router;
