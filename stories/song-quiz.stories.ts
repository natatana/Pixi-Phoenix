import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta = {
    title: 'Games/Song Quiz',
    parameters: { layout: 'fullscreen' },
};
export default meta;

/**
 * Loads the Song Quiz React app in an iframe.
 */
export const TotalFlow: StoryObj = {
    render: () => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.inset = '0';
        container.style.background = '#000';

        const iframe = document.createElement('iframe');
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.border = '0';
        iframe.allow = 'autoplay; fullscreen';

        const devUrl = 'https://pixi-song-quiz.netlify.app';
        iframe.src = devUrl;

        container.appendChild(iframe);

        // Return a React element
        return React.createElement('div', { dangerouslySetInnerHTML: { __html: container.innerHTML } });
    },
};