var BellBoy = require("./alarm.js").BellBoy(); // Require our helper library


BellBoy.on('alarm', function(name, alarm) {
    console.log("ALARM! " + name);
    BellBoy.play(alarm);
})

BellBoy.start();