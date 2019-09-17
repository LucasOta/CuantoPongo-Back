"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./server/server"));
var router_1 = __importDefault(require("./router/router"));
//Para usar en Socket.io
var http = require("http");
var socketIO = require("socket.io");
//Para lógica
var simpleModeRoom = require("./Models/simpleModeRoom");
var expressServer = server_1.default.init(3000);
var server = http.createServer(expressServer.app);
var io = socketIO.listen(server);
expressServer.app.use(router_1.default);
// Ida y vuelta entre server y Front a través de eventos de Socket.io
io.on('connection', function (socket) {
    console.log('New socket connected');
    // socket.on('clientMessage', (message: string) => {
    //   console.log(message);
    //   io.emit('serverMessage', { message: message }); //podría ser {message} en vez de {message:message} "shorthandProperties"
    // });
    socket.emit('hello', {
        connected: 'Connected to the server'
    });
    socket.on('newRoom', function (socket) {
        var aux = createNewSimpleModeRoom();
        socket.emit('numNewRoom', aux);
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
server.listen(3000);
