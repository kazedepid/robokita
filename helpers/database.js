const { Sequelize, DataTypes } = require('sequelize');
const { DATABASE_URL } = require('../config');

const database = DATABASE_URL == 'robokita.db' ? new Sequelize({ 
 dialect: 'sqlite', 
 storage: 'robokita.db',
 logging: false
}) : new Sequelize(DATABASE_URL, {
 dialectOptions: {
  ssl: {
   require: true,
   rejectUnauthorized: false
  } 
 }, logging: false 
});

try {
 database.authenticate();
} catch {
 console.log('[ ! ] Tidak dapat terhubung dengan database.');
 console.log('Pastikan database url terserah di file setting.');
}
try {
 database.sync();
} catch {
 console.log('[ ! ] Tidak dapat menyinkronkan dengan database.');
}

module.exports = { database };
