#!/bin/bash

find . -regex "\(*~\|.*__pycache__.*\|*.py[co]\)" -delete
find . -name "*~" -delete

tar --dereference -c -f http-api.tar.gz \
    services \
    conf \
    api.py

cp services/aux/aux.py services/
docker build -t filter-api .
rm -f http-api.tar.gz
rm -f services/aux.py
