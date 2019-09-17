"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var simpleParticipant_1 = __importDefault(require("./simpleParticipant"));
var SimpleModeRoom = /** @class */ (function () {
    function SimpleModeRoom(id) {
        this.id = id;
        this.total = 0;
        this.participants = [];
    }
    SimpleModeRoom.prototype.addParticipant = function (alias, paid) {
        var participant = new simpleParticipant_1.default(alias, paid);
        this.participants.push(participant);
        this.updateTotal();
        this.updateParticipants();
    };
    SimpleModeRoom.prototype.updateTotal = function () {
        var aux = 0;
        this.participants.forEach(function (part) {
            aux += part.paid;
        });
        this.total = aux;
    };
    SimpleModeRoom.prototype.updateParticipants = function () {
        var ammountPerParticipant = this.total / this.participants.length;
        this.participants.forEach(function (part) {
            part.updateValues(ammountPerParticipant);
        });
    };
    return SimpleModeRoom;
}());
exports.default = SimpleModeRoom;
