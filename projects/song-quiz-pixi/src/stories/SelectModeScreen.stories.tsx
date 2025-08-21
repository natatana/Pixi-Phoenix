import type { Meta, StoryObj } from '@storybook/react';
import { SelectModeScreen } from '../scenes/SelectModeScreen';

const meta: Meta<typeof SelectModeScreen> = {
    title: 'Games/Song Quiz/Scenes/SelectModeScreen',
    component: SelectModeScreen,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'The select mode screen where users can choose between single or multi-player modes.',
            },
        },
    },
    argTypes: {
        onSelectMode: {
            action: 'selectMode',
            description: 'Callback function called when a mode is selected',
        },
        scaleX: {
            control: 'number',
            description: 'Scale factor for the X dimension',
        },
        scaleY: {
            control: 'number',
            description: 'Scale factor for the Y dimension',
        },
        windowSize: {
            control: 'object',
            description: 'Window dimensions for the PIXI application',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onSelectMode: (mode: string) => console.log(`Mode selected: ${mode}`),
        scaleX: 1,
        scaleY: 1,
        windowSize: { width: 1920, height: 1080 },
    },
};
