module.exports = function setup(options, imports, register) {

  register(null, {
    // "auth" is a service this plugin provides
    bellboy: {
      doLogin: function() {
        return false
      },
      isLoggedIn: function() {
        return false
      }
    }
  });
};
