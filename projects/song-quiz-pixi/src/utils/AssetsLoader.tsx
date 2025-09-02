// src/utils/assetLoader.ts
import { Assets } from "pixi.js";

const manifestUrl = "/manifest.json"

let assetLoadTime = 0;

export async function loadGameAssets() {
    const startTime = performance.now();
    await Assets.init({ manifest: manifestUrl });
    await Assets.loadBundle('default')
    const endTime = performance.now()
    assetLoadTime = endTime - startTime;
    return assetLoadTime;
}
