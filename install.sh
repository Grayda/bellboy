#! /bin/sh

# Start epiphany. Use this to authenticate to the internet
epiphany

# Install git
sudo apt-get install git

# cd into home
cd ~/

# Clone Bellboy
git clone http://github.com/grayda/bellboy

# Get the latest version of node
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash

# Install node
sudo apt-get install nodejs

# Install everything
sudo npm install -g gulp nodemon

# Install stuff for bellboy
npm install

# Run the gulp task to set stuff up
gulp install-plugins

# Set your hostname
echo Installation complete. Set your hostname to the following using sudoedit /etc/hostname:
echo
echo -n bellboy\_
date | md5sum | head -c 6 ; echo
echo
echo nodemon will start in 10 seconds
sleep 10
cd ~/bellboy
nodemon index.js
