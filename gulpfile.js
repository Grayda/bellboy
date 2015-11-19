var gulp = require("gulp")
var dir = require("node-dir")
var cp = require("child_process")
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function (callback) {
  console.log("Compiling LESS files to CSS")
  return gulp.src('./plugins/core/web/public/stylesheets/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'plugins', "core", "web", "public", "stylesheets", "includes") ]
    }))
    .pipe(gulp.dest(path.join(__dirname, 'plugins', "core", "web", "public", "stylesheets")));
    callback()
});

gulp.task("default", function(callback) {
  console.log("List of available tasks: install-plugins")
  callback()
})

gulp.task("install", function(callback) {
  console.log("Installing dependencies")
  cp.execSync("npm install")
  console.log("Installing bower globally")
  cp.execSync("npm install -g bower")
  console.log("Installing less globally")
  cp.execSync("npm install -g less")
  callback()
})

gulp.task("install-plugins", ["install"], function(callback) {
  console.log("Installing dependencies for plugins")
  dir.paths(__dirname + "/plugins", function(err, paths) {
    try {
      paths.dirs.forEach(function(item) {
        if (item.indexOf("node_modules") > -1) {
          return
        }
        console.log("Running 'npm install' in " + item)
        cp.execSync("npm install", {
          cwd: item
        })
      })
    } catch (ex) {
      console.log("Failed to run 'npm install' in " + item + ". Error was: " + ex)
    }
  })
  callback()
})

gulp.task("install-bower", ["install"], function(callback) {
  console.log("Installing bower dependencies for web plugin")
  cp.execSync("bower install", {
    cwd: "./plugins/core/web"
  })
  callback()
})
