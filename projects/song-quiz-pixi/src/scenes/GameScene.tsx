import React, { useState, useEffect, useMemo } from "react";
import { Application, extend } from "@pixi/react";
import { SoundBar } from "../components/SoundBar";
import { RoundText } from "../components/RoundText";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { Sound } from "../utils/SoundManager";
import { BackgroundSprite } from "../components/BackgroundSprite";
import { ACTION_TYPE } from "../utils/config";
import Player from "../components/Player";

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
        if (!musicStarted || speakingPlayers !== null || winnerPlayer !== null || loserPlayer !== null) {
            setPlayerFloatOffsets(Array(playerCount).fill(0));
            if (floatAnimRef.current) {
                cancelAnimationFrame(floatAnimRef.current);
                floatAnimRef.current = null;
            }
            return;
        }
        let start = performance.now();
        let lastFrameTime = start;

        function animate(now: number) {
            // Only update if at least 16ms (about 60fps) have passed
            if (now - lastFrameTime >= 16) {
                const elapsed = (now - start) / 1000;
                // Use functional update to avoid unnecessary renders if values didn't change
                setPlayerFloatOffsets(prev => {
                    const next = Array.from({ length: playerCount }, (_, i) => Math.sin(elapsed * 2 + i) * 3);
                    // Only update if values actually changed (shallow compare)
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
    }, [musicStarted, speakingPlayers, winnerPlayer, loserPlayer, playerCount]);

    const onWebRemoteConnected = () => {
        try { Sound.playSuccessWebRemote(); } catch { }
    };
    void onWebRemoteConnected;

    const playerPointsObj = useMemo(() =>
        Array.from({ length: playerCount }, (_, index) =>
            winnerPlayer === index ? { song: 10, singer: 10 } : { song: 0, singer: 0 }
        ),
        [winnerPlayer, playerCount]
    );

    return (
        <Application width={windowSize.width} height={windowSize.height} autoDensity={true} resolution={window.devicePixelRatio || 1}>
            <pixiContainer cullable>
                <BackgroundSprite assetUrl="images/stadium.jpg" width={windowSize.width} height={windowSize.height} />
                {Array.from({ length: playerCount }).map((_, index) => {
                    let y = playerHeight + playerFloatOffsets[index];
                    if (gameOver && playerRankings.length === playerCount && playerPoints.length === playerCount) {
                        const rank = playerRankings[index];
                        y = playerHeight + (rank - 1) * 152 * scale;
                    }
                    return (
                        <PlayerMemo
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
                            points={playerPointsObj[index]}
                            score={playerPoints[index]}
                            showBronzeMedal={gameOver && playerRankings[index] === 2 && medalFadeIn.bronze}
                            showSilverMedal={gameOver && playerRankings[index] === 1 && medalFadeIn.silver}
                            showGoldMedal={gameOver && playerRankings[index] === 0 && medalFadeIn.gold}
                            showWinnerCrown={gameOver && playerRankings[index] === 0 && medalFadeIn.gold}
                        />
                    )
                })}
                {!gameOver && (
                    <SoundBarMemo
                        x={windowSize.width / 2}
                        y={windowSize.height}
                        scale={scale}
                        speakerIndex={speakingPlayers}
                        winnerIndex={winnerPlayer}
                        loserIndex={loserPlayer}
                    />
                )}
                <RoundTextMemo x={20 * scaleX} y={20 * scaleY} scale={scale} roundNumber={1} totalRounds={5} gameOver={gameOver} />
            </pixiContainer>
        </Application>
    );
}