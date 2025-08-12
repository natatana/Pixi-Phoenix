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
  const MIN_BAR_HEIGHT = 10;
  const MAX_BAR_HEIGHT = 74;
  const timeRef = useRef(0);
  const slowTimeRef = useRef(0);
  const SINE_SPEED = 0.04; // base speed factor
  const SLOW_SPEED = 0.012; // slow modulation speed
  const AMP_VARIATION = 0.18; // amplitude modulation intensity (0..1)
  const PHASE_JITTER = 0.18; // max per-bar phase jitter in radians (slightly reduced for coherence)
  const SLOW_PHASE_STEP = 0.0; // make global amplitude modulation in-phase across bars
  const phaseJitterRef = useRef<number[]>([]);

  // Multi-wave config to create several peaks across bars
  // Sum of sinusoids with different spatial wavelengths and time speeds
  const WAVES = [
    { amp: 0.55, spatialStep: 0.55, timeSpeed: 1.0 }, // primary traveling wave
    { amp: 0.30, spatialStep: 1.10, timeSpeed: 1.6 }, // shorter wavelength accent
    { amp: 0.20, spatialStep: 0.28, timeSpeed: 0.6 }, // long wavelength sway
  ] as const;

  // Smooth noise parameters
  const noiseTimeRef = useRef(0);
  const NOISE_BASE_SPEED = 0.02;
  const NOISE_AMP = 0.10; // fraction of main amplitude (slightly reduced)
  const noiseSpeed1Ref = useRef<number[]>([]);
  const noiseSpeed2Ref = useRef<number[]>([]);
  const noisePhase1Ref = useRef<number[]>([]);
  const noisePhase2Ref = useRef<number[]>([]);

  // Calculate initial bar heights and stable per-bar jitters
  useEffect(() => {
    const base = (MIN_BAR_HEIGHT + MAX_BAR_HEIGHT) / 2;
    const amp = (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) / 2;
    const heights: number[] = Array.from({ length: 20 }, (_, i) => {
      // sum of spatial waves at t=0
      let s = 0;
      for (const w of WAVES) {
        s += w.amp * Math.sin(i * w.spatialStep);
      }
      return base + amp * s;
    });
    setBarHeights(heights);

    // Stable per-bar phase jitter
    phaseJitterRef.current = Array.from({ length: 20 }, () => (Math.random() * 2 - 1) * PHASE_JITTER);

    // Initialize smooth noise params per bar
    noiseSpeed1Ref.current = Array.from({ length: 20 }, () => NOISE_BASE_SPEED * (0.75 + Math.random() * 0.75));
    noiseSpeed2Ref.current = Array.from({ length: 20 }, () => NOISE_BASE_SPEED * (1.2 + Math.random() * 1.2));
    noisePhase1Ref.current = Array.from({ length: 20 }, () => Math.random() * Math.PI * 2);
    noisePhase2Ref.current = Array.from({ length: 20 }, () => Math.random() * Math.PI * 2);
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

  // Per-frame multi-wave sound-graph style animation for bar heights
  useTick((options) => {
    // Pause animation if selection is active
    if (
      (speakerIndex !== null && speakerIndex !== undefined) ||
      (winnerIndex !== null && winnerIndex !== undefined) ||
      (loserIndex !== null && loserIndex !== undefined)
    ) {
      return;
    }

    timeRef.current += SINE_SPEED * options.deltaTime;
    slowTimeRef.current += SLOW_SPEED * options.deltaTime;
    noiseTimeRef.current += options.deltaTime;

    const base = (MIN_BAR_HEIGHT + MAX_BAR_HEIGHT) / 2;
    const amp = (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) / 2;

    setBarHeights(() => {
      const count = 20;
      const next: number[] = new Array(count);
      for (let i = 0; i < count; i++) {
        // Global slow amplitude modulation around 1.0 (in-phase across bars)
        const ampScale = 1 - AMP_VARIATION * 0.5 + (AMP_VARIATION * 0.5) * (1 + Math.sin(slowTimeRef.current + i * SLOW_PHASE_STEP));

        // Sum of waves to create several peaks across the bar indices
        let s = 0;
        for (const w of WAVES) {
          const phase = timeRef.current * w.timeSpeed + i * w.spatialStep + (phaseJitterRef.current[i] || 0);
          s += w.amp * Math.sin(phase);
        }

        // Smooth per-bar noise: sum of two sines with different speeds/phases
        const n1 = Math.sin((noisePhase1Ref.current[i] || 0) + noiseTimeRef.current * (noiseSpeed1Ref.current[i] || NOISE_BASE_SPEED));
        const n2 = Math.sin((noisePhase2Ref.current[i] || 0) + noiseTimeRef.current * (noiseSpeed2Ref.current[i] || NOISE_BASE_SPEED * 1.6));
        const noise = NOISE_AMP * amp * (0.6 * n1 + 0.4 * n2);

        let h = base + (amp * ampScale) * s + noise;
        if (h < MIN_BAR_HEIGHT) h = MIN_BAR_HEIGHT;
        if (h > MAX_BAR_HEIGHT) h = MAX_BAR_HEIGHT;
        next[i] = h;
      }
      return next;
    });
  });

  // Select the sound bar texture from preloaded assets
  useEffect(() => {
    let texturePath = "/sound_bar.png";
    if (speakerIndex !== null && speakerIndex !== undefined) {
      texturePath = `/avatar_${speakerIndex + 1}_sound_bar.png`;
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
      />

      {/* Timeline bars (drawn graphics) */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Draw multiple timeline bars with smooth progress
          for (let i = 0; i < 20; i++) {
            const barWidth = 10 * scale;
            const barSpacing = 20 * scale;
            const startX = -187 * scale + (i * barSpacing);
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
