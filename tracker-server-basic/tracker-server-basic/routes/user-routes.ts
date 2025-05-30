import * as express from 'express';
import { v1 as uuidv1 } from 'uuid';

import {pool} from "../config/db";
import {User} from "../model/user";
import {Loc} from "../model/location";
import { ResultSetHeader, RowDataPacket} from "mysql2";

export const userRouter = express.Router();

const salt:string = "Spengergasse";

userRouter.post('/login/', (req, res, next) => {
    let sql = "Select id, username, email, firstname, lastname, sex, address, " +
        "postalCode, city, country FROM `user` where user.username=?"
        + " && user.password=SHA2(?,512)";
    console.log(sql);
    pool.query<RowDataPacket[]>(sql, [req.body.username, req.body.password + salt],
        (err, rows) => {
            if (err) next(err);
            let data: User | null;
            if (rows.length > 0) {
                data = new User(rows[0].id, rows[0].username, rows[0].email,
                    rows[0].firstname, rows[0].lastname, rows[0].sex, rows[0].address,
                    rows[0].postalcode, rows[0].city, rows[0].country);
                res.status(200).send(data);
            } else
                res.status(404).send({error: 'User/PW not found'});
        })
})
userRouter.post('/register/', (req, res, next) => {
    let sql:string = "INSERT INTO  user  (username, password, email) VALUES (?, SHA2(?,512), ?);"
    try {
        console.log(sql);
        pool.query<ResultSetHeader>(sql,[req.body.username, req.body.password + salt, req.body.email], (err, rows) => {
            if (err) next(err);
            else {
                if (rows.affectedRows > 0)  // ???
                {
                    res.status(200).send({id:rows.insertId});
                } else res.status(400).send({error: "User already exists"}) ;
            }
        })
    } catch (err) {
        next(err);
    }
})
userRouter.post('/location/', (req, res, next) => {
    try {
        let sql = "INSERT INTO  location  (userid, latitude, longitude, time)" +
            " VALUES (?,?,?,?);"
        //console.log(sql);
        pool.query<ResultSetHeader>(sql,
                [req.body.userid, req.body.latitude, req.body.longitude, new Date(req.body.time)],
            (err, rs) => {
                if (err) next(err);
                else if (rs.affectedRows > 0)  // ???
                {
                    let loc: Loc = new Loc(rs.insertId, req.body.userid, req.body.latitude, req.body.longitude, req.body.time);
                    //console.log(Object.entries(loc));
                    res.status(200).send(loc);
                } else res.status(400).send({error: "location id already in db"})  ;
        });

    } catch (err) {
        next(err);
    }
})
userRouter.get('/locations/:id',
    (req,
     res, next) => {
        let data: Loc[] = [];
        let sql: string = "SELECT user.id as uid, location.id as lid, location.latitude as lat, "
            + "location.longitude as lng, location.time as time FROM location,user "
            + "WHERE user.id=? AND location.userid=user.id;"
        //console.log(sql);
        pool.query<RowDataPacket[]>(sql, [req.params.id], (err, rows) => {
            if (err) {
                next(err);
            } else {
                for (let i = 0; i < rows.length; i++)
                    data.push(new Loc(rows[i].lid, rows[i].uid, rows[i].lat, rows[i].lng, rows[i].time));
                //console.log(JSON.stringify(data));
                res.status(200).send(data);
            }
        })
    })
userRouter.put('/update/', (req,res,next) => {
    let sql = "UPDATE user SET firstname = ?, lastname = ?, sex = ?, address = ?" +
        ", postalcode = ?, city = ?, country = ? WHERE id = ?;";
    console.log(sql);
    pool.query<ResultSetHeader>(sql,
        [req.body.firstName, req.body.lastName, req.body.sex, req.body.address,
            req.body.postalCode, req.body.city, req.body.country, req.body.id],
        (err) => {
            if(err) next(err);
            res.status(200).send(null);
        })
})
