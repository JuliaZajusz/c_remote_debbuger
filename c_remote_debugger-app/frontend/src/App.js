import React from 'react';
import './App.css';
import AceEditor from 'react-ace';
import Button from "@material-ui/core/Button";
import 'brace/mode/java';
import 'brace/theme/dracula';
import {loadFile, readFile, runDbg, sendFile} from "./services/dbgService";
import Input from "@material-ui/core/Input";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            file: null
        }
        this.onFormSubmit = this.onFormSubmit.bind(this)
        this.onChange = this.onChange.bind(this)
        this.fileUpload = this.fileUpload.bind(this)
    }

    onFormSubmit(e) {
        e.preventDefault() // Stop form submit
        this.fileUpload(this.state.file)
    }

    onChange(e) {
        this.setState({file: e.target.files[0]})
    }

    fileUpload(file) {
        const url = 'http://example.com/file-upload';
        const formData = new FormData();
        formData.append('file', file)
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        console.log(file, url, formData, config)
        sendFile(file, formData).then((response) => {
            console.log(response.data);
        })
        // return  post(url, formData,config)
    }

    manInputBtnClick(val) {
        // var manInput = $('#manualInput').val();
        //
        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/manualInput",
        //     method: "POST",
        //     data:{
        //         manInput:manInput
        //     },
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    setBreakpointBtnClick(val) {
        // var debugLine = $('#debugLine').val();
        //
        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/setLineBreakpoint",
        //     method: "POST",
        //     data:{
        //         line:debugLine
        //     },
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    setBreakpointAddresBtnClick(val) {
        // var debugAddres = $('#debugAddres').val();
        //
        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/setAddresBreakpoint",
        //     method: "POST",
        //     data:{
        //         addres:debugAddres
        //     },
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    continueBtnClick(val) {

        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/continueExecution",
        //     method: "POST",
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    stepBtnClick(val) {

        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/stepExecution",
        //     method: "POST",
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    nextBtnClick(val) {

        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/nextExecution",
        //     method: "POST",
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    finishBtnClick(val) {
        //
        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/finishExecution",
        //     method: "POST",
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    showVariablesBtnClick(val) {
        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/showVariables",
        //     method: "POST",
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    showRegistersBtnClick = (val) => {
        // var programName = $('#programName').val();
        //
        // $.ajax({
        //     url: "http://localhost:1337/api/v1/posts/showRegisters",
        //     method: "POST",
        //     success: function(data, state){
        //         console.log(data);
        //     },
        //     error: function(data, state){
        //         console.log('failure');
        //         console.log(data);
        //         console.log(state);
        //     }
        // });
    }


    openBtnClick(val) {
        runDbg(val).then(
            () => {
                readFile(val)
            }
        )
        // $('#output').html('');
        // readFile();
    }

// function checkOutputBtnClick(val){
//
//
//     // $.ajax({
//     //     url: "http://localhost:1337/api/v1/posts/checkoutput",
//     //     method: "POST",
//     //     success: function(data, state){
//     //         for(var i = 0; i< data.response.length; i++)
//     //         {
//     //             var str = data.response[i];
//     //             var breaks = str.replace(/\r\n|\r|\n/g,"<br>")
//     //             $('#output').append(breaks);
//     //             console.log(data);
//     //         }
//     //     },
//     //     error: function(data, state){
//     //         console.log('failure');
//     //         console.log(data);
//     //         console.log(state);
//     //     }
//     // });
// }

// setInterval(checkOutputBtnClick, 100);
// function readFile(val){
//     // var programName = $('#programName').val();
//     //
//     // $.ajax({
//     //     url: "http://localhost:1337/api/v1/posts/readSource",
//     //     method: "POST",
//     //     data:{
//     //         filename:programName
//     //     },
//     //     success: function(data, state){
//     //         console.log(data);
//     //         editor.setSession(new EditSession(data.response));
//     //
//     //     },
//     //     error: function(data, state){
//     //         console.log('failure');
//     //         console.log(data);
//     //         console.log(state);
//     //     }
//     // });
// }

    const
    doLoadFile = () => {
        loadFile("nazwa_p").then((res) => console.log("wgrales plik", res))

    }


    render() {
        return (
            <div className="App">
                <div style={styles.root}>
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                            <Paper style={styles.paper}>
                                <h1>Remote debugger</h1>
                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper style={styles.paper}>
                                <Grid container spacing={24}>
                                    <Grid item xs={24}>
                                        <form onSubmit={this.onFormSubmit}>
                                            <h1>File Upload</h1>
                                            <input type="file" onChange={this.onChange}/>
                                            <button type="submit">Upload</button>
                                        </form>
                                    </Grid>
                                    <Grid item xs={24}>
                                        Program name:
                                        <Input id="programName"/>
                                        <Button variant="contained" id="openBtn" className="btn btn-primary btn-sm"
                                                onClick={() => this.openBtnClick()}>open</Button>
                                    </Grid>
                                    <Grid item xs={24}>
                                    <span id="normaltext"
                                          className="label label-default col-3"> Set breakpoint at line:</span>
                                        <Input id="debugLine"/>
                                        <Button variant="contained" id="setBreakpointButton"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => this.setBreakpointBtnClick()}>set
                                        </Button>
                                    </Grid>
                                    <Grid item xs={24}>
                                        <span id="normaltext" className="label label-default col-3"> Set breakpoint at addres:</span>
                                        <Input id="debugAddres"/>
                                        <Button variant="contained" id="setBreakpointAddresButton"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => this.setBreakpointAddresBtnClick()}>set
                                        </Button>
                                    </Grid>
                                    <Button variant="contained" id="continueButton"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => this.continueBtnClick()}>continue
                                    </Button>
                                    <Button variant="contained" id="stepButton"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => this.stepBtnClick()}>step in</Button>
                                    <Button variant="contained" id="nextButton"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => this.nextBtnClick()}>step over</Button>
                                    <Button variant="contained" id="finishButton"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => this.finishBtnClick()}>step out</Button>
                                    <Button variant="contained"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => this.showVariablesBtnClick()}>show variables</Button>
                                    <Button variant="contained" id="registersButton"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => this.showRegistersBtnClick()}>show
                                        registers
                                    </Button>
                                    <Grid item xs={12}>
                                        <span id="normaltext"
                                              className="label label-default col-3"> Write command:</span>
                                        <Input id="manualInput"/>
                                        <Button variant="contained" id="manInputButton"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => this.manInputBtnClick()}>submit
                                        </Button>
                                    </Grid>
                                    <Button variant="contained" onClick={() => this.doLoadFile()}>Load file</Button>
                                </Grid>

                            </Paper>
                        </Grid>
                        <Grid item xs={6}>
                            <Paper style={styles.paper}>xs=6</Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper style={styles.paper}>
                                <AceEditor

                                    mode="java"
                                    theme="dracula"
                                    value={"Load a file to see the contents"}
                                    onChange={(val) => console.log(val)}
                                    onInput={(val) => console.log("Input", val)}
                                    name="UNIQUE_ID_OF_DIV"
                                    editorProps={{$blockScrolling: true}}
                                    style={styles.aceEditor}
                                    width={"100%"}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    aceEditor: {
        width: '100% !important'
    }
});

export default App;
