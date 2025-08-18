import { Assets, Texture, Ticker } from "pixi.js";
import { useEffect, useRef, useState } from "react";
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
  scale: number;
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

export function Player({
  avatar,
  playerName,
  isOnline = false,
  isSpeaking = false,
  isWinner = false,
  isLooser = false,
  x,
  y,
  scale,
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
  const [loading, setLoading] = useState(true);

  type ConfettiParticle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    life: number;
  };
  const CONFETTI_PARTICLE_COUNT = 20;

  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [, setConfettiTimer] = useState(0);
  // const [showCurrentHighlight, setShowCurrentHighlight] = useState(false);

  // Animation state
  const [floatOffset, setFloatOffset] = useState(Math.random() * Math.PI * 2);
  const floatSpeed = 0.05; // Speed of the floating animation (reserved)
  const floatAmplitude = 10 * scale; // How far up and down to float (reserved)
  const [yOffset, setYOffset] = useState(0); // Negative moves up, positive moves down

  // Medal fade-in animation state
  const [bronzeMedalAlpha, setBronzeMedalAlpha] = useState(0);
  const [silverMedalAlpha, setSilverMedalAlpha] = useState(0);
  const [goldMedalAlpha, setGoldMedalAlpha] = useState(0);
  const [crownAlpha, setCrownAlpha] = useState(0);

  // Jet trail alpha for smooth fade-in
  const winnerTarget = -40 * scale;
  let jetTrailAlpha = 0;
  if (isWinner) {
    // The closer yOffset is to winnerTarget, the closer alpha is to 1
    const progress = Math.min(1, Math.max(0, (yOffset - 0) / (winnerTarget - 0)));
    jetTrailAlpha = progress;
  }

  // Animation tick
  useTick((options) => {
    const riseMagnitude = 40 * scale; // pixels
    const target = isWinner ? -riseMagnitude : isLooser ? riseMagnitude : 0;

    setYOffset((prev) => {
      const ease = 1 - Math.pow(0.001, options.deltaTime / 200);
      return prev + (target - prev) * ease;
    });
    if (isSpeaking) {
      setFloatOffset((prev) => (prev + floatSpeed * options.deltaTime) % (Math.PI * 2));
    }
  });

  // Use globally preloaded textures
  useEffect(() => {
    const loadedDefault = Assets.get("/images/default_avatar_highlight.png") as Texture;
    const loadedAvatar = Assets.get("/images" + avatar + ".png") as Texture;
    const loadedBase = Assets.get("/images/player_base.png") as Texture;
    const loadedHighlight = Assets.get("/images" + avatar + "_highlight.png") as Texture;
    const loadedJet = Assets.get("/images" + avatar + "_jet2_trail.png") as Texture;
    const loadedBaseHL = Assets.get("/images" + avatar + "_buzz_hightlight.png") as Texture;
    const loadedIncorrectAvatar = Assets.get("/images/incorrect_highlight.png") as Texture;
    const loadedIncorrectBaseHL = Assets.get("/images/incorrect_buzz_ighlight.png") as Texture;
    const loadedWinner = Assets.get("/images/result/winner_crown.png") as Texture;
    const loadedGold = Assets.get("/images/result/gold_medal.png") as Texture;
    const loadedSilver = Assets.get("/images/result/silver_medal.png") as Texture;
    const loadedBronze = Assets.get("/images/result/bronze_medal.png") as Texture;
    const loadedConfetti = Assets.get("/images/result/confetti.png") as Texture;

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

  // Show infinite confetti after gold medal appears
  useEffect(() => {
    if (showGoldMedal && goldMedalAlpha >= 1) {
      // Start confetti after gold medal is fully visible
      const particles: ConfettiParticle[] = [];
      for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
        // Distribute particles across a wider area and different starting heights
        const x = (Math.random() - 0.5) * 300 * scale; // wider spread
        // Vary starting height to avoid clustering
        const y = -300 * scale - Math.random() * 100 * scale; // random starting height
        // More varied velocities for natural movement
        const vx = (Math.random() - 0.5) * 80 * scale; // more horizontal variation
        const vy = 80 + Math.random() * 80 * scale; // varied downward speed
        particles.push({
          x: x,
          y: y,
          vx: vx,
          vy: vy,
          alpha: 1,
          life: Math.random() * 2, // random initial life to stagger appearance
        });
      }
      setConfettiParticles(particles);
      setShowConfetti(true);
      setConfettiTimer(0);
    } else if (!showGoldMedal) {
      setShowConfetti(false);
      setConfettiParticles([]);
      setConfettiTimer(0);
    }
  }, [showGoldMedal, goldMedalAlpha, scale]);

  // Smooth medal fade-in animations
  useEffect(() => {
    if (showBronzeMedal) {
      const duration = 800; // 800ms fade-in duration
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        setBronzeMedalAlpha(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setBronzeMedalAlpha(0);
    }
  }, [showBronzeMedal]);

  useEffect(() => {
    if (showSilverMedal) {
      const duration = 800; // 800ms fade-in duration
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        setSilverMedalAlpha(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setSilverMedalAlpha(0);
    }
  }, [showSilverMedal]);

  useEffect(() => {
    if (showGoldMedal) {
      const duration = 800; // 800ms fade-in duration
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        setGoldMedalAlpha(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setGoldMedalAlpha(0);
    }
  }, [showGoldMedal]);

  useEffect(() => {
    if (showWinnerCrown) {
      const duration = 800; // 800ms fade-in duration
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        setCrownAlpha(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setCrownAlpha(0);
    }
  }, [showWinnerCrown]);

  useTick((delta: Ticker) => {
    if (showConfetti) {
      setConfettiTimer((prev) => {
        const next = prev + delta.deltaTime / 60;

        setConfettiParticles((prevParticles) => {
          // Update existing particles with continuous downward movement
          let updatedParticles = prevParticles.map((p) => {
            const deltaTime = delta.deltaTime / 60; // Convert to seconds
            const newX = p.x + p.vx * deltaTime;
            const newY = p.y + p.vy * deltaTime;

            return {
              ...p,
              x: newX,
              y: newY,
              alpha: 1, // Keep alpha at 1 for continuous effect
              life: p.life + deltaTime,
            };
          });

          // Remove particles that have fallen below the screen
          updatedParticles = updatedParticles.filter(p => p.y < 500 * scale);

          // Add new particles at the top to maintain infinite effect
          if (updatedParticles.length < CONFETTI_PARTICLE_COUNT) {
            const particlesToAdd = CONFETTI_PARTICLE_COUNT - updatedParticles.length;
            for (let i = 0; i < particlesToAdd; i++) {
              // Distribute particles across a wider area and different starting heights
              const x = (Math.random() - 0.5) * 300 * scale; // wider spread
              // Vary starting height to avoid clustering
              const y = -150 * scale - Math.random() * 100 * scale; // random starting height
              // More varied velocities for natural movement
              const vx = (Math.random() - 0.5) * 80 * scale; // more horizontal variation
              const vy = 80 + Math.random() * 80 * scale; // varied downward speed
              updatedParticles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                alpha: 1,
                life: 0,
              });
            }
          }

          return updatedParticles;
        });

        return next;
      });
    }
  });

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

  const floatY = isSpeaking ? Math.sin(floatOffset) * floatAmplitude : 0;

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
          x={62 * scale}
          y={-50 * scale}
          scale={scale}
          alpha={crownAlpha}
        />
      )}
      {/* Avatar (top layer) */}
      <pixiSprite
        texture={avatarTexture}
        anchor={{ x: 0.5, y: 0.5 }}
        x={0}
        y={floatY}
        scale={scale}
      />
      {/* Static highlight effect */}
      {isOnline ?
        <pixiSprite
          texture={avatarHighlightTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={floatY}
          scale={scale}
        /> : <pixiSprite
          texture={defaultAvatarTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={floatY}
          scale={scale}
        />
      }
      {isWinner && (
        <WinnerPointsOverlay
          songTitle={songTitle}
          singer={singer}
          bonus={bonus}
          points={points}
          visible={isWinner}
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
          y={280 * scale}
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
      {showConfetti && confettiParticles.map((p, i) => (
        <pixiSprite
          key={i}
          texture={confettiTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={p.x}
          y={p.y}
          scale={0.5 * scale}
          alpha={p.alpha}
        />
      ))}
      {/* Spreading highlight animations */}
      <SpeakingAnimation isActive={isSpeaking} scale={scale} avatar={avatar} />
    </pixiContainer>
  );
}
