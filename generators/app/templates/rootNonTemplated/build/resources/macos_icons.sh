#!/usr/bin/env bash

cd "$(dirname "$0")"

rm -rf icon.iconset
mkdir icon.iconset
sips -z 16 16     fakelogo.png --out icon.iconset/icon_16x16.png
sips -z 32 32     fakelogo.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     fakelogo.png --out icon.iconset/icon_32x32.png
sips -z 64 64     fakelogo.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   fakelogo.png --out icon.iconset/icon_128x128.png
sips -z 256 256   fakelogo.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   fakelogo.png --out icon.iconset/icon_256x256.png
sips -z 512 512   fakelogo.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   fakelogo.png --out icon.iconset/icon_512x512.png
sips -z 512 512   fakelogo.png --out icon.png
cp fakelogo.png icon.iconset/fakelogo.png
iconutil -c icns -o icon.icns icon.iconset
rm -r icon.iconset

mkdir -p icons
convert fakelogo.png -scale 256 icon.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 256 icons/icon-256x256.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 192 icons/icon-192x192.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 152 icons/icon-152x152.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 144 icons/icon-144x144.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 128 icons/icon-128x128.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 64 icons/icon-64x64.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 32 icons/icon-32x32.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 16 icons/icon-16x16.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
convert fakelogo.png -scale 8 icons/icon-8x8.ico || (echo "FAILURE! Need imagemagick!" && exit 1)
