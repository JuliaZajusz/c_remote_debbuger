let posts = require('../data/posts.json')
const filename = './data/posts.json'
const helper = require('../helpers/helper.js')
const shell = require('shelljs')
var fs = require('fs');
const exec = require('child_process').exec;
var outputArray = [];
var programProcess;

function openProgram(body){
    
    console.log(body);
    programProcess = exec(`./../cpp/minidbg ./../cpp/` + body.filename);
    
    programProcess.stdout.on('data', function(data){

        outputArray.push(data); 
        console.log('im in the data function');
        console.log(data);
        
    });

    programProcess.stderr.on('data', function(data){
        
        outputArray.push(data); 
        console.log('im in the err function');
        console.log(data);
        
    });

    return "program started";

}

function readSource(body)
{
    
    var contents = fs.readFileSync('./../cpp/examples/' +body.filename+'.cpp', 'utf8');
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




function checkOutput()
{
    var result = outputArray;
    outputArray = [];
    return result;
}

function postFile(data) {
    fs.writeFile("/", data.file, function (err) {
        console.log("err ", err)
        // Do something with the data (which holds the file information)
    });
}

module.exports = {
    postFile,
    openProgram,
    checkOutput,
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
