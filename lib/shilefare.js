var fs = require('fs')
  , basename = require('path').basename
  , format = require('util').format

var settings = require('./settings')
  , util = require('./util')

// Shared, mutable state - OMG!
var files = exports.files = []

/**
 * Holds details of a file that's being shared and valid download keys.
 * @param {number} index the index of this shared file in the files list.
 * @param {string} path the full path to the file.
 * @param {number} the size of the file.
 */
function SharedFile(index, path, size) {
  this.index = index
  this.path = path
  this.fileName = basename(path)
  this.fileSize = util.formatSize(size)
  this.keys = {}
}
exports.SharedFile = SharedFile

/**
 * Generate a random 10 byte key for downloading and mark it as available.
 */
SharedFile.prototype.generateKey = function(cb) {
  util.getRandom(10, function(err, key) {
    if (err) return cb(err)
    this.keys[key] = true
    cb(null)
  }.bind(this))
}

/**
 * Create a list of links for download keys which are currently available.
 */
SharedFile.prototype.activeLinks = function() {
  var links = []
  for (var key in this.keys) {
    var available = this.keys[key]
    if (available) {
      links.push(format('%s/download?file=%s&key=%s',
                        settings.getBaseURL(), this.index, key))
    }
  }
  return links
}

/**
 * Shares the file at the given path, returning the resulting SharedFile object.
 */
exports.shareFile = function(path, cb) {
  if (!path) return cb(new Error('You must provide a file path.'))
  fs.stat(path, function(err, stats) {
    if (err || !stats.isFile()) return cb(new Error(format('"%s" is not a valid file.', path)))
    var file = new SharedFile(files.length, path, stats.size)
    file.generateKey(function(err) {
      if (err) return cb(err)
      files.push(file)
      cb(null, file)
    })
  })
}

/**
 * Determines if the given index is valid for the files list.
 */
exports.isValidFileIndex = function(fileIndex) {
  return (!isNaN(fileIndex) && fileIndex >= 0 && fileIndex < files.length)
}

/**
 * Determines if all files which were being shared have been downloaded, i.e.
 * there are no active links left.
 */
exports.allFilesDownloaded = function() {
  for (var i = 0, l = files.length; i < l; i++) {
    if (files[i].activeLinks().length) {
      return false
    }
  }
  return true
}