=========
shilefare
=========

Dead simple local, temporary file sharing with Node.js.

Installation
============

::

   npm install -g shilefare

Usage
=====

There are two ways to use shilefare.

1. Specify files on the command line and it will spin up a server, print out URLS
for the files and automatically shut down once the files have been downloaded.

::

   $ shilefare latest-build.zip screenshots.zip
   [23:02] shilefare server listening on http://127.0.0.1:3000
   latest-build.zip: http://127.0.0.1:3000/download?file=0&key=4ff77d660994da39445b
   screenshots.zip: http://127.0.0.1:3000/download?file=1&key=30ba97c9e423efe2dc10
   [23:04] Transferred latest-build.zip using key 4ff77d660994da39445b
   [23:04] Transferred screenshots.zip using key 30ba97c9e423efe2dc10
   [23:04] shilefare server stopped

2. If you don't specify any files, shilefare will run as a web application which
you can administrate using the secret key which is generated when the app is
started. Once authenticated, you can paste in full paths to files to be shared
and also generate additional download links for files.

::

   $ shilefare
   Secret key for this session is: aa93627c821e5fda020adc1eb3677758f0062f0c
   [23:11] shilefare server listening on http://127.0.0.1:3000

.. image:: https://github.com/insin/shilefare/raw/master/screenshots/shilefare01.png

.. image:: https://github.com/insin/shilefare/raw/master/screenshots/shilefare02.png

Configuration
=============

The following flags are supported:

``-p --port``
   Port number the server will listen on, defaults to 3000.
``-s --server``
   A hostname or IP your machine can be accessed at by the people you want to
   share files with. If you're on Windows, this will default to
   COMPUTERNAME.DNSDOMAIN, otherwise 127.0.0.1.

MIT License
===========

Copyright (c) 2012, Jonathan Buchanan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.