FROM ubuntu:precise
MAINTAINER Sascha Reuter

RUN apt-get install -y python-software-properties python
RUN add-apt-repository ppa:chris-lea/node.js
RUN echo "deb http://us.archive.ubuntu.com/ubuntu/ precise universe" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y nodejs
RUN mkdir /var/www
EXPOSE 8080

ADD ./ /var/www/

CMD ["/usr/bin/node", "/var/www/app.js"]