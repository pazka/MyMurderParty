import dotenv from 'dotenv';
//For env File 
dotenv.config();

import fs from 'fs';

import express, { Express, Request, Response, Application } from 'express';
const app: Application = express();
import http from 'http';
const server = http.createServer(app);
import { Server, Socket } from 'socket.io';
import userEvents from './services/socketService/userEvents';
import { createNewRoom, getAllRooms } from './services/roomService';
import config from './services/config';
import { generateId, getAllUsers, getUserBySessionId } from './services/userService';
import cors from 'cors';
import cookie from 'cookie';
import { broadcastAllClients, broadcastAllRooms, initIo } from './services/socket-io';

const io = initIo(server, { cors: config.cors });


const getVersion = () => {
  const versionTxt = fs.readFileSync('./version.txt')
  const version = versionTxt.toString();
  const versionArray = version.split('.');

  return versionArray.map((v) => parseInt(v));
}

app.use(express.json());
app.use(cors(config.cors))
app.use(express.static('public'))

app.get('/session', async (req: Request, res: Response) => {
  const cookies = cookie.parse(req.headers.cookie ?? '');

  if (cookies.sessionId) {
    console.log("user declare to be with this session : " + cookies.sessionId);

    return res.send(cookies.sessionId);
  }

  //setcookie if cookie not found or session of user not found
  const sessionId = generateId();
  res.setHeader('Set-Cookie', cookie.serialize('sessionId', sessionId, {
    path: '/',
    httpOnly: config.debug ? false : true,
    secure: config.debug ? false : true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    ...(config.debug ? {} : {
      sameSite: 'strict',
      domain: config.domain
    })
  }));
  res.send(sessionId);
});

app.get('/info', (req: Request, res: Response) => {
  res.send(getVersion().join('.'));
});

app.get('/users', (req: Request, res: Response) => {
  getAllUsers().then((users) => {
    res.send(users);
  })
});

app.get('/rooms', (req: Request, res: Response) => {
  return getAllRooms().then((rooms) => {
    res.send(rooms);
  })
});

app.all('*', (req, res) => {
  //redirect all no found to '/'
  res.redirect('/');
})

//Socket.io
io.on('connection', (userSocket: Socket) => {
  userEvents(userSocket, io)
});

server.listen(config.port,config.target, () => {
  console.log(`Server is Fire at http://${config.target}:${config.port}`);
});
