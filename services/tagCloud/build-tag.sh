#!/bin/bash
cp ../aux/aux.py .
docker build -t tag -f Dockerfile.tag .
rm -f aux.py
