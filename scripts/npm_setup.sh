#!/bin/bash
pwd
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/home/ubuntu/webapp/cloudwatch-config.json \
    -s
pwd
cd /home/ubuntu
cd webapp
npm install
source /etc/profile
mv /home/ubuntu/webapp/migrations/20200617133441-add-associations.js /home/ubuntu
npx sequelize db:migrate
mv /home/ubuntu/20200617133441-add-associations.js /home/ubuntu/webapp/migrations/
npx sequelize db:migrate
pm2 start ./bin/www
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

