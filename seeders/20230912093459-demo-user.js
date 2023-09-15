'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('Users', [           //ใช้คำสั่ง bulkInsert ในการนำเข้าข้อมูลทีเยอะๆ และตามด้วย ชื่อของ table และ array ที่มีข้อมูลที่เราจะป้อน
      {                                                   // เราสามารถ commar , และใส่ ข้อมูลเป็น object เพิ่มได้อีกหลายๆอันต่อๆกัน 
        firstName: 'Nuttakit',
        lastName: 'Ruangsujitwat',
        email: 'nuttakit.ruan@gmail.com',
        password: 'ez1362542',
        birthDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Users', null, {});            // เป็นคำสั่งลบข้อมูล users ทั้งตาราง
  }
};
