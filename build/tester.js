/* had used const module = require('module') as tsc
wouldn't output for ES2015 import module = require('module') */
const fs = require('fs');
const path = require('path');
const cli = require('commander');
const colors = require('colors');
const fontmachine = require('fontmachine');
const t = require('tap');
// cli.version('0.1.7')
// let inDir: String = "./fonts/";
let inDir = "./fonts/";
// console.log(fs.readdirSync(inDir));
function getFileList(inDir) {
    let allFiles;
    let files = [];
    if (fs.readdirSync(inDir) !== null || fs.readdirSync(inDir) !== undefined) {
        try {
            allFiles = fs.readdirSync(inDir);
        }
        catch (e) {
            EvalError("Cannot open source directory " + inDir);
        }
    }
    else {
        throw EvalError('bur');
    }
    for (let i in allFiles) {
        let matchingFiles = allFiles[i].match(/(ttf|woff|eot|otf)$/);
        if (matchingFiles && matchingFiles.length) {
            files.push(allFiles[i]);
        }
    }
    return files;
}
getFileList(inDir);
function getFontMetadata(fileList) {
    let data = fs.readFileSync('./fonts/' + fileList[0]) || "";
    let fontMetadataArray = [];
    let bur = [];
    // for (let file in fileList) {
    fontmachine.makeGlyphs({ font: data, filetype: '.ttf' }, function (err, font) {
        // fontMetadataArray.push({
        //     fontName: font.name, 
        //     fontFamilyName: font.metadata.family_name, 
        //     fontStyleName: font.metadata.style_name
        // })
        bur = [1, 2, 3];
        console.log(bur);
    });
    Promise.resolve(bur != []).then(res => { console.log(res); });
    // }
    console.log('asyc?');
}
getFontMetadata(getFileList(inDir));
