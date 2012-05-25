var crypto = require('crypto')
  , fs = require('fs')
  , basename = require('path').basename
  , util = require('util')

var express = require('express')

var settings = require('./settings')

var app = express.createServer()

// Use Jade as the default template engine
app.set('view engine', 'jade')
// Use template inheritance
app.set('view options', {layout: false})

// Express config
app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.session({secret: settings.SESSION_SECRET}))
app.use(app.router)
app.use(express.static(__dirname + '/static'))
app.use(express.errorHandler({showStack: true, dumpExceptions: true}))

// Add variables to the default template context
app.helpers({
  version: require('./package.json').version
})

function getRandom(cb) {
  crypto.randomBytes(20, function(err, buf) {
    if (err) return cb(err)
    cb(null, buf.toString('hex'))
  })
}

function formatSize(bytes) {
  var kb = bytes / 1024
  if (kb < 1000) return kb.toFixed(2) + ' KB'
  return (kb / 1024).toFixed(2) + 'MB'
}

// Try to automatically give the user a link that will work across their intranet
var host = (function() {
  if (process.env.COMPUTERNAME && process.env.USERDNSDOMAIN) {
    return (process.env.COMPUTERNAME.toLowerCase() + '.' +
            process.env.USERDNSDOMAIN.toLowerCase())
  }
  return '127.0.0.1'
})()
var baseURL = util.format('http://%s:%s', host, settings.PORT)

// Details of files being shared
var files = []

function SharedFile(index, path, size) {
  this.index = index
  this.path = path
  this.fileName = basename(path)
  this.fileSize = formatSize(size)
  this.keys = {}
}

SharedFile.prototype.generateKey = function(cb) {
  getRandom(function(err, key) {
    if (err) return cb(err)
    this.keys[key] = true
    cb(null)
  }.bind(this))
}

SharedFile.prototype.activeLinks = function() {
  var links = []
  for (var key in this.keys) {
    var available = this.keys[key]
    if (available) {
      links.push(util.format('%s/download?file=%s&key=%s', baseURL, this.index, key))
    }
  }
  return links
}

function isValidFileIndex(fileIndex) {
  return (!isNaN(fileIndex) && fileIndex >= 0 && fileIndex < files.length)
}

app.get('/', function(req, res) {
  if (req.session.authenticated) {
    return res.render('admin', {files: files})
  }
  res.render('index')
})

app.post('/login', function(req, res) {
  if (req.body.user == settings.AUTH_USER && req.body.pass == settings.AUTH_PASS) {
    req.session.authenticated = true
  }
  res.redirect('/')
})

app.post('/share', function(req, res, next) {
  if (!req.session.authenticated) return res.send(403)

  var path = req.body.path
  if (!path) return res.render('error', {message: 'You must provide a file path.'})

  fs.stat(path, function(err, stats) {
    if (err || !stats.isFile()) return res.render('error', {
      message: util.format('"%s" is not a valid file.', path)
    })
    var file = new SharedFile(files.length, path, stats.size)
    file.generateKey(function(err) {
      if (err) return next(err)
      files.push(file)
      res.redirect('/')
    })
  })
})

app.post('/generate_link', function(req, res, next) {
  if (!req.session.authenticated) return res.send(403)

  var fileIndex = parseInt(req.body.file, 10)
  if (!isValidFileIndex(fileIndex)) return res.render('error', {message: 'Invalid file.'})
  var file = files[fileIndex]
  file.generateKey(function(err) {
    if (err) return next(err)
    res.redirect('/')
  })
})

app.get('/download', function(req, res) {
  console.log(req.query)
  // Check and get the specified file
  var fileIndex = parseInt(req.query.file, 10)
  if (!isValidFileIndex(fileIndex)) return res.render('error', {message: 'Invalid file.'})
  var file = files[fileIndex]

  // Check the given key
  var key = req.query.key
  if (!key || typeof file.keys[key] == 'undefined')
    return res.render('error', {message: 'Invalid key.'})
  if (file.keys[key] === false)
    return res.render('error', {message: 'Key has already been used.'})

  // Serve the file
  res.download(file.path, basename(file.path), function(err){
    if (err) {
      console.error('Error transferring %s using key %s: %s', file.path, key, err)
      return next(err)
    }
    file.keys[key] = false
    console.log('Transferred %s using key %s', file.path, key)
  })
})

app.listen(settings.PORT, '0.0.0.0')
console.log('shilefare server listening on %s', baseURL)
