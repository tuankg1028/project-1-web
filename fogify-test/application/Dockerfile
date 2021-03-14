FROM node:10-alpine
ENV SCONE_HEAP=1G

# Create app directory
WORKDIR /usr/src/app


COPY code/package*.json code/
RUN cd code && npm install --production
RUN apk update && apk add bash

ADD code code

RUN ls -laR code/dist/*

EXPOSE 8000

#ADD code/entrypoint.sh /code/
#COPY code/entrypoint.sh /code/entrypoint.sh
# RUN chmod +x code/entrypoint.sh
RUN chmod +x code/entrypoint.sh
CMD ["/bin/bash", "code/entrypoint.sh"]