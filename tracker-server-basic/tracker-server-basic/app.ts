
import express  from 'express';
import cors from 'cors';
import config from 'config';
import {userRouter} from "./routes/user-routes";
import * as http from "http";

const app = express();
const port: number = config.get<number>('appConfig.port');
const origin:string[] = config.get<string[]>('appConfig.origin');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin:origin}))  ;

app.use('/users', userRouter);

function errorHandler(err:any, req:any, res:any, next:any)  {
    if (res.headersSent) {
        return next(err);
    }
    console.error("error!!!" + err);
    res.status(500).send('Something broke!  ' + err);
}
app.use(errorHandler);
const server = http.createServer(app);
server.listen(port, "localhost", () => {
    console.log(`Example app listening on port ${port}`)});
