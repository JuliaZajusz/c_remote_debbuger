

const express = require('express')
const router = express.Router()
const post = require('../models/post.model')
const m = require('../helpers/middlewares')

router.post('/readSource', function (req, res){

    var result = post.readSource(req.body);
    res.json({response: result});

})

router.post('/openProgram', function (req, res){

    var result = post.openProgram(req.body);
    res.json({response: result});

})

router.post('/setLineBreakpoint', function (req, res){

    var result = post.setLineBreakpoint(req.body);
    res.json({response: result});

})

router.post('/setAddresBreakpoint', function (req, res){

    var result = post.setAddresBreakpoint(req.body);
    res.json({response: result});

})


router.post('/continueExecution', function (req, res){

    var result = post.continueExecution(req.body);
    res.json({response: result});

})

router.post('/stepExecution', function (req, res){

    var result = post.stepExecution(req.body);
    res.json({response: result});

})

router.post('/nextExecution', function (req, res){

    var result = post.nextExecution(req.body);
    res.json({response: result});

})

router.post('/finishExecution', function (req, res){

    var result = post.finishExecution(req.body);
    res.json({response: result});

})


router.post('/showVariables', function (req, res){

    var result = post.showVariables(req.body);
    res.json({response: result});

})

router.post('/showRegisters', function (req, res){

    var result = post.showRegisters(req.body);
    res.json({response: result});

})

router.post('/manualInput', function (req, res){

    var result = post.manualInput(req.body);
    res.json({response: result});

})


// router.post('/checkoutput', function(req, res){
//
//     var result = post.checkOutput(req.body);
//
//     res.json({response: result});
// })

//load file
const multer = require("multer");

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
}).single("uploadedFile");


router.post("/postFile", (req, res) => {
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end(req.file && req.file.originalname);
    });
})


module.exports = router