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
import logging
import json
import uuid
import docker
from subprocess import call
from catenae import Link, Electron
from containerAux import preprocessJSON,gen_container_outputs,remote_call,launch_container,parser

class GenericService(Resource):


    def __init__(self, **kwargs):
        self.client = kwargs['client']
        self.consumer = kwargs['consumer']
        self.consumer.start(embedded=True)
        self.mongo = self.consumer.mongodb

    def delete(self): # Method that deletes all active containers
        try:
            c = docker.APIClient(base_url='unix://var/run/docker.sock')
            aux = self.consumer.containers.copy()
            aux = filter(None, aux)
            for container in aux:
                c.remove_container(container=container,force=True)
                self.consumer.containers.remove(container)
            self.mongo.remove(collection_name='is_alive')
            self.mongo.remove(collection_name='results')
            return {},201
        except Exception:
            logging.exception("")
            return {},400

    def get(self, id):
        item = {'identifier':id}
        if self.mongo.exists(item,collection_name='results'):
            result = self.mongo.get(item,collection_name='results') # This cursor is going to have always one single row
            document = result.next()
            if document:
                return {id:document['attr1']},200
        return {},404

    def post(self):
        try:
            data = request.get_json(force=True)
            response = {}
            if not data:
                return {},400 # Bad request

            elif 'image' in data and 'type' in data:
                id,hsh,container_args,image,consumer_inputs,kind = preprocessJSON(data)
                output = []
                result = launch_container(self.client,self.mongo,self.consumer,kind,id,hsh,image,output,consumer_inputs,container_args)
                self.consumer.containers.append(result[1])
                response["image"] = image
                response["outputs"] = result[0]
                response["type"] = kind

            elif 'topology' in data:
                info = parser(self.mongo,self.consumer,data['topology'])
                for container in info.values():
                    result = launch_container(self.client,self.mongo,self.consumer,container.get('type',""),container['id'],container['hsh'],container['image'],container['outputs'],container.get('inputs',[]),container.get("args",[]))
                    self.consumer.containers.append(result[1])
                    random_key = uuid.uuid4().hex
                    response[random_key] = {"id":container['id'],"image":container['image'],"outputs":result[0],"type":container.get('type',""),"inputs":container.get('inputs',[])}

            else:
                return {},400 # Bad request

            return response,201
        except Exception as e:
            logging.exception("")
            return {},400
