import * as PIXI from "pixi.js";
import { SceneBase } from "../../core/scene-manager";
import { generateButton } from "../../utils/button";

export class ZoneButton {
  private scene: SceneBase;
  private container: PIXI.Container;

  constructor(
    scene: SceneBase,
    x: number,
    y: number,
    key: string,
    blocked = false
  ) {
    this.scene = scene;
    this.container = new PIXI.Container({ x, y });
    this.container.zIndex = 3;
    this.scene.container.addChild(this.container);

    const zone = new PIXI.Sprite(PIXI.Assets.get(key));
    zone.anchor.set(0.5);
    this.container.addChild(zone);
    if (key === "scenes.game.dmitri.zone-button-dmitri") {
      const topName = new PIXI.Sprite(PIXI.Assets.get("scenes.game.dmitri.zone-button-dmitri-location"));
      topName.anchor.set(0.5, 1);
      topName.position.y = -zone.height / 2;
      topName.scale = 1.2;
      this.container.addChild(topName);
    }

    if (blocked) {
      const blocked = new PIXI.Sprite(PIXI.Assets.get("scenes.game.zone-button-blocked"));
      blocked.anchor.set(0.5);
      blocked.eventMode = "none";
      this.container.addChild(blocked);
    } else {
      generateButton(this.container);
    }
  }
}
