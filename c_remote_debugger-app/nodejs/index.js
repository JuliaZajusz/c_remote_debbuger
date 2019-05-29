// Import packages
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const post = require('./models/post.model')
// App
const app = express()
const exec = require('child_process').exec;
// Morgan
app.use(cors());
app.options('*', cors());
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes/index.routes'))
app.use(express.static(__dirname));
app.use(function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
  
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
    next();
  
  });
// First route
app.get('/', (req, res) => {
    res.sendFile(__dirname +'/dbg.html')
})
// Starting server
var server = app.listen('1337')
const io = require('socket.io')(server);

const util = require('util');
const execPromisify = util.promisify(require('child_process').exec);

async function compileFile(fileName, executeFileName) {
    const { stdout, stderr } = await execPromisify(`gcc -g ./public/uploads/${fileName} -o ./public/uploads/${executeFileName} -lstdc++ -gdwarf-2 -O0`);
    console.log('stdout:', stdout);
    if(stderr) {
        console.log('stderr:', stderr);
    }
}

io.on('connection', function(socket) {

  socket.on('openProgram', async function (data) {
      console.log('openprogram received');
      var executeFileName = data.split('.').slice(0, -1).join('.');
      await compileFile(data, executeFileName);
      programProcess = exec(`./../cpp/minidbg ./public/uploads/${executeFileName}`);
      post.setProgramProcess(programProcess);

      programProcess.stdout.on('data', function (data) {


          io.emit('serverMessage', data);
          console.log('im in the data function');
          console.log(data);

      });

      programProcess.stderr.on('data', function (data) {


          io.emit('serverMessage', data);
          console.log('im in the err function');
          console.log(data);

      });
      console.log('assigned');

  });
});

// app.get("/", express.static(path.join(__dirname, "./public")));
