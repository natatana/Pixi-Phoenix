import { useState, useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Assets, Texture, Text } from "pixi.js";
import { Player } from "./components/Player";
import { SoundBar } from "./components/SoundBar";
import { RoundText } from "./components/RoundText";
import "./resources/css/App.css";
import React from "react";
import { preloadAllSounds, Sound } from "./sound/SoundManager";

extend({
  Container,
  Graphics,
  Sprite,
  Text,
});

function BackgroundSprite() {
  const [texture, setTexture] = useState(Texture.EMPTY);

  useEffect(() => {
    if (texture === Texture.EMPTY) {
      const tex = (Assets.get("/stadium.jpg") as Texture) ?? Texture.EMPTY;
      setTexture(tex);
    }
  }, [texture]);

  return (
    <pixiSprite
      texture={texture}
      width={window.innerWidth}
      height={window.innerHeight}
      anchor={{ x: 0, y: 0 }}
      x={0}
      y={0}
    />
  );
}

const playerNames = ["Andrew", "Mary", "Jessica", "Devin"];

function App() {
  const playerCount = 4;
  const [musicStarted, setMusicStarted] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [soundsReady, setSoundsReady] = useState(false);
  const [playerFloatOffsets, setPlayerFloatOffsets] = useState(Array(playerCount).fill(0));
  const floatAnimRef = React.useRef<number | null>(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [speakingPlayers, setSpeakingPlayers] = useState<number | null>(null);
  const [winnerPlayer, setWinnerPlayer] = useState<number | null>(null);
  const [loserPlayer, setLoserPlayer] = useState<number | null>(null);

  // Calculate scale factors
  const REF_WIDTH = 1920;
  const scale = windowSize.width / REF_WIDTH;

  const playerBarWidth = 314;
  const playerSpacing = (REF_WIDTH - playerBarWidth * playerCount) / (playerCount + 1);
  const playerHeight = windowSize.height * 0.4;

  // Preload all textures
  useEffect(() => {
    const commonAssets = [
      "/stadium.jpg",
      "/player_base.png",
      "/player_base_highlight.png",
      "/default_avatar_highlight.png",
      "/incorrect_highlight.png",
      "/incorrect_buzz_ighlight.png",
      "/sound_bar.png",
    ];
    const perPlayerAssets: string[] = [];
    for (let i = 1; i <= playerCount; i++) {
      perPlayerAssets.push(
        `/avatar_${i}.png`,
        `/avatar_${i}_highlight.png`,
        `/avatar_${i}_jet2_trail.png`,
        `/avatar_${i}_buzz_hightlight.png`,
        `/avatar_${i}_sound_bar.png`,
      );
    }

    Assets.load([...commonAssets, ...perPlayerAssets]).then(() => setAssetsReady(true));
  }, []);

  // Preload all sounds
  useEffect(() => {
    preloadAllSounds().then(() => setSoundsReady(true)).catch(() => setSoundsReady(true));
  }, []);

  // Simulated flow (runs only after both assets and sounds are ready)
  useEffect(() => {
    if (!assetsReady || !soundsReady) return;

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const speakerIndex = Math.floor(Math.random() * 4);
    // const winnerIndex = Math.floor(Math.random() * 4);
    const winnerIndex = speakerIndex;
    let looserIndex = Math.floor(Math.random() * 4);
    while (looserIndex === winnerIndex) {
      looserIndex = Math.floor(Math.random() * 4);
    }

    const t0 = setTimeout(() => {
      Sound.playOpponentFound();
      Sound.stopMatchmaking();
    }, 3000);
    const t1 = setTimeout(() => {
      setSpeakingPlayers(speakerIndex);
      Sound.stopMatchmaking();
    }, 5000);
    const t2 = setTimeout(() => {
      setWinnerPlayer(winnerIndex);
      setSpeakingPlayers(null);
      Sound.stopMatchmaking();
      Sound.playRoundResultsBgm();
      Sound.playWinCheer();
    }, 10000);
    const t3 = setTimeout(() => {
      setLoserPlayer(looserIndex);
    }, 15000);
    const t4 = setTimeout(() => {
      Sound.stopRoundResultsBgm();
      Sound.playCountdown();
      Sound.playVsCountdown();
    }, 17000);

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("resize", handleResize);
    };
  }, [assetsReady, soundsReady]);

  // Start matchmaking music after all ready (autoplay policies still apply)
  useEffect(() => {
    if (musicStarted || !assetsReady || !soundsReady) return;
    const id = setTimeout(() => {
      setMusicStarted(true);
      try { Sound.playMatchmaking(); } catch { }
    }, 300);
    return () => clearTimeout(id);
  }, [musicStarted, assetsReady, soundsReady]);

  // Stop matchmaking when gameplay begins
  useEffect(() => {
    if (speakingPlayers !== null) {
      Sound.stopMatchmaking();
    }
  }, [speakingPlayers]);

  // Floating animation effect
  useEffect(() => {
    if (
      !musicStarted ||
      speakingPlayers !== null ||
      winnerPlayer !== null ||
      loserPlayer !== null
    ) {
      setPlayerFloatOffsets(Array(playerCount).fill(0));
      if (floatAnimRef.current) {
        cancelAnimationFrame(floatAnimRef.current);
        floatAnimRef.current = null;
      }
      return;
    }
    let start = performance.now();
    function animate(now: number) {
      const elapsed = (now - start) / 1000;
      setPlayerFloatOffsets(
        Array.from({ length: playerCount }, (_, i) => Math.sin(elapsed * 2 + i) * 20)
      );
      floatAnimRef.current = requestAnimationFrame(animate);
    }
    floatAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (floatAnimRef.current) {
        cancelAnimationFrame(floatAnimRef.current);
        floatAnimRef.current = null;
      }
    };
  }, [musicStarted, speakingPlayers, winnerPlayer, loserPlayer, playerCount]);

  const onWebRemoteConnected = () => {
    try { Sound.playSuccessWebRemote(); } catch { }
  };
  void onWebRemoteConnected;

  if (!assetsReady || !soundsReady) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b18",
        color: "#ecdeff",
        fontFamily: "sans-serif",
        fontSize: 20,
        letterSpacing: 1,
      }}>
        Loading assets & sounds...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
        <pixiContainer>
          <BackgroundSprite />
          {Array.from({ length: playerCount }).map((_, index) => (
            <Player
              key={index}
              playerName={playerNames[index]}
              avatar={`/avatar_${index + 1}`}
              x={scale * (playerSpacing * (index + 1) + playerBarWidth * index + playerBarWidth / 2)}
              y={playerHeight + playerFloatOffsets[index]}
              scale={scale}
              isOnline
              isSpeaking={speakingPlayers === index}
              isWinner={winnerPlayer === index}
              isLooser={loserPlayer === index}
              songTitle={winnerPlayer === index ? '24K Magic' : ''}
              singer={winnerPlayer === index ? 'Bruno Mars' : ''}
              bonus={winnerPlayer === index ? 10 : 0}
              points={winnerPlayer === index ? { song: 10, singer: 10 } : { song: 0, singer: 0 }}
            />
          ))}
          <SoundBar x={windowSize.width / 2} y={windowSize.height} scale={scale} speakerIndex={speakingPlayers} winnerIndex={winnerPlayer} loserIndex={loserPlayer} />
          <RoundText x={20 * scale} y={20 * scale} scale={scale} roundNumber={1} totalRounds={5} />
        </pixiContainer>
      </Application>
    </div>
  );
}

export default App;