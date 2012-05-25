var normalize = require('path').normalize

var express = require('express')

var settings = require('./settings')
  , timestampLog = require('./util').timestampLog

/**
 * Provides a more readable way to pass the singleFileMode argument
 */
exports.SINGLE_FILE_MODE = true

/**
 * Creates and configures the server.
 */
exports.createServer = function(singleFileMode) {
  var app = express.createServer()

  // Use Jade as the default template engine
  app.set('view engine', 'jade')
  // Use template inheritance
  app.set('view options', {layout: false})
  app.set('views', normalize(__dirname + '/../views'));

  // Express config
  app.use(express.bodyParser())
  if (!singleFileMode) {
    app.use(express.cookieParser())
    app.use(express.session({secret: settings.sessionSecret}))
  }
  app.use(app.router)
  app.use(express.static(normalize(__dirname + '/../static')))
  app.use(express.errorHandler({showStack: true, dumpExceptions: true}))

  // Add variables to the default template context
  app.helpers({
    version: require('../package.json').version
  })

  return app
}

/**
 * Starts the server.
 */
exports.startServer = function(app) {
  app.listen(settings.port, '0.0.0.0')
  timestampLog('shilefare server listening on %s', settings.getBaseURL())
}

/**
 * Stops the server.
 */
var stopServer = exports.stopServer = function(app) {
  app.close()
  timestampLog('shilefare server stopped')
  process.exit(0)
}

/**
 * Configures only the download route, for using shilefare in commandline mode
 * to serve a single file.
 */
var configureDownloadRoute = exports.configureDownloadRoute = function(app, shilefare, singleFileMode) {
  app.get('/download', function(req, res) {
    // Check and get the specified file
    var fileIndex = parseInt(req.query.file, 10)
    if (!shilefare.isValidFileIndex(fileIndex)) return res.render('error', {message: 'Invalid file.'})
    var file = shilefare.files[fileIndex]

    // Check the given key
    var key = req.query.key
    if (!key || typeof file.keys[key] == 'undefined')
      return res.render('error', {message: 'Invalid key.'})
    if (file.keys[key] === false)
      return res.render('error', {message: 'Key has already been used.'})

    // Serve the file
    res.download(file.path, file.fileName, function(err) {
      if (err) {
        timestampLog('Error transferring %s using key %s: %s', file.path, key, err)
        return next(err)
      }
      // Download looked good from our end - mark the key as unavailable
      file.keys[key] = false
      timestampLog('Transferred %s using key %s', file.path, key)
      // If we're in single file mode, stop now
      if (singleFileMode) {
        stopServer(app)
      }
    })
  })
}

/**
 * Configures all routes, for using shilefare as a slightly longer running webapp
 * with admin control.
 */
exports.configureAllRoutes = function(app, shilefare) {
  app.get('/', function(req, res) {
    if (req.session.authenticated) {
      return res.render('admin', {files: shilefare.files})
    }
    res.render('index')
  })

  app.post('/login', function(req, res) {
    if (req.body.key == settings.sessionSecret) {
      req.session.authenticated = true
    }
    res.redirect('/')
  })

  app.post('/share', function(req, res, next) {
    if (!req.session.authenticated) return res.send(403)

    var path = req.body.path
    if (!path) return res.render('error', {message: 'You must provide a file path.'})

    shilefare.shareFile(path, function(err, file) {
      if (err) return res.render('error', {message: err.message})
      timestampLog('Now sharing %s', file.path)
      res.redirect('/')
    })
  })

  app.post('/generate_link', function(req, res, next) {
    if (!req.session.authenticated) return res.send(403)

    var fileIndex = parseInt(req.body.file, 10)
    if (!shilefare.isValidFileIndex(fileIndex)) return res.render('error', {message: 'Invalid file.'})
    var file = shilefare.files[fileIndex]
    file.generateKey(function(err) {
      if (err) return next(err)
      res.redirect('/')
    })
  })

  configureDownloadRoute(app, shilefare)
}
