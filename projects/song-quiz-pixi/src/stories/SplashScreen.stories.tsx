import type { Meta, StoryObj } from '@storybook/react';
import { SplashScreen } from '../scenes/SplashScreen';

const meta: Meta<typeof SplashScreen> = {
    title: 'Games/Song Quiz/Scenes/SplashScreen',
    component: SplashScreen,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'The splash screen scene that displays when the game starts. Features a background image and automatically transitions after 2.5 seconds.',
            },
        },
    },
    argTypes: {
        onContinue: {
            action: 'continue',
            description: 'Callback function called when the splash screen should transition to the next scene',
        },
        windowSize: {
            control: 'object',
            description: 'Window dimensions for the PIXI application',
        },
    },
    decorators: [
        (Story) => (
            <div style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onContinue: () => console.log('Splash screen continue clicked'),
        windowSize: { width: 1920, height: 1080 },
    },
};