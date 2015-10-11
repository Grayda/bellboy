#! /bin/sh
function askInsecure {
  read -n1 -p "This installer can use an insecure method of instalation for organisations with self-signed certificates. Do you wish to install insecurely? If unsure, type N. If you have issues with this script, run again, with Y instead [Y/n]" insecure < /dev/tty
  echo
  case $insecure in
    y|Y)
      echo "Setting npm to not use strict-ssl"
      npm config set strict-ssl false
      return
      ;;
    n|N) return ;;
    *)
      echo "Invalid response. Please type Y or N"
      askInsecure
      ;;
  esac
}

function greenEcho {
  echo -e "\033[92m$1\033[0m"
}

function redEcho {
  echo -e "\033[91m$1\033[0m"
}

echo
greenEcho "       ########  ######## ##       ##       ########   #######  ##    ## "
greenEcho "       ##     ## ##       ##       ##       ##     ## ##     ##  ##  ##  "
greenEcho "       ##     ## ##       ##       ##       ##     ## ##     ##   ####   "
greenEcho "       ########  ######   ##       ##       ########  ##     ##    ##    "
greenEcho "       ##     ## ##       ##       ##       ##     ## ##     ##    ##    "
greenEcho "       ##     ## ##       ##       ##       ##     ## ##     ##    ##    "
greenEcho "       ########  ######## ######## ######## ########   #######     ##    "
echo

echo -e "\033[1mThis script will install everything necessary to run Bellboy on a Raspberry Pi"
echo "Please only use this on a fresh install of Raspbpian provided by the Raspberry Pi Foundation, as it will install additional kernels, set passwords, startx on boot etc."
echo
echo -e "To learn more, please visit http://github.com/Grayda/bellboy\033[0m"
echo
echo
read -p "Press [Enter] to continue or Ctrl+C to quit" < /dev/tty
echo
askInsecure

greenEcho "Updating system if necessary.."
sudo apt-get dist-upgrade
greenEcho "Preparing to install.."
cd /home/pi
greenEcho "Downloading latest version of Node.."
wget --no-check-certificate http://nodearm-nathanjohnson320.rhcloud.com/node_latest_armhf.deb
greenEcho "Installing latest Node deb.."
sudo dpkg -i node_latest_armhf.deb
greenEcho "Node version is:"
node -v
greenEcho "Cleaning up installer.."
sudo rm /home/pi/node_latest_armhf.deb
greenEcho "Installing audio dependency for Bellboy.."
sudo apt-get install mpg123 # For audio support
greenEcho "Setting up git.."
git config --global user.email "bellboy@davidgray.photography"
git config --global user.name "Bellboy"
greenEcho "CDing into /home/pi.."
if [ -d "/home/pi/bellboy/" ];
  then
    redEcho "Bellboy already cloned. Updating.."
    cd /home/pi/bellboy
    git stash
    git pull
  else
    greenEcho "Cloning Bellboy into /home/pi.."
    git clone http://github.com/Grayda/bellboy.git
    cd /home/pi/bellboy
  fi

greenEcho "Installing nodemon globally.."
sudo npm install -g nodemon
greenEcho "Installing other dependencies.."
npm install
greenEcho "Copying startup script to /etc/init.d.."
sudo cp bellboy /etc/init.d/
greenEcho "Making the script executable"
sudo chmod 755 /etc/init.d/bellboy
greenEcho "Registering changes.."
sudo update-rc.d bellboy defaults
echo
echo "Starting raspi-config. Please set the following options:"
echo "--------------------------------------------------------"
echo "> Timezone (under Internationalisation Options)"
echo -e "> User Password (\033[0;31m!IMPORTANT!\033[0m)"
echo "> Hostname (under Advanced Options) (optional, but recommended)"
echo "There is no need to enable Boot to Desktop. This will be done after you exit raspi-config"
echo
read -p "Press [Enter] to continue" < /dev/tty
sudo raspi-config

greenEcho "Bellboy installation is complete. Next, we'll try and install the support for files for the Adafruit PiTFT 2.2\" screen"
redEcho "When prompted, say no to setting the pin to power off and no to booting to console"
echo
echo -e "\033[0;31m This could take 20 minutes or more \033[0m"
read -p "If you do not have the PiTFT or else don't wish to install the files, press Ctrl+C now, otherwise, press any key to continue" < /dev/tty
curl -SLs https://apt.adafruit.com/add-pin | sudo bash
sudo apt-get install raspberrypi-bootloader
sudo apt-get install adafruit-pitft-helper
sudo adafruit-pitft-helper -t 22
read -p "Installation complete. Please see https://goo.gl/WxMf9g for instructions on booting to X on the PiTFT. Press any key to reboot or Ctrl+C to exit"
echo "Restarting the Pi. When it's booted, please visit the new hostname on port 8080 in your browser to begin"
sudo reboot
