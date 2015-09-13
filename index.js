var CronJob = require('cron').CronJob; // Handles the timing
var ejs = require('ejs'); // Text template engine, used for emails
var moment = require("moment"); // For formatting of dates
var Table = require('cli-table'); // Neatly presents data
var fs = require('fs'); // For reading files
var http = require('http'); // For our web server
var url = require("url"); // For parsing URLs
var dispatcher = require('httpdispatcher'); // For handling our web server requests
var parser = require('cron-parser');
var less = require('less');

var config, bells // Our two json config files
var jobs = {} // This will hold our cron jobs

// Begin
start()

function start() {
  loadSettings()
  c("Loading bells..")
  loadBells()

  // Start the web server if it's enabled
  if (config.Server) {
    startServer()
  }
}

// Play the audio file
function playAudio(file) {
  rand = Math.floor(Math.random() * (file.length));
  c("Playing " + file[rand])
  if (config.Debug == true) {
    c("Debug mode. Not playing audio!")
    return
  }
  var Player = require('player'); // Plays MP3s
  console.log(rand)
  player = new Player("./" + file[rand])
  player.on('error', function(err) {
    c(err)
  })
  player.play()

}

// Sends our trigger email.
function sendEmail(item) {
  // variables that the template should have access to
  var options = {
    mail: item.Mail.Trigger,
    item: item,
    Date: moment().format(config.DateFormat)
  }

  // Send the actual email.
  sendRawEmail(config.Mail.From, item.Mail.Trigger.To, item.Mail.Trigger.Subject, item.Mail.Trigger.Body, options)
}

function sendChangeEmail(item) {
  console.log(item)
  var options = {
    mail: item.Mail.Change,
    item: item,
    Date: moment().format(config.DateFormat)
  }

  // Send the actual email.
  sendRawEmail(config.Mail.From, item.Mail.Change.To, item.Mail.Change.Subject, item.Mail.Change.Body, options)


}

// Function that sends an email. SendEmail is used by it, as is the function for Mail.Changed
function sendRawEmail(from, to, subject, body, options) {
  // Take our options and parse our template
  var tBody = ejs.render(body, options)
  var tSubject = ejs.render(config.Mail.SubjectPrefix + subject, options)

  // Create a new table to show what email was sent.
  var table = new Table({
    head: ['Key', 'Value'],
    style: {
      head: ['green', 'bold']
    }
  });

  table.push(
    ["Server", config.Mail.Server], ["From", from], ["To", to], ["Subject", tSubject], ["Body", tBody], ["Time", moment().format(config.DateFormat)]
  );

  var email = require("emailjs");
  var server = email.server.connect({
    user: config.Mail.Username,
    password: config.Mail.Password,
    host: config.Mail.Server,
    ssl: config.Mail.SSL
  });

  // send the message and get a callback with an error or details of the message that was sent
  server.send({
    text: tBody,
    from: from,
    to: to,
    subject: tSubject
  }, function(err, message) {
    if (err) {
      c(err)
    }
  });

  c(table.toString())

}

// Starts a web server and sets up our dispatches
function startServer() {

  // Start a server and send any responses to our dispatcher
  var server = http.createServer(function(request, response) {
    dispatcher.dispatch(request, response);
  });

  // ===============================================================================================
  // Call to the root
  dispatcher.onGet("/", function(req, res) {
    file = fs.readFileSync("./web/index.html").toString()

    var options = {
      items: bells.Bells,
      bellsenabled: bells.Bells.Enabled,
      params: req.params,
      Date: moment().format(config.DateFormat),
      nextJob: nextJob(),
      cron: function(cron) {
        return cronToDate(cron)
      },
      query: req,
      filename: "./web/header.html"
    }
    res.end(ejs.render(file, options))

  });
  // ===============================================================================================
  // We've requested an image. Needs to be sent in binary
  dispatcher.beforeFilter(/\.jpg|\.png|\.gif|\.bmp\.ttf|\.woff/g, function(req, res) {
    file = fs.readFileSync("./web" + url.parse(req.url).pathname)
    params: req.params,
      res.end(file, 'binary')
  })

  // ===============================================================================================
  // We've requested a CSS file. Pass it the WebTheme from our config file
  dispatcher.beforeFilter(/\.less/g, function(req, res) {
    var options = {
      theme: config.WebTheme,
      params: req.params,
      filename: "./web/header.html"
    }

    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
    less.render(ejs.render(file, options), function(e, output) {
      c(e)
      res.end(output.css)
    })

  })

  // ===============================================================================================
  // We've requested a CSS file. Pass it the WebTheme from our config file
  dispatcher.beforeFilter(/\.css/g, function(req, res) {
    var options = {
      theme: config.WebTheme,
      params: req.params,
      filename: "./web/header.html",
      nextJob: nextJob(),
      cron: function(cron) {
        return cronToDate(cron)
      }
    }

    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
    res.end(ejs.render(file, options))

  })

  // ===============================================================================================
  // Not yet complete.
  dispatcher.onGet("/add.html", function(req, res) {
    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
    var options = {
      items: bells.Bells,
      Date: moment().format(config.DateFormat),
      params: req.params,
      query: req,
      filename: "./web/header.html",
      nextJob: nextJob(),
      cron: function(cron) {
        return cronToDate(cron)
      }
    }
    res.end(ejs.render(file, options))

  })

  // ===============================================================================================
  // View the logs
  dispatcher.onGet("/logs.html", function(req, res) {
    try {

      file = fs.readFileSync("./web/logs.html").toString()

      var options = {
        Date: moment().format(config.DateFormat),
        logs: fs.readFileSync("bellboy.log").toString().replace("\n", "<br />"),
        params: req.params,
        nextJob: nextJob(),
        cron: function(cron) {
          return cronToDate(cron)
        },
        filename: "./web/header.html"
      }
      res.end(ejs.render(file, options))
    } catch (ex) {
      console.log("Error parsing log: " + ex)
    }
  })

  // ===============================================================================================
  // For displays such as the PiTFT

  dispatcher.onGet("/monitor.html", function(req, res) {
    var bellcount = 0
    var enabledcount = 0
  Object.keys(bells.Bells).forEach(function(item) {
    bellcount++
    if(bells.Bells[item].Enabled == true) {
      enabledcount++
    }
  });
  console.log(bellcount, enabledcount)
    var options = {
      items: bells.Bells,
      Date: moment().format(config.DateFormat),
      params: req.params,
      filename: "./web/header.html",
      nextJob: nextJob(),
      bellcount: bellcount,
      enabledcount: enabledcount,
      cron: function(cron) {
        return cronToDate(cron)
      }
    }

    file = fs.readFileSync("./web/monitor.html").toString()
    res.end(ejs.render(file, options))
  });

  // ===============================================================================================
  // Reload bells and settings

  dispatcher.onGet("/reload.html", function(req, res) {
    loadBells()
    loadSettings()

    var options = {
      Date: moment().format(config.DateFormat),
      params: req.params,
      filename: "./web/header.html",
      nextJob: nextJob(),
      cron: function(cron) {
        return cronToDate(cron)
      }
    }

    file = fs.readFileSync("./web/reload.html").toString()
    res.end(ejs.render(file, options))
  });

  // ===============================================================================================
  // When we're switching a bell on or off
  dispatcher.onGet("/toggle.html", function(req, res) {

    var state = (req.params.state === "true")
    toggleBell(req.params.id, state, function(success) {
      if (success == false) {
        c("State NOT updated, as the job is locked")
      } else {
        sendChangeEmail(bells.Bells[req.params.id])
        showTable()
        saveBells()
      }

      // Grab the toggle.html file for updating
      file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
        // Options the template will have access to
      var options = {
        item: bells.Bells[req.params.id],
        Date: moment().format(config.DateFormat),
        nextJob: nextJob(),
        cron: function(cron) {
          return cronToDate(cron)
        },
        state: state,
        filename: "./web/header.html"
      }

      // Render the template and write it to our waiting client.
      res.end(ejs.render(file, options))
    })
  })

  // ===============================================================================================
  // When we're switching a bell on or off
  dispatcher.onGet("/trigger.html", function(req, res) {
    var item = req.params.id

    // If bells are DISABLED, just return. Don't process anything.
    if (bells.Bells["_all"].Enabled === false) {
      c("=======================================================================")
      c("Bells are currently DISABLED. No bells will ring until they are enabled")
      c("=======================================================================")
      return;
    }
    // Let us know the job has been triggered
    c("Triggering job: " + bells.Bells[item].Name + " at " + moment().format(config.DateFormat));
    // If we've got emails enabled for this job
    emailState = (bells.Bells[item].Mail.Trigger.Enabled === "true")
    if (emailState == true) {
      c("Emailing Now..")
      sendEmail(bells.Bells[item])
    }

    // Actually play the audio
    playAudio(bells.Bells[item].File)

    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
      // Options the template will have access to
    var options = {
      item: bells.Bells[req.params.id],
      Date: moment().format(config.DateFormat),
      nextJob: nextJob(),
      cron: function(cron) {
        return cronToDate(cron)
      },
      filename: "./web/header.html"
    }

    // Render the template and write it to our waiting client.
    res.end(ejs.render(file, options))

})


// ===============================================================================================
// Ask to update the app using git pull
// TO-DO: Make sure bells don't get overwritten by git pull!
dispatcher.onGet("/update.html", function(req, res) {
  var strStdout, branch
  if (req.params.confirm) {
    var exec = require('child_process').exec


    if (config.Beta === true) {
      branch = "beta"
    } else {
      branch = "stable"
    }
    c("Pulling branch: " + branch)

    exec("git pull origin " + branch, function(error, stdout, stderr) {
      strStdout = stdout
      console.log(stdout || stderr)
        // Grab the update.html file for updating
      file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
        // Options the template will have access to
      var options = {
        Date: moment().format(config.DateFormat),
        status: stdout || stderr,
        params: req.params,
        nextJob: nextJob(),
        cron: function(cron) {
          return cronToDate(cron)
        },
        filename: "./web/header.html"
      }
      res.end(ejs.render(file, options))
    })
  } else {
    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
    var options = {
      Date: moment().format(config.DateFormat),
      params: req.params,
      nextJob: nextJob(),
      cron: function(cron) {
        return cronToDate(cron)
      },
      filename: "./web/header.html"
    }
    res.end(ejs.render(file, options))

  }
})

// After our setup, set our server to listen
server.listen(config.ServerPort, function() {
  c("Server listening on: http://localhost:" + config.ServerPort);
});

}

// Sets a bell to the specified state. Supports a callback so you know when it's done.
function toggleBell(bell, state, callback) {

  // Force "locked" to be a boolean. Need to check this line in other functions, as it could be security risk
  var locked = (bells.Bells[bell].Locked === "true")
    // If the job isn't locked (meaning it can be changed via the web UI)
  if (locked == false) {
    // If state is going to be true, start the job
    if (state === true) {
      c("Starting Cron job for " + bell)
      if (bell != "_all") {
        jobs[bell].start()
      }
    } else {
      // Stop the job if we're disabling it
      c("Stopping Cron job for " + bell)
      if (bell != "_all") {
        jobs[bell].stop()
      }
    }
    // Set the bell. It's your responsibility to call saveBells() later
    bells.Bells[bell].Enabled = state
    c(bell + " is now " + bells.Bells[bell].Enabled)
    if (typeof callback === "function") {
      callback(true);
    }
  } else {
    if (typeof callback === "function") {
      callback(false);
    }
  }

}

function saveSettings() {
  fs.writeFile("./config.json", JSON.stringify(config, null, 2))
}

function loadSettings() {
  config = JSON.parse(fs.readFileSync("./config.json", 'utf8'));
}

function loadBells() {
  bells = JSON.parse(fs.readFileSync(config.BellFile, 'utf8'));

  if (bells.Bells["_all"].Enabled === false) {
    c("=======================================================================")
    c("Bells are currently DISABLED. No bells will ring until they are enabled")
    c("=======================================================================")
    return;
  }

  // Loop through all the bells we have
  // Because bells.Bells uses a string based key, we have to do it this way.
  Object.keys(bells.Bells).forEach(function(item) {
    if (item === "_all") {
      return
    }
    try {


      jobs[item].stop()
    } catch (ex) {

    }
    // Create a new Cron job at the specified .Time (a Cron expression)
    jobs[item] = new CronJob(bells.Bells[item].Time, function() {
      // If bells are DISABLED, just return. Don't process anything.
      if (bells.Bells["_all"].Enabled === false) {
        c("=======================================================================")
        c("Bells are currently DISABLED. No bells will ring until they are enabled")
        c("=======================================================================")
        return;
      }
      // Let us know the job has been triggered
      c("Triggering job: " + bells.Bells[item].Name + " at " + moment().format(config.DateFormat));
      // If we've got emails enabled for this job
      emailState = (bells.Bells[item].Mail.Trigger.Enabled === "true")
      if (emailState == true) {
        c("Emailing Now..")
        sendEmail(bells.Bells[item])
      }

      // Actually play the audio
      playAudio(bells.Bells[item].File)
        // Replace "null" with a function() if you want something to run when the job completes. The next parameter determines
        // if the job runs now (otherwise you need to call job[key].start()), final param is timezone the job should run
    }.bind(this), null, bells.Bells[item].Enabled, config.Location);

  })

  showTable()
}


function cronToDate(cron) {
  var details = []
  details["calendar"] = moment(parser.parseExpression(cron).next()).calendar()
  details["to"] = moment().to(parser.parseExpression(cron).next())
  return details
}

function nextJob() {
  var time
  var results = []
    // Because the diff is a negative number (smaller as it approaches "now") and we're lookiung for a number > the smallest, we set this insanely low
  results["diff"] = -9999999999999999999999999999
  Object.keys(bells.Bells).forEach(function(item) {
    if (item == "_all") {
      return
    }
    if (bells.Bells[item].Enabled == true) { // Only interested in enabled bells
      var interval = parser.parseExpression(bells.Bells[item].Time);
      diff = moment().diff(interval.next())
      if (diff > results["diff"]) {

        results["parsed"] = interval.next()
        results["shortparsed"] = moment(results["parsed"]).format("ddd MMM Do HH:MM:SS")
        results["diff"] = diff
        results["time"] = bells.Bells[item].Time

      }
    }
  })

  return results
}

function saveBells() {
  fs.writeFile(config.BellFile, JSON.stringify(bells, null, 2))
}

function showTable() {
  var table = new Table({
    head: ['ID', 'Name', 'Description', 'Time', 'File', 'Email', 'Enabled'],
    style: {
      head: ['green', 'bold']
    },
    chars: {
      'top': '=',
      'top-mid': '=',
      'top-left': '=',
      'top-right': '=',
      'bottom': '=',
      'bottom-mid': '=',
      'bottom-left': '=',
      'bottom-right': '=',
      'left': '|',
      'left-mid': '|',
      'mid': '-',
      'mid-mid': '+',
      'right': '|',
      'right-mid': '|',
      'middle': '|'
    }
  });

  Object.keys(bells.Bells).forEach(function(item) {
    if (item === "_all") {
      return
    }
    // Add details to the table
    table.push(
      [item, bells.Bells[item].Name, bells.Bells[item].Description, bells.Bells[item].Time, bells.Bells[item].File, bells.Bells[item].Mail.Trigger.Enabled, bells.Bells[item].Enabled]
    );
  })
  console.log(table.toString())
  c("Time is a cron expression: Minute, Hour, Day, Month, Day of the week")
  c()
}

function c(text) {
  if (text == null) {
    console.log("<br />")
  } else {
    text = moment().format(config.DateFormat) + " - " + text
    console.log(text + "<br />")
      // fs.appendFile(config.LogFile, text + "\r\n")

  }

}
