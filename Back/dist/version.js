"use strict";
import fs from "fs";

const getVersion = () => {
    const versionTxt = fs.readFileSync('./version.txt');
    const version = versionTxt.toString();
    const versionArray = version.split('.');
    return versionArray.map((v) => parseInt(v));
};
const increaseVersion = (level) => {
    const version = getVersion();
    version[level]++;
    for (let i = level + 1; i < version.length; i++) {
        version[i] = 0;
    }
    console.log("App at version " + version);
    const versionString = version.join('.');
    fs.writeFileSync('./version.txt', versionString);
    return versionString;
};
//if executed as main script, increase version patch
if (require.main === module) {
    increaseVersion(process.argv[2] || 2);
}
