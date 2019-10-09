"use strict";
var net = require('net');
var pipe = new net.Socket({ fd: 3 });
pipe.write('imprimi');
var intervalObj = setInterval(function () {
    pipe.write('imprimi');
}, 1000 * 10);
