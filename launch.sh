#!/bin/bash

#Donwload automatically newer image of Catenae and for the crawler
docker pull catenae/link:1.0.0rc3
docker pull extream/filter-api
docker pull brunneis/reddit-crawler
docker pull registry.catenae.dev/twitter-crawler
docker pull registry.catenae.dev/twitter-crawler-json-adapter

# Launch the crawler
cd crawler/
docker-compose up -d
cd ..

# Build the facade that allows us to raise any module
cd services/filter
./build-filter.sh
cd ..
cd stats/
./build-stats.sh
cd ..
cd batch/
./build-batch.sh
cd ..
cd tagCloud/
./build-tag.sh
cd ..
cd topicAnalysis/
./build-topic.sh
cd ..
cd ..

# Rebuild the master image
# ./build.sh

# Remove the current container
docker rm -f filter-api

docker run --restart unless-stopped -tid \
--name filter-api \
-p 3000:3000 \
--net=catenae \
-v /var/run/docker.sock:/var/run/docker.sock \
--privileged \
extream/filter-api -o void -m mongodb:27017 --kafka-bootstrap-server kafka:9092


#Build the webapp image

cd webapp/
./build.sh
./launch.sh > /dev/null 2>&1 &
cd ..
