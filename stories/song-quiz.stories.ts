import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
    title: 'Games/Song Quiz',
    parameters: { layout: 'fullscreen' },
};
export default meta;

/**
 * Loads the Song Quiz React app in an iframe.
 */
export const Default: StoryObj = {
    render: () => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.background = '#000';

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';
        iframe.allow = 'autoplay; fullscreen';

        // Prefer Vite dev server if running; fallback to built app if served elsewhere.
        // You can adjust the port to match your local dev server for song-quiz.
        const devUrl = 'http://localhost:3001';
        iframe.src = devUrl;

        container.appendChild(iframe);
        return container;
    },
};