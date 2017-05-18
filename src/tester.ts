/* had used const module = require('module') as tsc 
wouldn't output for ES2015 import module = require('module') */
const fs = require('fs')
const path = require('path');
const cli = require('commander');
const colors = require('colors');
const fontmachine = require('./../lib/fontmachine');
const t = require('tap');

/* Taken from https://italonascimento.github.io/applying-a-timeout-to-your-promises/ */
const promiseTimeout = function(ms, promise){
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      console.log("timeout finished at " + ms + "ms but promise won't reject");
      reject('Timed out in '+ ms + 'ms. - Reject Message')
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

/* ---------------- Code ---------------------- */

//--- var and funtions ----

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

function getFontMetadata(fileList: String[]) {
    return Promise.all(fileList.map(function (fileName) {
        let data = fs.readFileSync('./fonts/' + fileName) || "";
        return new Promise(function (resolve, reject) {

            fontmachine.makeGlyphs({font: data, filetype: '.ttf'}, function(error, font) {
                /* Logs font data to show it exist after the 10 second wait.. */
                if (font != undefined) {console.log(font.name);}
                
                /* Takes 10s to resolve */
                const prolongedPromise = function(){
                    return new Promise((resolve, reject) => {
                        resolve(font)
                    })
                };

                /* Attempting to race promises to get reject to execute on timeout */
                let promiseRace = promiseTimeout(2000, prolongedPromise());
                promiseRace.then(response => {
                    resolve(response);
                }, error => {
                    reject(error);
                }).catch(error => {
                    reject(error);
                })                            
            });
        })
    }))
}


//---execution----

getFontMetadata(getFileList(inDir))
.then(value => {
  console.log('..promise is RESOLVED!! : (' + ' Name:' +  value[0].name + ' Fam:' + value[0].metadata.family_name + ' Style:' + value[0].metadata.style_name); // Promise Resolved!
}, reason => {
    /* Fails if resolve fontmachine directly */
  console.log('Promise REJECTED!! (hopefully from timeout): ' + reason + '\n'); // Promise Rejected!
});



