import { Assets, Texture } from "pixi.js";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTick } from "@pixi/react";
import { SPEAK_COUNTDOWN_SECONDS } from "../utils/config";

interface SoundBarProps {
  x: number;
  y: number;
  scale: number;
  speakerIndex?: number | null; // null/undefined = no speaker, 0-3 = player index
  animate?: boolean;
}

export function SoundBar({ x, y, scale, speakerIndex, animate }: SoundBarProps) {
  const containerRef = useRef(null);
  const [soundBarTexture, setSoundBarTexture] = useState(Texture.EMPTY);
  const [progress, setProgress] = useState(0); // Smooth progress from 0 to 20
  const [countdown, setCountdown] = useState<number | null>(null);
  const [, forceRerender] = useState(0); // dummy state to force rerender

  const MIN_BAR_HEIGHT = 30;
  const MAX_BAR_HEIGHT = 74;

  function randomZeroHalfOne() {
    const choices = [0, 0.2, 0.4, 0.6, 0.8, 1];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  const randomHeight = () => MIN_BAR_HEIGHT + randomZeroHalfOne() * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);

  // Use refs for bar heights and targets
  const barHeightsRef = useRef<number[]>(Array.from({ length: 20 }, () => randomHeight()));
  const barTargetsRef = useRef<number[]>(Array.from({ length: 20 }, () => randomHeight()));

  // Initialize bar heights and targets once
  useEffect(() => {
    barHeightsRef.current = Array.from({ length: 20 }, () => randomHeight());
    barTargetsRef.current = Array.from({ length: 20 }, () => randomHeight());
    forceRerender((v) => v + 1); // initial render
  }, []);

  // Update progress smoothly every 100ms for smooth animation
  useEffect(() => {
    if (!animate) {
      return;
    }
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = 20 / (7000 / 100); // 7 seconds total for all 20 bars
        return prevProgress >= 20 ? 0 : prevProgress + increment;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [animate]);

  // Start countdown when speakerIndex becomes active
  useEffect(() => {
    if (speakerIndex !== null && speakerIndex !== undefined) {
      setCountdown(SPEAK_COUNTDOWN_SECONDS);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdown(null);
    }
  }, [speakerIndex]);

  // Per-frame grow/shrink animation for bar heights (using refs, not state)
  useTick((options) => {
    if (!animate) return;

    const easing = 0.08;
    let changed = false;
    for (let i = 0; i < 20; i++) {
      let target = barTargetsRef.current[i];
      if (typeof target !== "number") target = randomHeight();
      const current = barHeightsRef.current[i];
      const step = (target - current) * easing * options.deltaTime;
      let updated = current + step;
      if (Math.abs(target - updated) < 1) {
        barTargetsRef.current[i] = randomHeight();
      }
      if (updated < MIN_BAR_HEIGHT) updated = MIN_BAR_HEIGHT;
      if (updated > MAX_BAR_HEIGHT) updated = MAX_BAR_HEIGHT;
      if (Math.abs(updated - current) > 0.5) changed = true; // only if significant change
      barHeightsRef.current[i] = updated;
    }
    // Only force rerender if something changed
    if (changed) forceRerender((v) => v + 1);
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

  // Memoize draw function to avoid unnecessary re-renders
  const draw = useCallback((g: any) => {
    g.clear();
    for (let i = 0; i < 20; i++) {
      const barWidth = 16 * scale;
      const barSpacing = 24 * scale;
      const startX = -240 * scale + (i * barSpacing);
      const barHeight = (barHeightsRef.current[i] || MIN_BAR_HEIGHT) * scale;
      const startY = -60 * scale - barHeight / 2;

      let barColor: number;
      if (i < Math.floor(progress)) {
        barColor = 0xFFFFFF;
      } else if (i === Math.floor(progress)) {
        const fillPercentage = progress - Math.floor(progress);
        g.beginFill(0x1B0A33);
        g.drawRoundedRect(startX, startY, barWidth, barHeight, 19 * scale);
        g.endFill();

        const filledWidth = barWidth * fillPercentage;
        if (filledWidth > 0) {
          g.beginFill(0xFFFFFF);
          g.drawRoundedRect(startX, startY, filledWidth, barHeight, 19 * scale);
          g.endFill();
        }
        continue;
      } else {
        barColor = 0x1B0A33;
      }

      g.beginFill(barColor);
      g.drawRoundedRect(startX, startY, barWidth, barHeight, 19 * scale);
      g.endFill();
    }
  }, [progress, scale]);

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
      {/* Show countdown if speaking, else show bars */}
      {(speakerIndex !== null && countdown !== null) ? (
        <pixiText
          text={`: ${countdown.toString()}`}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={-80 * scale}
          style={{
            fontFamily: ["Gilroy", 'serif'],
            fontSize: 96 * scale,
            fill: 0xffffff,
            fontWeight: "bold",
            align: "center",
          }}
        />
      ) : (
        <pixiGraphics draw={draw} />
      )}
    </pixiContainer>
  );
}