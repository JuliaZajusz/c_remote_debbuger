##Requirements:
nodejs
npm
cmake

##Arrangements:
```
cd nodejs
npm i
cd ../cpp
cmake CMakeLists.txt
make
```


##Run webapp:
```
cd nodejs
npm run dev
```


##App:
```
http://localhost:1337/
```

##Api requests:

POST
```
http://localhost:1337/api/v1/posts/run
{
	"filename": "hello"
}
```



##Build:

```
cmake CMakeLists.txt
make
```

##Run
From localization
<your_path>/c_remote_debugger/c_remote_debugger-app/minidbg-tut_setup/cmake-build-debug

run:
```./minidbg hello```

first argument is a name of debugged file


##How to set breakpoints:
on address:
```break 0xaddr```
where addr is line address from `objdump -d <filename>` in main section

on line:
```break filename.cpp:line_number```










##Bibliography
Considered solutions and links to resources

NODEJS APP:
https://medium.com/@etiennerouzeaud/how-create-an-api-restfull-in-express-node-js-without-database-b030c687e2ea

RESTAPI  
https://stackify.com/rest-api-tutorial/  
https://restfulapi.net/rest-api-design-tutorial-with-example/  
https://www.youtube.com/playlist?list=PLjHmWifVUNMLjh1nP3p-U0VYrk_9aXVjE  

BEAST  
https://github.com/boostorg/beast/tree/develop  
https://www.boost.org/doc/libs/1_69_0/libs/beast/doc/html/index.html  
https://www.youtube.com/watch?v=7FQwAjELMek  

PROTOCOL BUFFERS  
https://developers.google.com/protocol-buffers/?hl=pl  
https://github.com/protocolbuffers/protobuf  
https://www.youtube.com/watch?v=EAFK-tN_yaw  

DEBUGGER  
https://blog.tartanllama.xyz/writing-a-linux-debugger-setup/  
https://www.youtube.com/watch?v=0DDrseUomfU  

CGROUP  
https://www.linuxjournal.com/content/everything-you-need-know-about-linux-containers-part-i-linux-control-groups-and-process  
https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/resource_management_guide/ch01  

DOCKER
https://devblogs.microsoft.com/cppblog/c-development-with-docker-containers-in-visual-studio-code/
