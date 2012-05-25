var shilefare = require('./lib/shilefare')
  , server = require('./lib/server')

var app = server.createServer()
server.configureAllRoutes(app, shilefare)
server.startServer(app, shilefare)
