import dotenv from 'dotenv';
import fs from 'fs';

import express, { Express, Request, Response, Application } from 'express';
const app: Application = express();
import http from 'http';
const server = http.createServer(app);
import { Server, Socket } from 'socket.io';
import userEvents from './services/socketService/userEvents';
import { createNewRoom } from './services/roomService';
const io = new Server(server);

//For env File 
dotenv.config();

const getVersion = () => {
  const versionTxt = fs.readFileSync('./version.txt')
  const version = versionTxt.toString();
  const versionArray = version.split('.');

  return versionArray.map((v) => parseInt(v));
}

const port = process.env.PORT || 8000;

app.use(express.static('public'))

app.get('/info', (req: Request, res: Response) => {
  res.send(getVersion().join('.'));
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
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
