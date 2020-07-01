
const core = require('@actions/core');
const github = require('@actions/github');
const { exec, spawnSync } = require('child_process');
const http = require('http');
const fs = require('fs');

try {
    const downloadExLibs = getAndSanitizeInputs('download-exotic-libraries', 'boolean', true);
    const compilerOptsForTests = getAndSanitizeInputs('compiler-options-for-tests', 'array', [ '-pedantic' ]);
    const runCesterRegression = getAndSanitizeInputs('run-cester-regression', 'boolean', true);
    const cesterOpts = getAndSanitizeInputs('cester-options', 'array', [ '--cester-noisolation', '--cester-nomemtest' ]);
    const testFolders = getAndSanitizeInputs('test-folders', 'array', [ 'test/', 'tests/' ]);
    
    if (downloadExLibs === true) {
        if (downloadExoticLibraries() === false) {
            throw new Error("Failed to download exotic libraries");
        }
    }
    console.log(`Compiler Options for Tests ${compilerOptsForTests}`);
    console.log(`Run Cester Regression Tests ${runCesterRegression}`);
    console.log(`Cester Options ${cesterOpts}`);
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

function downloadExoticLibraries() {
    var headerPath = "";
    var libsPath = "";
    if (process.platform === "linux") {
        headerPath = "/usr/include/exotic/"
        libsPath = "/usr/lib/exotic/"
    } else {
        console.error("Exotic Action is not supported on this platform '" + process.platform + "'")
        return false;
    }
    
    
    console.log(headerPath)
    /*if (!fs.existsSync(headerPath)) {
        if (!fs.mkdirSync(headerPath, { recursive: true })) {
            console.error("Failed to create libraries folder please open an issue at https://github.com/exoticlibraries/exotic-action")
            return false;
        }
    }
    console.log(libsPath)
    if (!fs.existsSync(libsPath) || !fs.existsSync(libsPath)) {
        console.error("Failed to create libraries folder please open an issue at https://github.com/exoticlibraries/exotic-action")
        return false;
    }*/
    
    console.log("Downloading Exotic Libraries...")
    
    exec('bash <(curl -s https://exoticlibraries.github.io/libcester/cester.sh)', (err, stdout, stderr) => {
      if (err) {
        return;
      }

      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
    
    /*console.log("libcester...")
    downloadSingleFile("cester.h", 
                          "http://raw.githubusercontent.com/exoticlibraries/libcester/master/include/exotic/cester.h",
                          headerPath)*/
    
    return true;
}

function downloadSingleFile(fileName, downloadPath, installationPath) {
    const file = fs.createWriteStream(installationPath + "/" + fileName);
    const request = http.get(downloadPath, function(response) {
        response.pipe(file);
    });
}














