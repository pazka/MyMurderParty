"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
//For env File 
dotenv_1.default.config();
const getVersion = () => {
    const versionTxt = fs_1.default.readFileSync('./version.txt');
    const version = versionTxt.toString();
    const versionArray = version.split('.');
    return versionArray.map((v) => parseInt(v));
};
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
app.use(express_1.default.static('public'));
app.get('/info', (req, res) => {
    res.send('');
});
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
