"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Sex = void 0;
var Sex;
(function (Sex) {
    Sex[Sex["Male"] = 0] = "Male";
    Sex[Sex["Female"] = 1] = "Female";
})(Sex || (exports.Sex = Sex = {}));
class User {
    constructor(id = -1, username = "", email = "", firstName = "", lastName = "", sex = Sex.Male, address = "", postalCode = "", city = "", country = "") {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.sex = sex;
        this.address = address;
        this.postalCode = postalCode;
        this.city = city;
        this.country = country;
    }
}
exports.User = User;
