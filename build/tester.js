/* had used const module = require('module') as tsc
wouldn't output for ES2015 import module = require('module') */
const fs = require('fs');
const path = require('path');
const cli = require('commander');
const colors = require('colors');
const fontmachine = require('fontmachine');
const t = require('tap');
let inDir = "./fonts/";
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
function getFontMetadata(fileList) {
    return Promise.all(fileList.map(function (fileName) {
        let data = fs.readFileSync('./fonts/' + fileName) || "";
        return new Promise(function (resolve, reject) {
            /*
                If you do resolve(fontmachine.makeGlyphs()) the promise will be fuffiled.
                However fontmachine method naturally returns undefined so trying to resolve it does not give me the values.
                I'm only able to access font in the callback which I'm trying to resolve....
            */
            fontmachine.makeGlyphs({ font: data, filetype: '.ttf' }, function (error, font) {
                /* Logs font data to show it exist some time */
                if (font != undefined) {
                    console.log(font.name);
                }
                if (error) {
                    reject(error);
                }
                else {
                    /* Trying to get this font data to be passed as data in array */
                    resolve(font);
                }
            });
        });
    }));
}
getFontMetadata(getFileList(inDir))
    .then(value => {
    console.log(value); // Success!
}, reason => {
    /* Fails if resolve fontmachine directly */
    console.log('Promise Rejected (from fontmachine callback err): ' + reason + '\n but wait for it... data will be logged soon..'); // Error!
});
// // Additional Testing of the Package Method
// // Uncomment This to see return value of fontmachine
// let data = fs.readFileSync('./fonts/' + (getFileList(inDir))[0]) || "";
// console.log(fontmachine.makeGlyphs({font: data, filetype: '.ttf'}, function(error, font) {
// }));
// Promise.resolve(fontmachine.makeGlyphs({font: data, filetype: '.ttf'}, function(error, font) {
// })).then(value => {console.log(value)}); 
