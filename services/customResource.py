#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Indivisa
# Copyright (C) 2019 Marcos Fernández Pichel
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from flask import Flask, request, jsonify
from flask_restful import Resource
from werkzeug.utils import secure_filename
import logging
import json
import magic
import fleep
import uuid
from subprocess import call
from catenae import Link, Electron
from containerAux import preprocessJSON,gen_container_outputs,remote_call,launch_container,parser

class CustomResource(Resource):

    def __init__(self, **kwargs):
        self.client = kwargs['client']
        self.consumer = kwargs['consumer']
        self.consumer.start()
        self.mongo = self.consumer.mongodb
        self.allowed_extensions = set(['tar'])

    def allowed_file(self,filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions

    def post(self):
        try:
            data = request.files['image']
            if self.allowed_file(data.filename):
                content = data.read()
                if magic.from_buffer(content,mime=True) == 'application/x-tar':
                    self.client.images.load(content)
                    print(data.filename)
                    return {},200
                else:
                    return {"msg":"Ups, something went wrong while loading your image"},400        
            else:
                return {"msg":"Ups, something went wrong while loading your image"},400
        except Exception as e:
            logging.exception("")
            return {"msg":"Ups, something went wrong while loading your image"},400