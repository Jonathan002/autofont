#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cli = require("commander");
//--- Project Modules ---
const taskFSHandler_1 = require("./taskFSHandler");
const taskScssSaveHandler_1 = require("./taskScssSaveHandler");
/* ---------------- Code ---------------------- */
/* ===============================
    Declaring Global Variables
================================== */
let welcomeMessage;
let helpMessage;
let source;
let output;
let watch;
let count; // For FS Watch: Queue Count to determine when it is safe to execute tasks on fs.watch event.
// --- tasks ---
let taskFSHandler;
let taskScssSaveHandler;
/* ===============================
        Functions Used
================================== */
const fixdir = (d) => {
    if (d && typeof d === "string" && d.substring(d.length - 1) !== "/") {
        d += "/";
        /* Noting FixDir modification - (helps find errors if path was automated somehow) */
        console.log('FixDir - Added a "/" at the end of specified string path.');
    }
    return d;
};
const addChangeCount = () => {
    count++;
};
/* ===============================
     Execution Overview
================================== */
welcomeMessage =
    '// ==========================================================\n' +
        '//                       Autofont          				  \n' +
        '// ==========================================================\n' +
        '//  - Feel free to add/remove font files in specified   		\n' +
        '//  	folder. Autofont will automatically add these fonts,	\n' +
        '// 	to a autofont.scss file in the folder.					\n' +
        '//                                                            \n' +
        '// ---------- Rules for changing autofont.scss -------------- \n' +
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
        '// --------------------------------------------------------\n';
// --------------------------- Cli Optionts ---------------------------
cli
    .version('1.0.6', '-v, --version')
    .arguments('<path_to_fonts>')
    .action(function (path_to_fonts) {
    source = fixdir(path_to_fonts);
})
    .usage('<path_to_fonts>')
    .option('-w, --watch', 'keep watching the input directory')
    .on('--help', function () {
    console.log(welcomeMessage);
})
    .parse(process.argv);
// --------------------------------------------------------------------
taskFSHandler = new taskFSHandler_1.TaskFSHandler;
taskScssSaveHandler = new taskScssSaveHandler_1.TaskScssSaveHandler;
watch = cli.watch || false;
// --- testing ---
// watch = true;
// source = './fonts/';
// ---------------
taskFSHandler.addListener('addCount', addChangeCount);
taskScssSaveHandler.addListener('addCount', addChangeCount);
if (source && watch) {
    let dirCount = fs.readdirSync(source).length;
    let currentDirCount;
    let diff;
    console.log(welcomeMessage);
    count = 0;
    taskScssSaveHandler.tmStart(source);
    taskFSHandler.tmStart(source);
    fs.watch(source, 'utf-8', function (eventType, filename) {
        if (eventType === 'rename' && count === 0) {
            currentDirCount = fs.readdirSync(source).length;
            diff = dirCount - currentDirCount;
            if (diff < 0) {
                diff = -diff;
            }
            count = diff;
            taskFSHandler.tmStart(source);
        }
        else if (eventType === 'change' && filename === 'autofont.scss' && count === 0) {
            taskScssSaveHandler.tmStart(source); // change source to -o if specified
            taskFSHandler.tmStart(source);
        }
        else if (eventType === 'change' && filename != 'autofont.scss') {
            count++;
        }
        if (count != 0) {
            count--;
            /* eventType 'change' '.DS_Store' happens before GUI move. (this may cause dirCount to update incorrectly causing diff to be 0)
                filename === 'autofont.scss' helps prevent this. */
            if (count === 0 && filename === 'autofont.scss')
                dirCount = fs.readdirSync(source).length;
        }
    });
}
else if (source) {
    console.log(welcomeMessage);
    taskScssSaveHandler.tmStart(source);
    taskFSHandler.tmStart(source);
}
else {
    cli.help();
}
/*
Extra Notes: Small window of danger.. (.5sec ish I think..)

After clear is logged from TaksFSHandler, fs.watch will make 2 emit passes
to .autofont and autofont.scss
(if user updates the dir file length before the emiter reduces the count
to 0 the dirCount may be incorrect)
*/
