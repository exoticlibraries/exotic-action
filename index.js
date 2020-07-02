
const core = require('@actions/core');
const github = require('@actions/github');
const exec = require("@actions/exec");
const fs = require('fs');
var path = require('path');

(async function() {
    try {
        const downloadExLibs = getAndSanitizeInputs('download-exotic-libraries', 'boolean', true);
        const compilerOptsForTests = getAndSanitizeInputs('compiler-options-for-tests', 'array', [ '-pedantic' ]);
        const runCesterRegression = getAndSanitizeInputs('run-cester-regression', 'boolean', true);
        const cesterOpts = getAndSanitizeInputs('cester-options', 'array', [ '--cester-noisolation', '--cester-nomemtest' ]);
        const testFolders = getAndSanitizeInputs('test-folders', 'array', [ 'test/', 'tests/' ]);
        const testFilePatterns = getAndSanitizeInputs('test-file-pattern', 'array', [ '^test_', '_test[.c](c\+\+|cpp|c)' ]);
        const testExludeFilePatterns = getAndSanitizeInputs('test-exclude-file-pattern', 'array', [ 'mock+' ]);

        if (downloadExLibs === true) {
            if (await downloadExoticLibraries() === false) {
                throw new Error("Failed to download exotic libraries");
            }
        }
        if (runCesterRegression === true) {
            console.log(`Test Folders ${testFolders} ~~ ` + (testFolders instanceof Array));
            testFolders.forEach(function (folder, index) {
                if (!fs.existsSync(folder)) {
                    throw new Error("The test folder does not exist: " + folder);
                }
                fs.readdir(folder, function (err, files) {
                    if (err) {
                      throw new Error("Could not list the content of test folder: " + folder);
                    }
                    files.forEach(function (file, index) {
                        var skip = false;
                        console.log("For: " + file)
                        testFilePatterns.forEach(function (pattern, index) {
                            console.log("Pattern: "+pattern);
                            if (!new RegExp(pattern).test(file)) {
                                skip = true;
                                return false;
                            }
                        });
                        console.log("1: " + skip);
                        if (skip === true) { return; }
                        testExludeFilePatterns.forEach(function (pattern, index) {
                            console.log("Exclude Pattern: "+pattern);
                            if (new RegExp(pattern).test(file)) {
                                skip = true;
                                return false;
                            }
                        });
                        console.log("2: " + skip);
                        if (skip === true) { return; }
                        
                        var fullPath = path.join(folder, file);
                        console.log(fullPath);
                    });
                });
            });
        }


        // after
        core.setOutput("tests-passed", true);
        // Get the JSON webhook payload for the event that triggered the workflow
        //const payload = JSON.stringify(github.context.payload, undefined, 2)
        //console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
})()


function getAndSanitizeInputs(key, type, defaultValue) {
    var value = core.getInput(key);
    if (!value || value == "") {
        return defaultValue;
    }
    if (type === "boolean") {
        return value.toUpperCase() === "TRUE" || value;
    }
    if (type === "array" && (typeof value == "string")) {
        return strToArray(value, '\n');
    }
    return value;
}

function strToArray(str, seperator) {
    return str.split(seperator);
}

async function downloadExoticLibraries() {
    console.log("Downloading Exotic Libraries...")
    if (process.platform === "linux") {
        await exec.exec("bash " + __dirname + "/../scripts/install.sh");
    } else {
        console.error("Exotic Action is not supported on this platform '" + process.platform + "'")
        return false;
    }
    return true;
}














