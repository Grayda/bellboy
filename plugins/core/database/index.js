
module.exports = function setup(options, imports, register) {
  var assert = require("assert")

  assert(options.host, "'host' is required")
  assert(options.port, "'port' is required")
  assert(options.host, "'database' is required")

  var url = "mongodb://" + options.host + ":" + options.port + "/" + options.database
  var db = require('monk')(url)

    register(null, {
      database: {
        db: db,
        url: url,
        insert: function(collection, data) {
          assert(collection, "Collection name is required!")
          assert(data, "Data is required!")
          var collection = db.get(collection)
          return collection.insert(data)
        },
        find: function(collection, criteria) {
          if(typeof criteria === "undefined") {
            criteria = {}
          }

          assert(collection, "Collection name is required!")
          var collection = db.get(collection)
          var results
          collection.find(criteria, function(err, docs) {
            this.results = docs
          }.bind(this))
          return results
        },
        update: function(collection, criteria, data) {
          assert(collection, "Collection name is required!")
          assert(criteria, "Criteria for update is required!")
          assert(data, "Data for update is required!")
          var collection = db.get(collection)
          return collection.update(criteria, data)
        },
        import: function(file) {
          return false // Not yet supported
        }
      }
    });
    imports.eventbus.emit("databaseconnected", url)


};
