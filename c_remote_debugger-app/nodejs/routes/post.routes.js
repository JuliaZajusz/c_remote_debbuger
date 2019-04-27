

const express = require('express')
const router = express.Router()
const post = require('../models/post.model')
const m = require('../helpers/middlewares')

router.post('/openProgram', function (req, res){

    var result = post.openProgram(req.body);
    res.json({response: result});

})

router.post('/setLineBreakpoint', function (req, res){

    var result = post.setLineBreakpoint(req.body);
    res.json({response: result});

})

router.post('/continueExecution', function (req, res){

    var result = post.continueExecution(req.body);
    res.json({response: result});

})

router.post('/showVariables', function (req, res){

    var result = post.showVariables(req.body);
    res.json({response: result});

})


router.post('/checkoutput', function(req, res){

    var result = post.checkOutput(req.body);

    res.json({response: result});
})

module.exports = router