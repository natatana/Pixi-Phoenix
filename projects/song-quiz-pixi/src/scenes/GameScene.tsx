import React, { useState, useEffect, useMemo } from "react";
import { Application, extend } from "@pixi/react";
import { SoundBar } from "../components/SoundBar";
import { RoundText } from "../components/RoundText";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Sound } from "../utils/SoundManager";
import { BackgroundSprite } from "../components/BackgroundSprite";
import { ACTION_TYPE } from "../utils/config";
import Player from "../components/Player";
import { BackgroundVideo } from "../components/BackgroundVideo";

const PlayerMemo = React.memo(Player);
const SoundBarMemo = React.memo(SoundBar);
const RoundTextMemo = React.memo(RoundText);

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
}

export function GameScene(props: GameSceneProps) {
    const {
        windowSize, scaleX, scaleY, type, selectedPlayer
    } = props;

    const scale = Math.min(scaleX, scaleY);
    const playerNames = ["Andrew", "Mary", "Jessica", "Devin"];
    const playerCount = 4;

    const simulationSteps = [
        {
            type: ACTION_TYPE.ONLINE,
            action: () => {
                for (let i = 0; i < 4; i++) {
                    const delay = i * 500;
                    setTimeout(() => {
                        setOnlinePlayers(prev => {
                            if (prev.includes(i)) return prev;
                            return [...prev, i];
                        });

                        if (i === 3) {
                            Sound.playSuccessWebRemoteFinal();
                        } else {
                            Sound.playSuccessWebRemote();
                        }
                    }, delay);
                }
                setAnimateSoundBar(false);
            }
        },
        {
            type: ACTION_TYPE.SPEAKING,
            action: () => {
                Sound.stopMatchmaking();
                Sound.playBuzzer();
                const speakerIndex = selectedPlayer - 1;
                setTimeout(() => {
                    setSpeakingPlayers(speakerIndex);
                    setOnlinePlayers([]);
                    Sound.playThinking();
                }, 500);
            }
        },
        {
            type: ACTION_TYPE.WINNER,
            action: () => {
                Sound.stopThinking();
                // Drum
                Sound.playDrum();
                setSpeakingPlayers(null);
                setTimeout(() => {
                    const winnerIndex = selectedPlayer - 1;
                    setWinnerPlayer(winnerIndex);
                    Sound.playWinCheer();
                }, 1500);
            }
        },
        // {
        //     type: ACTION_TYPE.LOSER,
        //     action: () => {
        //         const looserIndex = selectedPlayer - 1;
        //         setLoserPlayer(looserIndex);
        //     }
        // },
        {
            type: ACTION_TYPE.NORMAL,
            action: () => {
                Sound.stopFinalResult();
                Sound.playMatchmaking();
                setAnimateSoundBar(true);
            }
        },
        {
            type: ACTION_TYPE.GAMEOVER,
            action: () => {
                const points = [140, -20, 170, 115];
                setPlayerPoints(points);
                const sortedIndices = points.map((pt, idx) => ({ pt, idx })).sort((a, b) => b.pt - a.pt).map(obj => obj.idx);

                Sound.playDrum();
                setTimeout(() => {
                    setGameOver(true);
                    setWinnerPlayer(null);
                    setLoserPlayer(null);
                    const rankings = Array(4);
                    sortedIndices.forEach((playerIdx, rank) => {
                        rankings[playerIdx] = rank;
                    });
                    setPlayerRankings(rankings);
                    Sound.playFinalResult();
                    setTimeout(() => setMedalFadeIn(prev => ({ ...prev, bronze: true })), 4000);
                    setTimeout(() => setMedalFadeIn(prev => ({ ...prev, silver: true })), 5000);
                    setTimeout(() => {
                        setMedalFadeIn(prev => ({ ...prev, gold: true }))
                        Sound.playWinCheer();
                    }, 6000);
                }, 1500);
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

    const [showPlayers, setShowPlayers] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPlayers(true);
            setShowSoundBar(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const playerBarWidth = 324 * scale;
    const playerSpacing = gameOver ? 80 * scale : 136 * scale;
    const playerHeight = windowSize.height * 0.43;
    const screenSpace = (windowSize.width - playerSpacing * 3 - playerBarWidth * 4) / 2

    const soundBarHeight = 80 * scale; // adjust as needed
    const soundBarShowY = windowSize.height + 8 * scale // visible position
    const soundBarHideY = windowSize.height + soundBarHeight * 2; // hidden below screen

    const [soundBarY, setSoundBarY] = useState(soundBarHideY);
    const [animateSoundBar, setAnimateSoundBar] = useState(false);
    const [playerAnimationProgress, setPlayerAnimationProgress] = useState(0);
    // const [showWinnerVideo, setShowWinnerVideo] = useState(false);

    const [showSoundBar, setShowSoundBar] = useState(false);

    useEffect(() => {
        if (type === ACTION_TYPE.WINNER && speakingPlayers === null) {
            setShowSoundBar(false);
        } else {
            setShowSoundBar((!gameOver || speakingPlayers !== null) && winnerPlayer === null);
        }
    }, [winnerPlayer, gameOver, speakingPlayers, type]);

    useEffect(() => {
        if (showSoundBar) {
            let animFrame: number | null = null;
            const duration = 1000; // ms
            const startY = soundBarY;
            const endY = showSoundBar ? soundBarShowY : soundBarHideY;
            const startTime = performance.now();
            let lastUpdate = startTime;

            function animate(now: number) {
                const elapsed = now - startTime;
                const t = Math.min(1, elapsed / duration);
                // Ease out
                const eased = 1 - Math.pow(1 - t, 2);
                // Cap at 30 FPS
                if (now - lastUpdate >= 33) {
                    setSoundBarY(startY + (endY - startY) * eased);
                    lastUpdate = now;
                }
                if (t < 1) {
                    animFrame = requestAnimationFrame(animate);
                } else {
                    setSoundBarY(endY);
                }
            }

            if (startY !== endY) {
                animFrame = requestAnimationFrame(animate);
            }
            return () => {
                if (animFrame) cancelAnimationFrame(animFrame);
            };
        }

        // eslint-disable-next-line
    }, [showSoundBar, soundBarShowY, soundBarHideY, showPlayers]);

    // Execute the current simulation step
    useEffect(() => {
        const step = simulationSteps.find(step => step.type === type);
        if (step && typeof step.action === "function") {
            step.action();
        }
    }, [type]);

    // useEffect(() => {
    //     let timeout: number | undefined;
    //     if (winnerPlayer !== null) {
    //         timeout = window.setTimeout(() => setShowWinnerVideo(true), 2000);
    //     } else {
    //         setShowWinnerVideo(false);
    //     }
    //     return () => {
    //         if (timeout) clearTimeout(timeout);
    //     };
    // }, [winnerPlayer]);

    useEffect(() => {
        if (gameOver) {
            let animFrame: number | null = null;
            let timeout: number | null = null;

            const startAnimation = () => {
                const duration = 2000; // 2 second
                const startTime = performance.now();
                let lastUpdate = startTime;

                function animate(now: number) {
                    const elapsed = now - startTime;
                    const progress = Math.min(1, elapsed / duration);
                    if (now - lastUpdate >= 33) {
                        setPlayerAnimationProgress(progress);
                        lastUpdate = now;
                    }
                    if (progress < 1) {
                        animFrame = requestAnimationFrame(animate);
                    }
                }

                animFrame = requestAnimationFrame(animate);
            };

            timeout = window.setTimeout(startAnimation, 2000);

            return () => {
                if (animFrame) cancelAnimationFrame(animFrame);
                if (timeout) clearTimeout(timeout);
            };
        }
    }, [gameOver]);

    // Start matchmaking music after all ready (autoplay policies still apply)
    useEffect(() => {
        console.log("musicStarted", musicStarted);
        if (musicStarted) return;
        const id = setTimeout(() => {
            setMusicStarted(true);
            // try { Sound.playMatchmaking(); } catch { }
        }, 300);
        return () => clearTimeout(id);
    }, [musicStarted]);

    // Floating animation effect
    useEffect(() => {
        // Cancel any previous animation frame
        if (floatAnimRef.current) {
            cancelAnimationFrame(floatAnimRef.current);
            floatAnimRef.current = null;
        }


        if (
            !musicStarted ||
            speakingPlayers !== null ||
            winnerPlayer !== null ||
            loserPlayer !== null ||
            gameOver ||
            !showPlayers ||
            soundBarShowY != soundBarY ||
            onlinePlayers.length > 0
        ) {
            setPlayerFloatOffsets(Array(playerCount).fill(0));
            return;
        }

        let start = performance.now();
        let lastFrameTime = start;

        function animate(now: number) {
            if (now - lastFrameTime >= 33) {
                const elapsed = (now - start) / 1000;
                setPlayerFloatOffsets(prev => {
                    const next = Array.from({ length: playerCount }, () => Math.sin(elapsed * 2) * 10);
                    const EPSILON = 0.001;
                    if (
                        prev.length !== next.length ||
                        prev.some((v, i) => Math.abs(v - next[i]) > EPSILON)
                    ) {
                        return next;
                    }
                    return prev;
                });
                lastFrameTime = now;
            }
            floatAnimRef.current = requestAnimationFrame(animate);
        }
        floatAnimRef.current = requestAnimationFrame(animate);

        return () => {
            if (floatAnimRef.current) {
                cancelAnimationFrame(floatAnimRef.current);
                floatAnimRef.current = null;
            }
        };
    }, [
        musicStarted,
        speakingPlayers,
        winnerPlayer,
        loserPlayer,
        showPlayers,
        soundBarY,
        soundBarShowY,
        gameOver,
        playerCount,
        onlinePlayers
    ]);

    const playerPointsObj = useMemo(() =>
        Array.from({ length: playerCount }, (_, index) =>
            winnerPlayer === index ? { song: 10, singer: 10 } : { song: 0, singer: 0 }
        ),
        [winnerPlayer, playerCount]
    );

    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <pixiContainer cullable>
                <BackgroundSprite assetUrl="images/stadium.jpg" width={windowSize.width} height={windowSize.height} gameOver={gameOver} />
                {
                    // showWinnerVideo && 
                    winnerPlayer !== null && (
                        <BackgroundVideo
                            src={`videos/winner-${winnerPlayer}.mp4`}
                            width={windowSize.width}
                            height={windowSize.height}
                        />
                    )}

                {showPlayers && Array.from({ length: playerCount }).map((_, index) => {
                    const initialY = index % 2 === 0 ? playerHeight - playerFloatOffsets[index] : playerHeight + playerFloatOffsets[index];
                    const gameOverY = playerHeight + (playerRankings[index] - 1) * 152 * scale;
                    const y = gameOver ? initialY + (gameOverY - initialY) * playerAnimationProgress : initialY;

                    // Calculate initial and game-over X positions
                    const initialX = screenSpace + 136 * scale * index + playerBarWidth * index + playerBarWidth / 2;
                    const gameOverX = screenSpace + 80 * scale * index + playerBarWidth * index + playerBarWidth / 2;
                    const x = gameOver ?
                        index !== 0 ?
                            initialX + (gameOverX - initialX) * playerAnimationProgress :
                            initialX + 28 * scale * playerAnimationProgress :
                        initialX;

                    return (
                        <PlayerMemo
                            key={index}
                            playerName={playerNames[index]}
                            avatar={`/avatar_${index + 1}`}
                            x={x}
                            y={y}
                            scaleX={scaleX}
                            scaleY={scaleY}
                            isOnline={onlinePlayers.includes(index)}
                            isSpeaking={speakingPlayers === index}
                            isWinner={winnerPlayer === index}
                            isLooser={loserPlayer === index}
                            songTitle={winnerPlayer === index ? '24K Magic' : ''}
                            singer={winnerPlayer === index ? 'Bruno Mars' : ''}
                            bonus={winnerPlayer === index ? 10 : 0}
                            points={playerPointsObj[index]}
                            score={playerPoints[index]}
                            showBronzeMedal={gameOver && playerRankings[index] === 2 && medalFadeIn.bronze}
                            showSilverMedal={gameOver && playerRankings[index] === 1 && medalFadeIn.silver}
                            showGoldMedal={gameOver && playerRankings[index] === 0 && medalFadeIn.gold}
                            showWinnerCrown={gameOver && playerRankings[index] === 0 && medalFadeIn.gold}
                        />
                    )
                })}
                {showSoundBar && (soundBarY < windowSize.height + soundBarHeight) && (
                    <SoundBarMemo
                        x={windowSize.width / 2}
                        y={soundBarY}
                        scale={scale}
                        speakerIndex={speakingPlayers}
                        animate={animateSoundBar}
                    />
                )}
                <RoundTextMemo x={20 * scaleX} y={20 * scaleY} scale={scale} roundNumber={1} totalRounds={5} gameOver={gameOver} />
            </pixiContainer>
        </Application>
    );
}