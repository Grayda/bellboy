
module.exports = function setup(options, imports, register) {
  var assert = require("assert")
  var MongoClient = require('mongodb').MongoClient

  assert(options.host, "'host' is required")
  assert(options.port, "'port' is required")
  assert(options.host, "'database' is required")

  var url = "mongodb://" + options.host + ":" + options.port + "/" + options.database

  MongoClient.connect(url, function(err, db) {
    if(err) {
      throw err
    }

    register(null, {
      // "auth" is a service this plugin provides
      database: {
        db: db
        read: function(),
        write: emitter.on,
      }
    });
    immports.eventbus.emit("databaseconnected", url)
  })

};
