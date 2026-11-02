# Mona Dot

An interactive dot painting (pointillist) viewer of Leonardo da Vinci's iconic Mona Lisa painting.

## Features

- **Dot Painting Effect**: The Mona Lisa is rendered as a collection of colored dots, creating a pointillist art style
- **Adjustable Dot Size**: Use the slider to control the size of the dots (2-30 pixels)
- **Real-time Updates**: Change the dot size and see the painting update instantly
- **Responsive**: Scales to fill the entire screen

## How It Works

The image is loaded onto a canvas, and pixels are sampled at regular intervals. Instead of drawing solid pixels, colored circles (dots) are drawn at those positions, creating the pointillist effect.

- Smaller dots = more detail and closer to the original image
- Larger dots = more abstract and artistic appearance

## Controls

- **Slider**: Drag to adjust dot size from 2 to 30 pixels
- **Size Display**: Shows the current dot size value
