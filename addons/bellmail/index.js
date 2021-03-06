// BellMail module
// ==============
// Depends On: Bellboy
// Emits: ready

// This module allows emails to be sent when various things happen (e.g. bell disabled, )

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellMail, EventEmitter);

var moment = require("moment"); // For formatting of dates
var parser = require('cron-parser');
var ejs = require('ejs'); // Text template engine, used for web parsing
var fs = require('fs'); // For reading files
var lodash = require("lodash"); // For quick and easy counting of enabled bells
var email = require("emailjs");
var mime = require('mime'); // For detecting mime type and embedding base64-encoded images into emails

var bellboy = {}
var attachments = []

function BellMail(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}


BellMail.prototype.Prepare = function(callback) {
  // Nothing to set up. Let's rock and roll!
  this.emit("ready")
  if (typeof callback === "function") {
    callback(details);
  }
  return true
}

BellMail.prototype.ViewFiles = function() {
  return fs.readdirSync(__dirname + "/templates")
}

BellMail.prototype.AttachFile = function(file) {
  var obj = {}
  try {
    obj.headers = {}
    obj.path = __dirname + "/includes/" + file
    obj.type = mime.lookup(__dirname + "/includes/" + file)
    obj.name = file
    obj.headers["Content-ID"] = file

    obj.alternative = false
    attachments.push(obj)
    console.log(attachments)
    return "cid:" + file
  } catch (ex) {
    console.log(ex)
  }
}

BellMail.prototype.LoadTemplate = function(template, bell, subject, callback) {
  file = fs.readFileSync(__dirname + "/templates/" + template).toString()
  var options = {
    Date: {
      "parsed": moment().format(bellboy.config.DateFormat),
      "unix": moment().unix(),
      "moment": moment
    },
    bellboy: bellboy,
    bell: bell,
    AttachFile: this.AttachFile,
    lodash: lodash,
    filename: __dirname + "/templates/" + template
  }
  result = ejs.render(file, options)
  this.emit("emailtemplateloaded", template, result)
  if (typeof callback === "function") {
    callback(result);
  }
  return result
}

BellMail.prototype.SendMail = function(mail, body, callback) {
  if (mail.Enabled == false) {
    return
  }

  var server = email.server.connect({
    user: bellboy.config.Mail.Username,
    password: bellboy.config.Mail.Password,
    host: bellboy.config.Mail.Server,
    ssl: bellboy.config.Mail.SSL
  });

  // send the message and get a callback with an error or details of the message that was sent
  attachments.push({data:body, alternative:true})
  server.send({
      text: body,
      from: bellboy.config.Mail.From,
      to: mail.To,
      subject: mail.Subject,
      attachment: attachments
    },
    function(err, message) {
      if (err) {
        console.log(err)
        this.emit("mailsenterror", err, mail, body)
      } else {
        this.emit("mailsent", mail, body)
      }
    }.bind(this));

  attachments = []

  if (typeof callback === "function") {
    callback(result);
  }
}

module.exports = BellMail;
