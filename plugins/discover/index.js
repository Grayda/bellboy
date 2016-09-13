module.exports = function setup(options, imports, register) {
  // Required by all plugins. Lets Architect get the author, package name and description
  var package = require("./package.json")
  const dgram = require('dgram');
  const server = dgram.createSocket('udp4');

  server.on('error', (err) => {
    imports.logger.log("Error in discovery protocol: " + err, "error")
    server.close();
  });

  server.on('message', (msg, rinfo) => {
    console.dir(msg.toString('ascii'))
    if(msg.toString('ascii') == "hello_bellboy") {
      imports.logger.log("Got a hello from " + rinfo.address + ", sending a response on port " + rinfo.port, "debug")
      server.send("hello_client", rinfo.port, rinfo.address)
    }

  });


  server.bind(options.options.port, function() {
    server.setBroadcast(true)
  })

  demoObj = {
    plugin: package
  }

  // package.json tells Architect to expect a "demo" object, and we tell Architect about it here
  register(null, {
    discover: demoObj
  });
};
