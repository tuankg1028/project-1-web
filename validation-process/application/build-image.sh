#!/usr/bin/env bash
#!/bin/bash

set -e

#docker build -t edgify:0.1.0 ./base
cd code && npm run build
cd ..
docker build --no-cache -t validation-process:0.0.1 .
