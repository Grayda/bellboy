var CronJob = require('cron').CronJob;
// var Player = require('player');
var ejs = require('ejs');
var moment = require("moment")
var Table = require('cli-table');

var config = require("./config.json")
var bells = require(config.BellFile);
    // Loops through our bells.json file

    var table = new Table({
      head: ['Enabled', 'Name', 'Description', 'Time', 'File', 'Email'],
      style: { head: ['green', 'bold']}
    });

    bells.Bells.forEach(function(item) {
        table.push(
          [item.Enabled, item.Name, item.Description, item.Time, item.File, item.Email.Enabled]
        );

        if(item.Enabled == true) {
                // Create a new Cron job at the specified .Time (a Cron expression)
            new CronJob(item.Time, function() {
                console.log("Triggering job: " + item.Description);
                if ( typeof item.Email.Enabled !== 'undefined' && item.Email.Enabled == true) {
                  sendEmail(item)
                }

                playAudio(item.File)
            }.bind(this), null, true, config.Location);
        }
    })

    console.log(table.toString())

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
