var shilefare = require('./lib/shilefare')
  , server = require('./lib/server')
  , settings = require('./lib/settings')
  , util = require('./lib/util')

util.getRandom(function(err, secret) {
  if (err) return console.error('Error creating session secret: %s', err)
  console.log('Secret key for this session is: %s', secret)
  settings.sessionSecret = secret
  var app = server.createServer()
  server.configureAllRoutes(app, shilefare)
  server.startServer(app, shilefare)
})
