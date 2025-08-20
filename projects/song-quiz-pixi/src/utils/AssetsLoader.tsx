// src/utils/assetLoader.ts
import { Assets } from "pixi.js";
import { PLAYER_COUNT } from "./config";

let loaded = false;

export async function loadGameAssets() {
    if (loaded) return;

    const commonAssets = [
        "/images/splash.jpg",
        "/images/selectmode.jpg",
        "/images/stadium.jpg",
        "/images/player_base.png",
        "/images/default_avatar_highlight.png",
        "/images/incorrect_highlight.png",
        "/images/incorrect_buzz_ighlight.png",
        "/images/sound_bar.png",
    ];

    const selectModeAssets = [
        "/images/selectmode/emailus.png",
        "/images/selectmode/single.png",
        "/images/selectmode/single_highlight.png",
        "/images/selectmode/multi.png",
        "/images/selectmode/multi_highlight.png",
    ];

    const perPlayerAssets: string[] = [];
    for (let i = 1; i <= PLAYER_COUNT; i++) {
        perPlayerAssets.push(
            `/images/avatar_${i}.png`,
            `/images/avatar_${i}_highlight.png`,
            `/images/avatar_${i}_jet2_trail.png`,
            `/images/avatar_${i}_buzz_hightlight.png`,
            `/images/avatar_${i}_sound_bar.png`
        );
    }

    const resultAssets = [
        "/images/result/gold_medal.png",
        "/images/result/silver_medal.png",
        "/images/result/bronze_medal.png",
        "/images/result/winner_crown.png",
        "/images/result/confetti.png",
    ];

    await Assets.load([...commonAssets, ...selectModeAssets, ...perPlayerAssets, ...resultAssets]);
    loaded = true;
}
