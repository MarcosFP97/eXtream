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

import yaml
from flask import Flask
from flask_script import Manager, Server
from flask_restful import reqparse, abort, Api, Resource
from flask_cors import CORS
from genericService import GenericService
from customResource import CustomResource
from containerAux import generate_container_hsh
from conf import conf_loader as conf
from catenae import Link, Electron, CircularOrderedSet
from catenae.connectors.mongodb import MongodbConnector
import docker
import logging
from multiprocessing.managers import BaseManager
import multiprocessing
import gunicorn.app.base
from gunicorn.six import iteritems


class Consumer(Link):

    # Remote method to recalculate hash
    def recalculate_hash(self,context,input_topics,id,image):
        input_data = []
        input_data.append(image)
        for element in input_topics:
            element = element.split("-")
            input_data.append(element[0])
            if len(element) > 1:
                input_data.append(element[1])
        item = {'identifier':id}
        hsh = generate_container_hsh(input_data)
        value = {'hsh':hsh}
        self.mongodb.update(item,value, database_name='indivisa', collection_name='is_alive')

    def setup(self):
        try:
            self.mongodb.set_defaults(database_name='indivisa')
            self.containers = []
        except Exception as e:
            logging.exception("")

    def transform(self, electron):
        try:
            electron_key = electron.previous_topic  # key
            item = {'identifier':electron_key}
            if self.mongodb.exists(item,collection_name='results'):
                result = self.mongodb.get(item,collection_name='results')
                document = result.next()
                if document['attr2']:
                    self.mongodb.push(item,'attr1',[electron.value],collection_name='results')
                else:
                    value = {'attr1':electron.value}
                    self.mongodb.update(item,value,collection_name='results')
        except Exception as e:
            print(e)

class StandaloneApplication(gunicorn.app.base.BaseApplication):

    def __init__(self, app, options=None):
        self.application = app
        self.options = options or {}
        super(StandaloneApplication, self).__init__()

    def load_config(self):
        config = dict([(key, value) for key, value in iteritems(self.options)
                       if key in self.cfg.settings and value is not None])
        for key, value in iteritems(config):
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application

    def run(self):
        super().run()


if __name__ == '__main__':
    app = Flask(__name__)
    consumer = Consumer()
    CORS(app)
    api = Api(app)
    client = docker.DockerClient(base_url='unix://var/run/docker.sock', version='auto')
    kwargs = {'client': client, 'consumer': consumer}

    api.add_resource(GenericService,
                     conf.api['base_url'] +
                     '/platform/<id>', conf.api['base_url'] + '/platform',
                     resource_class_kwargs = kwargs)

    api.add_resource(CustomResource,
                     conf.api['base_url'] +
                     '/platform/image-upload',
                     resource_class_kwargs = kwargs)

    options = {
        'bind': '%s:%s' % ('0.0.0.0', '3000'),
        'workers': 1,
        'threads': multiprocessing.cpu_count() + 1,
    }

    StandaloneApplication(app, options).run()
