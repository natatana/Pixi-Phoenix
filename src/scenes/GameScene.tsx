import React, { useState, useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Player } from "../components/Player";
import { SoundBar } from "../components/SoundBar";
import { RoundText } from "../components/RoundText";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { preloadAllSounds, Sound } from "../utils/SoundManager";
import { REF_WIDTH } from "../utils/config";
import { BackgroundSprite } from "../components/BackgroundSprite";

extend({
    Container,
    Graphics,
    Sprite,
    Text,
});


interface GameSceneProps {
    windowSize: { width: number; height: number };
    scale: number;
}

export function GameScene(props: GameSceneProps) {
    const {
        windowSize, scale
    } = props;


    const playerNames = ["Andrew", "Mary", "Jessica", "Devin"];
    const playerCount = 4;

    const [musicStarted, setMusicStarted] = useState(false);
    const [soundsReady, setSoundsReady] = useState(false);
    const [playerFloatOffsets, setPlayerFloatOffsets] = useState(Array(playerCount).fill(0));
    const floatAnimRef = React.useRef<number | null>(null);


    const [onlinePlayers, setOnlinePlayers] = useState<number[]>([]);
    const [speakingPlayers, setSpeakingPlayers] = useState<number | null>(null);
    const [winnerPlayer, setWinnerPlayer] = useState<number | null>(null);
    const [loserPlayer, setLoserPlayer] = useState<number | null>(null);

    const playerBarWidth = 300;
    const playerSpacing = (REF_WIDTH - playerBarWidth * playerCount) / (playerCount + 1);
    const playerHeight = windowSize.height * 0.4;

    // Preload all sounds
    useEffect(() => {
        preloadAllSounds().then(() => setSoundsReady(true)).catch(() => setSoundsReady(true));
    }, []);

    // Simulated flow (runs only after both assets and sounds are ready)
    useEffect(() => {
        if (!soundsReady) return;

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

            // Randomly set onlinePlayers for all players at random times before the game starts
            for (let i = 0; i < playerCount; i++) {
                const delay = Math.random() * 1500; // between 0.5s and 3.5s
                setTimeout(() => {
                    setOnlinePlayers(prev => {
                        if (prev.includes(i)) return prev;
                        return [...prev, i];
                    });
                }, delay);
            }
        }, 5000);
        const t1 = setTimeout(() => {
            setSpeakingPlayers(speakerIndex);
            setOnlinePlayers([]);
            Sound.stopMatchmaking();
        }, 7000);
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

        return () => {
            clearTimeout(t0);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);

        };
    }, [soundsReady]);

    // Start matchmaking music after all ready (autoplay policies still apply)
    useEffect(() => {
        if (musicStarted || !soundsReady) return;
        const id = setTimeout(() => {
            setMusicStarted(true);
            try { Sound.playMatchmaking(); } catch { }
        }, 300);
        return () => clearTimeout(id);
    }, [musicStarted, soundsReady]);

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
                Array.from({ length: playerCount }, (_, i) => Math.sin(elapsed * 2 + i) * 3)
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

    if (!soundsReady) {
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
                Loading sounds...
            </div>
        );
    }

    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <pixiContainer>
                <BackgroundSprite assetUrl="/images/stadium.jpg" />
                {Array.from({ length: playerCount }).map((_, index) => (
                    <Player
                        key={index}
                        playerName={playerNames[index]}
                        avatar={`/avatar_${index + 1}`}
                        x={scale * (playerSpacing * (index + 1) + playerBarWidth * index + playerBarWidth / 2)}
                        y={playerHeight + playerFloatOffsets[index]}
                        scale={scale}
                        isOnline={speakingPlayers === index || winnerPlayer === index || loserPlayer === index || onlinePlayers.includes(index)}
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
    );
}