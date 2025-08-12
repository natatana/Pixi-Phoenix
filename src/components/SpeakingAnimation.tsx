import { useEffect, useState } from "react";
import { Assets, Texture } from "pixi.js";
import { useTick } from "@pixi/react";

interface SpeakingAnimationProps {
  avatar: string;
  isActive: boolean;
  scale: number;
  /** Maximum number of concurrent ripple rings */
  maxRings?: number;
  /** Speed multiplier for ring growth */
  animationSpeed?: number;
  /** Scale at which a ring disappears */
  maxRingScale?: number;
  /** Scale threshold to spawn the next ring */
  nextRingTriggerScale?: number;
  /** Minimum alpha for the faintest ring */
  minAlpha?: number;
  /** Auto stop animation after N milliseconds. Set 0/undefined to disable. */
  autoStopAfterMs?: number;
}

export function SpeakingAnimation({
  avatar,
  isActive,
  scale,
  maxRings = 3,
  animationSpeed = 0.005,
  maxRingScale = 1.5,
  nextRingTriggerScale = 1.25,
  minAlpha = 0.3,
  autoStopAfterMs = 10000,
}: SpeakingAnimationProps) {
  const [highlightTexture, setHighlightTexture] = useState(Texture.EMPTY);
  const [ringScales, setRingScales] = useState<number[]>([]);
  const [ringAlphas, setRingAlphas] = useState<number[]>([]);
  const [isEnded, setIsEnded] = useState(false);
  const [stopTimerId, setStopTimerId] = useState<number | null>(null);

  // Use preloaded highlight texture
  useEffect(() => {
    const tex = (Assets.get(avatar + "_highlight.png") as Texture) ?? Texture.EMPTY;
    setHighlightTexture(tex);
  }, [avatar]);

  // Reset when toggling active state and optionally auto stop
  useEffect(() => {
    // Clear any previous stop timer
    if (stopTimerId !== null) {
      clearTimeout(stopTimerId);
      setStopTimerId(null);
    }

    if (isActive) {
      setIsEnded(false);
      setRingScales([1]);
      setRingAlphas([1]);

      if (autoStopAfterMs && autoStopAfterMs > 0) {
        const id = window.setTimeout(() => {
          setIsEnded(true);
          setRingScales([]);
          setRingAlphas([]);
        }, autoStopAfterMs);
        setStopTimerId(id);
      }
    } else {
      setIsEnded(false);
      setRingScales([]);
      setRingAlphas([]);
    }
  }, [isActive, autoStopAfterMs]);

  useTick((options) => {
    if (!isActive || isEnded) return;

    setRingScales((prevScales) => {
      const nextScales: number[] = [];
      for (const prevScale of prevScales) {
        const grown = prevScale + animationSpeed * options.deltaTime;
        if (grown < maxRingScale) {
          nextScales.push(grown);
        }
      }

      // Spawn new ring when the last one passes trigger, limit concurrent rings
      if (
        nextScales.length > 0 &&
        nextScales.length < maxRings &&
        nextScales[nextScales.length - 1] >= nextRingTriggerScale
      ) {
        nextScales.push(1);
      }

      // Compute alphas for current rings
      const nextAlphas: number[] = [];
      for (let i = 0; i < nextScales.length; i++) {
        nextAlphas[i] = Math.max(
          minAlpha,
          1 - (nextScales[i] - 1) / (maxRingScale - 1)
        );
      }
      setRingAlphas(nextAlphas);

      return nextScales;
    });
  });

  if (!isActive || isEnded) return null;

  return (
    <>
      {ringScales.map((ringScale, index) => (
        <pixiSprite
          key={`speaking-ring-${index}`}
          texture={highlightTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={0}
          scale={scale * ringScale}
          alpha={ringAlphas[index] ?? 0}
        />
      ))}
    </>
  );
}


