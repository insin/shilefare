#!/usr/bin/env node
var shilefare = require('../lib/shilefare')
  , server = require('../lib/server')
  , util = require('../lib/util')

var path = process.argv[2]
shilefare.shareFile(path, function(err, url) {
  if (err) return console.error(err.message)
  var app = server.createServer(server.SINGLE_FILE_MODE)
  server.configureDownloadRoute(app, shilefare, server.SINGLE_FILE_MODE)
  server.startServer(app, shilefare)
  util.timestampLog('Download link: %s', url)
})
