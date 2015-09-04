var email   = require("emailjs");
var config  = require("./config.json")
var flags   = require('flags');
var fs   = require('fs');
var moment = require("moment"); // For formatting of dates

c("App has crashed at " + moment().format(config.DateFormat))

try {

  flags.defineString('username', config.Email.Username, 'Username to connect to SMTP as');
  flags.defineString('password', config.Email.Password, 'Password to connect to SMTP as');
  flags.defineString('server', config.Email.Server, 'SMTP server to connect to');
  flags.defineBoolean('ssl', config.Email.SSL, 'Use SSL for sending');
  flags.defineString('from', config.Email.From, 'Who the email is from');
  flags.defineString('to', config.CrashEmail.To, 'Who the email is going to');
  flags.defineString('subject', config.CrashEmail.Subject, 'Subject of the email');
  flags.defineString('body', config.CrashEmail.Body, 'Body of the email');

  flags.parse();

  c("Sending email:")
  c("Server: " + flags.get("server"))
  c("To: " + flags.get("to"))
  c("From: " + flags.get("from"))
  c("Subject: " + flags.get("subject"))
  c("Body: " + flags.get("body"))

  var server  = email.server.connect({
      user:    flags.get("username"),
      password:flags.get("password"),
      host:    flags.get("server"),
      ssl:     flags.get("ssl"),
  });

  // send the message and get a callback with an error or details of the message that was sent
  server.send({
      text:    flags.get("body"),
      from:    flags.get("from"),
      to:      flags.get("to"),
      subject: config.Email.SubjectPrefix + flags.get("subject")
  }, function(err, message) { c(err || message); });
  c("Sent mail")
} catch (ex) {
  c("Crash app failed: " + ex)
}

function c(text) {
  if(text == null) {
    console.log("")
   } else {
     console.log(text)
    text = moment().format(config.DateFormat) + " - " + text
    fs.appendFile(config.LogFile, text + "\r\n")
  }
}
