var url = require("url"); // For parsing URLs
var Bellboy = require("./core/index.js"); // Our core Bellboy class
var moment = require("moment"); // For date parsing
var bellboy = new Bellboy(); // The main class that schedules and enables / disables our bells

//If we're ready to go
bellboy.on("ready", function() {
  // Show a heading
  showWelcome()
  // Load the settings and the bells
  bellboy.LoadSettings("/config/config.json")
})

// Settings loaded. Load the bells now
bellboy.on("settingsloaded", function() {
  console.log("Settings loaded!")
  bellboy.LoadBells(bellboy.config.BellFile)
});

// Now the bells have loaded. We can now start
bellboy.on("bellsloaded", function() {
  console.log("Bells loaded!")
  // This creates new CronJobs for each bell in our bells.json file
  bellboy.Start()
});

// Emitted when a job is added. Useful for emailing when someone adds a new job,
// though it also gets called when the bells are reloaded.
// TO-DO: Change this behaviour so it only gets called when a job is added, not reloaded.
bellboy.on("jobadded", function(item) {
  // console.log("\"" + item.Name + "\" added. State is: " + item.Enabled)
})

// All the jobs are loaded. Time to load some modules!
bellboy.on("jobsloaded", function(jobs) {
  var BellLog = require("./addons/belllog/index.js") // An add-on that lets us parse and display cron jobs in a human-readable way
  var BellParser = require("./addons/bellparser/index.js") // An add-on that lets us parse and display cron jobs in a human-readable way
  var BellWeb = require("./addons/bellweb/index.js") // Gives us a front-end to work with. Depends on BellParser, so watch out for that
  var BellAudio = require("./addons/bellaudio/index.js") // A module that plays audio. Now supports Windows and Linux!
  var BellPi = require("./addons/bellpi/index.js") // An add-on that adds Raspberry Pi specific things, such as support for the Adafruit 2.2" TFT screen
  var BellMail = require("./addons/bellmail/index.js") // An add-on for emailing people.

  // We store these in bellboy.modules so other modules can use the features.
  // Some modules depend on others (e.g. BellWeb uses BellParser) so check
  // the index.js for that addon
  bellboy.modules["belllog"] = new BellLog(bellboy)
  bellboy.modules["bellparser"] = new BellParser(bellboy)
  bellboy.modules["bellmail"] = new BellMail(bellboy)
  bellboy.modules["bellaudio"] = new BellAudio(bellboy)
  bellboy.modules["bellweb"] = new BellWeb(bellboy)
  bellboy.modules["bellpi"] = new BellPi(bellboy)

  // Bellparser is loaded
  bellboy.modules["bellparser"].on("ready", function() {
    console.log("BellParser loaded")
  })

  // =============================================================================
  // BellPi related stuff

  // BellPi is laoded. If necessary, we can do stuff here
  bellboy.modules["bellpi"].on("ready", function() {
    console.log("BellPi loaded")
  })

  // When someone presses button1 on the 2.2" TFT screen, do this.
  // We also have button2, button3 and button4 to work with
  bellboy.modules["bellpi"].on("button1", function() {
    bellboy.Trigger("_default")
  })

  // Any button is pressed
  bellboy.modules["bellpi"].on("button", function(index) {
    switch(index) {
      case 1:
        bellboy.Trigger("_default")
        break;
    }
    // Turn on the backlight
    bellboy.modules["bellpi"].SetBacklight(true)
    // Then after 10 seconds, turn the light off
    setTimeout(function() {
      bellboy.modules["bellpi"].SetBacklight(false)
    }, 10000)
  })

  // =============================================================================
  // BellMail related stuff

  bellboy.modules["bellmail"].on("ready", function() {
    console.log("BellMail loaded")
  })

  // If we've encountered an error when sending mail
  bellboy.modules["bellmail"].on("mailsenterror", function(err, mail, body) {
    console.log("Mail NOT sent due to error:")
    console.dir(mail)
    console.log(body)
    console.log(err)
  })

  // Email was sent successfully
  bellboy.modules["bellmail"].on("mailsent", function(mail, body) {

  });


  // =============================================================================
  // Bellweb related stuff

  // BellWeb is ready (the server has started, dispatcher is ready, we're good to start accepting connections)
  bellboy.modules["bellweb"].on("ready", function() {
    console.log("BellWeb loaded")
    console.log("Access the web UI at: http://" + bellboy.modules["bellweb"].GetHostName() + ":8080")

    bellboy.modules["bellweb"].on("loggedin", function(username) {
      console.log(username + " has logged in")
    })
    // socketready lets us know that socket.io is ready to go.
    // Typically, this won't fire until a client connects
    bellboy.modules["bellweb"].on("socketready", function() {
      console.log("Socket ready")

      bellboy.modules["bellweb"].socket.on("deletelog", function() {
        bellboy.modules["belllog"].DeleteLog()
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Log Deleted",
          "message": "bellboy.log has been deleted!"
        })
      })
      // The client has sent a message to us, telling us the webpage has requested a **VIRTUAL** button press
      bellboy.modules["bellweb"].socket.on("button", function(button) {
        switch(button.number) {
          case 1:
            bellboy.modules["bellpi"].emit("button1")
            break;
            case 2:
              bellboy.modules["bellpi"].emit("button2")
              break;
            case 3:
              bellboy.modules["bellpi"].emit("button3")
              break;
            case 4:
              bellboy.modules["bellpi"].emit("button4")
              break;
        }
      }.bind(this))

      bellboy.modules["bellweb"].socket.on("setvolume", function(volume) {
        console.log("Volume set to " + volume)
        bellboy.modules["bellaudio"].SetVolume(volume)
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Volume changed",
          "message": "Volume set to " + volume + "!",
          "timeout": 2000
        })
      })

      bellboy.modules["bellweb"].socket.on("trigger", function(bell) {
        bellboy.Trigger(bell.bell)
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Bell triggered",
          "message": bellboy.bells[bellboy.config.Schedule][bell.bell].Name + " has been triggered!",
          "timeout": 2000
        })
      })

      bellboy.modules["bellweb"].socket.on("togglebell", function(data) {
        if(data.state == true) {
          bellboy.EnableBell(data.bell)
        } else if(data.state == false) {
          bellboy.DisableBell(data.bell)
        } else {
          return
        }
        bellboy.modules["bellweb"].SocketEmit("notification", {
          "title": "Bell toggled",
          "message": bellboy.bells[bellboy.config.Schedule][data.bell].Name + " has been set to " + data.state + "!",
          "timeout": 2000
        })

      })

      // This runs every 10 seconds and provides our webpage with the next bell time
      // Almost every other update is provided on an as-needed basis (e.g. reload currently enabled bells only when someone toggles a bell)
      setInterval(function() {

        bellboy.modules["bellweb"].SocketEmit("nextbell", {
          "date": bellboy.modules["bellparser"].GetNextJob()["calendar"]
        })

        // bellboy.modules["bellweb"].SocketEmit("reloadtable")
      }.bind(this), 10000)

      bellboy.modules["bellweb"].socket.on("error", function(err) {
        console.log(err)
      })
    })
  })

  // The meat of our BellWeb module. Someone has loaded a page, now
  // we need to work out what to do with it.
  bellboy.modules["bellweb"].on("pageloaded", function(req) {

    switch (url.parse(req.url).pathname) {
      // We've called toggle.html
      case "/toggle.html":
        // Find out if we want to turn a bell on or off
        switch (req.params.state) {
          case "true" || true:
            // Enable, then save the bells
            bellboy.EnableBell(req.params.id)
            bellboy.SaveBells(bellboy.config.BellFile)
            break;
          case "false" || false:
            // Disable, theb save the bells
            bellboy.DisableBell(req.params.id)
            bellboy.SaveBells(bellboy.config.BellFile)
            break;
          default:
            // Not actually  a state? Don't allow it!
            console.log("Incorrect state! Received: " + req.params.state)
        }
        break;
      case "/add.html":
        console.dir(req.params)
        if(typeof req.params.submit !== "undefined") {
          console.log("Saving bell")
          bellboy.AddBell(req.params.id, {
            "Name": req.params.name,
            "Description": req.params.description,
            "Locked": "false",
            "Time": req.params.time,
            "File": req.params.files,
            "Mail": {
              "Trigger": {
                "Enabled": req.params.triggermailenabled || false,
                "To": req.params.triggermailto || "",
                "Subject": req.params.triggermailsubject || "",
                "Template": req.params.triggermailtemplate,
              },
              "Change": {
                "Enabled": req.params.changemailenabled || false,
                "To": req.params.changemailto || "",
                "Subject": req.params.changemailsubject || "",
                "Template": req.params.changemailtemplate,
              }
            }
          })

        } else {
          console.log("Not adding bell. No params")
        }

        break;
      // Manually trigger a bell
      case "/trigger.html":
        bellboy.Trigger(req.params.id)
        break;
      case "/delete.html":
        bellboy.DeleteBell("temp")
        break;
    }
  })

  // Stuff we want to look out for is done, time to ask the various modules to prepare
  bellboy.modules["belllog"].Prepare()
  bellboy.modules["bellpi"].Prepare()
  bellboy.modules["bellparser"].Prepare()
  bellboy.modules["bellweb"].Prepare("./addons/bellweb/pages/", bellboy.config.ServerPort)
  bellboy.modules["bellmail"].Prepare()
  bellboy.modules["bellaudio"].Prepare()

})

// The bell has triggered, either manually or automatically
bellboy.on("trigger", function(item) {
  console.log(item)
  console.log(bellboy.bells[bellboy.config.Schedule][item].Name + " triggered!")
  // Play some audio
  // TO-DO: Pick a random file and play it
  bellboy.modules["bellaudio"].Play("/audio/" + bellboy.bells[bellboy.config.Schedule][item].File)

  // Load and send an email
  // TO-DO: Expand on this
  mail = bellboy.modules["bellmail"].LoadTemplate(bellboy.bells[bellboy.config.Schedule][item].Mail.Trigger.Template, item, bellboy.bells[bellboy.config.Schedule][item].Mail.Trigger.Subject)
  bellboy.modules["bellmail"].SendMail(bellboy.bells[bellboy.config.Schedule][item].Mail.Trigger, mail)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
  if(typeof bellboy.bells[bellboy.config.Schedule][item].SwitchSchedule !== "undefined") {
    bellboy.config.Schedule = bellboy.bells[bellboy.config.Schedule][item].SwitchSchedule
    bellboy.SaveSettings("/config/config.json")
  }
})

bellboy.on("triggerdone", function() {
  console.log("Job finished!")
})

// Someone has enabled a bell
bellboy.on("bellenabled", function(bell) {
  console.log(bellboy.bells[bellboy.config.Schedule][bell].Name + " was enabled")
  bellboy.SaveBells(bellboy.config.BellFile)
  mail = bellboy.modules["bellmail"].LoadTemplate(bellboy.bells[bellboy.config.Schedule][bell].Mail.Change.Template, bell, bellboy.bells[bellboy.config.Schedule][bell].Mail.Change.Subject)
  bellboy.modules["bellmail"].SendMail(bellboy.bells[bellboy.config.Schedule][bell].Mail.Change, mail)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
})

// Someone has disabled a bell
bellboy.on("belldisabled", function(bell) {
  console.log(bellboy.bells[bellboy.config.Schedule][bell].Name + " was disabled")
  bellboy.SaveBells(bellboy.config.BellFile)
  mail = bellboy.modules["bellmail"].LoadTemplate(bellboy.bells[bellboy.config.Schedule][bell].Mail.Change.Template, bell, bellboy.bells[bellboy.config.Schedule][bell].Mail.Change.Subject)
  bellboy.modules["bellmail"].SendMail(bellboy.bells[bellboy.config.Schedule][bell].Mail.Change, mail)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
})

bellboy.on("belladded", function(id, bell) {
  console.log("Bell added! New ID is " + id)
  bellboy.SaveBells(bellboy.config.BellFile)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
})

bellboy.on("belldeleted", function(id) {
  console.log("Bell " + id + " deleted")
  bellboy.SaveBells(bellboy.config.BellFile)
  bellboy.modules["bellweb"].SocketEmit("reloadtable")
})

bellboy.on("bellssaved", function(file) {
  console.log("Bells have been saved to " + file)
})

function showWelcome() {
  console.log()
  console.log(" Welcome to")
  console.log()
  var FONTS = require('cfonts');

  var fonts = new FONTS({
      'text': "Bellboy", //text to be converted
      'font': 'block', //define the font face
      'colors': ["white", "black"], //define all colors
      'background': 'black', //define the background color

      'space': false, //define if the output text should have empty lines on top and on the bottom
      'maxLength': '10' //define how many character can be on one line
  });
  console.log("    The Bell Timer System")
  console.log()
  console.log()

}

// We call this last, otherwise these "on" calls will fail (calling emit in bellboy BEFORE any handlers are set up? Bronchitis! (ain't nobody got time fo' dat))
bellboy.Prepare()
