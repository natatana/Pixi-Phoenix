import { Assets, Texture } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { useTick } from "@pixi/react";

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
  const MIN_BAR_HEIGHT = 30;
  const MAX_BAR_HEIGHT = 74;
  // Get 0, 0.5, or 1 randomly
  function randomZeroHalfOne() {
    const choices = [0, 0.5, 1];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const randomHeight = () => MIN_BAR_HEIGHT + randomZeroHalfOne() * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
  const barTargetsRef = useRef<number[]>([]);

  // Calculate bar heights once when component mounts
  useEffect(() => {
    const heights: number[] = Array.from({ length: 20 }, () => randomHeight());
    setBarHeights(heights);
    barTargetsRef.current = Array.from({ length: 20 }, () => randomHeight());
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

  // Per-frame grow/shrink animation for bar heights
  useTick((options) => {
    // Pause animation if selection is active
    if (
      (speakerIndex !== null && speakerIndex !== undefined) ||
      (winnerIndex !== null && winnerIndex !== undefined) ||
      (loserIndex !== null && loserIndex !== undefined)
    ) {
      return;
    }

    const easing = 0.16; // higher = snappier
    setBarHeights((prev) => {
      if (prev.length === 0) return prev;
      const next: number[] = new Array(prev.length);
      for (let i = 0; i < prev.length; i++) {
        let target = barTargetsRef.current[i];
        if (typeof target !== "number") target = randomHeight();
        const current = prev[i];
        const step = (target - current) * easing * options.deltaTime;
        let updated = current + step;
        // Clamp and retarget when close
        if (Math.abs(target - updated) < 1) {
          barTargetsRef.current[i] = randomHeight();
        }
        if (updated < MIN_BAR_HEIGHT) updated = MIN_BAR_HEIGHT;
        if (updated > MAX_BAR_HEIGHT) updated = MAX_BAR_HEIGHT;
        next[i] = updated;
      }
      return next;
    });
  });

  // Select the sound bar texture from preloaded assets
  useEffect(() => {
    let texturePath = "images/sound_bar.png";
    if (speakerIndex !== null && speakerIndex !== undefined) {
      texturePath = `images/avatar_${speakerIndex + 1}_sound_bar.png`;
    }
    const tex = (Assets.get(texturePath) as Texture) ?? Texture.EMPTY;
    setSoundBarTexture(tex);
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
        cacheAsTexture={() => true}
      />

      {/* Timeline bars (drawn graphics) */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Draw multiple timeline bars with smooth progress
          for (let i = 0; i < 20; i++) {
            const barWidth = 16 * scale;
            const barSpacing = 24 * scale;
            const startX = -240 * scale + (i * barSpacing);
            const barHeight = (barHeights[i] || MIN_BAR_HEIGHT) * scale;
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
