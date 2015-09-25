var config = require("./core/config/config.json")
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
  text: config.CrashEmail.Body,
  from: config.CrashEmail.From,
  to: config.CrashEmail.To,
  subject: config.CrashEmail.Subject,
  attachment: [
   {data:config.CrashEmail.Body, alternative:true}
  ]
}, function(err, message) {
  if (err) {
    console.log(err)
  } else {
    console.log(message)
  }
});
