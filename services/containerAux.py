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

import os
import logging
from subprocess import call
import docker
import time
import hashlib
import yaml
import uuid
import json
from itertools import chain
import tarfile
from aux import procChain

def generate_container_hsh(input_data):
    """
    Function that generates an unique hash for a container type
    """
    #print("!!!Input Data 1",input_data)
    input_data = sorted(input_data)
    string = ",".join(filter(None,input_data))
    #print("!!!Input Data 2",string)
    return hashlib.sha256(string.encode('utf-8')).hexdigest() # Identifier for a container

def filter_options(data,args):
    original_text = data['options']['query']
    exact = data['options']['exact']
    if len(original_text) != len(exact):
        return {},400 # The query cannot be properly formed
    for text,e in zip(original_text,exact): # We preprocess the query
        args.append(text)
        clean_text = procChain(text)
        clean_text += e
        args.append(clean_text)

def topic_options(data,args):
    if 'mode' in data['options']:
        mode = data['options']['mode']
        if 'time' in mode:
            for t in mode['time']:
                args.append(t)
        elif 'ntexts' in mode:
            ntexts = mode['ntexts']
            args.append(ntexts)
        args.append("#") # Symbol to separate corpus structure args from ntopics args
    ntopics = data['options']['ntopics'] # Number of topics, in case it is a topic analysis module
    for topic in ntopics:
        args.append(topic)

def batch_options(data,args):
    windows = data['options']['windows']
    for window in windows:
        for timestamp in window:
            args.append(timestamp)

def process_options(data,args):
    if 'options' in data: # If the user sends us options
        if 'query' in data['options'] and 'exact' in data['options']:
            filter_options(data,args)
        if 'ntopics' in data['options']:
            topic_options(data,args)
        if 'windows' in data['options']:
            batch_options(data,args)

def generate_inputs(data,input_data,consumer_inputs):
    if 'inputs' in data:
        for input in data['inputs']:
            if 'id' in input:
                input_data.append(input['id'])
            if 'topics' in input:
                for topic in input['topics']:
                    input_data.append(topic)
                    if not input['id']: # If the container that produces the topic is the crawler
                        consumer_inputs.append(topic)
                    else:
                        consumer_inputs.append(input['id']+"-"+topic)
            else:
                consumer_inputs.append(input['id'])

def process_params(data,input_data,args):
    if 'params' in data: # You can specify the resources for your container
        if 'cpu' in data['params']: # Still not in use, but prepared
            cpu = data['params']['cpu']
            input_data.append(cpu)
        if 'mem' in data['params']:
            mem = data['params']['mem']
            input_data.append(mem)
        if 'file' in data['params']:
            file = data['params']['file']
            input_data.append(file)
            args.append(file)
        if 'cl' in data['params']:
            cl = data['params']['cl']
            args.append(cl)
        if 'met' in data['params']:
            met = data['params']['met']
            args.append(met)
        if 'met_args' in data['params']:
            met_args = data['params']['met_args']
            args.append(met_args)

def preprocessJSON(data):
    """
    Function that preprocess JSON data and returns an unique id for the new container
    """
    args = [] # array of arguments for the container
    kind = data['type']
    if kind not in ['source','middle','leaf']:
        return {}, 400
    if kind!='source' and 'inputs' not in data: # Source is the only module type that doesn't have input
        return {}, 400
    image = data['image']
    input_data = [] # list that with elements to generate container id
    input_data.append(image)
    process_options(data,args)
    consumer_inputs = [] # list of inputs necessary to launch the container
    if kind!='source':
        generate_inputs(data,input_data,consumer_inputs)
    process_params(data,input_data,args)
    id = uuid.uuid4().hex # Identifier for a container
    hsh = generate_container_hsh(input_data) # Hash that will allow us not repeating containers with the same function and inputs
    return id,hsh,args,image,consumer_inputs,kind

def gen_filter_outputs(mongo,consumer,id,container_args,output):
    for a,b in zip(container_args[::2], container_args[1::2]): # Loop over the list of args in order to build the output topic
        b = b.replace(" ","")
        aux = id+"-"+b
        item1 = {'identifier':aux,'attr1':[],'attr2':True}
        if not mongo.exists(item1,collection_name='results'):
            mongo.insert(item1,collection_name='results')
        consumer.add_input_topic(aux)
        output.append(aux)

def gen_topic_outputs(mongo,consumer,id,container_args,output):
    if "#" in container_args:
        container_args = container_args[container_args.index('#')+1:]
    for arg in container_args:
        aux = id+"-"+arg
        consumer.add_input_topic(aux)
        item1 = {'identifier':aux,'attr1':[],'attr2':False}
        if not mongo.exists(item1,collection_name='results'):
            mongo.insert(item1,collection_name='results')
        output.append(aux)

def gen_batch_outputs(mongo,consumer,id,container_args,output):
    for a,b in zip(container_args[::2], container_args[1::2]):
        aux = id+"-"+a+"-"+b
        consumer.add_input_topic(aux)
        item1 = {'identifier':aux,'attr1':[],'attr2':False}
        if not mongo.exists(item1,collection_name='results'):
            mongo.insert(item1,collection_name='results')
        output.append(aux)

def gen_else_outputs(mongo,consumer,id,output):
    consumer.add_input_topic(id)
    item1 = {'identifier':id,'attr1':[],'attr2':False}
    if not mongo.exists(item1,collection_name='results'):
        mongo.insert(item1,collection_name='results')
    output.append(id)

def gen_container_outputs(mongo,consumer,id,image,container_args):
    """
    Function that generates output for a specific container and adds it as input for the api
    """
    output = []
    if image=="filter": # If it is a filter
        if container_args:
            gen_filter_outputs(mongo,consumer,id,container_args,output)
    elif image=="topic_analysis": # If it is a topic analysis module
        if container_args:
            gen_topic_outputs(mongo,consumer,id,container_args,output)
    elif image=="batch":
        if container_args:
            gen_batch_outputs(mongo,consumer,id,container_args,output)
    else:
        gen_else_outputs(mongo,consumer,id,output)
    return output

def filter_remote_call(mongo,consumer,container_args,id):
    output = []
    for a,b in zip(container_args[::2], container_args[1::2]): # Loop over the list of args in order to build the output topic
        aux = id+"-"+b
        item1 = {'identifier':aux,'attr1':[],'attr2':True}
        if not mongo.exists(item1,collection_name='results'):
            mongo.insert(item1,collection_name='results')
        output.append(aux)
        consumer.add_input_topic(aux)
        aux+=","+a
        consumer.rpc_call('Filter', 'add_query', args=[aux]) # Remote call to add a query
    return output

def topic_remote_call(mongo,consumer,container_args,id):
    output = []
    if "#" in container_args: # This call is used for initializing topic analiysis structure in case it is empty
        consumer.rpc_call('TopicAnalysis', 'init_corpus', args=[id,container_args[:container_args.index("#")]])
        container_args = container_args[container_args.index('#')+1:]
    for arg in container_args:
        aux = id+"-"+arg
        output.append(aux)
        consumer.add_input_topic(aux)
        item1 = {'identifier':aux,'attr1':[],'attr2':False}
        if not mongo.exists(item1,collection_name='results'):
            mongo.insert(item1,collection_name='results')
        consumer.rpc_call('TopicAnalysis', 'add_ntopics', args=[aux])
    return output

def batch_remote_call(mongo,consumer,container_args,id):
    output = []
    for a,b in zip(container_args[::2], container_args[1::2]):
        aux = id+"-"+a+"-"+b
        output.append(aux)
        consumer.add_input_topic(aux)
        item1 = {'identifier':aux,'attr1':[],'attr2':False}
        if not mongo.exists(item1,collection_name='results'):
            mongo.insert(item1,collection_name='results')
        consumer.rpc_call('BatchCons', 'add_window', args=[id,a,b,aux])
    return output

def generic_remote_call(consumer,container_args,id,image):
    container_args[-1].append(id)
    container_args[-1].append(image)
    print("Args llamada",container_args)
    consumer.rpc_call(to='broadcast',method=container_args[-2],args=container_args[-1])

def remote_call(mongo,consumer,id,image,container_args):
    """
    In case the container exists and it is a filter or a topic analyzer, we execute a remote call to add a new query or number of topics
    """
    output = []
    if container_args:
        if image=="filter": # Add a query to the current filter image
                if container_args[-2]=='add_topic' or container_args[-2]=='remove_topic':
                    generic_remote_call(consumer,container_args,id,image)
                else:
                    output = filter_remote_call(mongo,consumer,container_args,id)
        elif image=="topic_analysis": # Add new number of topics to the current topic analysis image
                if container_args[-2]=='add_topic' or container_args[-2]=='remove_topic':
                    generic_remote_call(consumer,container_args,id,image)
                else:
                    output = topic_remote_call(mongo,consumer,container_args,id)
        elif image=="batch": # Add time window to do batch processing
                if container_args[-2]=='add_topic' or container_args[-2]=='remove_topic':
                    generic_remote_call(consumer,container_args,id,image)
                else:
                    output = batch_remote_call(mongo,consumer,container_args,id)
        else:
                generic_remote_call(consumer,container_args,id,image) # This case is for any module that a user would like to implement with its remote calls
    return output

def launch_container(client,mongo,consumer,kind,id,hsh,image,output,consumer_inputs,container_args):
    """
    Function that launchs a docker container with given arguments or makes a rpc call in case the container already exists
    """
    item = {'hsh':hsh}
    container = None
    # Launch only if that image does not exist already in the topology
    if not mongo.exists(item,collection_name='is_alive'):
        item.update({'identifier':id})
        mongo.insert(item,collection_name='is_alive')
        if not output:
            output = gen_container_outputs(mongo,consumer,id,image,container_args)
        run_opts = {}
        run_opts['image'] = image
        run_opts['network_mode'] = 'catenae'
        string_outputs = ",".join(output)
        if not kind or kind=='source': # in case it is a source or it wasn't specified
            args = ["-o",string_outputs,"-g",id,"-k","kafka:9092"]
            args = container_args + args
        else:
            string_inputs = ",".join(consumer_inputs)
            args = ["-i",string_inputs,"-o",string_outputs,"-g",id,"-k","kafka:9092"]
            args = container_args + args
        run_opts['command'] = args
        run_opts['detach'] = True
        # Interactive, run bash without exiting, for instance.
        run_opts['stdin_open'] = True
        run_opts['tty'] = True  # TTY
        container = client.containers.run(**run_opts)
    else: # The image exists
        result = mongo.get(item,collection_name='is_alive')
        document = result.next()
        output = remote_call(mongo,consumer,document['identifier'],image,container_args)
    if container: 
        return [output,container.id]
    else:
        return [output,""]

def gen_related(service,services,input_data,inputs):
    for key,value in service['related'].items(): # We loop over its connected modules and the specific topics to which the container is connected
        related = services[key]
        for output in related['outputs']: # We pick outputs from one container as inputs of the other as it was specified in the file
            tmp = output.split("-") # Containers outputs can take two forms: id or id-topic, depending on that tmp will be a list with one or more elements
            if tmp[0] not in input_data:
                input_data.append(tmp[0])
            if len(tmp)>1: # If related outputs are of kind 'id-topic'
                for input in inputs:
                    if input == tmp[1]:
                        index = inputs.index(input)
                        inputs[index] = output # We rebuild the list of container inputs replacing the file input for the generated one that our platform understands
                        input_data.append(tmp[1])
            else:
                pos = related['command'].index('-o')+1
                orig_output = related['command'][pos]
                for input in inputs:
                    if input==orig_output: # We can compare it directly because these kind of containers have only one output (id)
                        index = inputs.index(input)
                        inputs[index] = output
                        break
    return inputs

def config_element_inputs(service,services,input_data):
    inputs = []
    if service['type']!='source':
        index = service['command'].index('-i')+1
        inputs = service['command'][index].split(",")
        if 'related' in service:  # In case it is connected to another topology module from the file...
            inputs = gen_related(service,services,input_data,inputs)
        service['inputs'] = inputs
    return inputs # It will only return an empty list in case it is a source link


def config_topology_elements(mongo,consumer,services):
    """
    Function that generates container id and its outputs taking into account its dependencies with the rest of the topology
    """
    for service in services.values():
        id = uuid.uuid4().hex # Identifier for a container
        service['id'] = id
        service['outputs'] = gen_container_outputs(mongo,consumer,id,service['image'],service.get("args",[]))
    input_data = []
    for service in services.values():
        if 'command' in service:
            inputs = config_element_inputs(service,services,input_data)
            if not input_data and service['type']!='source':
                input_data.extend(inputs)
        input_data.append(service['image'])
        if 'params' in service:
            for p in service['params']:
                input_data.append(p)
        service['hsh'] = generate_container_hsh(input_data) # Generate containers unique hash
        input_data.clear()

def processing_args(service):
    if type(service['command']) is not list:
        service['command'] = service['command'].split(" ")
    if service['command'][0]!='-i' and service['command'][0]!='-o': # In case the user specifies args for the container
        service['args'] = service['command'][0].split(",")
        for arg in service['args']:
            if '.py' in arg: # If the specific file is provided we should keep it as a an arg and as a param because it identifies an unique container
                if 'params' not in service:
                    service['params'] = []
                service['params'].append(arg)
                break
        if service['command'][1]!='-i' and service['command'][1]!='-o': # In case the user gives params that identify a specific container
            service['params'] = service['command'][1].split(",")
            for param in service['params']:
                if '.py' in param: # As it was said before, file is an arg and a param
                    service['args'].append(param)
                    break

def establish_type_relations(service,services): # Establishing each module type and the relations between them
    if '-i' in service['command']:
        if '-o' in service['command']:
            service['type'] = 'middle'
        else:
            service['type'] = 'leaf'
        index = service['command'].index('-i')+1
        list_inputs = service['command'][index].split(",")
        for key,value in services.items():
            if 'command' in value:
                if type(value['command']) is not list:
                    value['command'] = value['command'].split(" ")
                if '-o' in value['command']:
                    index2 = value['command'].index('-o')+1
                    list_outputs = value['command'][index2].split(",")
                    common_elements = [x for x in list_inputs if x in list_outputs]
                    if common_elements:
                        if not 'related' in service:
                            service['related'] = {}
                        service['related'].update({key:common_elements})
    else:
        service['type'] = 'source'

def parser(mongo,consumer,topology_file):
    """
    Function that parsers a yaml file and returns a Python dict in a format that allows us to launch all containers from a topology
    """
    try:
        data = yaml.load(topology_file,Loader=yaml.SafeLoader)
        services = data['services'] # We are only interested in the service part of the yaml file
        for service in services.values():
            if 'command' in service:
                processing_args(service)
                establish_type_relations(service,services)
        config_topology_elements(mongo,consumer,services)
        return services
    except yaml.YAMLError as exc:
        print(exc)
