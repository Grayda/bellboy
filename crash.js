var config = require(__dirname + "/config/config.json")
var email = require("emailjs")

console.dir(config.CrashEmail)

var server = email.server.connect({
  user: config.Mail.Username,
  password: config.Mail.Password,
  host: config.Mail.Server,
  ssl: config.Mail.SSL
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
  text: config.Mail.CrashEmail.Body,
  from: config.Mail.CrashEmail.From,
  to: config.Mail.CrashEmail.To,
  subject: config.Mail.CrashEmail.Subject,
  attachment: [
   {data:config.Mail.CrashEmail.Body, alternative:true}
  ]
}, function(err, message) {
  if (err) {
    console.log(err)
  } else {
    console.log(message)
  }
});
