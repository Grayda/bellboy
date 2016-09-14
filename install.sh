#! /bin/sh

echo This script will install Bellboy onto the Raspberry Pi.
echo
echo The first step is to ensure you have an internet connection, as some places require you to sign in to use the network.
read -p "Press enter to continue"

# Start epiphany. Use this to authenticate to the internet
epiphany

# Install git
sudo apt-get install git

# cd into home
cd ~/

# Clone Bellboy
git clone -b v2 http://github.com/grayda/bellboy

# cd into the directory
cd ~/bellboy

# Get the latest version of node
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash

# Install node
sudo apt-get install nodejs

# Install everything
sudo npm install -g gulp nodemon node-autostart

# Install stuff for bellboy
npm install

# Run the gulp task to set stuff up
gulp install-plugins

# Set up autostart
autostart enable -n "bellboy" -p "~/bellboy" -c "nodemon index"

# Post-installation instructions
echo Installation is nearly complete. On the next screen you will need to do the following:
echo
echo * Set your timezone
echo * Force the Pi to play audio from the 3.5mm audio jack
echo -n * Set your hostname (optional) to
echo -n bellboy\_
date | md5sum | head -c 6 ; echo

read -p "Press enter to continue"

sudo raspi-config

echo Installation complete.
read -p "Press enter to restart or Ctrl+C to exit"
sudo reboot
