import * as PIXI from "pixi.js";
import { gsap } from "gsap";

export function generateButton<T extends PIXI.Container>(gameObject: T, callback?: () => void) {
  gameObject.alpha = 0.85;
  gameObject.interactive = true;
  gameObject.cursor = "pointer";
  gameObject.on("pointerover", () => {
    gsap.to(gameObject, {
      duration: 0.1,
      pixi: {
        scale: 1.1,
        alpha: 1,
      },
    });
  });
  gameObject.on("pointerout", () => {
    gsap.to(gameObject, {
      duration: 0.1,
      pixi: {
        scale: 1,
        alpha: 0.85,
      },
    });
  });
  gameObject.on("pointerdown", () => {
    gsap.to(gameObject, {
      duration: 0.1,
      // yoyo: true, // For some reason it doesn't work.
      pixi: {
        scale: 0.9,
        alpha: 0.5,
      },
      onComplete: () => {
        gsap.to(gameObject, {
          duration: 0.1,
          pixi: {
            scale: 1.1,
            alpha: 1,
          },
          onComplete: () => {
            if (callback) callback();
          },
        });
      },
    });
  });
  return gameObject;
}
