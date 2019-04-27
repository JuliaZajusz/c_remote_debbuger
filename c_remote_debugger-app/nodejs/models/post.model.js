let posts = require('../data/posts.json')
const filename = './data/posts.json'
const helper = require('../helpers/helper.js')
const shell = require('shelljs')
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

function setLineBreakpoint(body)
{
    var line = body.line; 
    programProcess.stdin.write('b :'+line+' \n');
    return 'breakpoint request complete';

}

function continueExecution(body)
{
    programProcess.stdin.write('c \n');
    return 'continue request complete';

}

function showVariables(body)
{
    programProcess.stdin.write('variables \n');
    return 'variable request complete';

}


function checkOutput()
{
    var result = outputArray;
    outputArray = [];
    return result;
}

module.exports = {   
    openProgram,
    checkOutput,
    continueExecution,
    showVariables,
    setLineBreakpoint
}
