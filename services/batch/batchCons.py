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

from catenae import Link, Electron
import traceback

from aux import remove_non_ascii

# Catenae's consumer that takes every comment and submission in order to allow batch processing

class BatchCons(Link):

    # Remote method to add input topics dynamically
    def add_topic(self,context,topic,id,image):
        if self.id == id:
            self.add_input_topic(topic)
            self.rpc_call('Consumer', 'recalculate_hash', args=[self.input_topics,self.id,image])

    # Remote method to remove input topics dynamically
    def remove_topic(self,context,topic,id,image):
        if self.id == id:
            self.remove_input_topic(topic)
            self.rpc_call('Consumer', 'recalculate_hash', args=[self.input_topics,self.id,image])

    # Remote method to add a time window for the batch consumer
    def add_window(self,context,id,start,stop,output_topic):
        try:
            if self.id == id:
                window = (int(start),int(stop))
                self.windows.append(window)
                self.batch_msgs[window] = []
                self.output_topics.append(output_topic)
                print("Windows->",self.windows)
        except Exception as e:
            traceback.print_exc()

    def setup(self):
        self.batch_msgs = {}
        self.windows = []
        self.id = self.consumer_group
        for start,stop in zip(self.args[::2],self.args[1::2]):
            window = (int(start),int(stop))
            self.windows.append(window)
            self.batch_msgs[window] = []
        print("Initial windows->",self.windows)
        print("Id container",self.id)

    def transform(self, electron):
        try:
            for window,topic in zip(self.windows,self.output_topics):
                timestamp = int(electron.value['timestamp'])
                if electron.value['src'] == 'twitter':
                    timestamp /= 1000 # because tweet timestamps are expressed in miliseconds
                if  window[0] <= timestamp <= window[1]: # if the text belongs to the given range
                    print("Window->",window)
                    print("Topic->",topic)
                    print("Timestamp->",int(electron.value['timestamp']))
                    print("Src",electron.value['src'])
                    dict_items = remove_non_ascii(electron.value.items())
                    dict_set = frozenset(dict_items)  # value
                    self.batch_msgs[window].append(dict_set)
                    electron.topic = topic
                    electron.value = len(self.batch_msgs[window])
                    self.send(electron)
        except Exception as e:
            print("Exception",e)

if __name__ == "__main__":
    b = BatchCons(synchronous=True)
    b.start()
