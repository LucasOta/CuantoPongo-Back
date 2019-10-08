"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var simpleParticipant_1 = __importDefault(require("./simpleParticipant"));
var SimpleModeRoom = /** @class */ (function () {
    function SimpleModeRoom(id) {
        this.auxParticipantId = 0;
        this.name = '';
        this.id = id;
        this.total = 0;
        this.participants = [];
    }
    SimpleModeRoom.prototype.setName = function (pName) {
        this.name = pName;
    };
    SimpleModeRoom.prototype.updateTotal = function () {
        var aux = 0;
        this.participants.forEach(function (part) {
            aux += part.paid;
        });
        this.total = aux;
    };
    // Participants
    SimpleModeRoom.prototype.addParticipant = function (alias, paid) {
        var participant = new simpleParticipant_1.default(this.auxParticipantId++, alias, paid);
        this.participants.push(participant);
        this.updateTotal();
        this.updateParticipants();
    };
    SimpleModeRoom.prototype.modParticipant = function (id, alias, paid) {
        var aux = this.participants.findIndex(existeId);
        function existeId(element) {
            return element.id == id;
        }
        if (aux != -1) {
            this.participants[aux].alias = alias;
            this.participants[aux].paid = paid;
        }
        this.updateTotal();
        this.updateParticipants();
    };
    SimpleModeRoom.prototype.delParticipant = function (id) {
        this.participants = this.participants.filter(function (value, index, arr) {
            return value.id != id;
        });
        this.updateTotal();
        this.updateParticipants();
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
