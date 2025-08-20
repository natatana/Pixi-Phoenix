import * as PIXI from "pixi.js";
import { SceneBase } from "./scene-manager";

export interface ParticlesEmitterOptions {
  texture: PIXI.Texture;
  parentContainer?: PIXI.Container;
  lifetime: {
    min: number;
    max: number;
  };
  color?: number;
  scale?: {
    min: number;
    max: number;
  };
  velocity: {
    min: number;
    max: number;
  };
  frequency?: number;
  spawnChance?: number;
  particlesPerWave?: number;
  emitterLifetime?: number;
  maxParticles: number;
  pos?: {
    x: number;
    y: number;
  };
  spawnArea?: {
    width: number;
    height: number;
  };
}

export class ParticlesEmitter {
  private scene: SceneBase;
  private list = new Set<ParticlesContainer>();

  constructor(scene: SceneBase) {
    this.scene = scene;
    this.scene.app.ticker.add(this.update, this);
  }

  private update(ticker: PIXI.Ticker) {
    const dt = ticker.deltaMS / 1000;
    this.list.forEach((container) => {
      container.update(dt);
      for (const child of container.children) {
        if (child instanceof Particle) {
          child.update(dt);
        }
      }
    });
  }

  public emit(options: ParticlesEmitterOptions) {
    const container = new ParticlesContainer(options);
    this.list.add(container);
    if (options.parentContainer) {
      options.parentContainer.addChild(container);
    } else {
      this.scene.container.addChild(container);
    }
    return container;
  }

  public destroy() {
    this.scene.app.ticker.remove(this.update, this);
    this.list.forEach((container) => {
      container.destroy();
    });
  }
}

class ParticlesContainer extends PIXI.Container {
  options: ParticlesEmitterOptions;
  private _frequencyTimer: number = 0;

  constructor(options: ParticlesEmitterOptions) {
    const { pos = { x: 0, y: 0 } } = options;
    super({
      x: pos.x,
      y: pos.y,
      label: "ParticlesContainer",
    });
    this.options = options;
    this.fire();
  }

  private fire() {
    const { texture, maxParticles, spawnArea } = this.options;

    for (let i = 0; i < maxParticles; i++) {
      const particle = new Particle(texture, this.options);

      if (spawnArea) {
        particle.x = (Math.random() - 0.5) * spawnArea.width;
        particle.y = (Math.random() - 0.5) * spawnArea.height;
      }

      this.addChild(particle);
    }
  }

  public update(dt: number) {
    this._frequencyTimer += dt;
    const { frequency = 1 } = this.options;
    if (this._frequencyTimer >= frequency) {
      this.fire();
      this._frequencyTimer -= frequency;
    }
  }
}

class Particle extends PIXI.Sprite {
  velocity: PIXI.Point;
  lifetime: number = 1;
  age: number = 0;
  private _scaleValue: number = 1;

  constructor(texture: PIXI.Texture, options: ParticlesEmitterOptions) {
    super(texture);
    const { velocity, lifetime, scale = { min: 1, max: 1 }, color } = options;
    const velocityPoint = new PIXI.Point(
      velocity.min + Math.random() * (velocity.max - velocity.min),
      velocity.min + Math.random() * (velocity.max - velocity.min)
    );

    this.velocity = velocityPoint;
    this.lifetime = lifetime.min + Math.random() * lifetime.max;

    this.anchor.set(0.5);
    this._scaleValue = scale.min + Math.random() * scale.max;
    this.scale.set(this._scaleValue);
    if (typeof color === "number") this.tint = color;
    this.alpha = 1;

    // Optional: Add glow
    // this.filters = [
    //   new GlowFilter({
    //     distance: 15,
    //     outerStrength: 2,
    //     innerStrength: 0,
    //     color: 0xffdd33,
    //     quality: 0.5,
    //   }),
    // ];
  }

  update(dt: number) {
    this.x += this.velocity.x * dt;
    this.y += this.velocity.y * dt;

    this.age += dt;
    this.alpha = 1 - this.age / this.lifetime;
    this.scale = this._scaleValue * (this.age / this.lifetime + 0.25);

    if (this.age >= this.lifetime) {
      this.destroy();
    }
  }
}
