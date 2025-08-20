import * as PIXI from "pixi.js";
import { type GameScene } from "../../scenes/game/game.scene";
import { cache } from "../../core/loader";
import { type CharacterData } from "../../utils/game-data-parser";

export interface CharacterOptions {
  color?: number;
  particlesShapeWidthFactor?: number;
  speed?: number;
  scale?: number;
}

export class Character {
  public scene: GameScene;
  public charData: CharacterData;
  public container: PIXI.Container;
  private randomHexColor: number;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    charData: CharacterData,
    options: CharacterOptions = {}
  ) {
    this.scene = scene;
    this.charData = charData;
    this.randomHexColor = options.color ?? Math.random() * 0xffffff;
    this.container = new PIXI.Container({ x, y });
    this.scene.container.addChild(this.container);

    const avatar = this.createAvatar(charData.key, 1 / (options.speed || 5));
    const { scale = 1 } = options;

    this.container.addChild(avatar);
    this.container.scale.set(scale);

    const displayWidth = avatar.width * scale;
    const particlesContainer = this.scene.particlesEmitter.emit({
      texture: PIXI.Texture.from("/assets/particle.webp"),
      lifetime: {
        min: .5,
        max: 1,
      },
      color: this.randomHexColor,
      frequency: 0.05,
      spawnChance: 1,
      particlesPerWave: 1,
      emitterLifetime: 0.6,
      maxParticles: 1,
      scale: {
        min: 0.1,
        max: 0.3,
      },
      velocity: {
        min: -60,
        max: 60,
      },
      pos: {
        x: x,
        y: y - avatar.height / 2,
      },
      spawnArea: {
        width: avatar.width * scale,
        height: avatar.height * scale,
      }
    });
    particlesContainer.zIndex = -1;


    // Shadow
    const shadow = new PIXI.Sprite(PIXI.Assets.get("shadow"));
    shadow.position.set(x, y);
    shadow.anchor.set(0.5, 1);
    shadow.alpha = 0.5;
    shadow.scale.set(2);
    this.scene.container.addChild(shadow);
    const avatarWidth = displayWidth * 1.6;
    const scaleShadow = Math.min(
      avatarWidth / shadow.width,
      avatar.height / shadow.height
    );
    shadow.scale.set(scaleShadow);

    // HUD
    this.loadHudComponent(avatar, charData.hudOffset);
  }

  private async loadHudComponent(_avatar: any, offset?: { x: number, y: number }) {
    try {
      const avatar = _avatar;
      const module = await import("./components/hud");
      const hudOffset = offset || { x: 0, y: 0 };
      const hud = new module.HudComponent(
        this,
        0 + hudOffset.x,
        -((avatar.height) * this.container.scale.y) + hudOffset.y
      );
      this.container.addChild(hud.container);
    } catch (error) {
      console.error("Failed to load HudComponent:", error);
    }
  }

  public setOrigin(x: number, y: number) {
    const avatar = this.container.getChildByLabel("avatar") as PIXI.Sprite;
    if (avatar) {
      avatar.anchor.set(x, y);
    }
  }

  private createAvatar(key: string, animationSpeed: number) {
    const cacheGlow = cache.glow[key];
    const avatar = new PIXI.AnimatedSprite({
      textures: cacheGlow.textures,
      label: "avatar",
    });
    avatar.anchor.set(0.5, 1);
    avatar.setSize(cacheGlow.originalSize.width + cacheGlow.padding, cacheGlow.originalSize.height + cacheGlow.padding);
    avatar.loop = false;
    avatar.animationSpeed = animationSpeed;
    avatar.play();
    let yoyo = true;
    avatar.onComplete = async () => {
      if (yoyo) {
        yoyo = false;
        avatar.textures = avatar.textures.reverse();
        avatar.gotoAndPlay(0);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2_000 + Math.random() * 3_000));
        yoyo = true;
        avatar.textures = avatar.textures.reverse();
        avatar.gotoAndPlay(0);
      }
    }
    return avatar;
  }
}