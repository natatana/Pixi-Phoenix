import * as PIXI from "pixi.js";
import { SceneBase } from "../../core/scene-manager";
import { GlowFilter } from "pixi-filters";
import { cache } from "../../core/loader";
import { parseGameData } from "../../utils/game-data-parser";
import { isTVDevice } from "../../utils/responsive";

const POOL_COLORS = [0xf8ff6c, 0xff876c, 0xbe6cff];
const ENABLE_GLOW = true;

export class LoadingScene extends SceneBase {
  async onCreate() {
    const legendText = new PIXI.Text({
      text: "Loading assets...",
      style: {
        fontSize: 24,
        fontFamily: "Arial",
        fill: 0xffffff,
      },
      anchor: 0.5,
      position: {
        x: this.app.screen.width / 2,
        y: this.app.screen.height / 2,
      },
    });
    this.container.addChild(legendText);

    const debugText = new PIXI.Text({
      text: `Is TV: ${isTVDevice()}`,
      style: {
        fontSize: 24,
        fontFamily: "Arial",
        fill: 0xffffff,
      },
      anchor: 0,
      position: {
        x: 30,
        y: 30,
      },
    });
    this.container.addChild(debugText);
    
    await PIXI.Assets.loadBundle(["general", "game"], (progress) => {
      legendText.text = `Loading assets... ${Math.round(progress * 100)}%`;
    });

    const data = parseGameData(PIXI.Assets.get(("scenes.game.dmitri.data")));
    const time = performance.now();
    for (let i = 0; i < data.characters.length; i++) {
      const key = data.characters[i].key;
      const glowColor = POOL_COLORS[i % POOL_COLORS.length];
      const { textures, originalSize, padding } = await this.glowEffect(key, glowColor, (progress) => {
        const progressValue = i / data.characters.length + (1 / data.characters.length) * progress;
        legendText.text = `Generating... ${Math.round(progressValue * 100)}%`;
      });
      cache.glow[key] = { textures, color: glowColor, originalSize, padding };
    }
    cache.glowTime = performance.now() - time;
    this.manager.gotoScene("game", { dataKey: "scenes.game.dmitri.data" });
  }

  public async glowEffect(key: string, color: number, onProgress?: (progress: number) => void) {
    const spritesheet = PIXI.Assets.cache.get(key) as PIXI.Spritesheet;
    const animations = spritesheet.data.animations!;
    const avatar = PIXI.AnimatedSprite.fromFrames(animations[Object.keys(animations)[0]]);
    avatar.anchor.set(0.5, 1);
    const originalSize = { width: avatar.width, height: avatar.height };

    const textures: PIXI.Texture[] = [];
    const padding = 60;
    if (!ENABLE_GLOW) {
      return { textures: avatar.textures as PIXI.Texture[], originalSize, padding };
    }
    for (let i = 0; i < avatar.textures.length; i++) {
      const texture = avatar.textures[i] as PIXI.Texture;
      await new Promise((resolve) => setTimeout(resolve, 50));
      const rt = this.createGlowTexture(texture as PIXI.Texture, { resolution: cache.glowResolution, color, padding });
      textures.push(rt)
      if (onProgress) onProgress(i / avatar.textures.length);
    }
    await PIXI.Assets.unload(key);
    avatar.destroy();
    return { textures, originalSize, padding };
  };
  
  private createGlowTexture(texture: PIXI.Texture, options: { resolution?: number, color?: number, padding?: number }) {
    const { resolution = 1, color = Math.random() * 0xffffff, padding = 60 } = options;
    // Render one-time glow texture
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale = resolution;
    sprite.filters = [
      new GlowFilter({ distance: 50, outerStrength: 2, color: color })
    ];

    const w = sprite.width + padding;
    const h = sprite.height + padding;
    const rt = PIXI.RenderTexture.create({ width: w, height: h });
    const glowContainer = new PIXI.Container();
    sprite.position.set(w / 2, h / 2);
    glowContainer.addChild(sprite);
    this.app.renderer.render(glowContainer, { renderTexture: rt });
    sprite.destroy({ children: true });
    glowContainer.destroy({ children: true });

    return rt;
  }
}
