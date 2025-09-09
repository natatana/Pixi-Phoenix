import type { Meta, StoryObj } from '@storybook/react';
import SelectPlayList from '../scenes/SelectPlayList';

const meta: Meta<typeof SelectPlayList> = {
    title: 'Games/Song Quiz/Scenes/SelectPlaylistScreen',
    component: SelectPlayList,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'The select play list screen where users can choose.',
            },
        },
    },
    argTypes: {
        scale: {
            control: 'number',
            description: 'Scale factor for the X dimension',
        }
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        scale: 1,
    },
};
