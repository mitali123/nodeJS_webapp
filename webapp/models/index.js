'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const applog = require('../controllers/logger').applog;
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
//show  connection is ssl

sequelize.query("SHOW STATUS LIKE 'Ssl_version'", {
      type: sequelize.QueryTypes.SELECT
    })
    .then((result) => {
      applog.info("-- DB SSL CONNECTION VERSION (Ssl_version): --"+result[0].Value);
    })
    .catch(e => {
      applog.error(e)
    })

sequelize.query("SHOW STATUS LIKE 'Ssl_cipher'", {
      type: sequelize.QueryTypes.SELECT
    })
    .then((result) => {
      applog.info("-- DB SSL CONNECTION CIPHER (Ssl_Cipher): --"+result[0].Value);
    })
    .catch(e => {
      applog.error(e)
    })

sequelize.query("SELECT user, host, connection_type FROM performance_schema.threads pst INNER JOIN information_schema.processlist isp ON pst.processlist_id = isp.id;", {
      type: sequelize.QueryTypes.SELECT
    })
    .then((result) => {
      result.forEach(item => {
          applog.info("RECORDS FROM DB PERFORMANCE SCHEMA: ---- user:"+item.user+"----host:"+item.host+"----connection_type:"+item.connection_type);
      });
    })
    .catch(e => {
      applog.error(e)
    })


module.exports = db;



