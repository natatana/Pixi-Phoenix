import type { Preview } from '@storybook/html';

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
  decorators: [
    (Story) => {
      // Create a container div for the game canvas
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100vh';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.position = 'relative';
      
      const storyElement = Story();
      if (storyElement instanceof HTMLElement) {
        container.appendChild(storyElement);
      }
      
      return container;
    },
  ],
};

export default preview; 