import { Assets, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";

interface SoundBarProps {
  x: number;
  y: number;
  scale: number;
  speakerIndex?: number | null;
  winnerIndex?: number | null;
  loserIndex?: number | null;
}

export function SoundBar({ x, y, scale, speakerIndex = null, winnerIndex = null, loserIndex = null }: SoundBarProps) {
  const containerRef = useRef(null);
  const [soundBarTexture, setSoundBarTexture] = useState(Texture.EMPTY);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const [progress, setProgress] = useState(0); // Smooth progress from 0 to 20

  // Calculate bar heights once when component mounts
  useEffect(() => {
    const heights = [];
    for (let i = 0; i < 20; i++) {
      heights.push(25 + Math.random() * 49);
    }
    setBarHeights(heights);
  }, []);

  // Update progress smoothly every 50ms for smooth animation
  useEffect(() => {
    if (
      (speakerIndex !== null && speakerIndex !== undefined) ||
      (winnerIndex !== null && winnerIndex !== undefined) ||
      (loserIndex !== null && loserIndex !== undefined)
    ) {
      // Stop animation when a speaker, winner, or loser is selected
      return;
    }
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Reset to 0 when reaching the end (20 bars), otherwise increment smoothly
        const increment = 20 / (7000 / 50); // 7 seconds total for all 20 bars
        return prevProgress >= 20 ? 0 : prevProgress + increment;
      });
    }, 50); // 50ms for smooth updates

    return () => clearInterval(interval);
  }, [speakerIndex, winnerIndex, loserIndex]);

  // Preload the sound bar texture
  useEffect(() => {
    let texturePath = "/sound_bar.png";
    if (speakerIndex !== null && speakerIndex !== undefined) {
      texturePath = `/avatar_${speakerIndex + 1}_sound_bar.png`;
    }
    Assets.load(texturePath).then((result) => {
      setSoundBarTexture(result);
    });
  }, [speakerIndex]);

  return (
    <pixiContainer ref={containerRef} x={x} y={y} anchor={{ x: 0.5, y: 0.5 }}>
      {/* Sound bar sprite (background) */}
      <pixiSprite
        texture={soundBarTexture}
        anchor={{ x: 0.5, y: 1 }}
        x={0}
        y={0}
        scale={scale}
      />

      {/* Timeline bars (drawn graphics) */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Draw multiple timeline bars with smooth progress
          for (let i = 0; i < 20; i++) {
            const barWidth = 16 * scale;
            const barSpacing = 20 * scale;
            const startX = -187 * scale + (i * barSpacing);
            const barHeight = (barHeights[i] || 25) * scale;
            const startY = -60 * scale - barHeight / 2;

            // Calculate bar color with smooth progress
            let barColor: number;
            if (i < Math.floor(progress)) {
              // Fully filled bars
              barColor = 0xFFFFFF;
            } else if (i === Math.floor(progress)) {
              // Currently filling bar - water effect from left to right
              const fillPercentage = progress - Math.floor(progress);

              // Draw dark background first
              g.beginFill(0x1B0A33);
              g.drawRoundedRect(startX, startY, barWidth, barHeight, 19 * scale);
              g.endFill();

              // Draw filled portion from left to right like water
              const filledWidth = barWidth * fillPercentage;

              if (filledWidth > 0) {
                g.beginFill(0xFFFFFF);
                g.drawRoundedRect(startX, startY, filledWidth, barHeight, 19 * scale);
                g.endFill();
              }
              continue;
            } else {
              // Unfilled bars
              barColor = 0x1B0A33;
            }

            g.beginFill(barColor);
            g.drawRoundedRect(startX, startY, barWidth, barHeight, 19 * scale);
            g.endFill();
          }
        }}
      />
    </pixiContainer>
  );
}
