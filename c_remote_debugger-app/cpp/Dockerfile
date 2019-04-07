# Get image from Docker Hub
FROM ubuntu:16.04

# Copy the current folder which contains C++ source code to the Docker image under /usr/src
COPY . /usr/src/minidbg

# Specify the working directory
WORKDIR /usr/src/minidbg

#ENTRYPOINT [ "sh", "-c", "echo $HOME" ]

# Use GCC to compile the Test.cpp source file
RUN apt-get update
RUN yes | apt-get install cmake
RUN yes | apt-get install g++
RUN cmake CMakeLists.txt
RUN make
RUN rm -R src include examples CMakeFiles CMakeCache.txt  CMakeLists.txt  Makefile cmake_install.cmake



#instrukcje-budowanie obrazu i kontenera
#docker build . -t ubuntui1
#docker run -ti --rm --name=ubuntuc1 ubuntui1