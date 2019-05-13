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
 

io.on('connection', function(socket) {

  socket.on('openProgram', function(data) {
    console.log('openprogram received');
    programProcess = exec(`./../cpp/minidbg ./../cpp/` + data);
    post.setProgramProcess(programProcess);

    programProcess.stdout.on('data', function(data){


        io.emit('serverMessage', data);
        console.log('im in the data function');
        console.log(data);

    });

    programProcess.stderr.on('data', function(data){


        io.emit('serverMessage', data);
        console.log('im in the err function');
        console.log(data);

    });
  console.log('assigned');

	});
});

// app.get("/", express.static(path.join(__dirname, "./public")));
