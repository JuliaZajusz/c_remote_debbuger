# Get the GCC preinstalled image from Docker Hub
FROM gcc:4.9

# Copy the current folder which contains C++ source code to the Docker image under /usr/src
COPY . /usr/src/minidbg

# Specify the working directory
WORKDIR /usr/src/minidbg

#ENTRYPOINT [ "sh", "-c", "echo $HOME" ]

# Use GCC to compile the Test.cpp source file
RUN g++ -o Test ./cmake-build-debug/Test.cpp

# Run the program output from the previous step
#CMD ["./Test"]
#CMD ["bash"]