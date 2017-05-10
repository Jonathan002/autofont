/* had used const module = require('module') as tsc 
wouldn't output for ES2015 import module = require('module') */
const fs = require('fs')
const path = require('path');
const cli = require('commander');
const colors = require('colors');
const fontmachine = require('fontmachine');
const t = require('tap');


let inDir: String = "./fonts/";

function getFileList(inDir: String) {
    let allFiles: String[];
    let files: String[] = [];

    if (fs.readdirSync(inDir) !== null || fs.readdirSync(inDir) !== undefined) {
        try {
		    allFiles = fs.readdirSync(inDir);
        }
        catch (e) {
            EvalError("Cannot open source directory " + inDir);
        }
    } else {
        throw EvalError('bur');
    }

	for (let i in allFiles) {
        let matchingFiles: String[] = allFiles[i].match(/(ttf|woff|eot|otf)$/);
		if (matchingFiles && matchingFiles.length) {
            files.push(allFiles[i]);
        }
	}
    return files;
}

interface fontFace {
    fontName: String;
    fontFamilyName: String;
    fontStyleName: String;
}

function getFontMetadata(fileList: String[]) {
    // console.log(fileList);
    let fontMetadataArray: fontFace[] = [];
    return Promise.all(fileList.map(function (fileName) {
        let data = fs.readFileSync('./fonts/' + fileName) || "";
        return new Promise(function (resolve, reject) {
            fontmachine.makeGlyphs({font: data, filetype: '.ttf'}, function(err, font) {
                console.log('bur 2');
            });
        })
    }))
}

console.log('bur1');
getFontMetadata(getFileList(inDir)).then(x => {console.log('bur 3')});