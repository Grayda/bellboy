module.exports = function setup(options, imports, register) {
    _ = require("lodash")

    var schemaObj = {
      schema: {
        "schema": {},
        "form": [],
      },
      append: function(schema, form) {
        schemaObj.schema.schema.properties = schema
        schemaObj.schema.form.push(form)
      }
    }

    register(null, {
      schema: schemaObj
    });
};
