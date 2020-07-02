#!/bin/bash

HEADER_PATH=/usr/include
if [ "$1" = "darwin" ]; then
    HEADER_PATH=/usr/local/include
fi
if [ "$2" = "x86" ]; then
    sudo apt-get install gcc-multilib -y
fi    
wget -O cester.h https://raw.githubusercontent.com/exoticlibraries/libcester/master/include/exotic/cester.h
sudo mkdir -p $HEADER_PATH/exotic/
sudo mv cester.h $HEADER_PATH/exotic/
echo Done installing cester