import React, { useState, useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Player } from "../components/Player";
import { SoundBar } from "../components/SoundBar";
import { RoundText } from "../components/RoundText";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Sound } from "../utils/SoundManager";
import { BackgroundSprite } from "../components/BackgroundSprite";
import { ACTION_TYPE, REF_HEIGHT, REF_WIDTH } from "../utils/config";
import { Ticker } from "pixi.js";
import { isTVDevice } from "../utils/common";

extend({
    Container,
    Graphics,
    Sprite,
    Text,
});
interface GameSceneProps {
    windowSize: { width: number; height: number };
    scaleX: number;
    scaleY: number;
    type: ACTION_TYPE;
    selectedPlayer: 1 | 2 | 3 | 4;
    assetsLoadTime: number
}

export function GameScene(props: GameSceneProps) {
    const {
        windowSize, scaleX, scaleY, type, selectedPlayer, assetsLoadTime
    } = props;

    const scale = Math.min(scaleX, scaleY);
    const playerNames = ["Andrew", "Mary", "Jessica", "Devin"];
    const playerCount = 4;


    const simulationSteps = [
        {
            type: ACTION_TYPE.ONLINE,
            action: () => {
                Sound.playOpponentFound();
                Sound.stopMatchmaking();
                for (let i = 0; i < 4; i++) {
                    const delay = Math.random() * 1500;
                    setTimeout(() => {
                        setOnlinePlayers(prev => {
                            if (prev.includes(i)) return prev;
                            return [...prev, i];
                        });
                    }, delay);
                }
            }
        },
        {
            type: ACTION_TYPE.SPEAKING,
            action: () => {
                const speakerIndex = selectedPlayer - 1;
                setSpeakingPlayers(speakerIndex);
                setOnlinePlayers([]);
                Sound.stopMatchmaking();
            }
        },
        {
            type: ACTION_TYPE.WINNER,
            action: () => {
                const winnerIndex = selectedPlayer - 1;
                setWinnerPlayer(winnerIndex);
                setSpeakingPlayers(null);
                Sound.stopMatchmaking();
                Sound.playRoundResultsBgm();
                Sound.playWinCheer();
            }
        },
        {
            type: ACTION_TYPE.LOSER,
            action: () => {
                const looserIndex = selectedPlayer - 1;
                setLoserPlayer(looserIndex);
            }
        },
        {
            type: ACTION_TYPE.NORMAL,
            action: () => {
                Sound.stopRoundResultsBgm();
                Sound.playCountdown();
                Sound.playVsCountdown();
            }
        },
        {
            type: ACTION_TYPE.GAMEOVER,
            action: () => {
                setGameOver(true);
                setWinnerPlayer(null);
                setLoserPlayer(null);
                const points = Array.from({ length: 4 }, () => Math.floor(Math.random() * 24) * 10 - 30);
                setPlayerPoints(points);
                const sortedIndices = points.map((pt, idx) => ({ pt, idx })).sort((a, b) => b.pt - a.pt).map(obj => obj.idx);
                const rankings = Array(4);
                sortedIndices.forEach((playerIdx, rank) => {
                    rankings[playerIdx] = rank;
                });
                setPlayerRankings(rankings);
                setTimeout(() => setMedalFadeIn(prev => ({ ...prev, bronze: true })), 500);
                setTimeout(() => setMedalFadeIn(prev => ({ ...prev, silver: true })), 1500);
                setTimeout(() => setMedalFadeIn(prev => ({ ...prev, gold: true })), 2500);
            }
        }
    ];

    const [musicStarted, setMusicStarted] = useState(false);
    const [playerFloatOffsets, setPlayerFloatOffsets] = useState(Array(playerCount).fill(0));
    const [gameOver, setGameOver] = useState(false);
    const floatAnimRef = React.useRef<number | null>(null);

    const [onlinePlayers, setOnlinePlayers] = useState<number[]>([]);
    const [speakingPlayers, setSpeakingPlayers] = useState<number | null>(null);
    const [winnerPlayer, setWinnerPlayer] = useState<number | null>(null);
    const [loserPlayer, setLoserPlayer] = useState<number | null>(null);
    const [playerRankings, setPlayerRankings] = useState<number[]>([]);
    const [playerPoints, setPlayerPoints] = useState<number[]>([]);
    const [medalFadeIn, setMedalFadeIn] = useState<{ bronze: boolean; silver: boolean; gold: boolean }>({
        bronze: false,
        silver: false,
        gold: false
    });

    const [debugTextVisible, setDebugTextVisible] = useState(true);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            console.log(event.key)
            if (event.key === 'd' || event.key === 'D') {
                setDebugTextVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const [debugText, setDebugText] = useState("");
    let fpsSamples: number[] = [];
    useEffect(() => {
        const ticker = Ticker.system;
        ticker.minFPS = 10;
        ticker.maxFPS = 30;
        const intervalId = setInterval(() => {
            const fps = ticker.FPS; // Update FPS state and round to 2 decimal places
            const frameTime = 1000 / fps;
            if (!fpsSamples) fpsSamples = [];
            fpsSamples.push(fps);
            if (fpsSamples.length > 60) fpsSamples.shift();
            const avgFps = (
                fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
            ).toFixed(1);
            const droppedFrames = fpsSamples.filter((f) => f < 30).length;
            const droppedPercent = (
                (droppedFrames / fpsSamples.length) *
                100
            ).toFixed(1);
            const debugInfo = [
                `[DEBUG MENU] - Press [D] to toggle`,
                `FPS: ${fps.toFixed(1)} (average: ${avgFps})`,
                `Frame Time: ${frameTime.toFixed(1)}ms`,
                // `${ramText}`,
                `Dropped Frames: ${droppedPercent}%`,
                `Resolution: ${windowSize.width}x${windowSize.height}`,
                `PIXI Screen Resolution: ${REF_WIDTH}x${REF_HEIGHT}`,
                `Asset Load Time: ${assetsLoadTime.toFixed(1)} ms`,
                // `Glow Cache: ${(cache.glowTime / 1_000).toFixed(2)} seconds`,
                `Is TV: ${isTVDevice()}`,
            ].join("\n");
            setDebugText(debugInfo);
        }, 100); // Update every 0.1 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const playerBarWidth = 324 * scale;
    const playerSpacing = 80 * scale;
    const playerHeight = windowSize.height * 0.4;
    const screenSpace = (windowSize.width - playerSpacing * 3 - playerBarWidth * 4) / 2

    // Execute the current simulation step
    useEffect(() => {
        const step = simulationSteps.find(step => step.type === type);
        if (step && typeof step.action === "function") {
            step.action();
        }
    }, [type]);

    // Start matchmaking music after all ready (autoplay policies still apply)
    useEffect(() => {
        if (musicStarted) return;
        const id = setTimeout(() => {
            setMusicStarted(true);
            try { Sound.playMatchmaking(); } catch { }
        }, 300);
        return () => clearTimeout(id);
    }, [musicStarted]);

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

    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <pixiContainer>
                <BackgroundSprite assetUrl="images/stadium.jpg" width={windowSize.width} height={windowSize.height} />
                {Array.from({ length: playerCount }).map((_, index) => {
                    let y = playerHeight + playerFloatOffsets[index];
                    if (gameOver && playerRankings.length === playerCount && playerPoints.length === playerCount) {
                        const rank = playerRankings[index];
                        y = playerHeight + (rank - 1) * 152 * scale;
                    }
                    return (
                        <Player
                            key={index}
                            playerName={playerNames[index]}
                            avatar={`/avatar_${index + 1}`}
                            x={screenSpace + playerSpacing * index + playerBarWidth * index + playerBarWidth / 2}
                            y={y}
                            scaleX={scaleX}
                            scaleY={scaleY}
                            isOnline={speakingPlayers === index || winnerPlayer === index || loserPlayer === index || onlinePlayers.includes(index)}
                            isSpeaking={speakingPlayers === index}
                            isWinner={winnerPlayer === index}
                            isLooser={loserPlayer === index}
                            songTitle={winnerPlayer === index ? '24K Magic' : ''}
                            singer={winnerPlayer === index ? 'Bruno Mars' : ''}
                            bonus={winnerPlayer === index ? 10 : 0}
                            points={winnerPlayer === index ? { song: 10, singer: 10 } : { song: 0, singer: 0 }}
                            score={playerPoints[index]}
                            rank={playerRankings[index]}
                            showBronzeMedal={gameOver && playerRankings[index] === 2 && medalFadeIn.bronze}
                            showSilverMedal={gameOver && playerRankings[index] === 1 && medalFadeIn.silver}
                            showGoldMedal={gameOver && playerRankings[index] === 0 && medalFadeIn.gold}
                            showWinnerCrown={gameOver && playerRankings[index] === 0 && medalFadeIn.gold}
                        />
                    )
                })}
                {!gameOver && (
                    <SoundBar
                        x={windowSize.width / 2}
                        y={windowSize.height}
                        scale={scale}
                        speakerIndex={speakingPlayers}
                        winnerIndex={winnerPlayer}
                        loserIndex={loserPlayer}
                    />
                )}
                <RoundText x={20 * scaleX} y={20 * scaleY} scale={scale} roundNumber={1} totalRounds={5} gameOver={gameOver} />

                {debugTextVisible && <pixiText
                    text={debugText}
                    anchor={{ x: 0, y: 0.5 }}
                    x={100 * scale}
                    y={150 * scale}
                    style={{
                        fontSize: 20 * scale,
                        fill: 0xFFFFFF,
                        fontWeight: "bold",
                    }}
                />}
            </pixiContainer>
        </Application>
    );
}