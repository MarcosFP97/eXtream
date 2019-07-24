#!/bin/bash
docker rm -f webapp

docker run -p 8000:80 \
--name webapp \
webapp
