#!/bin/bash
sudo service codedeploy-agent restart
rm -r /home/ubuntu/*
pm2 kill
