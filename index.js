
const core = require('@actions/core');
const github = require('@actions/github');
const exec = require("@actions/exec");
const http = require('http');
const fs = require('fs');

try {
    const downloadExLibs = getAndSanitizeInputs('download-exotic-libraries', 'boolean', true);
    const compilerOptsForTests = getAndSanitizeInputs('compiler-options-for-tests', 'array', [ '-pedantic' ]);
    const runCesterRegression = getAndSanitizeInputs('run-cester-regression', 'boolean', true);
    const cesterOpts = getAndSanitizeInputs('cester-options', 'array', [ '--cester-noisolation', '--cester-nomemtest' ]);
    const testFolders = getAndSanitizeInputs('test-folders', 'array', [ 'test/', 'tests/' ]);
    
    if (downloadExLibs === true) {
        if (await downloadExoticLibraries() === false) {
            throw new Error("Failed to download exotic libraries");
        }
    }
    //console.log(`Compiler Options for Tests ${compilerOptsForTests}`);
    //console.log(`Run Cester Regression Tests ${runCesterRegression}`);
    //console.log(`Cester Options ${cesterOpts}`);
    console.log(`Test Folders ${testFolders}`);
    
    /*console.log()
    console.log("Test System")
    exec('mkdir -p /usr/include/exotic/; ls /usr/include/exotic/', (err, stdout, stderr) => {
      if (err) {
        return;
      }

      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
    console.log()*/
    
    
    // after
    core.setOutput("tests-passed", true);
    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

function getAndSanitizeInputs(key, type, defaultValue) {
    var value = core.getInput(key);
    if (!value || value == "") {
        return defaultValue;
    }
    if (type === "boolean") {
        return value.toUpperCase() === "TRUE" || value;
    }
    return value;
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














