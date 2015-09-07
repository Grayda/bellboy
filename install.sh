#! /bin/sh

echo "Downloading Node PPA.."
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
echo "Installing Node.."
sudo apt-get install -y nodejs
echo "Installing audio dependency for Bellboy.."
sudo apt-get install libasound2-dev # For audio support
echo "CDing into /home/pi.."
cd /home/pi
if [ -d "/home/pi/bellboy/" ] ;
  then
    echo "Cloning Bellboy into /home/pi.."
    git clone -b beta http://github.com/Grayda/bellboy.git
    cd /home/pi/bellboy
  else
    echo "Bellboy already cloned. Updating.."
    cd /home/pi/bellboy
    git pull origin beta
  fi

echo "Installing nodemon globally.."
sudo npm install -g nodemon
echo "Installing other dependencies.."
npm install
if grep -q "bellboy" "/etc/rc.local" ;
  then
    echo "bellboy already in startup. Skipping.."
  else
    echo "Adding script to startup.."
    sudo sed -i -e '$i \/usr/local/bin/nodemon /home/pi/bellboy/index.js &\n' /etc/rc.local
  fi
read -p "Press [Enter] key to reboot.."
