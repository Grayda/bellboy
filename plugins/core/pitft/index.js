module.exports = function setup(options, imports, register) {
    var gpio = require("rpi-gpio");
    var fs = require("fs")

    pitftObj.setPin(options.backlight, 0)
    pitftObj.setPin(options.button1, 1);
    pitftObj.setPin(options.button2, 1);
    pitftObj.setPin(options.button3, 1);
    pitftObj.setPin(options.button4, 1);

    gpio.on('change', function(pin, value) {
        switch (pin) {
          case options.button1:
            if (value == 1) {
              imports.eventbus.emit("button", 1)
            } else {
              imports.eventbus.emit("buttonreleased", 1)
            }
            break;
          case options.button2:
            if (value == 1) {
              imports.eventbus.emit("button", 2)
            } else {
              imports.eventbus.emit("buttonreleased", 2)
            }

            break;
          case options.button3:
            if (value == 1) {
              imports.eventbus.emit("button", 3)
            } else {
              imports.eventbus.emit("buttonreleased", 3)
            }

            break;
          case options.button4:
            if (value == 1) {
              imports.eventbus.emit("button", 4)
            } else {
              imports.eventbus.emit("buttonreleased", 4)
            }

            break;
          case options.backlight:
            imports.eventbus.emit("backlightchanged", value / 1023 * 100)
        }
        imports.eventbus.emit("pinchange", pin, value)
      }

      pitftObj = {
        isPi: function() {
          try {
            hardware = fs.readFileSync("/proc/cpuinfo")
            if (hardware.indexOf("BCM2708") > -1) {
              return true
            } else {
              return false
            }
          } catch (ex) {
            return false
          }
        },
        setPins: function(backlight, button1, button2, button3, button4) {
          var dir
          if (direction == 0) {
            dir = gpio.DIR_OUT
          } else {
            dir = gpio.DIR_IN
          }

          gpio.setup(pin, dir);
          imports.eventbus.emit("pinsetup", pin, direction)
        },
        setBacklight: function(percentage, timeout, revertedbrightness) {
          if (percentage === true) {
            percentage = 100
          } else if (percentage === false) {
            percentage = 0
          }

          // Convert our brightness into a value out of 1023
          brightness = percentage * 1023 / 100
          pitftObj.write(options.backlight, brightness)

          // If we've set a timeout
          if (typeof timeout !== "undefined") {
            pitftObj.togglePin(options.backlight, brightness, revertedbrightness, timeout)
          }

          imports.eventbus.emit("backlightchanged", percentage)
        },
        write: function(pin, value) {
          gpio.write(pin, value)
          imports.eventbus.emit("pinwrite", pin, value)
        },
        togglePin: function(pin, onvalue, offvalue, timeout) {
          pitftObj.write(pin, onvalue, function() {
            setTimeout(function() {
              pitftObj.write(pin, offvalue)
            }, timeout)
          })
        }
      }

      register(null, {
        pitft: pitftObj
      });
    };
