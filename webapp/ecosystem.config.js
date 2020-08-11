require('dotenv').config();
module.exports = {
  apps : [{
    name: "app",
    script: "node ./bin/www",
    env: {
      NODE_ENV: "development",
      "username": process.env.RDS_USER_NAME,
      "password": process.env.RDS_PASSWORD,
      "database": process.env.RDS_DB_NAME,
      "host": "",
      "BUCKET_NAME": "webapp.mitali.manjrekar",
      "dialect": "mysql",
      "operatorsAliases": false
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
