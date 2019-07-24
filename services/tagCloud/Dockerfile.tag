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

FROM filter-api

RUN \
    pip install --upgrade pip \
    && pip install numpy -U \
    && pip install \
        nltk \
    && pip install \
        argparse \
        nltk \
        unidecode \
        spacy \
        wordcloud \
        matplotlib \
    && python -c 'import nltk;nltk.download("'wordnet'");nltk.download("'punkt'");nltk.download("'stopwords'")'

COPY aux.py tagCons.py /opt/catenae/
ENTRYPOINT ["python","tagCons.py"]
