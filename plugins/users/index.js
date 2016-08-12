module.exports = function setup(options, imports, register) {
    var _ = require("lodash")
    var fs = require("fs")

    usersObj = {
        pluginName: "Users Plugin",
        pluginDescription: "User authentication plugin for Bellboy",
        users: [],
        groups: [],
        permissions: [],
        load: function() {
          this.users = JSON.parse(fs.readFileSync(options.options.usersFile, 'utf8'))
          this.groups = JSON.parse(fs.readFileSync(options.options.groupsFile, 'utf8'))
          this.permissions = JSON.parse(fs.readFileSync(options.options.permissionsFile, 'utf8'))

        },
        // Obviously replace this with a function that handles security properly
        authenticate: function(key, permission) {
          if(!_.includes(this.groups[this.users[key].groups].permissions, permission) && !_.includes(this.groups[this.users[key].groups].permissions, "all")) {
            imports.eventbus.emit("users.authenticate.nopermission", { key: key, permission: permission })
            return false
          }
          if(key === "ABC123") {
            imports.eventbus.emit("users.authenticate.success", key)
            return true
          } else {
            imports.eventbus.emit("users.authenticate.fail", key)
            return false
          }
        },
        login: function() {

        },
        logout: function() {

        }
    }

    usersObj.load()

    register(null, {
        users: usersObj
    });
};
