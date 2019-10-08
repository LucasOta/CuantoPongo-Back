import Server from './server/server';
import router from './router/router';

//Para usar en Socket.io
import http = require('http');
import socketIO = require('socket.io');
import express = require('express');
import path = require('path');

//Para lógica
import simpleModeRoom = require('./Models/simpleModeRoom');

let PORT = process.env.PORT || '3000';

const expressServer = Server.init(parseInt(PORT));
const server = http.createServer(expressServer.app);
const io = socketIO.listen(server);

expressServer.app.use(router);

// Ida y vuelta entre Server y Front a través de eventos de Socket.io
io.on('connection', (socket: SocketIO.Socket) => {
  console.log('New socket connected');

  socket.emit('hello', {
    connected: 'Connected to the server'
  });

  //Creo un ID que no exista en ese momento y lo mando al cliente
  socket.on('newSimpleRoom', pData => {
    let aux = createNewSimpleModeRoom();
    io.to(pData.socketID).emit('numNewSimpleRoom', aux);
  });

  socket.on('setSimpleRoomName', pData => {
    let aux = setSimpleRoomName(pData.roomID, pData.name);
  });

  // El cliente solicita unirse a una room
  socket.on('joinSimpleRoom', pRoomID => {
    socket.join(pRoomID);
  });
  // El cliente solicita abandonar una room
  socket.on('leaveSimpleRoom', pRoomID => {
    socket.leave(pRoomID);
  });

  socket.on('getUpdatedSimpleRoom', pRoomID => {
    let aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
      io.to(pRoomID).emit('updatedSimpleRoom', simpRooms[aux]);
    } else {
      // Mandar mensaje o algo diciendo que la room no existe
    }

    function existeRoom(element: any) {
      return element.id == pRoomID;
    }
  });

  // PARTICIPANTS - SIMPLE ROOM
  socket.on('newSimpleParticipant', pData => {
    //Esto es sólo para probar
    io.to(pData.roomID).emit('actualSocketIo', simpRooms);

    let aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
      simpRooms[aux].addParticipant(pData.alias, pData.paid);
      io.to(pData.roomID).emit('updatedSimpleRoom', simpRooms[aux]);
    } else {
      // Mandar mensaje o algo diciendo que la room no existe
    }

    function existeRoom(element: any) {
      return element.id == pData.roomID;
    }
  });

  socket.on('modSimpleParticipant', pData => {
    let aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
      simpRooms[aux].modParticipant(pData.id, pData.alias, pData.paid);
      io.to(pData.roomID).emit('updatedSimpleRoom', simpRooms[aux]);
    } else {
      // Mandar mensaje o algo diciendo que la room no existe
    }

    function existeRoom(element: any) {
      return element.id == pData.roomID;
    }
  });
  socket.on('delSimpleParticipant', pData => {
    let aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
      simpRooms[aux].delParticipant(pData.id);
      io.to(pData.roomID).emit('updatedSimpleRoom', simpRooms[aux]);
    } else {
      // Mandar mensaje o algo diciendo que la room no existe
    }

    function existeRoom(element: any) {
      return element.id == pData.roomID;
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

function setSimpleRoomName(proomID: number, pName: string) {
  let aux = simpRooms.findIndex(existeRoom);
  if (aux != -1) {
    simpRooms[aux].setName(pName);
    return simpRooms[aux];
  } else {
    // Mensaje indicando que no existe la room
  }

  function existeRoom(element: any) {
    return element.id == proomID;
  }
}

//No está testeado
function clearSimpRoomsArr() {
  var roomToDelete: string[] = [];
  simpRooms.forEach(room => {
    try {
      io.of('/')
        .in(room.name)
        .clients(function(error: any, clients: any) {
          if (clients.length == 0) {
            roomToDelete.push(room.name);
          }
        });
    } catch (error) {
      roomToDelete.push(room.name);
    }
  });

  for (let i = 0; i < roomToDelete.length; i++) {
    simpRooms = simpRooms.filter(function(value, index, arr) {
      return value.name != roomToDelete[i];
    });
  }
}

server.listen(PORT);

// -----------------------DEBUG
// node --inspect dist/index.js
