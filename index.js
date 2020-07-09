
const core = require('@actions/core');
const github = require('@actions/github');
const exec = require("@actions/exec");
const util = require('util');
const jsexec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();

main();
function main() {
    const downloadExLibs = getAndSanitizeInputs('download-exotic-libraries', 'boolean', true);
    if (downloadExLibs === true) {
        downloadExoticLibraries(async function(completed) {
            if (completed === true) {
                await afterDownloadDeps();
            } else {
                core.setFailed("Failed to download exotic libraries");
                return;
            }
        });
    } else {
        (async function() {
            await afterDownloadDeps();
        })()
    }
}

// TODO: treats install-compilers
async function afterDownloadDeps() {
    const compilerOptsForTests = getAndSanitizeInputs('compiler-options-for-tests', 'flatten_string', '-pedantic');
    const runCesterRegression = getAndSanitizeInputs('run-regression', 'boolean', true);
    const cesterOpts = getAndSanitizeInputs('regression-cli-options', 'flatten_string', ['--cester-verbose --cester-nomemtest', '--cester-printversion']);
    const testFolders = getAndSanitizeInputs('test-folders', 'array', [ 'test/', 'tests/' ]);
    const testFolderRecursive = getAndSanitizeInputs('test-folder-recursive', 'boolean', false);
    const testFilePatterns = getAndSanitizeInputs('test-file-pattern', 'array', [ '^test_', '_test[.c](c\+\+|cpp|c)' ]);
    const testExludeFilePatterns = getAndSanitizeInputs('test-exclude-file-pattern', 'array', [ ]);
    const testExludeFilePatternsx86 = getAndSanitizeInputs('test-exclude-file-pattern-x86', 'array', [ ]);
    const testExludeFilePatternsx64 = getAndSanitizeInputs('test-exclude-file-pattern-x64', 'array', [ ]);
    const testExludeFilePatternsxMacOS = getAndSanitizeInputs('test-exclude-file-pattern-macos', 'array', [ ]);
    const testExludeFilePatternsxLinux = getAndSanitizeInputs('test-exclude-file-pattern-linux', 'array', [ ]);
    const testExludeFilePatternsxWindows = getAndSanitizeInputs('test-exclude-file-pattern-windows', 'array', [ ]);
    const selectedCompiler = getAndSanitizeInputs('the-matrix-compiler-internal-use-only', 'string', "");
    const selectedArch = formatArch(getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', ""));
    const selectedArchNoFormat = getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', "");
    const exoIncludePath = homedir + "/.yo/include/";
    
    var params = {
        numberOfTestsRan: 0,
        numberOfFailedTests: 0,
        numberOfTests: 0,
        regressionOutput: "",
        selectedArchNoFormat: selectedArchNoFormat
    }
    var yamlParams = {
        compilerOptsForTests: compilerOptsForTests,
        cesterOpts: cesterOpts,
        testFolderRecursive: testFolderRecursive,
        testFilePatterns: testFilePatterns,
        testExludeFilePatterns: testExludeFilePatterns,
        testExludeFilePatternsx86: testExludeFilePatternsx86,
        testExludeFilePatternsx64: testExludeFilePatternsx64,
        testExludeFilePatternsxMacOS: testExludeFilePatternsxMacOS,
        testExludeFilePatternsxLinux: testExludeFilePatternsxLinux,
        testExludeFilePatternsxWindows: testExludeFilePatternsxWindows,
        selectedCompiler: selectedCompiler,
        exoIncludePath: exoIncludePath,
        selectedArch: selectedArch
    }
    if (runCesterRegression === true && selectedCompiler !== "" && selectedArch !== "" && (testFolders instanceof Array)) {
        var i;
        var j;
        var k;
        for (i = 0; i < testFolders.length; i++) {
            var folder = testFolders[i];
            if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
                core.setFailed("The test folder does not exist: " + folder);
                break;
            }
            try {
                await iterateFolderAndExecute(folder, params, yamlParams);
            } catch (error) {
                console.error(error);
                core.setFailed("Failed to iterate the test folder: " + folder);
                break;
            }
        }
        reportProgress(params);
    }
}

async function iterateFolderAndExecute(folder, params, yamlParams) {
    var files = fs.readdirSync(folder);
    if (!files) {
      core.setFailed("Could not list the content of test folder: " + folder);
      reportProgress(params);
      return;
    }
    for (j = 0; j < files.length; ++j) {
        var file = files[j];
        var fullPath = path.join(folder, file);
        console.log("File is : " + file);
        if (fs.lstatSync(file).isDirectory()) {
            Console.log("In folder " + file);
            if (yamlParams.testFolderRecursive === true) {
                iterateFolderAndExecute(file, params, yamlParams);
            }
            continue;
        }
        if (!matchesInArray(yamlParams.testFilePatterns, file)) {
            continue;
        }
        if (matchesInArray(yamlParams.testExludeFilePatterns, file)) {
            continue;
        }
        if (yamlParams.selectedArchNoFormat == "x86") {
            if (matchesInArray(yamlParams.testExludeFilePatternsx86, file)) {
                continue;
            }
        }
        if (yamlParams.selectedArchNoFormat.indexOf("x64") !== -1) {
            if (matchesInArray(yamlParams.testExludeFilePatternsx64, file)) {
                continue;
            }
        }
        if (process.platform === "darwin") {
            if (matchesInArray(yamlParams.testExludeFilePatternsxMacOS, file)) {
                continue;
            }
        } else if (process.platform === "linux") {
            if (matchesInArray(yamlParams.testExludeFilePatternsxLinux, file)) {
                continue;
            }
        } else if (process.platform.startsWith("win")) {
            if (matchesInArray(yamlParams.testExludeFilePatternsxWindows, file)) {
                continue;
            }
        }
        
        params.numberOfTests++;
        var compiler = selectCompilerExec(yamlParams.selectedArchNoFormat, yamlParams.selectedCompiler, file);
        var outputName = file.replace(/\.[^/.]+$/, "");
        var prefix = "./";
        if (process.platform.startsWith("win")) {
            outputName += ".exe";
            prefix = "";
        }
        var command = `${compiler} ${yamlParams.selectedArch} ${yamlParams.compilerOptsForTests} -I. -I${yamlParams.exoIncludePath} ${fullPath} -o ${outputName}`;
        try {
            var { stdout, stderr } = await jsexec(command);
            console.log(stdout); console.log(stderr);
            console.log(command);
            var { stdout, stderr } = await jsexec(`${prefix}${outputName} ${yamlParams.cesterOpts}`);
            console.log(stdout); console.log(stderr);
            var { stdout, stderr } = await jsexec(`rm ${outputName}`);
            console.log(stdout); console.log(stderr);
            params.numberOfTestsRan++;
            params.regressionOutput += `\nPASSED ${outputName}`;
        } catch (error) {
            params.numberOfFailedTests++;
            params.numberOfTestsRan++;
            params.regressionOutput += `\nFAILED ${outputName}`;
            console.error(!error.stdout ? (!error.stderr ? "" : error.stderr) : error.stdout);
            if ((!error.stdout && !error.stderr) || (error.stdout.toString().indexOf("test") === -1 && 
                                                     error.stderr.toString().indexOf("test") === -1)) {
                console.error(error);
            }
        }
    }
}

/**
    This might fail to callthe afterAll 
    function though no case now, but case 
    is expected in future.
*/
function reportProgress(params) {
    if (params.numberOfTestsRan === params.numberOfTests) {
        afterAll(params);
    }
}

function afterAll(params) {
    try {
        const runCesterRegression = getAndSanitizeInputs('run-regression', 'boolean', true);
        
        core.setOutput("tests-passed", (params.numberOfFailedTests === 0));
        core.setOutput("tests-count", params.numberOfTests);
        core.setOutput("failed-tests-count", params.numberOfFailedTests);
        core.setOutput("passed-tests-count", params.numberOfTests - params.numberOfFailedTests);    
        
        // compilers paths
        core.setOutput("win32-clang-gcc-folder", "C:\\msys64\\" + ((params.selectedArchNoFormat === "x86") ? "mingw32" : "mingw64") + "\\bin\\");        
        if (runCesterRegression === true) {
            var percentagePassed = Math.round((100 * (params.numberOfTests - params.numberOfFailedTests)) / params.numberOfTests);
            console.log("Regression Result:")
            console.log(params.regressionOutput);
            console.log(`${percentagePassed}% tests passed, ${params.numberOfFailedTests} tests failed out of ${params.numberOfTests}`);
            if (params.numberOfTests !== 0 && params.numberOfFailedTests !== 0) {
                throw new Error("Regression test fails. Check the log above for details");
            }
        }

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        //console.log(`The event payload: ${payload}`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

function matchesInArray(patternArray, text) {
    var k;
    for (k = 0; k < patternArray.length; k++) {
        var pattern = patternArray[k];
        //console.log(" <==>" + file + " in " + pattern + " is " + (new RegExp(pattern).test(file)));
        if (new RegExp(pattern).test(text)) {
            return true;
        }
    }
    return false;
}

function getAndSanitizeInputs(key, type, defaultValue) {
    var value = core.getInput(key);
    if (!value || value == "") {
        return defaultValue;
    }
    if (type === "boolean") {
        return value.toUpperCase() === "TRUE" || value;
    }
    if (type === "flatten_string") {
        return value.split('\n').join(' ');
    }
    if (type === "array" && (typeof value == "string")) {
        return strToArray(value, '\n');
    }
    return value;
}

function strToArray(str, seperator) {
    return str.split(seperator);
}

function selectCompilerExec(selectedArchNoFormat, selectedCompiler, file) {
    if (process.platform.startsWith("win")) {
        var arch = "64";
        if (selectedArchNoFormat === "x86") {
            arch = "32";
        }
        if (selectedCompiler.startsWith("gnu") || selectedCompiler.startsWith("gcc")) {
            if (selectedArchNoFormat === "x86") {
                return `C:\\msys64\\mingw${arch}\\bin\\` + ((file.endsWith('cpp') || file.endsWith('c++')) ? "clang++.exe" : "clang.exe");
            } else {
                return ((file.endsWith('cpp') || file.endsWith('c++')) ? "g++.exe" : "gcc.exe");
            }
            
        } else if (selectedCompiler.startsWith("clang")) {
            return `C:\\msys64\\mingw${arch}\\bin\\` + ((file.endsWith('cpp') || file.endsWith('c++')) ? "clang++.exe" : "clang.exe");
            
        }
    } else {
        if (selectedCompiler.startsWith("gnu") || selectedCompiler.startsWith("gcc")) {
            return (file.endsWith('cpp') || file.endsWith('c++') ? "g++" : "gcc");
        } else if (selectedCompiler.startsWith("clang")) {
            return (file.endsWith('cpp') || file.endsWith('c++') ? "clang++" : "clang");
        }
    }
}

function formatArch(selectedArch) {
    if (selectedArch == "x64" || selectedArch.endsWith("x64")) {
        return "-m64";
    } else if (selectedArch == "x86") {
        if (process.platform === "darwin") { // The i386 architecture is deprecated for macOS
            return "-m64";
        }
        return "-m32";
    } else {
        return "-march=" + selectedArch;
    }
}

function downloadExoticLibraries(callback) {
    var command = "";
    const selectedArch = getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', "");
    const selectedCompiler = getAndSanitizeInputs('the-matrix-compiler-internal-use-only', 'string', "");
    
    console.log("Downloading Exotic Libraries...")
    if (process.platform === "linux" || process.platform === "darwin") {
        command = "bash " + __dirname + "/../scripts/install.sh " + process.platform + " " + selectedArch + " " + selectedCompiler;
        
    } else if (process.platform === "win32") {
        command = "powershell " + __dirname + "/../scripts/install.ps1 " + process.platform + " " + selectedArch + " " + selectedCompiler;
        
    } else {
        console.error("Exotic Action is not supported on this platform '" + process.platform + " " + selectedArch + "'")
        callback(false);
        return;
    }
    console.log(command);
    exec.exec(command).then((result) => {
        if (result === 0) {
            callback(true);
        } else {
            callback(false);
        }
    }).catch((error) => {
        console.error(error);
        callback(false);
    });
}













