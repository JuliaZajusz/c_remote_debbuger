// Import packages
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
// App
const app = express()
// Morgan
app.use(cors());
app.options('*', cors());
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(require('./routes/index.routes'))
app.use(function(req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
  
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
    next();
  
  });
// First route
app.get('/', (req, res) => {
    res.sendfile('dbg.html')
})
// Starting server
app.listen('1337')