import dotenv from 'dotenv';
import fs from 'fs';

import express, { Express, Request, Response , Application } from 'express';
const app: Application = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';
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