
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
        db: db,
        url: url,
        insert: function(collection, data) {
          assert(collection, "Collection name is required!")
          assert(data, "Data is required!")
          db[collection].insert(data, function(err, data) {
            return data
          })
        },
        find: function(collection, criteria) {
          assert(collection, "Collection name is required!")
          assert(criteria, "Criteria for find is required!")
          db[collection].find(criteria, function(err, data) {
            return data
          })
        },
        update: function(collection, criteria, data) {
          assert(collection, "Collection name is required!")
          assert(criteria, "Criteria for update is required!")
          assert(data, "Data for update is required!")
          db[collection].update(criteria, data, function(err, data) {
            return data
          })
        },
        import: function(file) {
          return false // Not yet supported
        }
      }
    });
    imports.eventbus.emit("databaseconnected", url)
  })

};
