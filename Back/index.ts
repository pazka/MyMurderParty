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
import { getAllUsers } from './services/userService';
import cors from 'cors';
const io = new Server(server , { cors: config.cors });


const getVersion = () => {
  const versionTxt = fs.readFileSync('./version.txt')
  const version = versionTxt.toString();
  const versionArray = version.split('.');

  return versionArray.map((v) => parseInt(v));
}

const port = process.env.PORT || 8000;

app.use(cors(config.cors))
app.use(express.static('public'))

app.get('/info', (req: Request, res: Response) => {
  res.send(getVersion().join('.'));
});

app.get('/users', (req: Request, res: Response) => {
  getAllUsers().then((users) => {
    res.send(users);
  })
});

app.get('/rooms', (req: Request, res: Response) => {
  getAllRooms().then((rooms) => {
    res.send(rooms);
  })
});

app.post('/room', (req: Request, res: Response) => {
  const newRoom: NewRoom = req.body

  createNewRoom(newRoom).then((createdRoom: Room) => {
    res.status(201).send(createdRoom);
  }).catch((err: Error) => {
    res.status(400).send(err.message);
  })
})


//Socket.io

io.on('connection', (userSocket: Socket) => {
  userEvents(userSocket, io)
});

server.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});
