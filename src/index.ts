import Server from './server/server';
import router from './router/router';

//Para usar en Socket.io
import http = require('http');
import socketIO = require('socket.io');
import express = require('express');
import path = require('path');

//Para lógica
import simpleModeRoom = require('./Models/simpleModeRoom');

const expressServer = Server.init(3000);
const server = http.createServer(expressServer.app);
const io = socketIO.listen(server);

expressServer.app.use(router);

// Ida y vuelta entre server y Front a través de eventos de Socket.io
io.on('connection', (socket: SocketIO.Socket) => {
  console.log('New socket connected');

  socket.emit('hello', {
    connected: 'Connected to the server'
  });

  socket.on('newSimpleRoom', pData => {
    console.log(pData.socketID);

    let aux = createNewSimpleModeRoom();
    io.to(pData.socketID).emit('numNewSimpleRoom', aux);
    // io.emit('numNewSimpleRoom', aux);
  });

  socket.on('newSimpleParticipant', pData => {
    let aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
      simpRooms[aux].addParticipant(pData.alias, pData.paid);
      io.emit('updatedSimpleRoom', simpRooms[aux]);
    } else {
      // Mandar mensaje o algo diciendo que la room no existe
    }

    function existeRoom(element: any) {
      return element.id == pData.roomNo;
    }
  });

  socket.on('delSimpleParticipant', pData => {
    let aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
      simpRooms[aux].delParticipant(pData.id);
      io.emit('updatedSimpleRoom', simpRooms[aux]);
    } else {
      // Mandar mensaje o algo diciendo que la room no existe
    }

    function existeRoom(element: any) {
      return element.id == pData.roomNo;
    }
  });
});

// Lógica de la app
let simpRooms: simpleModeRoom.default[] = [];
function createNewSimpleModeRoom() {
  console.log('Creando nueva room');
  let aux: number;
  let exist = false;

  if (simpRooms.length > 0) {
    do {
      aux = Math.floor(Math.random() * 100) + 1;

      simpRooms.some(function(simpRoom) {
        if (simpRoom.id == aux) exist = true;
        return simpRoom.id === aux;
      });
    } while (exist);
    simpRooms.push(new simpleModeRoom.default(aux));
    return aux;
  } else {
    aux = Math.floor(Math.random() * 100) + 1;
    simpRooms.push(new simpleModeRoom.default(aux));
    return aux;
  }
}

server.listen(3000);

// -----------------------DEBUG
// node --inspect dist/index.js
