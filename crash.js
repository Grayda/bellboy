var email   = require("emailjs");
var config  = require("./config.json")
var flags   = require('flags');

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

  console.log("Sending email:")
  console.log("Server: " + flags.get("server"))
  console.log("To: " + flags.get("to"))
  console.log("From: " + flags.get("from"))
  console.log("Subject: " + flags.get("subject"))
  console.log("Body: " + flags.get("body"))

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
  }, function(err, message) { console.log(err || message); });
  console.log("Sent mail")
} catch (ex) {
  console.log("Crash app failed: " + ex)
}
