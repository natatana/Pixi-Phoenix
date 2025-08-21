import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.mdx',
    '../projects/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-docs',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: [
    { from: '../projects/song-quiz-pixi/public', to: '/' },
  ],
  viteFinal: async (config) => {
    // Ensure that we can import from the projects
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@dungeon': '/projects/dungeon-pixi/src',
      '@jeopardy': '/projects/jeopardy-phaser/src',
      '@songquiz': '/projects/song-quiz-pixi/src',
    };
    config.logLevel = "info";

    return config;
  },
};

export default config;