import { memo } from "react";
import { Assets, Texture } from "pixi.js";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTick } from "@pixi/react";
import { SpeakingAnimation } from "./SpeakingAnimation";
import { WinnerPointsOverlay } from "./WinnerPointsOverlay";

interface PlayerProps {
  avatar: string;
  playerName: string;
  isOnline?: boolean;
  isSpeaking?: boolean;
  isWinner?: boolean;
  isLooser?: boolean;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  songTitle?: string;
  singer?: string;
  bonus?: number;
  points?: { song: number; singer: number };
  score?: number;
  rank?: number;
  showBronzeMedal?: boolean;
  showSilverMedal?: boolean;
  showGoldMedal?: boolean;
  showWinnerCrown?: boolean;
}

const Player = memo(function Player({
  avatar,
  playerName,
  isOnline = false,
  isSpeaking = false,
  isWinner = false,
  isLooser = false,
  x,
  y,
  scaleX,
  scaleY,
  songTitle = "",
  singer = "",
  bonus = 0,
  points = { song: 0, singer: 0 },
  score = 0,
  showBronzeMedal = false,
  showSilverMedal = false,
  showGoldMedal = false,
  showWinnerCrown = false,
}: PlayerProps) {
  // Set scale to the minimum of scaleX and scaleY
  const scale = Math.min(scaleX, scaleY);

  const containerRef = useRef<any>(null);
  const [defaultAvatarTexture, setDefaultAvatarTexture] = useState(Texture.EMPTY);
  const [avatarTexture, setAvatarTexture] = useState(Texture.EMPTY);
  const [baseTexture, setBaseTexture] = useState(Texture.EMPTY);
  const [highlightTexture, setHighlightTexture] = useState(Texture.EMPTY);
  const [jetTrailTexture, setJetTrailTexture] = useState(Texture.EMPTY);
  const [baseHighlightTexture, setBaseHighlightTexture] = useState(Texture.EMPTY);
  const [incorrectAvatarTexture, setIncorrectAvatarTexture] = useState(Texture.EMPTY);
  const [incorrectBaseHighlightTexture, setIncorrectBaseHighlightTexture] = useState(Texture.EMPTY);
  const [winnerTexture, setWinnerTexture] = useState(Texture.EMPTY);
  const [goldTexture, setGoldTexture] = useState(Texture.EMPTY);
  const [silverTexture, setSilverTexture] = useState(Texture.EMPTY);
  const [bronzeTexture, setBronzeTexture] = useState(Texture.EMPTY);
  const [confettiTexture, setConfettiTexture] = useState(Texture.EMPTY);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiParticlesRef = useRef<{ x: number, y: number, vy: number }[]>([]);
  const [, forceRerender] = useState(0); // Used to trigger a re-render when needed
  const [loading, setLoading] = useState(true);
  // Animation state
  const floatOffsetRef = useRef(Math.random() * Math.PI * 2);
  const floatSpeed = 0.05; // Speed of the floating animation (reserved)
  const floatAmplitude = 12 * scale; // How far up and down to float (reserved)
  const shouldFloat = isSpeaking || (showConfetti && showGoldMedal && confettiParticlesRef.current.length > 0);
  const floatY = shouldFloat ? Math.sin(floatOffsetRef.current) * floatAmplitude : 0;
  const [yOffset, setYOffset] = useState(0); // Negative moves up, positive moves down

  // Medal fade-in animation state
  const [bronzeMedalAlpha, setBronzeMedalAlpha] = useState(0);
  const [silverMedalAlpha, setSilverMedalAlpha] = useState(0);
  const [goldMedalAlpha, setGoldMedalAlpha] = useState(0);
  // const [crownAlpha, setCrownAlpha] = useState(0);

  // Medal vertical position state
  const [bronzeMedalY, setBronzeMedalY] = useState(150); // Start above the view
  const [silverMedalY, setSilverMedalY] = useState(150);
  const [goldMedalY, setGoldMedalY] = useState(150);

  // Jet trail alpha for smooth fade-in
  const winnerTarget = -40 * scale;
  let jetTrailAlpha = 0;
  if (isWinner) {
    // The closer yOffset is to winnerTarget, the closer alpha is to 1
    const progress = Math.min(1, Math.max(0, (yOffset - 0) / (winnerTarget - 0)));
    jetTrailAlpha = progress;
  }

  // Animation tick
  // Only animate yOffset ONCE when isWinner or isLooser changes, not every frame
  useEffect(() => {
    const riseMagnitude = 40 * scale; // pixels
    let animFrame: number | null = null;
    let running = true;

    // Only animate if winner or looser
    if (isWinner || isLooser) {
      const target = isWinner ? -riseMagnitude : riseMagnitude;
      function animate() {
        setYOffset(prev => {
          const ease = 0.03;
          const next = prev + (target - prev) * ease;
          // If close enough to target, snap and stop animating
          if (Math.abs(next - target) < 0.5) {
            running = false;
            return target;
          }
          return next;
        });
        if (running) {
          animFrame = requestAnimationFrame(animate);
        }
      }
      animFrame = requestAnimationFrame(animate);
    } else {
      // Reset to 0 if neither winner nor looser
      setYOffset(0);
    }

    return () => {
      running = false;
      if (animFrame) cancelAnimationFrame(animFrame);
    };
    // Only rerun when isWinner, isLooser, or scale changes
  }, [isWinner, isLooser, scale]);

  // Use globally preloaded textures
  useEffect(() => {
    const loadedDefault = Assets.get("images/default_avatar_highlight.png") as Texture;
    const loadedAvatar = Assets.get("images" + avatar + ".png") as Texture;
    const loadedBase = Assets.get("images/player_base.png") as Texture;
    const loadedHighlight = Assets.get("images" + avatar + "_highlight.png") as Texture;
    const loadedJet = Assets.get("images" + avatar + "_jet2_trail.png") as Texture;
    const loadedBaseHL = Assets.get("images" + avatar + "_buzz_hightlight.png") as Texture;
    const loadedIncorrectAvatar = Assets.get("images/incorrect_highlight.png") as Texture;
    const loadedIncorrectBaseHL = Assets.get("images/incorrect_buzz_ighlight.png") as Texture;
    const loadedWinner = Assets.get("images/result/winner_crown.png") as Texture;
    const loadedGold = Assets.get("images/result/gold_medal.png") as Texture;
    const loadedSilver = Assets.get("images/result/silver_medal.png") as Texture;
    const loadedBronze = Assets.get("images/result/bronze_medal.png") as Texture;
    const loadedConfetti = Assets.get("images/result/confetti.png") as Texture;

    setDefaultAvatarTexture(loadedDefault ?? Texture.EMPTY);
    setAvatarTexture(loadedAvatar ?? Texture.EMPTY);
    setBaseTexture(loadedBase ?? Texture.EMPTY);
    setHighlightTexture(loadedHighlight ?? Texture.EMPTY);
    setJetTrailTexture(loadedJet ?? Texture.EMPTY);
    setBaseHighlightTexture(loadedBaseHL ?? Texture.EMPTY);
    setIncorrectAvatarTexture(loadedIncorrectAvatar ?? Texture.EMPTY);
    setIncorrectBaseHighlightTexture(loadedIncorrectBaseHL ?? Texture.EMPTY);
    setWinnerTexture(loadedWinner ?? Texture.EMPTY);
    setGoldTexture(loadedGold ?? Texture.EMPTY);
    setSilverTexture(loadedSilver ?? Texture.EMPTY);
    setBronzeTexture(loadedBronze ?? Texture.EMPTY);
    setConfettiTexture(loadedConfetti ?? Texture.EMPTY);
    setLoading(false);
  }, [avatar]);

  // Smooth medal fade-in animations
  // Medal and crown fade-in animations using useTick
  const FADE_DURATION = 500; // ms

  // Store animation state for each medal/crown
  const [bronzeStart, setBronzeStart] = useState<number | null>(null);
  const [silverStart, setSilverStart] = useState<number | null>(null);
  const [goldStart, setGoldStart] = useState<number | null>(null);
  const [crownStart, setCrownStart] = useState<number | null>(null);

  const [crownScale, setCrownScale] = useState(1);
  const CROWN_POP_SCALE = 1.2; // How big the crown should pop
  const CROWN_POP_DURATION = 800; // ms, how long the pop animation lasts

  // Reset animation start times when show* changes
  useEffect(() => {
    setBronzeStart(showBronzeMedal ? performance.now() : null);
    if (!showBronzeMedal) setBronzeMedalAlpha(0);
  }, [showBronzeMedal]);

  useEffect(() => {
    setSilverStart(showSilverMedal ? performance.now() : null);
    if (!showSilverMedal) setSilverMedalAlpha(0);
  }, [showSilverMedal]);

  useEffect(() => {
    setGoldStart(showGoldMedal ? performance.now() : null);
    if (!showGoldMedal) setGoldMedalAlpha(0);
  }, [showGoldMedal]);

  useEffect(() => {
    setCrownStart(showWinnerCrown ? performance.now() : null);
    if (!showWinnerCrown) {
      // setCrownAlpha(0);
      setCrownScale(1);
    } else {
      setCrownScale(CROWN_POP_SCALE); // <-- Start at pop scale
    }
  }, [showWinnerCrown]);

  useEffect(() => {
    if (
      (showGoldMedal && goldMedalAlpha === 1) ||
      (showSilverMedal && silverMedalAlpha === 1) ||
      (showBronzeMedal && bronzeMedalAlpha === 1)
    ) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [showGoldMedal, goldMedalAlpha, showSilverMedal, silverMedalAlpha, showBronzeMedal, bronzeMedalAlpha]);

  useEffect(() => {
    if (showConfetti) {
      confettiParticlesRef.current = Array.from({ length: 1 }, () => ({
        x: 0,
        y: (-200 - Math.random() * 100) * scale,
        vy: 1.4 + Math.random(),
      }));
      forceRerender(n => n + 1); // Trigger a re-render to show confetti
    } else {
      confettiParticlesRef.current = [];
      forceRerender(n => n + 1); // Hide confetti
    }
  }, [showConfetti, scale]);

  // Reduce FPS drop by throttling rerenders for float/confetti animations

  // Throttle rerenders to at most 30fps (every ~33ms)
  const lastRerenderRef = useRef<number>(0);

  useTick((delta) => {
    let shouldRerender = false;

    // Floating animation
    if (shouldFloat) {
      floatOffsetRef.current = (floatOffsetRef.current + floatSpeed * delta.deltaTime) % (Math.PI * 2);
      shouldRerender = true;
    }

    // Confetti animation
    if (showConfetti && confettiParticlesRef.current.length > 0) {
      let changed = false;
      confettiParticlesRef.current = confettiParticlesRef.current
        .map((p) => {
          const newY = p.y + p.vy * delta.deltaTime;
          if (newY !== p.y) changed = true;
          return { ...p, y: newY };
        })
        .filter((p) => p.y < 600 * scale);
      if (changed) shouldRerender = true;
    }

    // Infinite confetti animation
    // if (showConfetti && confettiParticlesRef.current.length > 0) {
    //   let changed = false;
    //   confettiParticlesRef.current = confettiParticlesRef.current.map((p) => {
    //     let newY = p.y + p.vy * delta.deltaTime;
    //     // If confetti falls below the bottom, reset to top
    //     if (newY > 400 * scale) {
    //       newY = (-200 - Math.random() * 100) * scale;
    //       changed = true;
    //     } else if (newY !== p.y) {
    //       changed = true;
    //     }
    //     return { ...p, y: newY };
    //   });
    //   if (changed) shouldRerender = true;
    // }

    // Only rerender if enough time has passed since last rerender
    const now = performance.now();
    if (shouldRerender && now - lastRerenderRef.current > 50) {
      lastRerenderRef.current = now;
      forceRerender(n => n + 1);
    }
  });

  useTick(
    useCallback(() => {
      const now = performance.now();

      if (showBronzeMedal && bronzeStart !== null) {
        const progress = Math.min(1, (now - bronzeStart) / FADE_DURATION);
        setBronzeMedalAlpha(Math.pow(progress, 1.5));
        setBronzeMedalY((230 + 50 * progress) * scale);
      }

      if (showSilverMedal && silverStart !== null) {
        const progress = Math.min(1, (now - silverStart) / FADE_DURATION);
        setSilverMedalAlpha(progress);
        setSilverMedalY((230 + 50 * progress) * scale);
      }

      if (showGoldMedal && goldStart !== null) {
        const progress = Math.min(1, (now - goldStart) / FADE_DURATION);
        setGoldMedalAlpha(progress);
        setGoldMedalY((230 + 50 * progress) * scale);
      }

      if (showWinnerCrown && crownStart !== null) {
        // setCrownAlpha(progress);
        const elapsed = now - crownStart;
        if (elapsed < CROWN_POP_DURATION) {
          const half = CROWN_POP_DURATION / 2;
          let scale;
          if (elapsed < half) {
            // First half: scale 1 -> 1.5
            const t = elapsed / half;
            scale = 1 + (CROWN_POP_SCALE - 1) * t;
          } else {
            // Second half: scale 1.5 -> 1
            const t = (elapsed - half) / half;
            scale = CROWN_POP_SCALE - (CROWN_POP_SCALE - 1) * t;
          }
          setCrownScale(scale);
        } else if (crownScale !== 1) {
          setCrownScale(1); // Snap to normal at end
        }
      }
    }, [showBronzeMedal, bronzeStart, showSilverMedal, silverStart, showGoldMedal, goldStart, showWinnerCrown, crownStart])
  );

  // Select highlight textures based on isLooser and showCurrentHighlight
  const avatarHighlightTexture = isOnline
    ? (isLooser ? incorrectAvatarTexture : highlightTexture)
    : defaultAvatarTexture;

  const baseHighlightTextureToUse = isOnline
    ? (isLooser ? incorrectBaseHighlightTexture : baseHighlightTexture)
    : null;

  const getMedalTexture = () => {
    if (showGoldMedal) return goldTexture;
    if (showSilverMedal) return silverTexture;
    if (showBronzeMedal) return bronzeTexture;
    return null;
  };
  const medalTexture = getMedalTexture();

  const getMedalAlpha = () => {
    if (showGoldMedal) return goldMedalAlpha;
    if (showSilverMedal) return silverMedalAlpha;
    if (showBronzeMedal) return bronzeMedalAlpha;
    return 0;
  };
  const medalAlpha = getMedalAlpha();

  // Calculate player score based on winner/looser status
  let playerScore = score;
  let playerScoreColor = 0xffffff; // default white
  if (isWinner || score >= 0) {
    playerScoreColor = 0x00ffd1; // Winner color
  } else if (isLooser || score < 0) {
    playerScoreColor = 0xff1e34; // Looser color
  }


  if (loading) {
    return null;
  }

  return (
    <pixiContainer
      ref={containerRef}
      anchor={{ x: 0.5, y: 0.5 }}
      x={x}
      y={y + yOffset}
    >
      {/* Winner crown for first place */}
      {showWinnerCrown && (
        <pixiSprite
          texture={winnerTexture}
          anchor={{ x: 1, y: 1 }}
          x={54 * scaleX}
          y={(-50 + floatY) * scale}
          scale={scale * crownScale}
          alpha={1}
        />
      )}
      {/* Avatar (top layer) */}
      <pixiSprite
        texture={avatarTexture}
        anchor={{ x: 0.5, y: 0.5 }}
        x={0}
        y={floatY * scale}
        scale={scale}
      />
      {/* Static highlight effect */}
      {isOnline ? (
        <pixiSprite
          texture={avatarHighlightTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={floatY * scale}
          scale={scale}
        />
      ) : (
        <pixiSprite
          texture={defaultAvatarTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={floatY * scale}
          scale={scale}
        />
      )}
      {isWinner && (
        <WinnerPointsOverlay
          songTitle={songTitle}
          singer={singer}
          bonus={bonus}
          points={points}
          scale={scale}
        />
      )}
      {/* Jet trail */}
      {isWinner && (
        <pixiSprite
          texture={jetTrailTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={260 * scale}
          scale={scale}
          alpha={jetTrailAlpha}
        />
      )}
      {/* Medal for ranking */}
      {medalTexture && (
        <pixiSprite
          texture={medalTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={showGoldMedal ? goldMedalY : showSilverMedal ? silverMedalY : bronzeMedalY}
          scale={scale}
          alpha={medalAlpha}
        />
      )}
      {/* Player base (bottom layer) */}
      <pixiSprite
        texture={baseTexture}
        anchor={{ x: 0.5, y: 0.5 }}
        x={0}
        y={150 * scale}
        scale={scale}
      />
      {/* Player base highlight */}
      {isOnline && baseHighlightTextureToUse && (
        <pixiSprite
          texture={baseHighlightTextureToUse}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={150 * scale}
          scale={scale}
        />
      )}
      {/* Player name text */}
      <pixiText
        text={playerName}
        anchor={{ x: 0.5, y: 0.5 }}
        x={-54 * scale}
        y={150 * scale}
        style={{
          fontSize: 24 * scale,
          fill: 0xffffff,
          fontFamily: ["Gilroy", 'serif'],
          fontWeight: "bold",
        }}
      />
      {/* Player score text */}
      <pixiText
        text={playerScore}
        anchor={{ x: 0.5, y: 0.5 }}
        x={84 * scale}
        y={150 * scale}
        style={{
          fontSize: 24 * scale,
          fill: playerScoreColor,
          fontFamily: ["Gilroy", 'serif'],
          fontWeight: "bold",
        }}
      />
      {/* Confetti effect for first place */}
      {showConfetti && showGoldMedal && confettiParticlesRef.current.map((p, i) => (
        <pixiSprite
          key={i}
          texture={confettiTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={p.x}
          y={p.y}
          scale={0.7 * scale}
          alpha={1}
        />
      ))}
      {/* Spreading highlight animations */}
      <SpeakingAnimation isActive={isSpeaking} scale={scale} avatar={avatar} />
    </pixiContainer>
  );
}, (prev, next) => {
  return (
    prev.x === next.x &&
    prev.y === next.y &&
    prev.scaleX === next.scaleX &&
    prev.scaleY === next.scaleY &&
    prev.isSpeaking === next.isSpeaking &&
    prev.isLooser === next.isLooser &&
    prev.showBronzeMedal === next.showBronzeMedal &&
    prev.showSilverMedal === next.showSilverMedal &&
    prev.showGoldMedal === next.showGoldMedal &&
    prev.showWinnerCrown === next.showWinnerCrown &&
    prev.avatar === next.avatar &&
    prev.playerName === next.playerName &&
    prev.score === next.score
    // 🚀 ignore everything else to avoid useless redraws
  );
});

export default Player;