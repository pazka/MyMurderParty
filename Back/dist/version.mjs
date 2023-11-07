"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.increaseVersion = exports.getVersion = void 0;
const fs_1 = __importDefault(require("fs"));
const getVersion = () => {
    const versionTxt = fs_1.default.readFileSync('./version.txt');
    const version = versionTxt.toString();
    const versionArray = version.split('.');
    return versionArray.map((v) => parseInt(v));
};
exports.getVersion = getVersion;
const increaseVersion = (level) => {
    const version = (0, exports.getVersion)();
    version[level]++;
    for (let i = level + 1; i < version.length; i++) {
        version[i] = 0;
    }
    console.log("App at version " + version);
    const versionString = version.join('.');
    fs_1.default.writeFileSync('./version.txt', versionString);
    return versionString;
};
exports.increaseVersion = increaseVersion;
//if executed as main script, increase version patch
if (this === undefined) {
    (0, exports.increaseVersion)(process.argv[2] || 2);
}
