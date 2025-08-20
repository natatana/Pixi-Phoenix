import * as PIXI from "pixi.js";
import {
  setBackgroundVideo,
  updateBackgroundContainer,
} from "../../../dom/background-container";
import { SceneBase } from "../../core/scene-manager";
import { Character } from "../../game-objects/character/character";
import { TasksObject } from "../../game-objects/tasks/tasks";
import { TitleGameObject } from "../../game-objects/title/title";
import { TopBarGameObject } from "../../game-objects/top-bar/top-bar";
import { ZoneButton } from "../../game-objects/zone-button/zone-button";
import { generateButton } from "../../utils/button";
import { parseGameData } from "../../utils/game-data-parser";
import { Howl } from "howler";
import { ParticlesEmitter } from "../../core/particles-emitter";
import { GlowFilter } from "pixi-filters";
import { cache } from "../../core/loader";
import { isTVDevice } from "../../utils/responsive";
import { setDMVideo } from "../../../dom/top-bar";

interface GameSceneData {
  dataKey: string;
}

export class GameScene extends SceneBase {
  private fpsSamples: number[] = [];
  private assetLoadTime: number = 0;
  private errorCount: number = 0;
  private warningCount: number = 0;
  public debugText: PIXI.Text;
  private canvasInside?: HTMLCanvasElement;
  public particlesEmitter: ParticlesEmitter;
  public fps: number = 0;
  private isTV: boolean = isTVDevice();

  async onCreate({ dataKey }: GameSceneData) {
    this.assetLoadTime = performance.now();
    const { width, height } = this.app.screen;
    const data = parseGameData(PIXI.Assets.get((dataKey)));
    this.particlesEmitter = new ParticlesEmitter(this);

    const BGM = new Howl({
      src: ["assets/scenes/game/dmitri/dmitri-bgm.wav"],
      loop: true,
      volume: 0.15,
      autoplay: true,
    })
    BGM.play();

    // Background video setup (disabled)
    // setBackgroundVideo(data.backgroundVideo);
    const video = new PIXI.Sprite(PIXI.Assets.get("scenes.game.dmitri.background"));
    video.anchor.set(0.5, 0.5);
    video.position.set(width / 2, height / 2);
    video.width = width;
    video.height = height;
    video.zIndex = -2;
    this.container.addChild(video);

    // Cache canvas for DOM sync
    const gameContainer = document.getElementById("app") as HTMLDivElement;
    this.canvasInside = gameContainer?.querySelector("canvas") ?? undefined;

    // Characters
    const characters: Character[] = [];
    data.characters.reverse().forEach((characterData) => {
      const character = new Character(
        this,
        characterData.position.x,
        characterData.position.y,
        characterData,
        { color: cache.glow[characterData.key].color, speed: characterData.speed, scale: characterData.scale }
      );
      if (characterData.origin) {
        character.setOrigin(characterData.origin.x, characterData.origin.y);
      }
      characters.push(character);
    });

    if (data.enableMic) {
      const bottomBackground = PIXI.Sprite.from("scenes.game.bottom-background");
      bottomBackground.position.set(width / 2, height + 50);
      bottomBackground.anchor.set(0.5, 1);
      bottomBackground.scale.set(1.1);
      bottomBackground.zIndex = 2;
      this.container.addChild(bottomBackground);
      const mic = new PIXI.Sprite(PIXI.Assets.get("scenes.game.hold-to-talk"));
      mic.position.set(width / 2 + 4, height - 141);
      mic.anchor.set(0.5);
      mic.zIndex = 2;
      generateButton(mic);
      this.container.addChild(mic);
      const textToGameMasterBackground = new PIXI.Sprite(PIXI.Assets.get("scenes.game.text-to-game-master-background"));
      textToGameMasterBackground.position.set(width / 2 + 4, mic.y + mic.height / 2 + textToGameMasterBackground.height / 2 + 5);
      textToGameMasterBackground.anchor.set(0.5);
      textToGameMasterBackground.zIndex = 2;
      this.container.addChild(textToGameMasterBackground);
      // @ts-ignore PixiJS typings are wrong with 'fontStyle'.
      const textToGameMaster = new PIXI.Text({
        x: textToGameMasterBackground.x,
        y: textToGameMasterBackground.y,
        text: "Text to Game Master",
        style: {
          fontSize: 18,
          fontFamily: "Magra-Regular",
          fill: "#ffffff99",
  
        },
        anchor: {
          x: 0.5,
          y: 0.5,
        },
      });
      textToGameMaster.zIndex = 2;
      this.container.addChild(textToGameMaster);
    }

    // Zone Buttons
    data.zoneButtons.forEach((zoneButtonData) => {
      new ZoneButton(
        this,
        zoneButtonData.position.x,
        zoneButtonData.position.y,
        zoneButtonData.key,
        zoneButtonData.blocked
      );
    });

    // Tasks
    const tasksObject = new TasksObject(this, width - 500, height - 150);
    tasksObject.addTask(
      "tavern",
      "Interrogate townsfolk in the tavern for where Jade was last seen",
      true
    );
    // tasksObject.addTask(
    //   "altar",
    //   "Disarm Dagger Grin and his band of goblins to rescue Jade",
    //   true
    // );
    tasksObject.checkIfAllTasksCompleted();

    const topBar = new TopBarGameObject(this);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    const onPointerDown = async () => {
      // const dialogueSound = new Howl({
      //   src: ["assets/scenes/game/dmitri/dialogue.m4a"],
      // })
      // dialogueSound.play();
      // setDMVideo({ autoPlay: true });

      // Title
      const title = new TitleGameObject(this, data.title.texts);
      // setTimeout(async () => {
      await title.runAndStopAtEnd(() => {
        topBar.startSpeaking();
        // setDMVideo({ borderEffect: true });
        // topBar.startSpeaking();
      }, () => {
        // setDMVideo({ borderEffect: true });
        topBar.stopSpeaking();
      });
      // }, 1_000);
      this.app.stage.off("pointerdown", onPointerDown);
    }
    this.app.stage.once('pointerdown', onPointerDown);

    this.debugText = new PIXI.Text({
      x: 25,
      y: 150,
      style: {
        fontSize: 24,
        fontFamily: "monospace",
        fill: 0xffffff,
      },
    });
    // this.debugText.visible = import.meta.env.DEV;
    // this.debugText.visible = false;
    this.container.addChild(this.debugText);

    window.addEventListener("keydown", (event) => {
      if (event.key === "d") {
        this.debugText.visible = !this.debugText.visible;
      }
    });

    setInterval(() => {
      this.fps = this.app.ticker.FPS;
    }, 100);

    // var script=document.createElement('script');
    // script.src='https://rawgit.com/paulirish/memory-stats.js/master/bookmarklet.js';
    // document.head.appendChild(script);
  }

  onUpdate(ticker: PIXI.Ticker): void {
    if (this.canvasInside) {
      updateBackgroundContainer(this.canvasInside);
    }
    const fps = this.fps;
    const frameTime = 1000 / fps;
    // Smooth FPS samples for average
    if (!this.fpsSamples) this.fpsSamples = [];
    this.fpsSamples.push(fps);
    if (this.fpsSamples.length > 60) this.fpsSamples.shift();
    const avgFps = (
      this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length
    ).toFixed(1);
    const droppedFrames = this.fpsSamples.filter((f) => f < 30).length;
    const droppedPercent = (
      (droppedFrames / this.fpsSamples.length) *
      100
    ).toFixed(1);
    const res = `${window.innerWidth}x${window.innerHeight}`;
    // === RAM Info (Chrome only)
    // const hasMemory = "memory" in performance;
    // const usedHeap = hasMemory ? performance.memory.usedJSHeapSize / 1048576 : 0;
    // const heapLimit = hasMemory ? performance.memory.jsHeapSizeLimit / 1048576 : 0;
    // const ramText = hasMemory
    //   ? `RAM: ${usedHeap.toFixed(1)}MB / ${heapLimit.toFixed(1)}MB`
    //   : `RAM: ~450MB used`;
    const assetLoadTime = this.assetLoadTime
      ? `${(this.assetLoadTime - performance.timing.navigationStart).toFixed(
          0
        )}ms`
      : "~1200ms";
    // const errors = this.errorCount || 0;
    // const warnings = this.warningCount || 0;
    
    const debugInfo = [
      `[DEBUG MENU] - Press [D] to toggle`,
      `FPS: ${fps.toFixed(1)} (average: ${avgFps})`,
      `Frame Time: ${frameTime.toFixed(1)}ms`,
      // `${ramText}`,
      `Dropped Frames: ${droppedPercent}%`,
      `Resolution: ${res}`,
      `PIXI Screen Resolution: ${this.app.screen.width}x${this.app.screen.height}`,
      `Asset Load Time: ${assetLoadTime}`,
      `Glow Cache: ${(cache.glowTime / 1_000).toFixed(2)} seconds`,
      `Is TV: ${this.isTV}`,
    ].join("\n");
    this.debugText.text = debugInfo;
  }
}
