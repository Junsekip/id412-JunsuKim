# Falling Snow

An interactive animation of snow falling continuously over a black and white checkered background.

## Features

- **Black and White Checkerboard**: Classic alternating pattern background (40x40 pixel squares)
- **Falling Snowflakes**: 200 snowflakes fall continuously from top to bottom
- **Realistic Motion**: Each snowflake has its own speed and opacity for natural appearance
- **Looping Animation**: Snowflakes wrap around from top when they exit the bottom
- **Responsive**: Adapts to window resize events

## How It Works

- Canvas-based animation using requestAnimationFrame for smooth 60fps rendering
- Snowflakes are simple circles with varying sizes (2-5px) and speeds (1-3px/frame)
- Each flake has random opacity for depth perception
- When a snowflake reaches the bottom, it resets to the top at a random x position
- Checkerboard pattern is redrawn each frame behind the falling snow

## Visual Details

- Snowflakes: White circles with 0.8 opacity (semi-transparent)
- Background: 50/50 black and white alternating squares
- Total snowflakes: 200 particles for dense snow effect
