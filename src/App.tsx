import { useState, useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Assets, Texture, Text } from "pixi.js";
import useSound from "use-sound";
import { Player } from "./components/Player";
import { SoundBar } from "./components/SoundBar";
import { RoundText } from "./components/RoundText";
import "./resources/css/App.css";
import React from "react";

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
      Assets.load("/stadium.jpg").then((result) => {
        setTexture(result);
      });
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
  const [playCrowdCheering] = useSound('/sounds/MatchmakingMusic.mp3', {
    loop: true,
    volume: 0.6,
    html5: true,
  });
  const [playWinCheer] = useSound('/sounds/CheeringWinTie2.wav', {
    volume: 1.0,
    html5: true,
  });
  const [musicStarted, setMusicStarted] = useState(false);
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

  // Handle window resize and game state transitions
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const speakerIndex = Math.floor(Math.random() * 4);
    const winnerIndex = Math.floor(Math.random() * 4);
    // const winnerIndex = 2
    let looserIndex = Math.floor(Math.random() * 4);
    // Ensure looserIndex is not the same as winnerIndex
    while (looserIndex === winnerIndex) {
      looserIndex = Math.floor(Math.random() * 4);
    }
    setTimeout(() => {
      setSpeakingPlayers(speakerIndex);
    }, 5000);

    setTimeout(() => {
      setWinnerPlayer(winnerIndex);
      setSpeakingPlayers(null);
    }, 10000);

    setTimeout(() => {
      setLoserPlayer(looserIndex);
    }, 15000);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Start background music on first user interaction (required by autoplay policies)
  useEffect(() => {
    if (musicStarted) return;
    setTimeout(() => {
      setMusicStarted(true);
      playCrowdCheering();
    }, 500);
  }, [musicStarted, playCrowdCheering]);

  // Play win cheer when a winner is set
  useEffect(() => {
    if (winnerPlayer !== null) {
      try {
        playWinCheer();
      } catch (e) {
        // Ignore autoplay errors; will succeed once user interacts
      }
    }
  }, [winnerPlayer, playWinCheer]);

  // Floating animation effect
  useEffect(() => {
    // Stop floating if music hasn't started, a speaker is selected, or winner/loser is determined
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
      // Sine wave for smooth floating
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

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <Application width={windowSize.width} height={windowSize.height}>
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