try {
    var Player = require('player').Player();
}
    catch(ex) {
        console.log("YO: " + ex.message)

}


var util = require("util"); // As part of our EventEmitter code
var EventEmitter = require("events").EventEmitter; // For emitting events so other node.js libraries and code can react to what we're doing here

var fs = require('fs');
var alarms = JSON.parse(fs.readFileSync('alarms.json', 'utf8'));
var CronJob = require('cron').CronJob;
 

util.inherits(BellBoy, EventEmitter); // Let BellBoy inherit everything EventEmitter can do, so we can call this.emit('blah');

function BellBoy() { }

BellBoy.prototype.start = function() {
    var a = alarms 
    for(var i = 0; i <= alarms.length - 1; i++) {
        console.log("A: " + i);
        console.log("Creating alarm '" + alarms[i].name + "' with time " + alarms[i].time);
        new CronJob(alarms[i].time, function() {
            console.log("L:" + i)
            this.emit('alarm', alarms[i - 2].name, alarms[i - 2].alarm);
        }.bind(this), function() {}, true);    
    }
}

BellBoy.prototype.play = function(file) {
    Player.add('./jesus.mp3');
    Player.play();
    // event: on error
Player.on('error', function(err){
  // when error occurs
  console.log(err);
});
}

module.exports = BellBoy;