"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loc = void 0;
class Loc {
    constructor(id = -1, userid = -1, latitude = 0, longitude = 0, time = new Date()) {
        this.id = id;
        this.userid = userid;
        this.latitude = latitude;
        this.longitude = longitude;
        this.time = time;
    }
}
exports.Loc = Loc;
