module.exports = [
  "../plugins/core/eventbus",
  { packagePath: "../plugins/core/database", host: "localhost", port: "27017", database: "bellboy" },
  "../plugins/core/bellboy",
  "../plugins/core/web",
  "../plugins/core/audio"
]
