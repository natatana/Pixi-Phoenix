import type { Meta, StoryObj } from '@storybook/react';
import { GameScene } from '../scenes/GameScene';

const meta: Meta<typeof GameScene> = {
    title: 'Games/Song Quiz/Scenes/GameScene',
    component: GameScene,
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

export const InitialLoading: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: false,
    },
};

export const MatchmakingStart: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [],
    },
};

export const PlayersOnline: Story = {
    args: {
        windowSize: { width: 1920, height: 1080 },
        scaleX: 1,
        scaleY: 1,
        soundsReady: true,
        musicStarted: true,
        onlinePlayers: [0, 1, 2, 3],
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
    },
};