#! /bin/sh
echo -e "\033[1mThis script will install everything necessary to run Bellboy on a Raspberry Pi"
echo "Please only use this on a fresh install of Raspbpian, as it will install additional kernels, set passwords, startx on boot etc."
echo
echo "To learn more, please visit http://github.com/Grayda/bellboy\033[0m"
read -p "Press any key to continue or Ctrl+C to quit"
echo "Preparing to install.."
cd /home/pi
echo "Downloading latest Node deb.."
wget --no-check-certificate http://node-arm.herokuapp.com/node_latest_armhf.deb
echo "Installing latest Node deb.."
sudo dpkg -i node_latest_armhf.deb
echo "Node version is:"
node -v
echo "Cleaning up installer.."
sudo rm /home/pi/node_latest_armhf.deb
echo "Installing audio dependency for Bellboy.."
sudo apt-get install mpg123 # For audio support
echo "CDing into /home/pi.."
if [ -d "/home/pi/bellboy/" ];
  then
    echo "Bellboy already cloned. Updating.."
    cd /home/pi/bellboy
    git stash
    git pull
  else
    echo "Cloning Bellboy into /home/pi.."
    git clone http://github.com/Grayda/bellboy.git
    cd /home/pi/bellboy
  fi

echo "Installing nodemon globally.."
sudo npm install -g nodemon
echo "Installing other dependencies.."
npm install
echo "Copying startup script to /etc/init.d.."
sudo cp bellboy /etc/init.d/
echo "Making the script executable"
sudo chmod 755 /etc/init.d/bellboy
echo "Registering changes.."
sudo update-rc.d bellboy defaults
echo "Starting raspi-config. Please set the following options:"
echo "--------------------------------------------------------"
echo "> Timezone (under Internationalisation Options)"
echo -e "> User Password (\033[0;31m!IMPORTANT!\033[0m)"
echo "> Hostname (under Advanced Options) (optional, but recommended)"
echo "There is no need to enable Boot to Desktop. This will be done after you exit raspi-config"

read -p "Press [Enter] to continue"
sudo raspi-config

# echo "Bellboy installation is complete. Next, we'll try and install the support for files for the Adafruit PiTFT 2.2\" screen"
# echo -e "\033[0;31m This could take 20 minutes or more \033[0m"
# read -p "If you do not have the PiTFT or else don't wish to install the files, press Ctrl+C now, otherwise, press any key to continue"
# curl -SLs https://apt.adafruit.com/add-pin | sudo bash
# sudo apt-get install raspberrypi-bootloader
# sudo apt-get install adafruit-pitft-helper
# sudo adafruit-pitft-helper -t 22
# read -p "Installation complete. Please see https://goo.gl/WxMf9g for instructions on booting to X on the PiTFT. Press any key to reboot or Ctrl+C to exit"
echo "Restarting the Pi. When it's booted, please visit the new hostname on port 8080 in your browser to begin"
sudo reboot
