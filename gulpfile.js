var gulp = require("gulp")
var dir = require("node-dir")
var cp = require("child_process")
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  return gulp.src('./plugins/core/web/public/stylesheets/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'plugins', "core", "web", "public", "stylesheets", "includes") ]
    }))
    .pipe(gulp.dest(path.join(__dirname, 'plugins', "core", "web", "public", "stylesheets")));
});

gulp.task("default", function() {
  console.log("List of available tasks: install-plugins")
})

gulp.task("install", function() {
  cp.execSync("npm install -g bower")
  cp.execSync("npm install -g lessc")
})

gulp.task("install-plugins", function() {
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
})

gulp.task("install-bower", function() {
  cp.execSync("bower install", {
    cwd: "./plugins/core/web"
  })
})
