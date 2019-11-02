"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./server/server"));
var router_1 = __importDefault(require("./router/router"));
var spawn = require('child_process').spawn;
//Para usar en Socket.io
var http = require("http");
var socketIO = require("socket.io");
//Para lógica
var simpleModeRoom = require("./Models/simpleModeRoom");
var PORT = process.env.PORT || '3000';
var expressServer = server_1.default.init(parseInt(PORT));
var server = http.createServer(expressServer.app);
var io = socketIO.listen(server);
expressServer.app.use(router_1.default);
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
io.on('connection', function (socket) {
    console.log('New socket connected');
    socket.emit('hello', {
        connected: 'Connected to the server'
    });
    //Creo un ID que no exista en ese momento y lo mando al cliente
    socket.on('newSimpleRoom', function (pData) {
        // let aux = createNewSimpleModeRoom();
        simpRooms.push(new simpleModeRoom.default('sr_' + pData.socketID));
        io.to(pData.socketID).emit('numNewSimpleRoom', 'sr_' + pData.socketID);
    });
    socket.on('setSimpleRoomName', function (pData) {
        var aux = setSimpleRoomName(pData.roomID, pData.name);
    });
    // El cliente solicita unirse a una room
    socket.on('joinSimpleRoom', function (pRoomID) {
        socket.join(pRoomID);
    });
    // El cliente solicita abandonar una room
    socket.on('leaveSimpleRoom', function (pRoomID) {
        socket.leave(pRoomID);
    });
    socket.on('getUpdatedSimpleRoom', function (pRoomID) {
        var aux = simpRooms.findIndex(existeRoom);
        if (aux != -1) {
            io.to(pRoomID).emit('updatedSimpleRoom', simpRooms[aux]);
        }
        else {
            // Mandar mensaje o algo diciendo que la room no existe
        }
        function existeRoom(element) {
            return element.id == pRoomID;
        }
    });
    // ADMIN
    socket.on('refreshAdmin', function (socketID) {
        // clearSimpRoomsArr();
        var aux = adminData();
        io.to(socketID).emit('refreshedAdmin', aux);
    });
    socket.on('clearSimpRooms', function (socketID) {
        clearSimpRoomsArr();
    });
    // PARTICIPANTS - SIMPLE ROOM
    socket.on('newSimpleParticipant', function (pData) {
        //Esto es sólo para probar
        io.to(pData.roomID).emit('actualSocketIo', simpRooms);
        var aux = simpRooms.findIndex(existeRoom);
        if (aux != -1) {
            simpRooms[aux].addParticipant(pData.alias, pData.paid);
            io.to(pData.roomID).emit('updatedSimpleRoom', simpRooms[aux]);
        }
        else {
            // Mandar mensaje o algo diciendo que la room no existe
        }
        function existeRoom(element) {
            return element.id == pData.roomID;
        }
    });
    socket.on('modSimpleParticipant', function (pData) {
        var aux = simpRooms.findIndex(existeRoom);
        if (aux != -1) {
            simpRooms[aux].modParticipant(pData.id, pData.alias, pData.paid);
            io.to(pData.roomID).emit('updatedSimpleRoom', simpRooms[aux]);
        }
        else {
            // Mandar mensaje o algo diciendo que la room no existe
        }
        function existeRoom(element) {
            return element.id == pData.roomID;
        }
    });
    socket.on('delSimpleParticipant', function (pData) {
        var aux = simpRooms.findIndex(existeRoom);
        if (aux != -1) {
            simpRooms[aux].delParticipant(pData.id);
            io.to(pData.roomID).emit('updatedSimpleRoom', simpRooms[aux]);
        }
        else {
            // Mandar mensaje o algo diciendo que la room no existe
        }
        function existeRoom(element) {
            return element.id == pData.roomID;
        }
    });
});
// Lógica de la app
var simpRooms = [];
function setSimpleRoomName(proomID, pName) {
    var aux = simpRooms.findIndex(existeRoom);
    if (aux != -1) {
        simpRooms[aux].setName(pName);
        return simpRooms[aux];
    }
    else {
        // Mensaje indicando que no existe la room
    }
    function existeRoom(element) {
        return element.id == proomID;
    }
}
function adminData() {
    var rc = simpRooms.length;
    var sr = io.nsps['/'].adapter.rooms;
    var sr_count = 0;
    var sc_count = 0;
    for (var _i = 0, _a = Object.keys(sr); _i < _a.length; _i++) {
        var k = _a[_i];
        if (k.includes('sr_')) {
            sr_count++;
            sc_count += sr[k].length;
        }
    }
    var data = {
        sockets_connected: sc_count,
        rooms_created: rc,
        sockets_rooms: sr_count
    };
    return data;
}
//No está testeado
function clearSimpRoomsArr() {
    var roomsToDelete = [];
    var sr = io.nsps['/'].adapter.rooms;
    for (var _i = 0, simpRooms_1 = simpRooms; _i < simpRooms_1.length; _i++) {
        var r = simpRooms_1[_i];
        try {
            if (!sr[r.id]) {
                roomsToDelete.push(r.id);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    // let auxSimpRooms = [];
    roomsToDelete.forEach(function (rtd) {
        simpRooms.forEach(function (sr) {
            if (sr.id == rtd) {
                var index = simpRooms.indexOf(sr);
                if (index > -1) {
                    simpRooms.splice(index, 1);
                }
            }
        });
    });
}
// list the sockets in one of those rooms
function getSocketsInRoom(pRoom, pNamespace) {
    if (pNamespace === void 0) { pNamespace = '/'; }
    var room = io.nsps[pNamespace].adapter.rooms[pRoom];
    return room.sockets;
}
server.listen(PORT);
// -----------------------DEBUG
// node --inspect dist/index.js
