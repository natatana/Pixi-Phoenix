import * as PIXI from "pixi.js";
import { manifest } from "./loader";

export class SceneBase {
  public key: string;
  public app: PIXI.Application<PIXI.Renderer<HTMLCanvasElement>>;
  public manager: SceneManager;
  public container: PIXI.Container;

  constructor(key: string, manager: SceneManager) {
    this.key = key;
    this.app = manager.app;
    this.manager = manager;
  }

  async onCreate(data?: unknown) {}

  onUpdate(delta: PIXI.Ticker) {}

  async onDispose() {}
}

export interface SceneManagerConfig {
  parent: HTMLElement | string;
  width: number;
  height: number;
  scenes: Record<string, typeof SceneBase>;
}

export class SceneManager {
  app: PIXI.Application<PIXI.Renderer>;
  private currentScene: SceneBase;
  private destroyed = false;
  private loaded = false;
  private scenes = new Map<string, SceneBase>();
  private config: SceneManagerConfig;

  constructor(config: SceneManagerConfig) {
    this.config = config;
    const { parent, scenes, width, height } = config;
    // Adjust the resolution for retina screens; along with
    // the autoDensity this transparently handles high resolutions
    // PIXI.AbstractRenderer.defaultOptions.resolution =
    //   window.devicePixelRatio || 1;

    // The PixiJS application instance
    this.app = new PIXI.Application();
    this.app
      .init({
        // resizeTo: window, // Auto fill the screen
        resolution: 2,
        // autoDensity: true, // Handles high DPI screens
        // backgroundColor: 0x028af8,
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
      })
      .then(async () => {
        this.loaded = true;
        if (this.destroyed) return;
        // Add application canvas to body
        const parentElement =
          typeof parent === "string" ? document.getElementById(parent) : parent;
        if (!parentElement) throw new Error("Parent element not found");
        parentElement.appendChild(this.app.canvas);

        // Add a handler for the updates
        this.app.ticker.add((delta) => {
          this.update(delta);
        });

        window.addEventListener("resize", () => this.resize());
        this.resize();

        await PIXI.Assets.init({
          manifest,
        });

        Object.entries(scenes).forEach(([key, scene]) => {
          this.addScene(key, scene);
        });

        this.gotoScene(Object.keys(scenes)[0]);
      });
  }

  private resize(): void {
    // current screen size
    // const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    // const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // uniform scale for our game
    const scale = Math.min(screenWidth / this.config.width, screenHeight / this.config.height);

    // the "uniformly englarged" size for our game
    const enlargedWidth = Math.floor(scale * this.config.width);
    const enlargedHeight = Math.floor(scale * this.config.height);

    // margins for centering our game
    const horizontalMargin = (screenWidth - enlargedWidth) / 2;
    const verticalMargin = (screenHeight - enlargedHeight) / 2;

    // now we use css trickery to set the sizes and margins
    this.app.canvas.style.width = `${enlargedWidth}px`;
    this.app.canvas.style.height = `${enlargedHeight}px`;
    this.app.canvas.style.marginLeft = this.app.canvas.style.marginRight = `${horizontalMargin}px`;
    this.app.canvas.style.marginTop = this.app.canvas.style.marginBottom = `${verticalMargin}px`;
  }

  // Replace the current scene with the new one
  async gotoScene(key: string, data?: unknown) {
    const newScene = this.scenes.get(key);
    if (!newScene) throw new Error(`Scene '${key}' not found`);
    if (this.currentScene !== undefined) {
      await this.currentScene.onDispose();
      this.app.stage.removeChildren();
    }

    // This is the stage for the new scene
    const container = new PIXI.Container();
    // container.width = this.WIDTH;
    // container.height = this.HEIGHT;
    // container.scale.x = this.actualWidth() / this.WIDTH;
    // container.scale.y = this.actualHeight() / this.HEIGHT;
    // container.x = this.app.screen.width / 2 - this.actualWidth() / 2;
    // container.y = this.app.screen.height / 2 - this.actualHeight() / 2;

    // Start the new scene and add it to the stage
    this.currentScene = newScene;
    this.app.stage.addChild(container);
    this.currentScene.container = container;
    await newScene.onCreate(data);
  }

  addScene(key: string, scene: typeof SceneBase) {
    this.scenes.set(key, new scene(key, this));
  }

  // This allows us to pass the PixiJS ticks
  // down to the currently active scene
  update(delta: PIXI.Ticker) {
    if (this.currentScene !== undefined) {
      this.currentScene.onUpdate(delta);
    }
  }

  destroy(
    rendererDestroyOptions?: PIXI.RendererDestroyOptions,
    options?: PIXI.DestroyOptions
  ) {
    this.destroyed = true;
    if (!this.loaded) return;
    this.app.destroy(rendererDestroyOptions, options);
  }

  // get WIDTH() {
  //   return this.config.width;
  // }

  // get HEIGHT() {
  //   return this.config.height;
  // }

  // The dynamic width and height lets us do some smart
  // scaling of the main game content; here we're just
  // using it to maintain a 9:16 aspect ratio and giving
  // our scenes a 375x667 stage to work with

  // actualWidth() {
  //   const { width, height } = this.app.screen;
  //   const isWidthConstrained = width < (height * 9) / 16;
  //   return isWidthConstrained ? width : (height * 9) / 16;
  // }

  // actualHeight() {
  //   const { width, height } = this.app.screen;
  //   const isHeightConstrained = (width * 16) / 9 > height;
  //   return isHeightConstrained ? height : (width * 16) / 9;
  // }
}
