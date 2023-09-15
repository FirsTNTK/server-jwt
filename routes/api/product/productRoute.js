var express = require('express');
var router = express.Router();
const mysql = require('mysql2');         // เรียกการใช้งาน mysql เชื่อมกับ database




const con = mysql.createConnection({                                                            // ให้สร้างตัวแปรมารับค่า con จากฐานข้อมูล database sql
    host: 'localhost', user: 'root', password: 'ez1362542', database: 'shopper'                 // ใส่่ชื่อ รหัส คนใช้ให้ถูกของ sql
});



// Get                                                                  // ข้อดีของ default parameter คือเมื่อไม่ใส่อะไรมามันจะใส่ให้เองโดยอัตโนมัติ
router.get("/", (req, res, next) => {
    // Filter ทำเผื่อให้ผู้ใช้เรียกฐานข้อมูลได้ดีขึ้นไม่ได้เอามาทั้งหมด               // เป็นตัว sort กำหนด default เป็น เรียงจาก id   order = desc (เรียงจากน้อยไปมาก) asc (มากไปน้อย)  ถ้าตัวไหนไ่ม่ใช่ Sort กับ order เก็บใน filter
    let { page = 1, limit = 10, sort = "id", order = "desc", ...filter } = req.query;      // ส่วนใหญ่มากับ query parameter โดยให้ req.queryมาใช้     เวลาไม่มีการส่งค่า query ไปจะเป็น filter เปล่าๆ มันไม่ต้อง where หรือ where เป็น 1
    filter = Object.keys(filter).length === 0 ? "1" : filter;                       // ก็ต้องเช็คว่า filter เป็น object ว่างเปล่ารึป่าว โดยใช้คำสั่ง Object.keys(ค่าที่ส่งมา).length ถ้าเป็น 0 ให้ส่ง 1 กลับไป แต่ถ้าเป็นobject เปล่าส่ง filterตัวเดิม
    // ใช้คำสั่ง order by เพื่อการเรียงลำดับ และใช้แบล็คติกแทรกตัวแปรลงไปใน string แล้วกำหนดเรียงจาก sort และ order

    // query parameter ชอบเป็นตัว string เราเลยจะแปลงมันเพื่อความชัวเป็นตัวเลขก่อน
    page = parseInt(page);     // เป็นการแปลงค่าให้เป็นจำนวนเต็มโดยใช้ parseInt
    limit = parseInt(limit);

    // มีการสร้างตัวแปร offset และรับค่า ตัวแปร สูตร page มีค่า1จะเท่ากับ 0 แล้วคูณ limit ได้ 0 เพราะเริ่มต้นที่ 0 ถึง10
    let offset = (page - 1) * limit;


    // มีการเพิ่ม limit มากกว่า 0 ส่งกลับไปทั้งหมด แต่ถ้า มากกว่า 0 ให้ทำการ limit ข้อมูลส่งเป็นชุดๆ ใช้คำสั่ง limit ? , ? ตั้งแต่ตัวไหนไปอีกกี่ตัว
    let sql = limit > 0 ? `SELECT * FROM product WHERE ? ORDER BY ${sort} ${order} LIMIT ?, ?` : `SELECT * FROM product WHERE ? ORDER BY ${sort} ${order}`;
    // เราจะทำการสร้างตัวแปร sql แล้วไปแทนในส่วนล่าง และใช้ prepare statement โดยคำสั่ง where ? 
    console.log(filter)

    // มีการเพิ่มค่าให้กับ arry มาจากอะไรเอ่ย ? 
    con.query(sql, [filter, offset, limit], (err, datas, fields) => {                        // กำหนดเอาตัวแปรมาใช้คำสั่งจาก sql  เมื่อเข้าลิ้งนี้ให้ใช้งานตัวเอาขึ้นมาทุกตว
        if (err) {
            const { code, sqlMessage } = err;                                          // สร้างตัวที่รับค่าข้นมา เป็น object มันคือ error
            res.status(400).send({ error: { name: code, message: sqlMessage } })       // ในกรณีที่มัน error ให้บอกเราพร้อม status ทั้งชื่อ และเหตุผลที่เสีย
        } else {
            res.send(datas);                                                     // ใน parameter มีรับ3ค่า err datas field  ให้มัน log ค่าของ datas ออกมา 
        }
    })
});





// Get By ID
router.get("/:id", (req, res, next) => {                                                                            // เข้าพาทผ่านIDแล้วใช้ call back
    con.query('SELECT * FROM product WHERE id = ?', [req.params.id], (err, datas, fields) => {                      // ให้ใช้คำสั่ง และเพิม่เงื่อนไข where id = ? เราสามารถเพิ่ม
        if (datas.length > 0) {                                                                     // ตัวแปรมารับอีกตัวได้ คือ [req.params.id] ที่ client ส่งมา เรียกว่า prepare statement
            res.send(datas[0]);                                                                     // con.query จะได้ค่าเป็น arry เลยต้องกำหนดให้แสดงข้อมูลarry เริ่มที่0
        } else {                                                                                    //ถ้า datas มีค่ามากกว่า0 ให้ส่งค่านั้นมา แต่ถ้าไม่มี else ส่งเป็น status และ error กลับไป ชื่อ  แมสเสจ
            res.status(400).send({ error: { name: "DataNotFOUND", message: "DataNotFOUND" } })
        }
    })
});



// Post การเพิ่มข้อมูล
router.post("/", (req, res, next) => {
    con.query("INSERT INTO product SET ?", req.body, (err, datas, fields) => {             // คำสั่ง sql เพิ่มข้อมูลในตาราง req.bodyในmethod post
        if (err) {
            const { code, sqlMessage } = err;
            res.status(400).send({ error: { name: code, message: sqlMessage } })
        } else {
            res.send({ success: { message: "Insert successfully.", result: datas } })           // Datas จะได้ affectedRow กับ insertID
        }
    })
})



// Put method UPDATE การเปลี่ยนค่าบางส่วน
router.put("/:id", (req, res, next) => {
    con.query("UPDATE product SET ? WHERE id = ?", [req.body, req.params.id], (err, datas, fields) => {
        if (err) {
            const { code, sqlMessage } = err;
            res.status(400).send({ error: { name: code, message: sqlMessage } })           // ในกรณีที่มัน error จะได้ error กลับมาพร้อมเหตุผล
        } else if (datas.affectedRows == 0) {
            res.status(400).send({ error: { name: "DataNotFOUND", message: "DataNotFOUND" } })    // ในกรณีที่ไม่ error แต่หาค่าที่ส่งไปไม่เจอก็จะส่งตัวนี้ไป
        } else {
            res.send({ success: { message: "Insert successfully.", result: req.body } })               // ถ้าส่งได้ปกติก็จะได้อันนี้ แล้วก็เอา datas ตัวนั้นส่งกลับไป เราสามารถเอาแค่ข้อมูลที่อัพเดทส่งกลับมาก็ได้ใช้ req.body แทน datas
        }                                                          // result: datas
    })
})


// patch กับ put ต่างกันตรงที่จะแก้ทั้งหมดหรือจะแก้ทีละตัวก็ได้ ใช้ในการ update ได้ทั้งคู่


// Patch method UPDATE 
router.patch("/:id", (req, res, next) => {
    con.query("UPDATE product SET ? WHERE id = ?", [req.body, req.params.id], (err, datas, fields) => {
        if (err) {
            const { code, sqlMessage } = err;
            res.status(400).send({ error: { name: code, message: sqlMessage } })
        } else if (datas.affectedRows == 0) {
            res.status(400).send({ error: { name: "DataNotFOUND", message: "DataNotFOUND" } })
        } else {
            res.send({ success: { message: "Insert successfully.", result: req.body } })
        }
    })
})




// Delete ลบ
// การที่จะส่งข้อมูลที่ลบไปจากฐานข้อมูลให้กับคนที่มาใช้ api ทำได้ โดยใช้ middleware
function productMiddleware(req, res, next) {                                                                    //สร้าง middleware ขึ้นมาเพื่อให้มันเก็บข้อมูลในส่วนที่เราลบ
    con.query("SELECT * FROM product WHERE id = ?", [req.params.id], (err, datas, fields) => {                  
        req.product = datas[0];                                                                                 //ตัวแปรที่มารับdata ของข้อมู, req.product
        next();
    });
}


router.delete("/:id", productMiddleware, (req, res, next) => {                                         // จะเป็นการสั่งให้มันทำงาน middleware ก่อนลบ ให้เก็บค่าที่ลบใส่ req.product
    con.query("DELETE FROM product WHERE id = ?", [req.params.id], (err, datas, fields) => {           // คำสั่ง sql 
        if (err) {
            const { code, sqlMessage } = err;
            res.status(400).send({ error: { name: code, message: sqlMessage } })
        } else if (datas.affectedRows == 0) {
            res.status(400).send({ error: { name: "DataNotFOUND", message: "DataNotFOUND" } })
        } else {
            res.send({ success: { message: "Deleted successfully.", result: req.product } })            // และแสดง req.product คือค่าที่ลบ
        }
    })
})





module.exports = router;