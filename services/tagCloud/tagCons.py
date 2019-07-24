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


from aux import remove_non_ascii,preprocessForTag,init_nltk
from wordcloud import WordCloud
from catenae import Link, Electron, CircularOrderedSet


class TagCons(Link):

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

    # Function that generates a word cloud of a given query
    def __generate_word_cloud(self,batch_msgs):
        clean_texts = []
        texts = list(batch_msgs) # we need to put it as a list to avoid run time errors related with changing size of the set
        for text in texts:
            for element in text:
                if element[0] == b'body' or element[0] == b'submission_title':
                    word = preprocessForTag(str(element[1]),self.languages)
                    print("#####Word",word)
                    if word not in clean_texts:
                        clean_texts.append(word)
        print("###clean_texts",clean_texts)
        output = ' '.join(map(str,clean_texts))
        print("####Output",output)
        wordcloud = WordCloud(background_color="white").generate(output)
        #print("Wordcloud",wordcloud.words_)
        result = []
        for t, v in wordcloud.words_.items():
            result.append({"text":t,"value":v*1000})
        return result

    def setup(self):
        self.id = self.consumer_group
        self.languages = init_nltk() # Initializa languages for natural language toolkit
        self.batch_msgs = CircularOrderedSet(100)

    def transform(self, electron):
        dict_items = remove_non_ascii(electron.value.items())
        dict_set = frozenset(dict_items)  # value
        self.batch_msgs.add(dict_set)
        electron.topic = self.output_topics[0]
        electron.value = self.__generate_word_cloud(self.batch_msgs)
        return electron

if __name__ == "__main__":
    t = TagCons()
    t.start()
