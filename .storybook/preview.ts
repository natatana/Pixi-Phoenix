import type { Preview } from '@storybook/react';
import React from 'react';
import { loadGameAssets } from '../projects/song-quiz-pixi/src/utils/AssetsLoader'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'game',
          value: '#000000',
        },
      ],
    },
  },
  loaders: [
    async () => {
      await loadGameAssets();
      return {};
    },
  ],
  decorators: [
    (Story) => {
      // Create a container div for the game canvas
      const container = React.createElement('div', {
        style: {
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        },
        children: Story(), // Pass the story as a child
      });

      return container;
    },
  ],
};

export default preview; 