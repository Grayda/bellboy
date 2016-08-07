module.exports = function setup(options, imports, register) {
    usersObj = {
        pluginName: "Users Plugin",
        pluginDescription: "User authentication plugin for Bellboy",
        authenticate: function(key) {
          if(key === "ABC123") {
            imports.eventbus.emit("users.authenticate.success", key)
            return true
          } else {
            imports.eventbus.emit("users.authenticate.fail", key)
            return false
          }
        }
    }

    register(null, {
        users: usersObj
    });
};
