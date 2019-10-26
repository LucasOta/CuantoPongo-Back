import Server from './server/server';
import router from './router/router';

let spawn = require('child_process').spawn;

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

// // Subproceso
// let child = spawn(process.execPath, [__dirname + '/stackCleaner.js', 'child'], {
//   stdio: [null, null, null, 'pipe']
// });
// child.stdio[3].on('data', (pData: { toString: () => string }) => {
//   if (pData.toString() === 'imprimi') {
//     console.log('Bueno, escuché el evento del child');
//   }
// });

// Ida y vuelta entre Server y Front a través de eventos de Socket.io
io.on('connection', (socket: SocketIO.Socket) => {
  console.log('New socket connected');

  socket.emit('hello', {
    connected: 'Connected to the server'
  });

  //Creo un ID que no exista en ese momento y lo mando al cliente
  socket.on('newSimpleRoom', pData => {
    // let aux = createNewSimpleModeRoom();
    simpRooms.push(new simpleModeRoom.default('sr_' + pData.socketID));
    io.to(pData.socketID).emit('numNewSimpleRoom', 'sr_' + pData.socketID);
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

  // ADMIN
  socket.on('refreshAdmin', socketID => {
    // clearSimpRoomsArr();

    let aux = adminData();
    io.to(socketID).emit('refreshedAdmin', aux);
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

function setSimpleRoomName(proomID: string, pName: string) {
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

function adminData() {
  let rc = simpRooms.length;
  let sr = io.nsps['/'].adapter.rooms;
  let sr_count = 0;
  let sc_count = 0;
  for (let k of Object.keys(sr)) {
    if (k.includes('sr_')) {
      sr_count++;
      sc_count += sr[k].length;
    }
  }
  let data = {
    sockets_connected: sc_count,
    rooms_created: rc,
    sockets_rooms: sr_count
  };
  return data;
}

//No está testeado
function clearSimpRoomsArr() {
  var roomToDelete: string[] = [];
  var simpRooms2 = simpRooms;
  io.of('/')
    .in(simpRooms2[0].name)
    .clients(function(error: any, clients: any) {
      console.log('hola');
    });
  // simpRooms.forEach(room => {
  //   try {
  //     io.of('/')
  //       .in(room.name)
  //       .clients(function(error: any, clients: any) {
  //         if (clients.length == 0) {
  //           roomToDelete.push(room.name);
  //         }
  //       });
  //   } catch (error) {
  //     roomToDelete.push(room.name);
  //   }
  // });

  // for (let i = 0; i < roomToDelete.length; i++) {
  //   simpRooms = simpRooms.filter(function(value, index, arr) {
  //     return value.name != roomToDelete[i];
  //   });
  // }
}

// list the sockets in one of those rooms
function getSocketsInRoom(pRoom: any, pNamespace = '/') {
  let room = io.nsps[pNamespace].adapter.rooms[pRoom];
  return room.sockets;
}

server.listen(PORT);

// -----------------------DEBUG
// node --inspect dist/index.js
