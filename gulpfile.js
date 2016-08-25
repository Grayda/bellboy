var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sh = require('shelljs');
var cp = require("child_process")
var dir = require("node-dir")
var nodemon = require('gulp-nodemon')
var path = require('path');
var fs = require("fs")

// Goes through all the folders in the plugins directory, runs
// npm install on each one, then adds it to plugins.json
gulp.task('install-plugins', function() {
  plugins = []
  if(typeof gutil.env.path === "undefined") {
    gutil.env.path = "./plugins"
  }

  try {
    fs.statSync(gutil.env.path)
  } catch(ex) {
    gutil.log(gutil.colors.red("Plugin path not found! Check that it exists"))
    process.exit(1)
  }

  dir.paths(__dirname + "/plugins", function(err, paths) {
    try {
      paths.dirs.forEach(function(item) {
        if (item.indexOf("node_modules") > -1 || item.indexOf("bower_components") > -1) {
          return
        }
        plugin = JSON.parse(fs.readFileSync(item + "/package.json"))
        gutil.log("Installing " + gutil.colors.green(plugin.description))

        plugins.push({
          packagePath: item,
          options: plugin.plugin.options || {}
        })

        cp.execSync("npm install", {
         cwd: item
        })
      }.bind(this))
      fs.writeFileSync(__dirname + "/plugins/plugins.json", JSON.stringify(plugins, null, "\t"))
    } catch (ex) {
      gutil.log(gutil.color.red("Failed to run 'npm install'. Error was: " + ex))
    }
  }.bind(this))


});
