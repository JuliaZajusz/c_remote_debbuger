import axios from 'axios/index';
import {api} from '../api';

export const loadFile = (filename) => {
    console.log(api);
    return axios.get(`${api}/`)
    // .then(res => console.log(res.data));
};

export const runDbg = (programName) => {
    return axios.post(`${api}/api/v1/posts/openProgram`, {
        filename: programName
    })
    // readFile();
}

export const readFile = (programName) => {
    return axios.post(`${api}/api/v1/posts/readSource`, {
        filename: programName
    })
}

export const sendFile = (file, formData, headers) => {
    console.log('dawfile');
    console.log(file);
    return axios.post(`${api}/api/v1/posts/postFile`,
        formData
        , {
        headers: {
            'content-type': 'multipart/form-data'
        }
        }
    )
}