#! /bin/sh
# /etc/init.d/bellboy.sh

### BEGIN INIT INFO
# Provides:          bellboy
# Required-Start:    $remote_fs $syslog $network
# Required-Stop:     $remote_fs $syslog $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Starts Bellboy at boot
# Description:       A simple script to launch bellboy as the RPi boots. Uses nodemon
### END INIT INFO

case "$1" in
  start)
    echo "Starting Bellboy"
    cd /home/pi/bellboy
    exec sudo /usr/local/bin/nodemon /home/pi/bellboy/index.js >> /home/pi/bellboy/bellboy.log 2>&1 &
  stop)
    echo "Stopping Bellboy"
    sudo killall node
  *)
    echo "Usage: $0 [start|stop]"
    exit 1
