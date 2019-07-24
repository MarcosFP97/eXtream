#!/bin/bash
cp ../aux/aux.py .
docker build -t topic_analysis -f Dockerfile.topic .
rm -f aux.py
