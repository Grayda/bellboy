#! /bin/sh

echo "Downloading Node PPA.."
curl -skL https://deb.nodesource.com/setup_0.12 | sudo bash -
echo "Installing Node.."
sudo apt-get install -y nodejs
echo "Installing audio dependency for Bellboy.."
sudo apt-get install libasound2-dev # For audio support
echo "CDing into /home/pi.."
cd /home/pi
if [ -d "/home/pi/bellboy/" ];
  then
    echo "Bellboy already cloned. Updating.."
    cd /home/pi/bellboy
    git pull origin beta
  else
    echo "Cloning Bellboy into /home/pi.."
    git clone -b beta http://github.com/Grayda/bellboy.git
    cd /home/pi/bellboy
  fi

echo "Installing nodemon globally.."
sudo npm install -g nodemon
echo "Installing other dependencies.."
npm install
echo "Copying startup script to /etc/init.d.."
sudo cp bellboy.sh /etc/init.d/
echo "Making the script executable"
sudo chmod 755 /etc/init.d/bellboy.sh
echo "Registering changes.."
sudo update-rc.d bellboy.sh defaults
read -p "Press [Enter] key to reboot.."
