#!/bin/bash
cd ~
git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
cd quick2wire-gpio-admin
make
sudo make install
sudo adduser $USER gpio
cd ~/gpio-rest
npm install express
npm install pi-gpio

# now edit public/swagger.js and change the "host" field.
# to run: node server.js