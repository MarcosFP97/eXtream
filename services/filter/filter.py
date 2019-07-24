#!/usr/bin/env python
# encoding=utf8
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



import string
import traceback
from catenae import Link,Electron
import sys

from aux import queryTokens,procChain,init_nltk

class Filter(Link):

    # Remote method to add input topics dynamically
    def add_topic(self,context,topic,id,image):
        if self.id == id and self.uid != context['uid']:
            print("Estoy en el add input topic del filtro")
            self.add_input_topic(topic)
            self.rpc_call('Consumer', 'recalculate_hash', args=[self.input_topics,self.id,image])

    # Remote method to remove input topics dynamically
    def remove_topic(self,context,topic,id,image):
        if self.id == id and self.uid != context['uid']:
            self.remove_input_topic(topic)
            self.rpc_call('Consumer', 'recalculate_hash', args=[self.input_topics,self.id,image])

    # Remote callable method that allows us to add a query dynamically
    def add_query(self,context,query):
        try:
            aux = query.split("-")
            print("Id llamada",aux[0])
            if self.id == aux[0]:
                query = query.split(",")
                tmp = query[0].split("-")
                if tmp[1] not in self.query: # Avoids duplicate values
                    print("Adding new query...")
                    self.topics.append(query[0])
                    self.query.append(tmp[1])
                    self.fText.append(tmp[1][:-1])
                    self.exact.append(tmp[1][-1:])
                    self.original.append(queryTokens(query[1],self.languages))
                    print("Topics",self.topics)
                    print("Queries",self.query)
                    print("Exact-matches",self.exact)
                    print("Searching for", self.fText)
                    print("Original texts",self.original)
                    print("###################################")
        except Exception as e:
            print("Exception", e)

    def setup(self):
        try:
            self.query = []
            self.exact = []
            self.original = []
            self.fText = []
            self.topics = []
            self.languages = init_nltk() # Initializa languages for natural language toolkit
            print("Starting filter...")
            for topic in self.output_topics:
                self.topics.append(topic)
            self.id = self.consumer_group
            print("Args",self.args)
            for a,b in zip(self.args[::2], self.args[1::2]):
                self.query.append(b)
                self.fText.append(b[:-1])
                self.exact.append(b[-1:])
                self.original.append(queryTokens(a,self.languages))
            print("Id contenedor",self.id)
            print("Topics",self.topics)
            print("Queries",self.query)
            print("Exact-matches",self.exact)
            print("Searching for", self.fText)
            print("Original texts",self.original)
        except Exception as e:
            print("Exception", e)

    def transform(self, electron):

        try:

            key = electron.key
            value = electron.value
            for q,e,o,t in zip(self.fText,self.exact,self.original,self.topics):
                if e == "0": # exact_match
                    title = ""
                    if 'submission_title' in value:
                        title = procChain(value['submission_title'])
                    content = procChain(value['body'])
                    if (value['type'] == 0 and q in title) or q in content:
                        if 'submission_title' in value:
                            print("Title:", value['submission_title'].encode('ascii', errors='ignore'))
                        print("Body:", value['body'].encode('ascii', errors='ignore'))
                        print("Type:", str(value['type']).encode(
                            'ascii', errors='ignore'))
                        print('Timestamp:',value['timestamp'])
                        electron.topic = t
                        self.send(electron)

                elif e == "1": # non-exact match
                    title = set()
                    if 'submission_title' in value :
                        title = set(queryTokens(value['submission_title'],self.languages))
                    content = set(queryTokens(value['body'],self.languages))
                    if (value['type'] == 0 and title.issuperset(set(o))) or content.issuperset(set(o)):
                        if 'submission_title' in value:
                            print("Title:", value['submission_title'].encode('ascii', errors='ignore'))
                        print("Body:", value['body'].encode('ascii', errors='ignore'))
                        print("Type:", str(value['type']).encode(
                            'ascii', errors='ignore'))
                        print('Timestamp:',value['timestamp'])
                        electron.topic = t
                        self.send(electron)

        except (Exception, UnicodeEncodeError) as e:
            print("Exception", e)
            traceback.print_exc()

if __name__ == "__main__":
    f = Filter()
    f.start()
