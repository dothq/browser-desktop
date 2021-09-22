echo Enter URL to download from
read URL
echo What is this background called
read NAME
mkdir ./$NAME/
wget -O ./$NAME/temp $URL
~/magick convert ./$NAME/temp $NAME/temp.jpg
rm ./$NAME/temp
mv $NAME/temp.jpg $NAME/raw.jpg
~/magick convert $NAME/raw.jpg -gravity center -resize 1920x1080\! $NAME/1080.jpg
~/magick convert $NAME/raw.jpg -gravity center -resize 1280x720\! $NAME/720.jpg
~/magick convert $NAME/raw.jpg -gravity center -resize 854x480\! $NAME/480.jpg
rm $NAME/raw.jpg