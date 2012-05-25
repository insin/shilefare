// Port files will be served on
exports.port = 3000

// Host at which your machine will be accessible for people you're trying to
// share with. If you know this, configure it yourself. There's a specific
// fallback for Windows intranets because that's what I'm working in.
exports.host = (function() {
  // Should work for people on Windows intranets
  if (process.env.COMPUTERNAME && process.env.USERDNSDOMAIN) {
    return (process.env.COMPUTERNAME.toLowerCase() + '.' +
            process.env.USERDNSDOMAIN.toLowerCase())
  }
  // Doesn't work for sharing, but generates usable local URLs for testing
  return '127.0.0.1'
})()

// Secret key for this session when running the full webapp version - will be
// generated on startup.
exports.sessionSecret = null

/**
 * Convenience function for stitching host and port together as a base URL.
 */
exports.getBaseURL = function() {
  return 'http://' + exports.host + ':' + exports.port
}
