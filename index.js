
const core = require('@actions/core');
const github = require('@actions/github');
const exec = require("@actions/exec");
const util = require('util');
const jsexec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();
    
const supportedCompilers = [
    'gcc',
    'clang',
    'tcc'
];
const exoPath = homedir + "/exotic-libraries/";
const exoIncludePath = homedir + "/exotic-libraries/include/";

main();
function main() {
    const downloadExLibs = getAndSanitizeInputs('download-exotic-libraries', 'boolean', true);
    const selectedExoticLibraries = getAndSanitizeInputs('selected-exotic-libraries', 'flatten_string', 'libcester');
    if (downloadExLibs === true) {
        downloadExoticLibraries(selectedExoticLibraries, exoIncludePath, async function(completed) {
            if (completed === true) {
                await afterDownloadDeps(exoIncludePath);
            } else {
                core.setFailed("Failed to download exotic libraries");
                return;
            }
        });
    } else {
        (async function() {
            await afterDownloadDeps(exoIncludePath);
        })()
    }
}

// TODO: treats install-compilers
async function afterDownloadDeps(exoIncludePath) {
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
    const unformatedSelectedArch = getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', "");
    const selectedArchNoFormat = getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', "");
    const selectedArch = formatArch(unformatedSelectedArch);
    
    if (!(await validateAndInstallAlternateCompiler(selectedCompiler, unformatedSelectedArch))) {
        return;
    }
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
        selectedArchNoFormat: selectedArchNoFormat,
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
                console.error("Failed to iterate the test folder: " + folder);
                core.setFailed(error);
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
    var j;
    for (j = 0; j < files.length; ++j) {
        var file = files[j];
        var fullPath = path.join(folder, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (yamlParams.testFolderRecursive === true) {
                await iterateFolderAndExecute(fullPath, params, yamlParams);
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
        } else if (matchesInArray(getAndSanitizeInputs(`test-exclude-file-pattern-${yamlParams.selectedCompiler}`, 'array', [ ]), file)) {
            continue;
        }
        
        let result = selectCompilerExec(yamlParams.selectedArchNoFormat, yamlParams.selectedCompiler, file);
        if (!result) {
            console.log(`The compiler ${yamlParams.selectedCompiler} cannot be used to compile the test ${file}`);
            continue;
        }
        let {
            compiler, 
            specificCompilerOptions
        } = result;
        var outputName = file.replace(/\.[^/.]+$/, "");
        var prefix = "./";
        if (process.platform.startsWith("win")) {
            outputName += ".exe";
            prefix = "";
        }
        params.numberOfTests++;
        console.log(`
===============================================================================================================
${outputName}
Compiler: ${compiler}
Compiler Options: ${yamlParams.compilerOptsForTests}
Runtime Options: ${yamlParams.cesterOpts}
===============================================================================================================
        `)
        var command = `${compiler} ${specificCompilerOptions} ${yamlParams.selectedArch} ${yamlParams.compilerOptsForTests} -I. -I${yamlParams.exoIncludePath} ${fullPath} -o ${outputName}`;
        console.log(command);
        try {
            var { error, stdout, stderr } = await jsexec(command);
            console.log(stdout); console.log(stderr); if (error) { throw error; }
            var { error, stdout, stderr } = await jsexec(`${prefix}${outputName} ${yamlParams.cesterOpts}`);
            console.log(stdout); console.log(stderr); if (error) { throw error; }
            params.numberOfTestsRan++;
            params.regressionOutput += `\nPASSED ${outputName}`;
            try {
                var { error, stdout, stderr } = await jsexec(`rm ${outputName}`);
                console.log(stdout); console.log(stderr); console.log(error);
            } catch (error) { console.log(error) }
        } catch (error) {
            params.numberOfFailedTests++;
            params.numberOfTestsRan++;
            params.regressionOutput += `\nFAILED ${outputName}`;
            console.error("Process Error Code " + (error.code ? error.code : "Unknown"))
            console.error(!error.stdout ? (!error.stderr ? error : error.stderr) : error.stdout);
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
                return {
                    compiler: `C:\\msys64\\mingw${arch}\\bin\\` + ((file.endsWith('cpp') || file.endsWith('c++')) ? "clang++.exe" : "clang.exe"),
                    specificCompilerOptions: ""
                };

            } else {
                return {
                    compiler: ((file.endsWith('cpp') || file.endsWith('c++')) ? "g++.exe" : "gcc.exe"),
                    specificCompilerOptions: ""
                };

            }
            
        } else if (selectedCompiler.startsWith("clang")) {
            return {
                compiler: `C:\\msys64\\mingw${arch}\\bin\\` + ((file.endsWith('cpp') || file.endsWith('c++')) ? "clang++.exe" : "clang.exe"),
                specificCompilerOptions: ""
            };
            
        } else if (selectedCompiler.startsWith("tcc") && file.endsWith('c')) {
            return {
                compiler: `${exoPath}/tcc-win/tcc/tcc.exe`,
                specificCompilerOptions: `-D__BASE_FILE__=\\\"${file}\\\"`
            };

        }

    } else {
        if (selectedCompiler.startsWith("gnu") || selectedCompiler.startsWith("gcc")) {
            return {
                compiler: (file.endsWith('cpp') || file.endsWith('c++') ? "g++" : "gcc"),
                specificCompilerOptions: ""
            };

        } else if (selectedCompiler.startsWith("clang")) {
            return {
                compiler: (file.endsWith('cpp') || file.endsWith('c++') ? "clang++" : "clang"),
                specificCompilerOptions: ""
            };

        } else if (selectedCompiler.startsWith("tcc") && file.endsWith('c')) {
            return {
                compiler: selectedCompiler,
                specificCompilerOptions: ""
            };

        }
    }
}

async function validateAndInstallAlternateCompiler(selectedCompiler, arch) {
    if (!supportedCompilers.includes(selectedCompiler)) {
        core.setFailed("Exotic Action does not support the compiler '" + selectedCompiler + "'");
        return false;
    }
    if (selectedCompiler === "tcc") {
        if (process.platform === "linux" && (arch === "x64" || arch === "x86_64")) {
            var { error, stdout, stderr } = await jsexec('sudo apt-get install -y tcc');
            console.log(stdout); console.log(stderr); console.log(error);
            return true;

        } else if (process.platform === "win32") {
            if (!fs.existsSync(exoPath)){
                fs.mkdirSync(exoPath, { recursive: true });
            }
            if (arch.startsWith("x") && arch.endsWith("64")) {
                var { error, stdout, stderr } = await jsexec(`powershell -Command "Invoke-WebRequest -uri 'https://download.savannah.nongnu.org/releases/tinycc/tcc-0.9.27-win64-bin.zip' -Method 'GET'  -Outfile '${exoPath}/tcc-win.zip'"`);
                console.log(stdout); console.log(stderr); console.log(error);

            } else if (arch === "x86" || arch == "i386") {
                var { error, stdout, stderr } = await jsexec(`powershell -Command "Invoke-WebRequest -uri 'https://download.savannah.nongnu.org/releases/tinycc/tcc-0.9.27-win32-bin.zip' -Method 'GET'  -Outfile '${exoPath}/tcc-win.zip'"`);
                console.log(stdout); console.log(stderr); console.log(error);

            } else {
                console.log(`The compiler '${selectedCompiler} not supported on this platform '${process.platform}:${arch}'`);
                return false;
            }
            var { error, stdout, stderr } = await jsexec(`powershell -Command "Expand-Archive '${exoPath}/tcc-win.zip' -DestinationPath '${exoPath}/tcc-win' -Force"`);
            console.log(stdout); console.log(stderr); console.log(error);
            return true;

        } else {
            console.log(`The compiler '${selectedCompiler} not supported on this platform '${process.platform}:${arch}'`);
            return false;
        }
    }
    return false;
}

function formatArch(selectedArch) {
    if (selectedArch.startsWith("x") && selectedArch.endsWith("64")) { //x64 and x86_64 - 64 bits
        return "-m64";
    } else if (selectedArch === "x86" || selectedArch == "i386") { //x86 - 32 bits
        if (process.platform === "darwin") { // The i386 architecture is deprecated for macOS
            return "-m64";
        }
        return "-m32";
    } else {
        return "-march=" + selectedArch;
    }
}

function downloadExoticLibraries(selectedLibs, exoIncludePath, callback) {
    var command1 = "", command2 = "";
    const selectedArch = getAndSanitizeInputs('the-matrix-arch-internal-use-only', 'string', "");
    
    console.log("Downloading Exotic Libraries...");
    if (!fs.existsSync(exoIncludePath)){
        fs.mkdirSync(exoIncludePath, { recursive: true });
    }
    if (process.platform === "linux" || process.platform === "darwin") {
        command1 = `curl -s https://exoticlibraries.github.io/magic/install.sh -o exotic-install.sh`
        command2 = `bash ./exotic-install.sh --installfolder=${exoIncludePath} ${selectedLibs}`;
        
    } else if (process.platform === "win32") {
        command1 = `powershell -Command "& $([scriptblock]::Create((New-Object Net.WebClient).DownloadString('https://exoticlibraries.github.io/magic/install.ps1')))" --InstallFolder=${exoIncludePath} ${selectedLibs}`;
        
    } else {
        console.error("Exotic Action is not supported on this platform '" + process.platform + " " + selectedArch + "'")
        callback(false);
        return;
    }
    console.log(command1);
    console.log(command2);
    exec.exec(command1).then((result) => {
        if (result === 0) {
            if (command2 !== "") {
                exec.exec(command2).then((result) => {
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
        } else {
            callback(false);
        }
    }).catch((error) => {
        console.error(error);
        callback(false);
    });
}













