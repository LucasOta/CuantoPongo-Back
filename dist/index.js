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
// Subproceso
var child = spawn(process.execPath, [__dirname + '/stackCleaner.js', 'child'], {
    stdio: [null, null, null, 'pipe']
});
child.stdio[3].on('data', function (pData) {
    if (pData.toString() === 'imprimi') {
        console.log('Bueno, escuché el evento del child');
    }
});
// Ida y vuelta entre Server y Front a través de eventos de Socket.io
io.on('connection', function (socket) {
    console.log('New socket connected');
    socket.emit('hello', {
        connected: 'Connected to the server'
    });
    //Creo un ID que no exista en ese momento y lo mando al cliente
    socket.on('newSimpleRoom', function (pData) {
        var aux = createNewSimpleModeRoom();
        io.to(pData.socketID).emit('numNewSimpleRoom', aux);
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
function createNewSimpleModeRoom() {
    console.log('Creando nueva room');
    var aux;
    var exist = false;
    if (simpRooms.length > 0) {
        do {
            aux = Math.floor(Math.random() * 100) + 1;
            simpRooms.some(function (simpRoom) {
                if (simpRoom.id == aux)
                    exist = true;
                return simpRoom.id === aux;
            });
        } while (exist);
        simpRooms.push(new simpleModeRoom.default(aux));
        return aux;
    }
    else {
        aux = Math.floor(Math.random() * 100) + 1;
        simpRooms.push(new simpleModeRoom.default(aux));
        return aux;
    }
}
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
//No está testeado
function clearSimpRoomsArr() {
    var roomToDelete = [];
    simpRooms.forEach(function (room) {
        try {
            io.of('/')
                .in(room.name)
                .clients(function (error, clients) {
                if (clients.length == 0) {
                    roomToDelete.push(room.name);
                }
            });
        }
        catch (error) {
            roomToDelete.push(room.name);
        }
    });
    var _loop_1 = function (i) {
        simpRooms = simpRooms.filter(function (value, index, arr) {
            return value.name != roomToDelete[i];
        });
    };
    for (var i = 0; i < roomToDelete.length; i++) {
        _loop_1(i);
    }
}
server.listen(PORT);
// -----------------------DEBUG
// node --inspect dist/index.js
