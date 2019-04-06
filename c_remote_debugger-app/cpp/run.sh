#!/bin/bash

if [[ "$(docker inspect --type=image minidbg_image:latest)" == "[]" ]]; then
  echo "create image minidbg_image"
  docker build ./../cpp/ -t minidbg_image
fi

while [[ "$(docker inspect --type=image minidbg_image:latest)" == "[]" ]]
do
  sleep 10
  echo "waiting for image..."
done

number=1
while [ "$(docker inspect --type=container minidbg_container${number})" != "[]" ]
do
  echo "container number ${number} already exist, taking next number"
  number=$((number+1))
done
docker run --rm --name=minidbg_container${number} minidbg_image





#docker build . -t minidbg_image
#docker run --rm --name=minidbg_container minidbg_image