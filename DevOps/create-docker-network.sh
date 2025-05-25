#!/bin/sh

docker network create \
  --driver bridge \
  --subnet X.X.X.X/24 \
  neuraleye_network