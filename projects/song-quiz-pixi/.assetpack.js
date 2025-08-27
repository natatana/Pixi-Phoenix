// .assetpack.js
import { pixiPipes } from '@assetpack/core/pixi';

export default {
    entry: './assets/images', // Source folder for your raw assets
    output: './public/images', // Output folder for processed assets
    pipes: [
        ...pixiPipes({
            cacheBust: true,
            resolutions: { default: 1 },
            compression: { jpg: true, png: true, webp: true },
            texturePacker: { nameStyle: "short" },
            audio: {},
            manifest: { createShortcuts: true },
        }),
    ],
};