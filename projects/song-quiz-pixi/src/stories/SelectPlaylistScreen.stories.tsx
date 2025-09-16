import type { Meta, StoryObj } from '@storybook/react';
import SelectPlayList from '../scenes/SelectPlayListForStorybook';

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
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};
