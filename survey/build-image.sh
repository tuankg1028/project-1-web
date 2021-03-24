#!/usr/bin/env bash
#!/bin/bash

set -e

#docker build -t edgify:0.1.0 ./base
npm run install
npm run build
docker build --no-cache -t survey_nodeserver:latest .
