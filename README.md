# Dockship

Deploy node.js apps on docker hosts.

## Preamble

Before you start, you may want to read about the motives behind Dockship in my recent blogpost:

http://braindump.ghost.io/meet-dockship/

## Goals behind this solution

- to have App-management/PaaS-logic completly client-side
- to have no server-side dependencies beside clean dockerd installation API exposed via TCP

## Install

```npm install dockship -g```

## Usage

### Command overview

```
$ dockship 

  Usage: dockship command

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
                      
    status            Status of running applications
    list              List deployed applications
    push   <appname>  Push a new application
    start  <appname>  Start the application
    stop   <appname>  Stop the application, also takes --all
    purge  <appname>  Delete the application

```

### List available apps

```
┌──────────────┬────────────────────────────────────────┐
│ id           │ name                                   │
├──────────────┼────────────────────────────────────────┤
│ 34d81953888c │ superapp:latest                        │
└──────────────┴────────────────────────────────────────┘
```

### Start app

```
$ dockship start superapp:latest
Started: 5e9f186e931e
```

### Stop app

```
$ dockship stop superapp:latest
Stopped: 5e9f186e931e
```

### Push app

```
$ dockship push superapp

a .
a ./app.js
a ./Dockerfile
a ./package.json

Step 1 : FROM ubuntu:precise
 ---> 8dbd9e392a96
Step 2 : MAINTAINER Sascha Reuter
 ---> Using cache
 ---> 1a479c14b8bf
Step 3 : RUN apt-get install -y python-software-properties python
 ---> Using cache
 ---> f4791bc909d3
Step 4 : RUN add-apt-repository ppa:chris-lea/node.js
 ---> Using cache
 ---> e660eec930ec
Step 5 : RUN echo "deb http://us.archive.ubuntu.com/ubuntu/ precise universe" >> /etc/apt/sources.list
 ---> Using cache
 ---> 6e0b66f1073d
Step 6 : RUN apt-get update
 ---> Using cache
 ---> d9fc6ff57980
Step 7 : RUN apt-get install -y nodejs
 ---> Using cache
 ---> 3eacec1174ba
Step 8 : RUN mkdir /var/www
 ---> Using cache
 ---> 93b969629608
Step 9 : EXPOSE 8080
 ---> Running in 2b897219c3a4
 ---> 62eb23aeffaa
Step 10 : ADD ./ /var/www/
 ---> 2277aa64d91f
Step 11 : CMD ["/usr/bin/node", "/var/www/app.js"]
 ---> Running in d69128319942
 ---> bd08be6ae92f
Successfully built bd08be6ae92f
```
