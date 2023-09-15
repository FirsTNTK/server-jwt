'use strict';




// ส่วน up จะำงานตอนเราเรียก db:migrate เพิ่ม
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction(t => {                        //                   
      return Promise.all([                                                
        queryInterface.addColumn('Users', 'profileImage', {                   // สร้าง profileImage ใน table users
          type: Sequelize.STRING,                                             // กำหนดว่าเป็น typeอะไร
          after: 'lastName'                                                   // กำหนดให้มันต่อท้อย lastname
        }, { transaction: t }),                                               // คำสั่งที่ 1 ใส่ได้มากกว่า1คำสั่งเพราะเป็น array
      ])
    })
  },




  // ส่วน down จะำงานตอนเราเรียก db:migrate:undo ลบ
  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'profileImage', { transaction: t })                      // การลบ
      ])
    })
  }
};
