import { Assets, Texture } from "pixi.js";
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
  const [loading, setLoading] = useState(true);

  // const [showCurrentHighlight, setShowCurrentHighlight] = useState(false);

  // Animation state
  const [floatOffset, setFloatOffset] = useState(Math.random() * Math.PI * 2);
  const floatSpeed = 0.05; // Speed of the floating animation (reserved)
  const floatAmplitude = 10 * scale; // How far up and down to float (reserved)
  const [yOffset, setYOffset] = useState(0); // Negative moves up, positive moves down

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

    setDefaultAvatarTexture(loadedDefault ?? Texture.EMPTY);
    setAvatarTexture(loadedAvatar ?? Texture.EMPTY);
    setBaseTexture(loadedBase ?? Texture.EMPTY);
    setHighlightTexture(loadedHighlight ?? Texture.EMPTY);
    setJetTrailTexture(loadedJet ?? Texture.EMPTY);
    setBaseHighlightTexture(loadedBaseHL ?? Texture.EMPTY);
    setIncorrectAvatarTexture(loadedIncorrectAvatar ?? Texture.EMPTY);
    setIncorrectBaseHighlightTexture(loadedIncorrectBaseHL ?? Texture.EMPTY);
    setLoading(false);
  }, [avatar]);

  // useEffect(() => {
  //   const randomDelay = 3000 + Math.random() * 2000;
  //   const timer = setTimeout(() => {
  //     isOnline = true;
  //   }, randomDelay);
  //   return () => clearTimeout(timer);
  // }, []);

  // Select highlight textures based on isLooser and showCurrentHighlight
  const avatarHighlightTexture = isOnline
    ? (isLooser ? incorrectAvatarTexture : highlightTexture)
    : defaultAvatarTexture;

  const baseHighlightTextureToUse = isOnline
    ? (isLooser ? incorrectBaseHighlightTexture : baseHighlightTexture)
    : null;

  // Calculate player score based on winner/looser status
  let playerScore = 0;
  let playerScoreColor = 0xffffff; // default white
  if (isWinner) {
    playerScore = 20;
    playerScoreColor = 0x00ffd1; // Winner color
  } else if (isLooser) {
    playerScore = -10;
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
      {/* Spreading highlight animations */}
      <SpeakingAnimation isActive={isSpeaking} scale={scale} avatar={avatar} />
    </pixiContainer>
  );
}
