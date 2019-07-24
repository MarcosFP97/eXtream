#!/bin/bash
cp ../aux/aux.py .
docker build -t batch -f Dockerfile.batch .
rm -f aux.py
