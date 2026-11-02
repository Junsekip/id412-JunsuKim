# Paintings Carousel

An interactive carousel that displays canvas-based illustrations of famous paintings, rotating every 10 seconds.

## Features

- **5 Famous Paintings** drawn using HTML5 Canvas:
  1. The Scream (Edvard Munch, 1893)
  2. Mona Lisa (Leonardo da Vinci, 1503-1519)
  3. Girl with a Pearl Earring (Johannes Vermeer, 1665)
  4. The Kiss (Gustav Klimt, 1908)
  5. The Pied Piper of Hamelin (Traditional)

- **Auto-rotation**: Paintings change automatically every 10 seconds
- **Manual navigation**: Click the dots at the bottom to jump to any painting
- **Smooth animations**: Fade-in and slide-up transitions between paintings
- **Responsive design**: Works on desktop and mobile devices

## How It Works

The component uses React hooks to manage the carousel state:
- `useState` tracks the current painting index
- `useEffect` sets up an interval for auto-rotation
- `useRef` accesses the canvas element
- Each painting is drawn using Canvas API drawing functions

Each painting is a simplified canvas illustration capturing the essence and colors of the original artwork.

## Controls

- **Automatic**: Watch the paintings change automatically
- **Manual**: Click any dot below to jump to that painting instantly
