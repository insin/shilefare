#!/usr/bin/env node

var program = require('commander')

var shilefare = require('../lib/shilefare')
  , server = require('../lib/server')
  , settings = require('../lib/settings')

program
  .version(require('../package.json').version)
  .usage('[options] [file ...]')
  .option('-p, --port [port]', 'port to serve on [3000]', Number, settings.port)
  .option('-s, --server [server]', 'hostname or IP your machine can be accessed at [' + settings.host + ']', settings.host)
  .parse(process.argv)

settings.port = program.port
settings.host = program.server

if (program.args.length) {
  server.startSingleFileServer(program.args)
}
else {
  server.startFullServer()
}
