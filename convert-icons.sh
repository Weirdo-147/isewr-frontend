#!/bin/bash
# This script converts SVG icons to PNG format
# Requires Inkscape or librsvg2-bin (rsvg-convert)

cd public/

# Check if we have Inkscape
if command -v inkscape &> /dev/null; then
    echo "Using Inkscape for SVG to PNG conversion"
    CONVERTER="inkscape"
# Check if we have rsvg-convert
elif command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert for SVG to PNG conversion"
    CONVERTER="rsvg-convert"
# On macOS, check for conversion or magick
elif command -v convert &> /dev/null; then
    echo "Using ImageMagick convert for SVG to PNG conversion"
    CONVERTER="convert"
elif command -v magick &> /dev/null; then
    echo "Using ImageMagick magick for SVG to PNG conversion"
    CONVERTER="magick"
else
    echo "No suitable SVG to PNG converter found. Please install one of the following:"
    echo "  - Inkscape (inkscape.org)"
    echo "  - librsvg2-bin (provides rsvg-convert)"
    echo "  - ImageMagick (imagemagick.org)"
    exit 1
fi

# Convert apple-touch-icon.svg to PNG (180x180)
if [ "$CONVERTER" = "inkscape" ]; then
    inkscape -w 180 -h 180 apple-touch-icon.svg -o apple-touch-icon.png
elif [ "$CONVERTER" = "rsvg-convert" ]; then
    rsvg-convert -w 180 -h 180 apple-touch-icon.svg > apple-touch-icon.png
elif [ "$CONVERTER" = "convert" ]; then
    convert -background none -resize 180x180 apple-touch-icon.svg apple-touch-icon.png
elif [ "$CONVERTER" = "magick" ]; then
    magick -background none -resize 180x180 apple-touch-icon.svg apple-touch-icon.png
fi

# Convert logo.svg to logo192.png (192x192)
if [ "$CONVERTER" = "inkscape" ]; then
    inkscape -w 192 -h 192 logo.svg -o logo192.png
elif [ "$CONVERTER" = "rsvg-convert" ]; then
    rsvg-convert -w 192 -h 192 logo.svg > logo192.png
elif [ "$CONVERTER" = "convert" ]; then
    convert -background none -resize 192x192 logo.svg logo192.png
elif [ "$CONVERTER" = "magick" ]; then
    magick -background none -resize 192x192 logo.svg logo192.png
fi

# Convert logo.svg to logo512.png (512x512)
if [ "$CONVERTER" = "inkscape" ]; then
    inkscape -w 512 -h 512 logo.svg -o logo512.png
elif [ "$CONVERTER" = "rsvg-convert" ]; then
    rsvg-convert -w 512 -h 512 logo.svg > logo512.png
elif [ "$CONVERTER" = "convert" ]; then
    convert -background none -resize 512x512 logo.svg logo512.png
elif [ "$CONVERTER" = "magick" ]; then
    magick -background none -resize 512x512 logo.svg logo512.png
fi

# Convert favicon.svg to favicon.ico (multiple sizes)
if [ "$CONVERTER" = "convert" ] || [ "$CONVERTER" = "magick" ]; then
    CMD=$CONVERTER
    $CMD -background none -resize 16x16 favicon.svg favicon-16.png
    $CMD -background none -resize 32x32 favicon.svg favicon-32.png
    $CMD -background none -resize 48x48 favicon.svg favicon-48.png
    $CMD -background none favicon-16.png favicon-32.png favicon-48.png favicon.ico
    rm favicon-16.png favicon-32.png favicon-48.png
    echo "Created favicon.ico with multiple sizes"
else
    echo "Warning: Cannot create favicon.ico without ImageMagick"
    echo "Using SVG favicon only, which is supported by most modern browsers"
fi

echo "Icon conversion complete!" 