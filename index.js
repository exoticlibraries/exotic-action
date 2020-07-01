
const core = require('@actions/core');
const github = require('@actions/github');

try {
    const downloadExoticLibraries = getAndSanitizeInputs('download-exotic-libraries', 'boolean', true);
    
    console.log(`Download Exotic Libraries ${downloadExoticLibraries}!`);
    core.setOutput("tests-passed", true);
    // Get the JSON webhook payload for the event that triggered the workflow
    //const payload = JSON.stringify(github.context.payload, undefined, 2)
    //console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}

function getAndSanitizeInputs(key, type, defaultValue) {
    var value = core.getInput(key);
    if (!value) {
        return defaultValue;
    }
    return value;
}
