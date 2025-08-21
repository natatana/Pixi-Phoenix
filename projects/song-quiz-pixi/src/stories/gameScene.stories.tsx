import type { Meta, StoryObj } from '@storybook/react';
import GameSceneLoader from '../utils/GameSceneLoader';

const meta: Meta<typeof GameSceneLoader> = {
    title: 'Games/Song Quiz/Scenes/GameScene',
    component: GameSceneLoader,
    argTypes: {
        windowSize: {
            control: 'object',
            description: 'Window dimensions for the PIXI application',
        },
        scaleX: {
            control: 'number',
            description: 'Scale factor for X axis',
        },
        scaleY: {
            control: 'number',
            description: 'Scale factor for Y axis',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NormalStatus: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: false,
        type: 'normal', // Added action type
    },
};

export const OnlinePlayers: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [],
        type: 'online', // Added action type
    },
};

export const SpeakingPlayer: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [],
        speakingPlayers: 0,
        type: 'speaking', // Added action type
    },
};

export const WinnerAnnounced: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [],
        winnerPlayer: 0,
        speakingPlayers: null,
        type: 'winner', // Added action type
    },
};

export const LoserAnnounced: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [],
        loserPlayer: 0,
        speakingPlayers: null,
        type: 'loser', // Added action type
    },
};

export const GameOver: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [],
        gameOver: true,
        playerRankings: [0, 1, 2, 3],
        playerPoints: [100, 80, 60, 40],
        medalFadeIn: { bronze: true, silver: true, gold: true },
        type: 'gameover', // Added action type
    },
};