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


import re
import nltk
import unidecode
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk.corpus.util
import sys
import time
from spacy.lang.en.stop_words import STOP_WORDS
import hashlib

# Init nltk
def init_nltk():
    return stopwords.fileids()

# Remove non-ascii elements from electron values
def remove_non_ascii(electron_items):
    dict_items = []
    for i, e in electron_items:
        first = str(i).encode('ascii', errors='ignore')
        second = str(e).encode('ascii', errors='ignore')
        tup = (first, second)
        dict_items.append(tup)
    return dict_items

# This function is going to return a dictionary that calculates the probability of a text to be written in a given language
def calculate_language_ratios(tokens,languages):

    language_ratios = {}  # empty dictionary
    words = [word.lower() for word in tokens]
    # Loop through the languages included in nltk
    for language in languages:
        stopwords_set = set(stopwords.words(language))
        words_set = set(words)
        common_elements = words_set.intersection(stopwords_set)
        # key=language name, value= intersection value
        language_ratios[language] = len(common_elements)
    return language_ratios

# This function calls __calculate_language_ratios and returns the language with the biggest probability in the dictionary
def detect_language(tokens,languages):
    lang_prob = calculate_language_ratios(tokens,languages)
    most_rated = max(lang_prob, key=lang_prob.get)
    return most_rated

def __preprocessString(cadena):
    cadena = cadena.lower()  # Change the string to lowercase
    # We only keep letters, numbers and _
    cadena = re.sub(r'[^\w\s]', '', cadena)
    cadena = unidecode.unidecode(cadena)  # Remove accents
    return cadena

# Function that processes the input string and returns a list of tokens
def queryTokens(cadena,languages):
    cadena = __preprocessString(cadena)
    # remove non ascii-characters
    cadena = ''.join(i for i in cadena if ord(i) < 128)
    cadena = cadena.strip()  # remove initial and end spaces
    word_tokens = word_tokenize(cadena)
    # Detect in which language the text is written
    lang = detect_language(word_tokens,languages)
    stop_words = set(stopwords.words(lang))  # Filtering stop words
    inverters = set(['dont','doesnt','havent','arent','didnt','wasnt','werent','not','never','hardly','seldom'])
    incrementers = set(['too','many','much','very','lots'])
    STOP_WORDS.add('im')
    STOP_WORDS.add('pm')
    STOP_WORDS.add('ai')
    STOP_WORDS.add('ie')
    STOP_WORDS.add('still')
    STOP_WORDS.add('cant')
    STOP_WORDS.add('isnt')
    STOP_WORDS.add('couldnt')
    STOP_WORDS.add('youre')
    STOP_WORDS.add('seen')
    STOP_WORDS.add('say')
    STOP_WORDS.add('says')
    STOP_WORDS.add('tell')
    STOP_WORDS.add('lot')
    STOP_WORDS.add('lol')
    STOP_WORDS.add('hes')
    STOP_WORDS.add('s')
    STOP_WORDS.add('be')
    filtered_sentence = [w for w in word_tokens if not w in stop_words and not w in inverters and not w in incrementers and not w in STOP_WORDS] # Checking not in stop_words
    return filtered_sentence

# Function that process the input string
def procChain(cadena):
    cadena = __preprocessString(cadena)
    word_tokens = word_tokenize(cadena)
    # We build a new string properly processed
    newStr = ' '.join(map(str, word_tokens))
    # remove non ascii-characters
    newStr = ''.join(i for i in newStr if ord(i) < 128)
    newStr = newStr.strip()  # remove initial and end spaces
    return newStr

def preprocessForTag(cadena,languages):
    cadena = cadena[1:] # Remove initial character used for encoding
    filtered_sentence = queryTokens(cadena,languages)
    filtered_sentence = [w for w in filtered_sentence if not w.startswith("http") and not w.startswith("www")]
    # We build a new string properly processed
    newStr = ' '.join(map(str, filtered_sentence))
    # remove non ascii-characters
    newStr = ''.join(i for i in newStr if ord(i) < 128)
    newStr = newStr.strip()  # remove initial and end spaces
    return newStr

def preprocessForTopic(cadena,languages):
    cadena = cadena[1:] # Remove initial character used for encoding
    filtered_sentence = queryTokens(cadena,languages)
    filtered_sentence = [w for w in filtered_sentence if not w.startswith("http") and not w.startswith("www")]
    return filtered_sentence
