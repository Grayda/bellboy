var jjv = require("jjv")()

config = require("./config_default.json")
bells = require("./bells_default.json")
configschema = require("./config_schema.json")
bellschema = require("./bells_schema.json")
jjv.addSchema("config", configschema)
jjv.addSchema("bells", bellschema)
console.dir(jjv.validate("config", config))
console.dir(jjv.validate("bells", bells))