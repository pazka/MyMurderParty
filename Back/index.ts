
import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';

//For env File 
dotenv.config();

const getVersion = () => {
  const versionTxt = fs.readFileSync('./version.txt')
  const version = versionTxt.toString();
  const versionArray = version.split('.');

  return versionArray.map((v) => parseInt(v));
}

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(express.static('public'))

app.get('/info', (req: Request, res: Response) => {
  res.send(getVersion().join('.'));
});

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});