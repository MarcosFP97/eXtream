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

FROM catenae/link:1.0.0rc3
MAINTAINER "Marcos Fernández" <marcosfernandezpichel@gmail.com>

################################################
# HTTP API
################################################

RUN \

    apt-get update && apt-get install libsqlite3-0 && apt-get -y install libmagic1 \
    && pip install --upgrade pip \
    && pip install \
        pyyaml \
        python-magic \
        fleep \
        flask \
        web3 \
        spacy \
        pandas \
        gunicorn \
        unidecode \
        nltk \
        catenae \
        flask-restful \
        flask_cors \
        docker \
        Flask-Script \
      && python -c 'import nltk;nltk.download("'punkt'");nltk.download("'stopwords'")' \
      && apt-get clean

ADD http-api.tar.gz /opt/catenae

EXPOSE 3000

COPY services/* /opt/catenae/

ENTRYPOINT ["python","api.py"]
