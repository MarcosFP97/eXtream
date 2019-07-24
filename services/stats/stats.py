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
import datetime
import time
import hashlib


class Stats(Link):

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

    def setup(self):
        self.texts_counter = 0
        self.start_timestamp = datetime.datetime.now()
        self.users = set()
        self.id = self.consumer_group
        self.n_users = 0
        self.iter_texts = 0
        self.iter_users = 0
        self.texts_second = 0
        self.users_second = 0

    def transform(self, electron):
        self.texts_counter += 1
        # adds a user id if it doesn't already exist
        self.users.add(electron.value['user_id'])
        self.n_users = len(self.users)
        now = datetime.datetime.now()
        diff = (now - self.start_timestamp).seconds
        if diff >= 5:  # Refresh every 5 seconds
            self.start_timestamp = datetime.datetime.now()
            self.texts_second = (self.texts_counter-self.iter_texts) / diff
            self.users_second = (self.n_users-self.iter_users) / diff
            print("Texts/second",self.texts_second)
            print("Users/second",self.users_second)
            self.iter_texts = self.texts_counter
            self.iter_users = self.n_users
            electron.topic = self.output_topics[0]
            electron.value = {'texts_sec':self.texts_second,'users_sec':self.users_second,'total_users':len(self.users),'total_texts':self.texts_counter}
            return electron

if __name__ == "__main__":
    s = Stats()
    s.start()
