"use strict";
/*
    Module-Template: Taskmaster

    ================================== Readme ======================================
    - This class is a template of Taskmaster.
    Please review extra properties and methods declared below that begin with
    prefix of "tm" in case you wish to use a namespace begining with tm.
    - This class needs to emit if fs.watch 'rename' or a 'change' specifically to autofont.scss event happens for watcher (see app.ts)
     Use the find tool and search: "@Emitter" to find methods related to EventEmitter.
*/
Object.defineProperty(exports, "__esModule", { value: true });
/* ===============================
        Dependencies
================================== */
// -------- Node Modules ---------
const fs = require("fs");
const fontmachine = require("fontmachine");
const EventEmitter = require("events");
// -------- Lib ---------
const u = require("./../lib/utility");
/* ---------------- Code ---------------------- */
class TaskFSHandler extends EventEmitter {
    constructor() {
        super(...arguments);
        //Properties
        this.satusMessages = {
            'stop_updatingFontFolder': ('\n// -------------------- WARNING! ---------------------------\n' +
                '//                 UPDATING FONT FOLDER                    \n' +
                '//  ------------------------------------------------------ \n' +
                '//  - Do not edit/move files until this process has been   \n' +
                '//    completed.                                           \n' +
                '// --------------------------------------------------------\n'),
            'go_updateFinished': ('\n// -------------------- CLEAR! ---------------------------\n' +
                '//              UPDATE SUCESSFULLY FINISHED                \n' +
                '//  ------------------------------------------------------ \n' +
                '//  - You may now continue to add Font Files and Edit      \n' +
                '//    Your Autofont.Scss File                             \n' +
                '// --------------------------------------------------------\n')
        };
    }
    // Methods
    getFileList(inDir) {
        let allFiles;
        let files = [];
        if (fs.readdirSync(inDir) !== null || fs.readdirSync(inDir) !== undefined) {
            try {
                allFiles = fs.readdirSync(inDir);
            }
            catch (e) {
                Error("Cannot open source directory " + inDir);
            }
        }
        else {
            throw Error("Cannot open source directory " + inDir);
        }
        for (let i in allFiles) {
            let matchingFiles = allFiles[i].match(/(ttf|woff|woff2|eot|otf|svg)$/);
            if (matchingFiles && matchingFiles.length) {
                files.push(allFiles[i]);
            }
        }
        return files;
    }
    // tslint:disable-next-line:member-access (source is expected to have '/' at end due to fixdir in app.ts)
    getFontMetadata(source, fileList) {
        return Promise.all(fileList.map(function (fileName) {
            let filetype = fileName.split('.').pop();
            let data = fs.readFileSync(source + fileName) || "";
            return new Promise(function (resolve, reject) {
                fontmachine.makeGlyphs({ font: data, filetype: filetype }, function (error, font) {
                    /* Logs font data to show it exist after the 10 second wait.. */
                    // if (font != undefined) {console.log(font.name);}
                    /* Takes 10s to resolve */
                    const prolongedPromise = function () {
                        return new Promise((resolve, reject) => {
                            resolve([font, filetype, fileName]); //do not reorder this! ( see cleanFontMetadataArray() )
                        });
                    };
                    /* Attempting to race promises to get reject to execute on timeout */
                    let promiseRace = u.promiseTimeout(2000, prolongedPromise());
                    promiseRace.then(response => {
                        resolve(response);
                    }, error => {
                        reject(error);
                    }).catch(error => {
                        reject(error);
                    });
                });
            });
        }));
    }
    cleanFontMetadataArray(fontMetadataArray) {
        // remove undefined arrays
        // add str to font object
        fontMetadataArray = fontMetadataArray.filter(x => x[0] !== undefined); //removes [undefined, 'filetype'] from array
        fontMetadataArray = fontMetadataArray.map(x => {
            x[0]['filetype'] = x[1];
            x[0]['filename'] = x[2];
            x.splice(-2, 2);
            return x;
        }); //add filetype to font metadata object
        return u.flatten(fontMetadataArray);
    }
    addFontWeighttProp(cleanFontMetadataArray) {
        cleanFontMetadataArray = cleanFontMetadataArray.map(x => {
            let fontStyle = x.metadata.style_name.replace(' ', '').toLowerCase();
            if (['extralight', 'ultralight'].indexOf(fontStyle) >= 0) {
                x['weight'] = 100;
            }
            else if (['light', 'thin'].indexOf(fontStyle) >= 0) {
                x['weight'] = 200;
            }
            else if (['book', 'demi'].indexOf(fontStyle) >= 0) {
                x['weight'] = 300;
            }
            else if (['nomal', 'regular'].indexOf(fontStyle) >= 0) {
                x['weight'] = 400;
            }
            else if (['medium'].indexOf(fontStyle) >= 0) {
                x['weight'] = 500;
            }
            else if (['semibold', 'demibold'].indexOf(fontStyle) >= 0) {
                x['weight'] = 600;
            }
            else if (['bold'].indexOf(fontStyle) >= 0) {
                x['weight'] = 700;
            }
            else if (['black', 'extrabold', 'heavy'].indexOf(fontStyle) >= 0) {
                x['weight'] = 800;
            }
            else if (['extrablack', 'fat', 'poster', 'ultrablack'].indexOf(fontStyle) >= 0) {
                x['weight'] = 900;
            }
            else {
                x['weight'] = 400;
                console.log("- Couldn't match font metadata's style for font file '" + x.filename + "'." +
                    "\n     It had been defaulted to '400' under the @font-face font-family: '" + x.metadata.family_name + "'.");
                //move it to fixme scss
            }
            return x;
        });
        return cleanFontMetadataArray;
    }
    groupFonts(addFontWeightProp) {
        let groupFontsArray = [];
        for (let i = 0; i < addFontWeightProp.length; i++) {
            for (let idx = 0; (idx - 1) < groupFontsArray.length; idx++) {
                if (groupFontsArray[idx] === undefined) {
                    groupFontsArray.push([addFontWeightProp[i]]);
                    break;
                }
                else if (groupFontsArray[idx][0].metadata.family_name.indexOf(addFontWeightProp[i].metadata.family_name) >= 0 && groupFontsArray[idx][0].weight === addFontWeightProp[i].weight) {
                    groupFontsArray[idx].push(addFontWeightProp[i]);
                    break;
                }
            }
        }
        return groupFontsArray;
    }
    getNoMetadataList(fileList, fontMetadataArray) {
        let noMetaFileNames = [];
        //Array item position shouldn't change
        for (var i = 0; i < fileList.length; i++) {
            if (fontMetadataArray[i][0] === undefined) {
                noMetaFileNames.push(fileList[i]);
            }
        }
        if (noMetaFileNames.length) {
            console.log('Files that could not be Autofonted:\n- ' + noMetaFileNames.join('\n- '));
        }
        return noMetaFileNames;
    }
    createFontFaceJson(groupFonts, getNoMetadataList) {
        let fontFaceJson = {
            autofont: [],
            fixme: []
        };
        /* --- Adding Autofont --- */
        //Add Family-Collection Obj
        groupFonts.map(arrayX => {
            for (var i = 0; (i - 1) < fontFaceJson['autofont'].length; i++) {
                if (fontFaceJson['autofont'][i] === undefined) {
                    fontFaceJson['autofont'].push({
                        "font-family-name": arrayX[0].metadata.family_name,
                        "font-scss": []
                    });
                    break;
                }
                else if (fontFaceJson['autofont'][i]['font-family-name'].indexOf(arrayX[0].metadata.family_name) >= 0) {
                    break;
                }
            }
        });
        // Add Scss Obj to Family-Collection Scss prop
        fontFaceJson['autofont'] = fontFaceJson['autofont'].map(autofont => {
            let fontFamilyScss = [];
            groupFonts.map(arrayX => {
                let srcPaths = [];
                arrayX.map(x => {
                    srcPaths.push('url("./' + x.filename + '") format("' + x.filetype + '")');
                });
                for (var i = 0; (i - 1) < fontFamilyScss.length; i++) {
                    if (fontFamilyScss[i] === undefined && (autofont['font-family-name'] === arrayX[0].metadata.family_name)) {
                        fontFamilyScss.push({
                            "scss-rule": "@font-face",
                            'font-family': arrayX[0].metadata.family_name,
                            "font-style": "normal",
                            'font-weight': arrayX[0].weight,
                            "src": srcPaths
                        });
                        break;
                    }
                    else if (autofont['font-family-name'] === (arrayX[0].metadata.family_name)) {
                        fontFamilyScss.push({
                            "scss-rule": "@font-face",
                            "font-family": arrayX[0].metadata.family_name,
                            "font-style": "normal",
                            "font-weight": arrayX[0].weight,
                            "src": srcPaths
                        });
                        break;
                    }
                }
            });
            autofont['font-scss'] = fontFamilyScss;
            return autofont;
        });
        /* --- ============ --- */
        /* --- Adding Fixme --- */
        getNoMetadataList = getNoMetadataList.map((x) => {
            fontFaceJson['fixme'].push({
                "font-family-name": x.split('.')[0],
                "font-scss": [{
                        "scss-rule": "@font-face",
                        "font-family": x.split('.')[0],
                        "font-style": "normal",
                        "font-weight": 400,
                        "src": ['url("./' + x + '")']
                    }]
            });
        });
        return fontFaceJson;
    }
    checkIfDataExist(inDir) {
        let allFiles;
        let autofontFSMatch;
        let autofontData;
        if (fs.readdirSync(inDir) !== null || fs.readdirSync(inDir) !== undefined) {
            try {
                allFiles = fs.readdirSync(inDir);
            }
            catch (e) {
                throw EvalError("Cannot open source directory " + inDir);
            }
        }
        else {
            throw EvalError("Cannot open source directory " + inDir);
        }
        for (let i in allFiles) {
            if (allFiles[i].match(/(.autofont)$/)) {
                autofontFSMatch = allFiles[i].match(/(.autofont)$/);
                break;
            }
            ;
        }
        //Check if autofontData exist
        if (autofontFSMatch != undefined || autofontFSMatch != null) {
            //Verify autofontData or delete it. Must return false if data does not exist.
            try {
                autofontData = fs.readFileSync(inDir + autofontFSMatch[1], 'utf-8');
                autofontData = JSON.parse(autofontData);
            }
            catch (e) {
                // console.log('hmmmmmm')
                try {
                    fs.unlinkSync(inDir + autofontFSMatch[1]);
                    this.emit('addCount');
                    // might be nicer in future updates..
                    console.log('WARNING: Deleted a corrupt .autofont file so saved Scss changes will revert back to default.. Did you touch this?');
                }
                catch (e) {
                    throw Error("Attempted to delete .autofont file as it is corrputed. This program sadly failed so you must delete it manually. (Note: it is a hidden file - use google if you don't know yet how to find those.. :p)");
                }
                return false;
            }
            return autofontData;
        }
        return false;
    }
    compareJsonData(newJson, oldJson) {
        if (oldJson === false) {
            return newJson;
        }
        else {
            // Creating new Objects that will contain differences for removal and adding
            let newJsonB = u.newInstance(newJson); // Will contain Fonts to Add
            let oldJsonB = u.newInstance(oldJson); // Will contain Fonts to Remove
            // ------------------------ Comparison --------------------------------
            //Autofont Comparison
            for (let iNew = 0; iNew < newJsonB['autofont'].length; iNew++) {
                for (let iOld = 0; iOld < oldJsonB['autofont'].length; iOld++) {
                    //Check If Font Fam Matches
                    if (newJsonB['autofont'][iNew]['font-family-name'] === oldJsonB['autofont'][iOld]['font-family-name']) {
                        for (let iiNew = 0; iiNew < newJsonB['autofont'][iNew]['font-scss'].length; iiNew++) {
                            for (let iiOld = 0; iiOld < oldJsonB['autofont'][iOld]['font-scss'].length; iiOld++) {
                                // Check if Src Matches
                                if (u.diff(newJsonB['autofont'][iNew]['font-scss'][iiNew]['src'], oldJsonB['autofont'][iOld]['font-scss'][iiOld]['src'])[2] === 'equal') {
                                    newJsonB['autofont'][iNew]['font-scss'].splice(iiNew, 1);
                                    oldJsonB['autofont'][iOld]['font-scss'].splice(iiOld, 1);
                                    iiNew--;
                                    break;
                                }
                            }
                        }
                        // Removing Font-Fams with empty Font-Scss
                        if (newJsonB['autofont'][iNew]['font-scss'].length === 0 && oldJsonB['autofont'][iOld]['font-scss'].length === 0) {
                            newJsonB['autofont'].splice(iNew, 1);
                            oldJsonB['autofont'].splice(iOld, 1);
                            iNew--;
                        }
                        else if (newJsonB['autofont'][iNew]['font-scss'].length === 0) {
                            newJsonB['autofont'].splice(iNew, 1);
                            iNew--;
                        }
                        else if (oldJsonB['autofont'][iOld]['font-scss'].length === 0) {
                            oldJsonB['autofont'].splice(iOld, 1);
                        }
                        break;
                    }
                }
            }
            //Fixme Comparison
            for (let iNew = 0; iNew < newJsonB['fixme'].length; iNew++) {
                for (let iOld = 0; iOld < oldJsonB['fixme'].length; iOld++) {
                    //Check If Font Src Matches
                    if (newJsonB['fixme'][iNew]['font-scss'][0]['src'][0] === oldJsonB['fixme'][iOld]['font-scss'][0]['src'][0]) {
                        newJsonB['fixme'].splice(iNew, 1);
                        oldJsonB['fixme'].splice(iOld, 1);
                        iNew--;
                        iOld--;
                        break;
                    }
                }
            }
            // ======================== Updating Changes ==============================
            //Checks to Update the Json are already made via array length.
            // ------------------------------ Removal ---------------------------------
            // Remove Changes Autofont
            for (let irm = 0; irm < oldJsonB['autofont'].length; irm++) {
                for (let i = 0; i < oldJson['autofont'].length; i++) {
                    //Check if Font Fam Matches
                    if (oldJsonB['autofont'][irm]['font-family-name'] === oldJson['autofont'][i]['font-family-name']) {
                        for (let iirm = 0; iirm < oldJsonB['autofont'][irm]['font-scss'].length; iirm++) {
                            for (let ii = 0; ii < oldJson['autofont'][i]['font-scss'].length; ii++) {
                                // Check if Src Matches and Remove the Object
                                if (u.diff(oldJsonB['autofont'][irm]['font-scss'][iirm]['src'], oldJson['autofont'][i]['font-scss'][ii]['src'])[2] === 'equal') {
                                    oldJson['autofont'][i]['font-scss'].splice(ii, 1);
                                    break;
                                }
                            }
                        }
                        // Removing Font-Fams with empty Font-Scss
                        if (oldJson['autofont'][i]['font-scss'].length === 0) {
                            oldJson['autofont'].splice(i, 1);
                            i--;
                        }
                        break;
                    }
                }
            }
            //Remove Changes Fixme
            for (let irm = 0; irm < oldJsonB['fixme'].length; irm++) {
                for (let i = 0; i < oldJson['fixme'].length; i++) {
                    //Check If Font Src Matches and Remove Object
                    if (oldJsonB['fixme'][irm]['font-scss'][0]['src'][0] === oldJson['fixme'][i]['font-scss'][0]['src'][0]) {
                        oldJson['fixme'].splice(i, 1);
                        break;
                    }
                }
            }
            // ------------------------------ Adding ---------------------------------
            // Adding Changes Autofont
            for (let iadd = 0, lengthCheck = newJsonB['autofont'].length; iadd < newJsonB['autofont'].length; iadd++) {
                for (let i = 0; i < oldJson['autofont'].length; i++) {
                    //Check if Font Fam Matches
                    if (newJsonB['autofont'][iadd]['font-family-name'] === oldJson['autofont'][i]['font-family-name']) {
                        // Push to font-scss of fam and remove newJsonB['autofont'][iadd] --iadd
                        for (let iiadd = 0; iiadd < newJsonB['autofont'][iadd]['font-scss'].length; iiadd++) {
                            oldJson['autofont'][i]['font-scss'].push(newJsonB['autofont'][iadd]['font-scss'][iiadd]);
                        }
                        //Remove the added font fam to indicate a change in length
                        newJsonB['autofont'].splice(iadd, 1);
                        iadd--;
                        break;
                    }
                }
                // Check length to determine if there was no font fam match so we must add a new font fam.
                if (newJsonB['autofont'].length === lengthCheck) {
                    oldJson['autofont'].push(newJsonB['autofont'][iadd]);
                }
                else {
                    lengthCheck = newJsonB['autofont'].length;
                }
            }
            //Adding Changes Fixme
            for (let i = 0; i < newJsonB['fixme'].length; i++) {
                oldJson['fixme'].push(newJsonB['fixme'][i]);
            }
            // ------------------------------ Returning Updated OldJson (if any) ---------------------------------
            return oldJson;
        }
    }
    sortJsonFontWeight(MT_createFontFaceJson) {
        let autofont = MT_createFontFaceJson['autofont'];
        for (let fontFam of autofont) {
            fontFam['font-scss'].sort(function (a, b) {
                return a['font-weight'] - b['font-weight'];
            });
        }
        return MT_createFontFaceJson;
    }
    writeAutofontFile(inDir, autofontJson) {
        try {
            fs.writeFileSync(inDir + '.autofont', JSON.stringify(autofontJson, null, 4));
            return true;
        }
        catch (e) {
            throw Error('Unable to write .autofont FS Error: ' + e);
        }
    }
    createFontFaceStringArray(fontFaceJson) {
        let fontFaceStr = '// ==================================\n' +
            '// ==== Autofont Master Font File ===\n' +
            '// ==================================\n';
        if (u.isValidJson(fontFaceJson)) {
            if (fontFaceJson['fixme'].length != 0) {
                fontFaceStr +=
                    '// ---------------------------------------------------------\n' +
                        '// --- Fixme - These files could not fully be auto added ---\n' +
                        '// ---------------------------------------------------------\n';
                fontFaceStr += '\n\n';
                for (let fontFam of fontFaceJson['fixme']) {
                    fontFaceStr +=
                        '@font-face {\n' +
                            '   font-family: "' + fontFam['font-scss'][0]['font-family'] + '";\n' +
                            '   font-style: ' + fontFam['font-scss'][0]['font-style'] + ';\n' +
                            '   font-weight: ' + fontFam['font-scss'][0]['font-weight'] + ';\n' +
                            '   src: ' + fontFam['font-scss'][0]['src'].join(', ') + ';\n' +
                            '}\n\n';
                }
                fontFaceStr += '\n\n\n';
            }
            fontFaceStr +=
                '// ---------------------------------------------------------------------\n' +
                    '// --- Auto added these fonts. Font-Style must manually be set here  ---\n' +
                    '// ---------------------------------------------------------------------\n';
            fontFaceStr += '\n\n';
            for (let fontFam of fontFaceJson['autofont']) {
                fontFaceStr +=
                    '// ---' + fontFam['font-family-name'] + '---' +
                        '\n\n';
                for (let fontFace of fontFam['font-scss']) {
                    fontFaceStr +=
                        '@font-face {\n' +
                            '   font-family: "' + fontFace['font-family'] + '";\n' +
                            '   font-style: ' + fontFace['font-style'] + ';\n' +
                            '   font-weight: ' + fontFace['font-weight'] + ';\n' +
                            '   src: ' + fontFace['src'].join(', ') + ';\n' +
                            '}\n\n';
                }
            }
        }
        return fontFaceStr;
    }
    writeScssFile(inDir, MT_createFontFaceString) {
        // Need to verify file exist to know if we are calling rename or change to watcher via try catche error.
        try {
            fs.writeFileSync(inDir + 'autofont.scss', MT_createFontFaceString, 'utf8');
            this.emit('addCount');
            return true;
        }
        catch (e) {
            throw Error('Unable to write autofont.scss. FS Error: ' + e);
        }
    }
    /* ===============================
                Taskmaster
    ================================== */
    tmStart(inDir) {
        // Alert the user that autofont is working and is not safe to proceed with folder/save changes.
        console.log(this.satusMessages['stop_updatingFontFolder']);
        let M_getFileList = this.getFileList(inDir); // => ['filename']
        let M_getFontMetadata = this.getFontMetadata(inDir, M_getFileList)
            .then((MTV_fontMetadataArray) => {
            // Part 1
            let MT_cleanFontMetadataArray = this.cleanFontMetadataArray(MTV_fontMetadataArray); // => [{}]
            let MT_addFontWeightProp = this.addFontWeighttProp(MT_cleanFontMetadataArray); // => [ {} + .weight ]
            let MT_groupFonts = this.groupFonts(MT_addFontWeightProp); // => [ [{}] ] - put font-family's and weights coresponding (.ttf, woff, etc) together
            // Part 2
            let MT_getNoMetadataList = this.getNoMetadataList(M_getFileList, MTV_fontMetadataArray); // => ['filename']
            // Part 3 - Requires Part 1 & 2
            let MT_createFontFaceJson = this.createFontFaceJson(MT_groupFonts, MT_getNoMetadataList); // => JSON
            // Part 4
            let MT_checkIfDataExist = this.checkIfDataExist(inDir); // => JSON || false;
            if (MT_checkIfDataExist === false)
                this.emit('addCount');
            // console.log('data exist', MT_checkIfDataExist)
            // Part 5 - Requires Part 3 & 4
            let MT_CompareJsonData = this.compareJsonData(MT_createFontFaceJson, MT_checkIfDataExist); // => JSON
            let MT_sortJsonFontWeight = this.sortJsonFontWeight(MT_CompareJsonData); // => same JSON (with sorted font weight)
            let MT_writeAutofontFile = this.writeAutofontFile(inDir, MT_sortJsonFontWeight); // if fs.writeSync() => true
            let MT_createFontFaceString = this.createFontFaceStringArray(MT_sortJsonFontWeight); // => '@font-face'
            let MT_writeScssFile = this.writeScssFile(inDir, MT_createFontFaceString); // if fs.writeSync() => true
            // Alert the user that it is safe to proceed with watcher
            console.log(this.satusMessages['go_updateFinished']);
        }, (reason) => {
            throw Error('Promise Rejected.. Reason: ' + reason);
        });
    }
}
exports.TaskFSHandler = TaskFSHandler;
