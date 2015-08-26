var CronJob = require('cron').CronJob; // Handles the timing
// var Player = require('player'); // Plays MP3s
var ejs = require('ejs'); // Text template engine, used for emails
var moment = require("moment"); // For formatting of dates
var Table = require('cli-table'); // Neatly presents data
var fs = require('fs'); // For reading files
var http = require('http'); // For our web server
var url = require("url"); // For parsing URLs
var dispatcher = require('httpdispatcher'); // For handling our web server requests

var config, bells

start()

function start() {
  console.log()
  console.log("Loading settings..")
  loadSettings()
  console.log("Loading bells..")
  loadBells()
  console.log()


  // Creates a new table with our headings
  var table = new Table({
    head: ['Enabled', 'Name', 'Description', 'Time', 'File', 'Email'],
    style: { head: ['green', 'bold']}
  });

  startServer()

  // Loop through all the bells we have
  bells.Bells.forEach(function(item) {
      // Add details to the table
      table.push(
        [item.Enabled, item.Name, item.Description, item.Time, item.File, item.Email.Enabled]
      );

      // If this bell is enabled
      if(item.Enabled == true) {
          // Create a new Cron job at the specified .Time (a Cron expression)
          new CronJob(item.Time, function() {
              // Let us know the job has been triggered
              console.log("Triggering job: " + item.Description + " at " + moment().format(config.DateFormat));
              // If we've got emails enabled for this job
              if ( typeof item.Email.Enabled !== 'undefined' && item.Email.Enabled == true) {
                sendEmail(item)
              }
              // Actually play the audio
              playAudio(item.File)
          // Replace "null" with a function() if you want something to run when the job completes, "true" = runs the job now, final param is timezone the job should run
          }.bind(this), null, true, config.Location);
      }
  })

      console.log(table.toString())
      console.log("Time is a cron expression: Minute, Hour, Day, Month, Day of the week")
      console.log()
}

function playAudio(file) {
    console.log("Playing " + file)
    //player = new Player("./" + file)
    //player.play()
}

function sendEmail(item) {

    var options = {
      Item: item,
      Date: moment().format(config.DateFormat)
    }
    var tBody = ejs.render(item.Email.Body, options)
    var tSubject = ejs.render(item.Email.Subject, options)

    console.log(tSubject)
    console.log(tBody)

    var email   = require("emailjs");
    var server  = email.server.connect({
        user:    config.Email.Username,
        password:config.Email.Password,
        host:    config.Email.Server,
        ssl:     config.Email.SSL
    });

    // send the message and get a callback with an error or details of the message that was sent
    server.send({
        text:    tBody,
        from:    item.Email.From,
        to:      item.Email.To,
        subject: tSubject
    }, function(err, message) {
        console.log(err || message);
    });
}

function startServer() {

  // Start a server and send any responses to our dispatcher
  var server = http.createServer(function(request, response){
    dispatcher.dispatch(request, response);
  });

  // When we're switching a bell on or off
  dispatcher.onGet("/toggle.html", function(req,res) {
    toggleBell(req.params.id, req.params.state)
    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
    var options = {
      items: bells.Bells,
      Date: moment().format(config.DateFormat),
      query: req.params.id,
      state: req.params.state,
      filename: "./web/header.html"
    }
    res.end(ejs.render(file, options))
  })

  // We've requested an image. Needs to be sent in binary
  dispatcher.beforeFilter(/\.jpg|\.png|\.gif/g, function(req, res) {
    console.log("Image!")
      file = fs.readFileSync("./web" + url.parse(req.url).pathname)
      res.end(file, 'binary')
  })

  // We've requested a CSS file
  dispatcher.beforeFilter(/.css/g, function(req, res) {
    var options = {
      items: bells.Bells,
      Date: moment().format(config.DateFormat),
      query: req.params.id,
      filename: "./web/header.html"
    }

    file = fs.readFileSync("./web" + url.parse(req.url).pathname).toString()
    res.end(ejs.render(file, options))

  })

  // Call to the root
  dispatcher.onGet("/", function(req, res) {
    file = fs.readFileSync("./web/index.html").toString()
    var options = {
      items: bells.Bells,
      Date: moment().format(config.DateFormat),
      query: req,
      filename: "./web/header.html"
    }
    res.end(ejs.render(file, options))

  });


  server.listen(config.ServerPort, function(){
      console.log("Server listening on: http://localhost:%s", config.ServerPort);
  });

}

function toggleBell(bell, state) {
  bells.Bells.forEach(function(item) {
    if(item.ID == bell) {
      item.Enabled = state
      console.log(item.ID + " is now " + item.Enabled)
    }
  })
}

function saveSettings() {
  fs.writeFile("./config.json", json.stringify(config))
}

function loadSettings() {
  config = JSON.parse(fs.readFileSync("./config.json", 'utf8'));
}

function loadBells() {
  bells = JSON.parse(fs.readFileSync(config.BellFile, 'utf8'));
}

function saveBells() {
  fs.writeFile("./bells.json", json.stringify(bells))
}
