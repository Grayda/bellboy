var gulp = require("gulp")
var dir = require("node-dir")
var cp = require("child_process")
var less = require('gulp-less');
var nodemon = require('gulp-nodemon')
var path = require('path');
var fs = require("fs")

gulp.task("default", function(callback) {
  console.log("List of available gulp tasks. Run with 'gulp [taskname]':")
  console.log()
  console.log("install            - Runs 'install-global', 'install-plugins', 'install-bower' and 'less'")
  console.log("start              - Runs 'nodemon index.js'")
  console.log("'n'blow            - Two and a half words. Named after the fast food place in The Simpsons. Runs 'install-skipglobal', then 'start'")
  console.log("install-skipglobal - Same as 'install', but skips install-global")
  console.log("install-global     - Installs 'bower' globally, then installs 'less' globally")
  console.log("install-plugins    - Runs 'npm install' in the root folder, then recursively runs 'npm install' in every folder in '" + __dirname + "/plugins' (except 'node_modules' and 'bower_components')")
  console.log("install-bower      - Runs 'bower install' in '" + __dirname + "/plugins/core/web'")
  console.log("less               - Compiles all LESS files in " + __dirname + "/plugins/core/web/public/stylesheets'")
  callback()
})

gulp.task("start", ["less"], function(callback) {
  nodemon({
    script: 'index.js'
  })
})

gulp.task("'n'blow", ["install-skipglobal", "start"], function(callback) {
  callback()
})

gulp.task("install", ["install-global", "install-plugins", "install-bower", "less"], function(callback) {
  callback()
})

gulp.task("install-skipglobal", ["install-plugins", "install-bower", "less"], function(callback) {
  callback()
})

gulp.task("install-global", function(callback) {
  console.log("Installing bower globally")
  cp.execSync("npm install -g bower")
  console.log("Installing less globally")
  cp.execSync("npm install -g less")
  callback()
})

gulp.task("install-plugins", function(callback) {
  console.log("Installing dependencies")
  cp.execSync("npm install")
  console.log("Installing dependencies for plugins")
  dir.paths(__dirname + "/plugins", function(err, paths) {
    try {
      paths.dirs.forEach(function(item) {
        if (item.indexOf("node_modules") > -1 || item.indexOf("bower_components") > -1) {
          return
        }
        console.log("Running 'npm install' in " + item)
        cp.execSync("npm install", {
          cwd: item
        })
      })
    } catch (ex) {
      console.log("Failed to run 'npm install'. Error was: " + ex)
    }
  })
  callback()
})

gulp.task("install-bower", function(callback) {
  console.log("Installing bower dependencies for web plugin")
  cp.execSync("bower install", {
    cwd: "./plugins/core/web"
  })
  callback()
})

gulp.task('less', function (callback) {
  console.log("Compiling LESS files to CSS")
  return gulp.src('./plugins/core/web/public/stylesheets/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'plugins', "core", "web", "public", "stylesheets", "includes") ]
    }))
    .pipe(gulp.dest(path.join(__dirname, 'plugins', "core", "web", "public", "stylesheets")));
    callback()
})
