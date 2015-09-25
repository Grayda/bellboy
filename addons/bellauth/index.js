// BellAuth module
// ==============
// Depends On: Bellboy
// Emits: ready, log[logfile], logdeleted

// This module reads logs and such.

var fs = require("fs");
var bcrypt = require("bcrypt-nodejs")

var util = require("util"); // For inheriting the EventEmitter stuff so we can use it via this.emit();
var EventEmitter = require("events").EventEmitter;
util.inherits(BellAuth, EventEmitter);

var bellboy = {}
var users = {}

function BellAuth(bellboyInstance) {
  bellboy = bellboyInstance
  EventEmitter.call(this); // Needed so we can emit() from this module
}

ellAuth.prototype.Prepare = function(callback) {
  // Nothing to set up. Let's rock and roll!
  this.emit("ready")
  if (typeof callback === "function") {
    callback(details);
  }
  return true
}

BellAuth.prototype.LoadUsers = function(file, callback) {

  // Load and parse the JSON
  users = JSON.parse(fs.readFileSync(__dirname + file, 'utf8'));
  // So other files can use the config
  BellAuth.prototype.users = users;
  // Let everyone know we're ready, and what file we loaded
  this.emit("usersloaded", __dirname + file)
}

BellAuth.prototype.AddUser = function(username, password, callback) {
  if (typeof this.users[username] === "undefined") {
    return false
  }
  this.users[username].Username = username
  this.users[username].Password = bcrypt.hash(pasword)

  this.emit("useradded", username)

  if (typeof callback === "function") {
    callback(details);
  }
  return true

}

BellAuth.prototype.DeleteUser = function(username, callback) {
  if (typeof this.users[username] === "undefined") {
    return false
  }

  delete this.users[username]
  this.emit("userdeleted", username)
}

BellAuth.prototype.CheckDetails = function(username, password, callback) {
  if (typeof this.users[username] === "undefined") {
    return false
  }

  if(bcrypt.compareSync(password, this.users[username].Password)) {
    return true
  } else {
    return false
  }

}

B

module.exports = BellAuth;
