#!/bin/bash
cp ../aux/aux.py .
docker build -t filter -f Dockerfile.filter .
rm -f aux.py
