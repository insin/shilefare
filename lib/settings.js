// Settings are managed through `npm config` - this module provides a more
// convenient way to access them and provide defaults where possible.

// Port files will be served on
var port = exports.port = parseInt(process.env.npm_package_config_port, 10) || 3000

// Host at which your machine will be accessible for people you're trying to
// share with. If you know this, configure it yourself. There's a specific
// fallback for Windows intranets because that's what I'm working in.
var publicHost = exports.publicHost = (function() {
  if (process.env.npm_package_config_public_host) {
    return process.env.npm_package_config_public_host
  }
  // Should work for people on Windows intranets
  if (process.env.COMPUTERNAME && process.env.USERDNSDOMAIN) {
    return (process.env.COMPUTERNAME.toLowerCase() + '.' +
            process.env.USERDNSDOMAIN.toLowerCase())
  }
  // Doesn't work for sharing, but generates usable local URLs for testing
  return '127.0.0.1'
})()

// Base URL for sharing links
exports.baseURL = 'http://' + publicHost + ':' + port

// Salt for Express sessions when running the full webapp version
exports.sessionSecret = process.env.npm_package_config__session_secret

// Administration credentials for full webapp version
exports.authUser = process.env.npm_package_config__auth_user
exports.authPass = process.env.npm_package_config__auth_pass
