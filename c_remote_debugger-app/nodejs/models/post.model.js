let posts = require('../data/posts.json')
const filename = './data/posts.json'
const helper = require('../helpers/helper.js')
const shell = require('shelljs')
var fs = require('fs');
// const exec = require('child_process').exec;
var outputArray = [];
var programProcess;


function readSource(body)
{
console.log("body", body)
    var contents = fs.readFileSync('./public/uploads/' +body.filename, 'utf8');
    return contents;
}

function manualInput(body)
{
    var maninput = body.maninput; 
    programProcess.stdin.write(maninput+'\n');
    return 'manual input request complete';

}

function setLineBreakpoint(body)
{
    var line = body.line; 
    programProcess.stdin.write('b :'+line+' \n');
    return 'breakpoint line request complete';

}

function setAddresBreakpoint(body)
{
    var addres = body.addres; 
    programProcess.stdin.write('b 0x'+addres+' \n');
    return 'breakpoint addres request complete';

}

function continueExecution(body)
{
    programProcess.stdin.write('cont \n');
    return 'continue request complete';

}

function stepExecution(body)
{
    programProcess.stdin.write('step \n');
    return 'step request complete';

}

function nextExecution(body)
{
    programProcess.stdin.write('next \n');
    return 'next request complete';

}

function stepOutExecution(body)
{
    programProcess.stdin.write('stepOut \n');
    return 'finish request complete';

}

function finishExecution(body)
{
    programProcess.stdin.write('finish \n');
    return 'finish request complete';

}

function showVariables(body)
{
    programProcess.stdin.write('variables \n');
    return 'variable request complete';

}

function showRegisters(body)
{
    programProcess.stdin.write('register dump \n');
    return 'register request complete';

}

function setProgramProcess(process)
{
    programProcess = process;
}

module.exports = {
    stepOutExecution,
    setProgramProcess,
    continueExecution,
    stepExecution,
    nextExecution,
    finishExecution,
    showVariables,
    showRegisters,
    manualInput,
    setLineBreakpoint,
    setAddresBreakpoint,
    readSource
}
