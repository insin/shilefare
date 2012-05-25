var crypto = require('crypto')
  , format = require('util').format

/**
 * Formats bytes as KB or MB.
 */
exports.formatSize = function(bytes) {
  var kb = bytes / 1024
  if (kb < 1000) return kb.toFixed(2) + ' KB'
  return (kb / 1024).toFixed(2) + 'MB'
}

/**
 * Generates a random, 20 byte hex string.
 */
exports.getRandom = function(cb) {
  crypto.randomBytes(20, function(err, buf) {
    if (err) return cb(err)
    cb(null, buf.toString('hex'))
  })
}

/**
 * Logs a message with a timestamp, formatting with any additional arguments as
 * per the usual console.log.
 */
exports.timestampLog = function(message) {
  var date = new Date()
    , hours = date.getHours()
    , minutes = date.getMinutes()
  if (hours < 10) hours = '0' + hours
  if (minutes < 10) minutes = '0' + minutes

  message = format('[%s:%s] %s', hours, minutes, message)
  console.log.apply(console, [message].concat(Array.prototype.slice.call(arguments, 1)))
}
