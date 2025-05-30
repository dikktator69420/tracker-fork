"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express = __importStar(require("express"));
const db_1 = require("../config/db");
const user_1 = require("../model/user");
const location_1 = require("../model/location");
exports.userRouter = express.Router();
const salt = "Spengergasse";
exports.userRouter.post('/login/', (req, res, next) => {
    let sql = "Select id, username, email, firstname, lastname, sex, address, " +
        "postalCode, city, country FROM `user` where user.username=?"
        + " && user.password=SHA2(?,512)";
    console.log(sql);
    db_1.pool.query(sql, [req.body.username, req.body.password + salt], (err, rows) => {
        if (err)
            next(err);
        let data;
        if (rows.length > 0) {
            data = new user_1.User(rows[0].id, rows[0].username, rows[0].email, rows[0].firstname, rows[0].lastname, rows[0].sex, rows[0].address, rows[0].postalcode, rows[0].city, rows[0].country);
            res.status(200).send(data);
        }
        else
            res.status(404).send({ error: 'User/PW not found' });
    });
});
exports.userRouter.post('/register/', (req, res, next) => {
    let sql = "INSERT INTO  user  (username, password, email) VALUES (?, SHA2(?,512), ?);";
    try {
        console.log(sql);
        db_1.pool.query(sql, [req.body.username, req.body.password + salt, req.body.email], (err, rows) => {
            if (err)
                next(err);
            else {
                if (rows.affectedRows > 0) // ???
                 {
                    res.status(200).send({ id: rows.insertId });
                }
                else
                    res.status(400).send({ error: "User already exists" });
            }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.userRouter.post('/location/', (req, res, next) => {
    try {
        let sql = "INSERT INTO  location  (userid, latitude, longitude, time)" +
            " VALUES (?,?,?,?);";
        //console.log(sql);
        db_1.pool.query(sql, [req.body.userid, req.body.latitude, req.body.longitude, new Date(req.body.time)], (err, rs) => {
            if (err)
                next(err);
            else if (rs.affectedRows > 0) // ???
             {
                let loc = new location_1.Loc(rs.insertId, req.body.userid, req.body.latitude, req.body.longitude, req.body.time);
                //console.log(Object.entries(loc));
                res.status(200).send(loc);
            }
            else
                res.status(400).send({ error: "location id already in db" });
        });
    }
    catch (err) {
        next(err);
    }
});
exports.userRouter.get('/locations/:id', (req, res, next) => {
    let data = [];
    let sql = "SELECT user.id as uid, location.id as lid, location.latitude as lat, "
        + "location.longitude as lng, location.time as time FROM location,user "
        + "WHERE user.id=? AND location.userid=user.id;";
    //console.log(sql);
    db_1.pool.query(sql, [req.params.id], (err, rows) => {
        if (err) {
            next(err);
        }
        else {
            for (let i = 0; i < rows.length; i++)
                data.push(new location_1.Loc(rows[i].lid, rows[i].uid, rows[i].lat, rows[i].lng, rows[i].time));
            //console.log(JSON.stringify(data));
            res.status(200).send(data);
        }
    });
});
exports.userRouter.put('/update/', (req, res, next) => {
    let sql = "UPDATE user SET firstname = ?, lastname = ?, sex = ?, address = ?" +
        ", postalcode = ?, city = ?, country = ? WHERE id = ?;";
    console.log(sql);
    db_1.pool.query(sql, [req.body.firstName, req.body.lastName, req.body.sex, req.body.address,
        req.body.postalCode, req.body.city, req.body.country, req.body.id], (err) => {
        if (err)
            next(err);
        res.status(200).send(null);
    });
});
