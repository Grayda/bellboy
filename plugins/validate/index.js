module.exports = function setup(options, imports, register) {
  var validator = require("validator")
  var jjv = require("jjv")
  var fs = require("fs")

  validator.pluginName = "Validator Plugin"
  validator.pluginDescription = "Core plugin that validates JSON schemas and other information. Extends the 'validator' package"

  validator.isFilename = function(str) {
    return /^[^\\\/:"*?<>|]+$/i.test(str);
  }

  validator.isValidSchema = function(schema, json) {

    schema = fs.readFileSync(options.options.schemaPath + "/" + schema)
    jjv.addSchema("schema", schema.toString())
    results = jjv.validate("schema", json.toString())

    if (results == null) {
      imports.eventbus.emit("validate.validschema")
      return true
    } else {
      imports.eventbus.emit("validate.invalidschema", results)
      return results
    }
  }

  register(null, {
    validate: validator
  });
};
