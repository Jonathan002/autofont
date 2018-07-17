

/* 
    Module-Template: Taskmaster

	================================== Readme ======================================
    - This class is a template of Taskmaster. 
    Please review extra properties and methods declared below that begin with
    prefix of "tm" in case you wish to use a namespace begining with tm. 
    - This class needs to emit if fs.watch 'rename' or a 'change' specifically to autofont.scss event happens for watcher (see app.ts)
     Use the find tool and search: "@Emitter" to find methods related to EventEmitter.
*/



/* ===============================
     	Dependencies
================================== */
// -------- Node Modules ---------
import * as fs from 'fs';
import * as EventEmitter from 'events';
// -------- Lib ---------
import * as u from './../lib/utility';
/* --------------------------- */


/* ---------------- Code ---------------------- */
export class TaskScssSaveHandler extends EventEmitter {
    /* ===============================
     	Basic helper module methods
    ================================== */
    statusMessages(request, dynamicMessages?) {
        switch (request) {
            case 'rejection':
                return ('// --------------- Scss Rejection! ---------------------\n' +
                        '//' + dynamicMessages[0] +                                  '\n' +
                        '//  ------------------------------------------------------ \n' +
                        '//  - ' + dynamicMessages[1] +                                 '\n' +
                        '// --------------------------------------------------------\n')
            case 'rejection_unableToParse':
                return ('// --------------- Scss Rejection! ---------------------\n' +
                        '//               Unable to Parse Scss                    \n' +
                        '//  ------------------------------------------------------ \n' +
                        '//  - Unable to parse your autofont.scss. This may be due to \n' +
                        '//    a syntax error.                                        \n' +
                        '//                                                           \n' +
                        '//  - Your saved Scss has been rejected. Your latest changes \n' +
                        '//   have been moved to autofont-rejected.scss at.           \n' +
                        '//     ---> ' + dynamicMessages[1] + 'autofont-rejected.scss   \n' +
                        '// --------------------------------------------------------\n')

            case 'rejection_illegalProp':
                return ('// ------------- Scss Rejection! ---------------------------\n' +
                        '//          Illegal Font Property Changed                   \n' +
                        '//  ------------------------------------------------------ \n' +
                        '//  - Illegal Font Property Found:                         \n' +
                        '//     ---> ' + dynamicMessages[0] +                       '\n' +
                        '//                                                           \n' +
                        '//  - Your saved Scss has been rejected. Your latest changes \n' +
                        '//   have been moved to autofont-rejected.scss at.           \n' +
                        '//     ---> ' + dynamicMessages[1] + 'autofont-rejected.scss   \n' +
                        '//                                                             \n' +
                        '// - Rules for font changes are shown below:         \n' +
                        '//                                                            \n' +
                        '//  Fixme:                                                     \n' +
                        '//     @font-face {                                            \n' +
                        '//         font-family: "ALLOWED"; \u2713                      \n' +
                        '//         font-style: "ALLOWED CHOICE: [normal, italic, oblique]"; \u2713 \n' +
                        '//         font-weight: "ALLOWED CHOICE: [100, 200, 300, 400, 500, \n' +
                        '//                                        600, 700, 800 ]"; \u2713  \n' +
                        '//         src: "NOT ALLOWED"; \u274C                               \n' +
                        '//     }                                                             \n' +
                        '//                                                                     \n' +
                        '//  Autofont:                                                         \n' +
                        '//    @font-face {                                                    \n' +
                        '//         font-family: "NOT ALLOWED"; \u274C                       \n' +
                        '//         font-style: "ALLOWED CHOICE: [normal, italic, oblique]"; \u2713 \n' +
                        '//         font-weight: "NOT ALLOWED"; \u274C                          \n' +
                        '//         src: "NOT ALLOWED"; \u274C                                  \n' +
                        '//     }                                                               \n' + 
                        '// --------------------------------------------------------\n')

            case 'sucess_savingAutofont':
                return ('// ------------------ Sucess! -----------------------------\n' +
                        '//         Successfully Saved Valid Scss                   \n' +
                        '//  ------------------------------------------------------ \n' +
                        '//  - Changes saved to your autofont Scss at:               \n' +
                        '//     ---> ' + dynamicMessages + '.autofont                \n' +
                        '// --------------------------------------------------------\n')

            case 'update':
                return ('// --------------- Autofont Update! ---------------------\n' +
                        '//' + dynamicMessages[0] +                                  '\n' +
                        '//  ------------------------------------------------------ \n' +
                        '//  - ' + dynamicMessages[1] +                                 '\n' +
                        '// --------------------------------------------------------\n')
            
            case 'update_revertScssFile':
                return ('// --------------- Autofont Update! ---------------------\n' +
                        '//      Attempting to Revert Autofont Scss File.           \n' +
                        '//  ------------------------------------------------------ \n' +
                        '//  - If changes are not visible please close and reopen     \n' +
                        '//    Autofont.scss. (saving or not saving changes will     \n' +
                        '//    still result in a revert on watch mode)               \n' +
                        '// --------------------------------------------------------\n')
            
            case 'error':
                return ('\n' +
                        '// -------------------- Error! ---------------------------  \n' +
                        '//                                                            \n' +
                        '//  - ' + dynamicMessages +                                 '\n' +
                        '// --------------------------------------------------------\n')
        } 
    }

    rejectScss() { // @Emitter
        let scssString = this.tmVar['M_readScss'];
        //Need to verify if file exist so we can emit a rename count..
        try {
            fs.readFileSync(this.tmVar['inDir'] + 'Autofont-Rejected.scss', 'utf-8');
            fs.writeFileSync(this.tmVar['inDir'] + 'Autofont-Rejected.scss', scssString);
        } catch(e) {
            fs.writeFileSync(this.tmVar['inDir'] + 'Autofont-Rejected.scss', scssString);
            this.emit('addCount')
        }
        
        // Revert Message: App will run TaskFSHandler() after to implement the revert
        console.log(this.statusMessages('update_revertScssFile'));
        
        this.tmStop(); //Rather than closing scss and running watcher agian, user just has to close and reopen scss.
    }

    arrayCompare(val, arr) {
        for (let item of arr) {
            if (val === item) {  
                return true;
            }
        }
        return false;
    }

    validateFontFamily(val) {
        if (u.type(val) === 'string') {
            return val;
        }

        console.log(this.statusMessages('rejection_illegalProp', ['Font Family', this.tmVar['inDir']]));
        this.rejectScss();
    }

    validateFontStyle(val) {
        let fontStyleArr = ['normal', 'oblique', 'italic'];
        if (u.type(val) === 'string' && this.arrayCompare(val, fontStyleArr) === true) {
            return true;
        }

        console.log(this.statusMessages('rejection_illegalProp', ['Font Style', this.tmVar['inDir']]));
        this.rejectScss();
    }

    validateFontWeight(val) {
        let fontWeightArr = [100, 200, 300, 400, 500, 600, 700, 800, 900];
        val = parseInt(val);
        if (u.type(val) === 'number' && this.arrayCompare(val, fontWeightArr) === true) {
            return true;
        }

        console.log(this.statusMessages('rejection_illegalProp', ['Font Weight', this.tmVar['inDir']]));
        this.rejectScss();
    }

    /* =====================================================
     	                Main Methods
    ======================================================== */
    readScss(inDir) {
        let allFiles: String[];
        let autofontScssFile: any;
        let autofontScssString: String;

        if (fs.readdirSync(inDir) !== null || fs.readdirSync(inDir) !== undefined) {
            try {
                allFiles = fs.readdirSync(inDir);
            }
            catch (e) {
                throw Error(this.statusMessages('error', "Cannot open source directory " + inDir));
            }
        } else {
            throw Error(this.statusMessages('error', "Cannot open source directory " + inDir + '\n//     ---> FS returned null/undefined'));
        }

        for (let i in allFiles) {
            if (allFiles[i].match('autofont.scss')) {
                autofontScssFile = allFiles[i].match('autofont.scss');
                break;
            };
        }    

        if (autofontScssFile === undefined || autofontScssFile === null) {
            console.log(this.statusMessages('update', [
                '       Unable to read/find Autofont Scss',
                'Unable to read/find Autofont Scss File at:\n' + 
                '       ----> ' + this.tmVar['inDir'] + '\n\n' +
                '   - Autofont will now proceed to generating an Scss File for you..'
            ]));
            this.tmStop();
            return false;
        } else {
            try {
                autofontScssString = fs.readFileSync(inDir + autofontScssFile, 'utf-8');
                return autofontScssString;
            } catch(e) {
                console.log(this.statusMessages('update', [
                    '       Unable to read/find Autofont Scss',
                    'Unable to read/find Autofont Scss File at:\n' + 
                    '       ----> ' + this.tmVar['inDir'] + '\n\n' +
                    '   - Autofont will now proceed to generating an Scss File for you..'
                ]));
                this.tmStop();
                return false;
            }
        }
    }

    splitScss(M_readScss) {
        let autofontScssString = M_readScss;
        let spliter =
        '// ---------------------------------------------------------------------\n' +
        '// --- Auto added these fonts. Font-Style must manually be set here  ---\n' +
        '// ---------------------------------------------------------------------\n';
        let fixme = '';
        let autofont = '';

        if (autofontScssString.search(spliter) === -1) {
            console.log(this.statusMessages('rejection_unableToParse'));
            this.rejectScss();
        } else {
            fixme = autofontScssString.split(spliter)[0];
            autofont = autofontScssString.split(spliter)[1];
        }

        return {'fixme': fixme, 'autofont': autofont}
    }

    parseAndGenerateJsonData(stringToParse, destination, fontFaceJson) {
        /*
            this.rejectScss()
            this.validateFontFamily()
            this.validateFontStyle()
            this.validateFontWeight()
        */

        let fontFaceObj;
        let fontFamName;
        let fontPropArray;
        let fontScss;
        let prop;
        let val;

        if (destination === 'autofont') {
            stringToParse = stringToParse.split("// ---");
            stringToParse.shift();
        } else {
            stringToParse = stringToParse.split("@font-face");
            stringToParse.shift();
            stringToParse = stringToParse.map(x => '@font-face' + x); //normalize fixme for loop
        }

        for (let fontFam of stringToParse) {
            fontFaceObj = { //=
                "font-family-name": '',
                "font-scss": []
            };

            fontFam = fontFam.split('@font-face')//  ['Montserrat---\n\n', {\n   font-family: "Montserrat";\n   font-style: normal;\n   font-weight: 100;\n   src: url("./Montserrat-ExtraLight.otf") format("otf");\n}]\n\n'}

            fontFamName = fontFam.shift(); //=
            fontFamName = fontFamName.replace(/\n/g, '');
            fontFamName = fontFamName.slice(0, -'---'.length);

            fontFaceObj["font-family-name"] = fontFamName;
            for (let fontWeightGroupProp of fontFam) {
                fontPropArray = fontWeightGroupProp.replace(/\s+(?=([^"]*"[^"]*")*[^"]*$)/g,'').slice(1).slice(0, -1).split(';'); //=
                fontPropArray = fontPropArray.filter(x => x != '');

                fontScss = { //=
                    'scss-rule': '@font-face'
                };
                
                for (let fontProp of fontPropArray) {
                    prop = fontProp.split(':')[0]; //=
                    val = fontProp.split(':')[1]; //=
                    switch (prop) {
                        case 'font-family':
                            val = val.slice(1).slice(0, -1);
                            this.validateFontFamily(val);
                            fontScss['font-family'] = val;
                            break;
                        case 'font-style':
                            this.validateFontStyle(val);
                            fontScss['font-style'] = val;
                            break;
                        case 'font-weight':
                            this.validateFontWeight(val)
                            fontScss['font-weight'] = Number(val);
                            break;
                        case 'src': //val = 'url("./icomoon.svg")format("otf")'
                            //add a space
                            val = val.replace(/\"\)format\(/g,'") format(')
                            //get fontfam from src
                            if (destination === 'fixme') {
                                fontFaceObj['font-family-name'] = val.slice(7).split('.')[0];
                            }
                            val = val.split(',');
                            fontScss['src'] = val;
                            break;
                        default:
                            console.log(this.statusMessages('rejection_unableToParse'));
                            this.rejectScss();
                            break;
                    }
                }
                fontFaceObj['font-scss'].push(fontScss);
            }
            fontFaceJson[destination].push(fontFaceObj)
        }

        return fontFaceJson;
    }

    readAutofontJson(inDir) {
        let autofontJson;
        try {
            autofontJson = JSON.parse(fs.readFileSync(inDir + '.autofont', 'utf8'));
        } catch(e) {
            console.log(this.statusMessages('update',[
                '       Unable to read/find .autofont data', 
                '   Unable to read/find .autofont data in ' + this.tmVar['inDir'] + '\n\n' +
                '   - NOTE: Due to missing/corrupt .autofont data,\n' +
                '       Autofont will Reject your current Scss and \n' +
                '       generate a new one based on font files' +
                '\n\n' +
                '   try -> JSON.parse(fs) -> Error Caught:' + e
            ]));
            this.rejectScss();
            return false;
        }
        
        return autofontJson;
    };

    compareChangesAndValidate(M_readAutofontJson, M_fontFaceJson, inDir) {
        let difference = u.diff(M_readAutofontJson, M_fontFaceJson);
        
        if (u.searchJsonPath(difference[1], "['fixme'][]['font-family-name']", false) != false
        || u.searchJsonPath(difference[1], "['fixme'][]['font-scss']['src']", false) != false
        || u.searchJsonPath(difference[1], "['autofont'][]['font-scss'][]['font-family']") != false
        || u.searchJsonPath(difference[1], "['autofont'][]['font-scss'][]['font-weight']") != false
        || u.searchJsonPath(difference[1], "['autofont'][]['font-scss'][]['src']") != false
        ) {
            console.log(this.statusMessages('rejection_illegalProp', ['Unknown Property', this.tmVar['inDir']]))
            this.rejectScss();
        } else {
            console.log('Valid Scss.. Attempting to save changes to your autofont Scss..');
            fs.writeFileSync(this.tmVar['inDir'] + '.autofont', JSON.stringify(M_fontFaceJson, null, 4));
            console.log(this.statusMessages('sucess_savingAutofont', this.tmVar['inDir']))
        }
    }

    /* ===============================
                Taskmaster
    ================================== */
    // ----- Wrapper for Global Vars --------
    // Not sure yet why I didnt use readonly varVaultTwo = {fontFaceJson: {}}
    varVault(request) {
        // this.prop = {}
        switch (request) {
            case 'fontFaceJson':
                return {
                    autofont: [],
                    fixme: []
                }
        }
    }
    // -------- Taskmaster Reserved Properties --------------
    private tmDone;
    private tmContinueTaskMaster;
    private tmTaskListIndexState = 0;
    readonly tmVar = {}
    private tmTaskList = [
        //Part 1
        "this.tmVar['M_readScss'] = this.readScss(this.tmVar['inDir']);", // => 'Scss String'
        "this.tmVar['M_splitScss'] = this.splitScss(this.tmVar['M_readScss']);", // => {'fixme', 'autofont'}
        "this.tmVar['M_fontFaceJson'] = this.varVault('fontFaceJson');", // => JSON (empty);
            "this.parseAndGenerateJsonData(this.tmVar['M_splitScss']['fixme'], 'fixme', this.tmVar['M_fontFaceJson']);", // Adds Fixme to M_fontFaceJson
            "this.parseAndGenerateJsonData(this.tmVar['M_splitScss']['autofont'], 'autofont', this.tmVar['M_fontFaceJson']);", // Adds Autofont to M_fontFaceJson
        "this.tmVar['M_readAutofontJson'] = this.readAutofontJson(this.tmVar['inDir']);", // => autofont JSON

        //Part 2 - requires M_fontFaceJson & M_readAutofontJson - will also fs write straight away if valid
        "this.tmVar['M_compareChangesAndValidate'] = this.compareChangesAndValidate(this.tmVar['M_readAutofontJson'], this.tmVar['M_fontFaceJson'], this.tmVar['inDir']);" // FS write Autofont JSON (if Valid)
    ]
    
    // -------- Taskmaster Reserved Methods --------------
    public tmStop() {
        this.tmContinueTaskMaster = false;
    }

    public tmNext() {
        if (this.tmTaskListIndexState >= this.tmTaskList.length) {
        this.tmDone = true;
        } else {
            try {
                //need more opinions on this..
                eval( this.tmTaskList[this.tmTaskListIndexState] );
                this.tmTaskListIndexState++;
            } catch(e) {
                throw EvalError("Note Taskmaster will convert task function into a string and evaluate. Please read taskMaster user guide to foramat array properly.\n\n" +
                'String being evaluated: "' + this.tmTaskList[this.tmTaskListIndexState] + '"\n\n' +
                'Eval Error Message: '  + e);
            }
        }    
    }

    tmStart(inDir) {
        //Register manually
        this.tmVar['inDir'] = inDir;
        //Starting Taskmaster...
        this.tmTaskListIndexState = 0;
        this.tmContinueTaskMaster = true;
        this.tmDone = false;
        while(this.tmContinueTaskMaster && this.tmDone === false) {
            this.tmNext()
        }
    }
}