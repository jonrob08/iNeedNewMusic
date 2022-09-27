'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      { name: 'Keith',
        email: 'Fuller',
        password: '12345',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { name: 'Jon',
        email: 'Robson',
        password: 'asdfg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { name: 'Joel',
      email: 'Fullsend',
      password: 'password',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ],)
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {})
  }
};
