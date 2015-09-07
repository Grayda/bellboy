#! /bin/sh

echo "Downloading Node PPA.."
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
echo "Installing Node.."
sudo apt-get install -y nodejs
echo "Version of Node now installed:"
node –v # For version checking
echo "Installing audio dependency for Bellboy.."
sudo apt-get install libasound2-dev # For audio support
echo "CDing into /home/pi.."
cd /home/pi
echo "Cloning Bellboy into /home/pi.."
git clone –b stable http://github.com/Grayda/bellboy.git
cd /home/pi/bellboy
echo "Installing nodemon globally.."
sudo npm install -g nodemon
echo "Installing other dependencies.."
npm install
echo "Copying startup script into /etc/init.d"
sudo cp bellboy.sh /etc/init.d/
echo "Making the startup script executable"
sudo chmod 755 /etc/init.d/bellboy.sh
echo "Rebooting.."
sudo reboot
