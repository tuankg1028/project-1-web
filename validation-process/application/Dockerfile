#FROM node:10-alpine
FROM registry.scontain.com:5050/sconecuratedimages/apps:node-10.14-alpine

# Create app directory
WORKDIR /usr/src/app

RUN apk update && apk add bash
COPY code/package*.json code/
RUN cd code && npm install --production

ADD code code

RUN ls -laR code/dist/*

EXPOSE 8000

#ADD code/entrypoint.sh /code/
#COPY code/entrypoint.sh /code/entrypoint.sh
RUN chmod +x code/entrypoint.sh
CMD ["/bin/bash", "code/entrypoint.sh"]