module.exports = function setup(options, imports, register) {
    var fs = require("fs")
    var _ = require("lodash")

    var schemaObj = {
      schema: {
        "schema": {},
        "form": [],
      },
      append: function(schema, form) {
        schemaObj.schema.schema = _.merge(schemaObj.schema.schema, schema)
        schemaObj.schema.form.push(form)
      },
      load: function(file) {
        var obj = {}
        var schema = {}
        var form = []

        jsonfile = JSON.parse(fs.readFileSync(file, 'utf8'));

        obj.schema = jsonfile.schema
        obj.form = jsonfile.form
        return obj
      }
    }

    register(null, {
      schema: schemaObj
    });
};
