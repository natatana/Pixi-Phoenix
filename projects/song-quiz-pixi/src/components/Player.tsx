import { memo } from "react";
import { Assets, Texture, Ticker } from "pixi.js";
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
  const [loading, setLoading] = useState(true);

  type ConfettiParticle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
  };
  const CONFETTI_PARTICLE_COUNT = 10;

  const confettiParticlesRef = useRef<ConfettiParticle[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

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
  const handleTick = useCallback((options: any) => {
    const riseMagnitude = 40 * scale; // pixels
    const target = isWinner ? -riseMagnitude : isLooser ? riseMagnitude : 0;

    setYOffset((prev) => {
      const ease = 1 - Math.pow(0.001, options.deltaTime / 100);
      return prev + (target - prev) * ease;
    });
    if (isSpeaking) {
      setFloatOffset((prev) => (prev + floatSpeed * options.deltaTime) % (Math.PI * 2));
    }
  }, [isWinner, isLooser, scale, isSpeaking, floatSpeed]);

  useTick(handleTick);

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

  // Show infinite confetti after gold medal appears
  useEffect(() => {
    if (showGoldMedal) {
      if (!showConfetti) {
        // Only generate new confetti when first showing
        const particles: ConfettiParticle[] = [];
        for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
          const x = (Math.random() - 0.8) * 300 * scale;
          const y = -300 * scale - Math.random() * 100 * scale;
          const vx = (Math.random() - 0.5) * 80 * scale;
          const vy = 80 + Math.random() * 80 * scale;
          particles.push({ x, y, vx, vy, life: Math.random() * 2 });
        }
        confettiParticlesRef.current = particles;
      }
      setShowConfetti(true);
    } else if (!showGoldMedal) {
      setShowConfetti(false);
      confettiParticlesRef.current = [];
    }
  }, [showGoldMedal, goldMedalAlpha, scaleX, scaleY]);

  useTick(
    useCallback((delta: Ticker) => {
      if (showConfetti) {
        const deltaTime = delta.deltaTime / 60;
        confettiParticlesRef.current = confettiParticlesRef.current.map((p) => {
          const newX = p.x + p.vx * deltaTime;
          const newY = p.y + p.vy * deltaTime;
          return { ...p, x: newX, y: newY, life: p.life + deltaTime };
        }).filter(p => p.y < 500 * scale);
      }
    }, [showConfetti, scale])
  );

  // Smooth medal fade-in animations
  // Medal and crown fade-in animations using useTick
  const FADE_DURATION = 800; // ms

  // Store animation state for each medal/crown
  const [bronzeStart, setBronzeStart] = useState<number | null>(null);
  const [silverStart, setSilverStart] = useState<number | null>(null);
  const [goldStart, setGoldStart] = useState<number | null>(null);
  const [crownStart, setCrownStart] = useState<number | null>(null);

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
    if (!showWinnerCrown) setCrownAlpha(0);
  }, [showWinnerCrown]);

  useTick(
    useCallback(() => {
      const now = performance.now();

      if (showBronzeMedal && bronzeStart !== null) {
        const progress = Math.min(1, (now - bronzeStart) / FADE_DURATION);
        setBronzeMedalAlpha(progress);
      }

      if (showSilverMedal && silverStart !== null) {
        const progress = Math.min(1, (now - silverStart) / FADE_DURATION);
        setSilverMedalAlpha(progress);
      }

      if (showGoldMedal && goldStart !== null) {
        const progress = Math.min(1, (now - goldStart) / FADE_DURATION);
        setGoldMedalAlpha(progress);
      }

      if (showWinnerCrown && crownStart !== null) {
        const progress = Math.min(1, (now - crownStart) / FADE_DURATION);
        setCrownAlpha(progress);
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
          x={54 * scaleX}
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
      {showConfetti && confettiParticlesRef.current.map((p, i) => (
        <pixiSprite
          key={i}
          texture={confettiTexture}
          anchor={{ x: 0.5, y: 0.5 }}
          x={p.x}
          y={p.y}
          scale={0.5 * scaleX}
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