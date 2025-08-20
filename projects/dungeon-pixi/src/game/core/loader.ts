import * as PIXI from "pixi.js";
import { isTVDevice } from "../utils/responsive";

export const cache = {
  glow: {} as Record<
    string,
    {
      textures: PIXI.Texture[];
      color: number;
      originalSize: { width: number; height: number };
      padding: number;
    }
  >,
  glowResolution: 0.8,
  glowTime: 0,
};

const isTV = isTVDevice();

export const manifest: PIXI.AssetsManifest = {
  bundles: [
    {
      name: "general",
      assets: [
        { alias: "particle", src: "/assets/particle.webp" },
        { alias: "shadow", src: "/assets/shadow.webp" },
      ]
    },
    {
      name: "game",
      assets: [
        { alias: "scenes.game.hp-bar", src: "/assets/scenes/game/hp-bar.png" },
        { alias: "scenes.game.task-background", src: "/assets/scenes/game/task-background.png" },
        { alias: "scenes.game.task-background-info", src: "/assets/scenes/game/task-background-info.png" },
        { alias: "scenes.game.task-icon", src: "/assets/scenes/game/task-icon.png" },
        { alias: "scenes.game.task-icon-checked", src: "/assets/scenes/game/task-icon-checked.png" },
        { alias: "scenes.game.task-icon-info", src: "/assets/scenes/game/task-icon-info.png" },
        { alias: "scenes.game.zone-button-blocked", src: "/assets/scenes/game/zone-button-blocked.webp" },
        { alias: "scenes.game.top-bar-avatar-01", src: "/assets/scenes/game/player-avatar-01.mp4", data: { loop: true } },
        { alias: "scenes.game.top-bar-avatar-02", src: "/assets/scenes/game/player-avatar-02.mp4", data: { loop: true } },
        { alias: "scenes.game.top-bar-avatar-03", src: "/assets/scenes/game/player-avatar-03.mp4", data: { loop: true } },
        { alias: "scenes.game.top-bar-background", src: "/assets/scenes/game/top-bar-background.webp" },
        { alias: "scenes.game.top-bar-button-chat-history", src: "/assets/scenes/game/top-bar-button-chat-history.png" },
        { alias: "scenes.game.top-bar-button-menu", src: "/assets/scenes/game/top-bar-button-menu.png" },
        { alias: "scenes.game.top-bar-tooltips-audio", src: "/assets/scenes/game/top-bar-tooltips-audio.webp" },
        { alias: "scenes.game.top-bar-tooltips-background", src: "/assets/scenes/game/top-bar-tooltips-background.webp" },
        { alias: "scenes.game.top-bar-tooltips-mic", src: "/assets/scenes/game/top-bar-tooltips-mic.webp" },
        { alias: "scenes.game.top-bar-tooltips-video", src: "/assets/scenes/game/top-bar-tooltips-video.webp" },
        { alias: "scenes.game.top-bar-dm", src: "/assets/scenes/game/top-bar-dm.png" },
        { alias: "scenes.game.top-bar-speaking", src: "/assets/scenes/game/top-bar-speaking.json" },
        { alias: "scenes.game.top-bar-blur", src: "/assets/scenes/game/top-bar-blur.png" },
        { alias: "scenes.game.hold-to-talk", src: "/assets/scenes/game/hold-to-talk.png" },
        { alias: "scenes.game.text-to-game-master-background", src: "/assets/scenes/game/text-to-game-master-background.webp" },
        { alias: "scenes.game.bottom-background", src: "/assets/scenes/game/bottom-background.webp" },
        { alias: "scenes.game.dm-avatar", src: "/assets/scenes/game/dm-dialogue.mp4", data: { muted: false, autoPlay: false } },
        // { alias: "scenes.game.medusa-ss", src: "/assets/scenes/game/medusa-ss.png" },
        { alias: "scenes.game.dmitri.background", src: "/assets/scenes/game/dmitri/background.mp4", data: { loop: true } },
        { alias: "scenes.game.dmitri.zone-button-altar", src: "/assets/scenes/game/dmitri/zone-button-altar.webp" },
        { alias: "scenes.game.dmitri.zone-button-dmitri", src: "/assets/scenes/game/dmitri/zone-button-dmitri.png" },
        { alias: "scenes.game.dmitri.zone-button-dmitri-location", src: "/assets/scenes/game/dmitri/zone-button-dmitri-location.png" },
        { alias: "scenes.game.dmitri.zone-button-mushroom-forest", src: "/assets/scenes/game/dmitri/zone-button-mushroom-forest.webp" },
        { alias: "scenes.game.dmitri.data", src: "/assets/scenes/game/dmitri/dmitri.json" },
        { alias: "characters.mushroom-forest.frogman", src: "/assets/characters/character-frogman.webp" },
        { alias: "characters.mushroom-forest.king", src: "/assets/characters/character-king.webp" },
        { alias: "characters.mushroom-forest.knight", src: "/assets/characters/character-knight.webp" },
        { alias: "characters.mushroom-forest.medusa", src: "/assets/characters/character-medusa.webp" },
        { alias: "characters.dmitri.king", src: "/assets/scenes/game/dmitri/king.webp" },
        { alias: "characters.dmitri.knight", src: "/assets/scenes/game/dmitri/knight.webp" },
        { alias: "characters.dmitri.medusa", src: "/assets/scenes/game/dmitri/medusa.webp" },
        { alias: "characters.dmitri.medusa-ss", src: isTV ? "/assets/characters/tv/medusa/medusa-ss-0.json" : "/assets/characters/medusa/medusa-ss-0.json" },
        { alias: "characters.dmitri.knight-ss", src: isTV ? "/assets/characters/tv/knight/knight-0.json" : "/assets/characters/knight/knight-0.json" },
        { alias: "characters.dmitri.king-ss", src: isTV ? "/assets/characters/tv/king/king-0.json" : "/assets/characters/king/king-0.json" },
      ]
    }
  ]
};
