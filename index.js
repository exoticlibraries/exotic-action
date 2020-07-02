
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
        const selectedCompiler = getAndSanitizeInputs('the-matrix-compiler-internal-use-only', 'string', "");
        const selectedArch = formatArch(getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', ""));

        if (downloadExLibs === true) {
            if (await downloadExoticLibraries() === false) {
                throw new Error("Failed to download exotic libraries");
            }
        }
        if (runCesterRegression === true && selectedCompiler !== "" && selectedArch !== "") {
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
                        var skip = true;
                        testFilePatterns.forEach(function (pattern, index) {
                            if (new RegExp(pattern).test(file)) {
                                skip = false;
                                return false;
                            }
                        });
                        if (skip === true) { return; }
                        testExludeFilePatterns.forEach(function (pattern, index) {
                            if (new RegExp(pattern).test(file)) {
                                skip = true;
                                return false;
                            }
                        });
                        if (skip === true) { return; }
                        
                        var fullPath = path.join(folder, file);
                        var outputName = "out";
                        console.log("Running test: " + fullPath);
                        console.log("The compiler: " + selectedCompiler);
                        console.log("The arch: " + selectedArch);
                        //gcc test/test_no_assert.c -I. -o out; ./out
                        var command = `${selectedCompiler} ${selectedArch} ${compilerOptsForTests} ${fullPath} -o ${outputName}; ./${outputName} ${cesterOpts}`;
                        console.log(command)
                        //await exec.exec()
                    });
                });
            });
        }


        // after
        core.setOutput("tests-passed", true);
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
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

function formatArch(selectedArch) {
    if (selectedArch == "x64") {
        return "-m64";
    } else if (selectedArch == "x86") {
        return "-m32";
    } else {
        return "-march=" + selectedArch;
    }
}

async function downloadExoticLibraries() {
    console.log("Downloading Exotic Libraries...")
    if (process.platform === "linux" || process.platform === "darwin") {
        await exec.exec("bash " + __dirname + "/../scripts/install.sh " + process.platform);
    } else {
        console.error("Exotic Action is not supported on this platform '" + process.platform + "'")
        return false;
    }
    return true;
}














