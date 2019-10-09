let net = require('net');
let pipe = new net.Socket({ fd: 3 });

pipe.write('imprimi');

const intervalObj = setInterval(() => {
  pipe.write('imprimi');
}, 1000 * 10);
