"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Simpleparticipant = /** @class */ (function () {
    function Simpleparticipant(alias, paid) {
        this.hasToPay = -1;
        this.hasToGet = -1;
        this.alias = alias;
        this.paid = paid;
    }
    Simpleparticipant.prototype.updateValues = function (amountPerParticipant) {
        if (amountPerParticipant > this.paid) {
            this.hasToPay = amountPerParticipant - this.paid;
            this.hasToGet = 0;
        }
        else {
            this.hasToGet = this.paid - amountPerParticipant;
            this.hasToPay = 0;
        }
    };
    return Simpleparticipant;
}());
exports.default = Simpleparticipant;
