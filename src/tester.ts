/* had used const module = require('module') as tsc 
wouldn't output for ES2015 import module = require('module') */
const fs = require('fs')
const path = require('path')
const cli = require('commander')
const colors = require('colors')
const fontmachine = require('fontmachine')
const t = require('tap')

// cli.version('0.1.7')

// let inDir: String = "./fonts/";
let inDir: String = "./fonts/";
// console.log(fs.readdirSync(inDir));

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
        throw EvalError('bur')
    }

	for (let i in allFiles) {
        let matchingFiles: String[] = allFiles[i].match(/(ttf|woff|eot|otf)$/);
		if (matchingFiles && matchingFiles.length) {
            files.push(allFiles[i]);
        }
	}
    return files;
}

getFileList(inDir);

interface fontFace {
    fontName: String;
    fontFamilyName: String;
    fontStyleName: String;
}

function getFontMetadata(fileList: String[]) {
    let data = fs.readFileSync('./fonts/' + fileList[0]) || "";
    let fontMetadataArray: fontFace[] = [];
    let bur = [];

    // for (let file in fileList) {
    fontmachine.makeGlyphs({font: data, filetype: '.ttf'}, function(err, font) {            
        // fontMetadataArray.push({
        //     fontName: font.name, 
        //     fontFamilyName: font.metadata.family_name, 
        //     fontStyleName: font.metadata.style_name
        // })
        bur = [1,2,3];
        console.log(bur);
    });

    Promise.resolve(bur != []).then(res => {console.log(res)});
    // }
    console.log('asyc?');
}
//organize and group metadata... hmmmm

//getFontMetadata.then (
//create .scss per font
    //add font-faces per font-group
//with cli path add .scss barrel of font files to fonts.scss
) 

getFontMetadata(getFileList(inDir));