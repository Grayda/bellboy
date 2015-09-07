#! /bin/sh
# /etc/init.d/bellboy.sh

### BEGIN INIT INFO
# Provides:          bellboy
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Starts Bellboy at boot
# Description:       A simple script to launch bellboy as the RPi boots. Uses nodemon
### END INIT INFO

nodemon /home/pi/bellboy/index.js
