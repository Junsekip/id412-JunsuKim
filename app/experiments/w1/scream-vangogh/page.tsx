import styles from "./page.module.css";

export default function ScreamVanGogh() {
  return (
    <main className={styles.container}>
      <svg
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.canvas}
      >
        <defs>
          <style>{`
            @keyframes swirl {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .swirling {
              animation: swirl 20s linear infinite;
              transform-origin: 500px 500px;
            }
          `}</style>
        </defs>

        {/* Background - van Gogh swirling sky */}
        <rect width="1000" height="1000" fill="#0a1f3f" />

        {/* Swirling sky patterns - van Gogh style */}
        <g className={styles.skyLayer}>
          <path
            d="M 0 100 Q 150 50 300 100 T 600 100 T 1000 100"
            stroke="#ff8c00"
            strokeWidth="8"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 0 200 Q 200 150 400 180 T 800 150 T 1000 200"
            stroke="#ffa500"
            strokeWidth="10"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 0 300 Q 250 250 500 280 T 1000 300"
            stroke="#ff6b35"
            strokeWidth="12"
            fill="none"
            opacity="0.4"
          />
        </g>

        {/* Anguished figure - Munch's Scream */}
        <g className={styles.figure}>
          {/* Head */}
          <ellipse cx="500" cy="350" rx="80" ry="100" fill="#e8a87c" />

          {/* Face features - distorted, anguished */}
          <ellipse cx="475" cy="330" rx="20" ry="30" fill="#2c3e50" opacity="0.8" />
          <ellipse cx="525" cy="330" rx="20" ry="30" fill="#2c3e50" opacity="0.8" />

          {/* Open mouth - the scream */}
          <ellipse cx="500" cy="380" rx="35" ry="45" fill="#1a1a1a" />
          <path
            d="M 465 380 Q 465 390 500 410 Q 535 390 535 380"
            stroke="#8b0000"
            strokeWidth="3"
            fill="none"
          />

          {/* Hands to face - anguish */}
          <ellipse cx="420" cy="360" rx="30" ry="50" fill="#e8a87c" />
          <ellipse cx="580" cy="360" rx="30" ry="50" fill="#e8a87c" />

          {/* Body */}
          <path
            d="M 480 450 L 450 600 L 500 650 L 550 600 L 520 450 Z"
            fill="#ff6b35"
            opacity="0.8"
          />

          {/* Arms */}
          <path
            d="M 480 470 Q 400 500 380 550"
            stroke="#ff8c00"
            strokeWidth="25"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 520 470 Q 600 500 620 550"
            stroke="#ff8c00"
            strokeWidth="25"
            fill="none"
            strokeLinecap="round"
          />

          {/* Legs */}
          <path
            d="M 485 650 L 470 750"
            stroke="#1a1a1a"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 515 650 L 530 750"
            stroke="#1a1a1a"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Van Gogh swirling brushstrokes around figure */}
        <g className={styles.brushstrokes} opacity="0.7">
          <path
            d="M 300 200 Q 350 250 400 300 T 500 400"
            stroke="#ffd700"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 700 200 Q 650 250 600 300 T 500 400"
            stroke="#ffd700"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 200 400 Q 300 450 400 500"
            stroke="#ffeb3b"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 800 400 Q 700 450 600 500"
            stroke="#ffeb3b"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Radiating distortion lines */}
        <g className={styles.distortion} opacity="0.4">
          <line x1="500" y1="500" x2="100" y2="100" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="900" y2="100" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="100" y2="900" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="900" y2="900" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="50" y2="500" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="950" y2="500" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="500" y2="50" stroke="#ff1744" strokeWidth="3" />
          <line x1="500" y1="500" x2="500" y2="950" stroke="#ff1744" strokeWidth="3" />
        </g>

        {/* Additional van Gogh stars/spirals */}
        <g className={styles.stars} opacity="0.6">
          <circle cx="150" cy="150" r="20" fill="#ffff00" />
          <circle cx="150" cy="150" r="15" fill="none" stroke="#ff8c00" strokeWidth="2" />

          <circle cx="850" cy="150" r="20" fill="#ffff00" />
          <circle cx="850" cy="150" r="15" fill="none" stroke="#ff8c00" strokeWidth="2" />

          <circle cx="200" cy="800" r="18" fill="#ffff00" />
          <circle cx="200" cy="800" r="13" fill="none" stroke="#ff8c00" strokeWidth="2" />

          <circle cx="800" cy="800" r="18" fill="#ffff00" />
          <circle cx="800" cy="800" r="13" fill="none" stroke="#ff8c00" strokeWidth="2" />
        </g>

        {/* Foreground - bridge-like structure from painting */}
        <g className={styles.foreground} opacity="0.5">
          <path
            d="M 200 650 L 300 700 L 700 700 L 800 650"
            stroke="#8b4513"
            strokeWidth="15"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 250 680 L 250 750"
            stroke="#6b3410"
            strokeWidth="8"
            opacity="0.7"
          />
          <path
            d="M 500 700 L 500 770"
            stroke="#6b3410"
            strokeWidth="8"
            opacity="0.7"
          />
          <path
            d="M 750 680 L 750 750"
            stroke="#6b3410"
            strokeWidth="8"
            opacity="0.7"
          />
        </g>
      </svg>
    </main>
  );
}
