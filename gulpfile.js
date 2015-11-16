var gulp = require("gulp")
var dir = require("node-dir")
var cp = require("child_process")

gulp.task("default", function() {
  console.log("List of available tasks: install-plugins")
})

gulp.task("install-plugins", function() {
  dir.paths(__dirname + "/plugins", function(err, paths) {
    paths.dirs.forEach(function(item) {
      if(item.indexOf("node_modules") > -1) { return }
      console.log("Running 'npm install' in " + item)
      cp.execSync("npm install", { cwd: item})
    })
  })
})
