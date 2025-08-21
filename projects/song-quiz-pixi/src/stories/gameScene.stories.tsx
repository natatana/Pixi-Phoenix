import type { Meta, StoryObj } from '@storybook/react';
import GameSceneLoader from '../utils/GameSceneLoader';

const meta: Meta<typeof GameSceneLoader> = {
    title: 'Games/Song Quiz/Scenes/GameScene',
    component: GameSceneLoader,
    argTypes: {
        width: {
            control: {
                type: 'range',
                min: 800,
                max: 1920,
                step: 100,
            },
            description: 'Adjustable width for the PIXI application',
        },
        height: {
            control: false,
            description: 'Height locked to 9/16 of the width',
            table: {
                disable: true,
            },
        },
        scaleX: {
            control: false,
            description: 'Scale factor for X axis based on width',
            table: {
                disable: true,
            },
        },
        scaleY: {
            control: false,
            description: 'Scale factor for Y axis based on height',
            table: {
                disable: true,
            },
        },
        type: {
            control: { type: 'select' },
            options: [
                'normal',
                'online',
                'speaking',
                'winner',
                'loser',
                'gameover',
            ],
            description: 'Which Song Quiz scene to display',
            table: {
                type: { summary: 'string' },
                defaultValue: { summary: 'normal' },
            },
        }
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NormalStatus: Story = {
    args: {
        width: 1280,
        height: Math.round(1280 * 9 / 16),
        scaleX: 1280 / 1920,
        scaleY: Math.round(1280 * 9 / 16) / 1080,
        type: 'normal',
    },
};

export const OnlinePlayers: Story = {
    args: {
        width: 1280,
        height: Math.round(1280 * 9 / 16),
        scaleX: 1280 / 1920,
        scaleY: Math.round(1280 * 9 / 16) / 1080,
        type: 'online',
    },
};

export const SpeakingPlayer: Story = {
    args: {
        width: 1280,
        height: Math.round(1280 * 9 / 16),
        scaleX: 1280 / 1920,
        scaleY: Math.round(1280 * 9 / 16) / 1080,
        type: 'speaking',
    },
};

export const WinnerAnnounced: Story = {
    args: {
        width: 1280,
        height: Math.round(1280 * 9 / 16),
        scaleX: 1280 / 1920,
        scaleY: Math.round(1280 * 9 / 16) / 1080,
        type: 'winner',
    },
};

export const LoserAnnounced: Story = {
    args: {
        width: 1280,
        height: Math.round(1280 * 9 / 16),
        scaleX: 1280 / 1920,
        scaleY: Math.round(1280 * 9 / 16) / 1080,
        type: 'loser',
    },
};

export const GameOver: Story = {
    args: {
        width: 1280,
        height: Math.round(1280 * 9 / 16),
        scaleX: 1280 / 1920,
        scaleY: Math.round(1280 * 9 / 16) / 1080,
        type: 'gameover',
    },
};