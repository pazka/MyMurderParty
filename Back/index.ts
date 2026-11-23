import dotenv from 'dotenv';
//For env File 
dotenv.config({ quiet: true }); // dotenv >= 17 logs a banner by default; keep the startup log as before

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
import { stringifySetCookie } from 'cookie';
import { parseCookies } from './services/cookies';
import { broadcastAllClients, broadcastAllRooms, initIo } from './services/socket-io';
import { publicRoom, publicUser } from './services/publicView';
import { log, requestLogger, errorRecorder, errField, configNamesSet } from './services/log';

const io = initIo(server, { cors: config.cors });


const getVersion = () => {
  const versionTxt = fs.readFileSync('./version.txt')
  const version = versionTxt.toString();
  const versionArray = version.split('.');

  return versionArray.map((v) => parseInt(v));
}

// Express prints every error it answers to stderr unless its env is "test" (body-parser errors quote the
// body). The answers are the same in "development" and "test" (only "production" hides the stack), so the
// error goes to the JSON request line instead (errorRecorder).
if (process.env.NODE_ENV !== 'production') app.set('env', 'test');

app.use(requestLogger()); // X-Request-Id + one JSON line for a 5xx or a slow answer (never the path, IP or cookie)
app.use(express.json());
app.use(cors(config.cors))
app.use(express.static('public'))

app.get('/session', async (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);

  if (cookies.sessionId) {
    return res.send(cookies.sessionId);
  }

  //setcookie if cookie not found or session of user not found
  const sessionId = generateId();
  res.setHeader('Set-Cookie', stringifySetCookie({
    name: 'sessionId',
    value: sessionId,
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
    res.send(users.map(publicUser));
  })
});

app.get('/rooms', (req: Request, res: Response) => {
  return getAllRooms().then((rooms) => {
    res.send(rooms.map(publicRoom));
  })
});

// Health for the box (compose healthcheck, hosh-deploy): proves the server reads its files and the in-memory
// user/room store answers, and that Socket.IO is attached. Read-only: creates no user, room or session.
app.get('/healthz', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const [users, rooms] = await Promise.all([getAllUsers(), getAllRooms()]);
    res.json({
      status: 'ok',
      version: getVersion().join('.'),
      users: users.length,
      rooms: rooms.length,
      sockets: io.engine.clientsCount,
    });
  } catch (e) {
    log.error('healthz_failed', 'healthz failed', errField(e));
    res.status(503).json({ status: 'error' });
  }
});

app.all('*', (req, res) => {
  //redirect all no found to '/'
  res.redirect('/');
})

// Express default error answers stay as they were; the error goes to the request line
app.use(errorRecorder);

//Socket.io
io.on('connection', (userSocket: Socket) => {
  userEvents(userSocket, io)
});

server.listen(config.port,config.target, () => {
  log.info('startup', `Server is Fire at http://${config.target}:${config.port}`, {
    port: config.port,
    env: process.env.ENV || 'PROD',
    log_level: log.level,
    config: configNamesSet(),
  });
});

// docker stop sends SIGTERM to node (PID 1 in the image): one line, then exit (the game state is in memory
// and is lost on any stop, as before; without a handler node ignored SIGTERM and docker killed it after 10 s)
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    log.info('shutdown', 'stopping', { signal, uptime_s: Math.round(process.uptime()) });
    process.exit(0);
  });
}
