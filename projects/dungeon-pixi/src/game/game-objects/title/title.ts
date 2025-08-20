import * as PIXI from "pixi.js";
import { SceneBase } from "../../core/scene-manager";
import { type TitleData } from "../../utils/game-data-parser";
import { gsap } from "gsap";

const BLUR_STRENGTH = 0.4;
const WORD_WRAP_WIDTH_PERCENTAGE = 0.4;
const HEIGHT_PERCENTAGE = 0.3;

export class TitleGameObject {
  private scene: SceneBase;
  private headers: PIXI.Text[] = [];
  private data: TitleData["texts"];
  private currentIndex: number = 0;
  private wordTexts: PIXI.Text[] = [];
  private firstTime = true;

  constructor(scene: SceneBase, titles: TitleData["texts"]) {
    this.scene = scene;
    this.data = titles;
    const { width, height } = this.scene.app.screen;

    this.headers.push(this.createHeader(width * WORD_WRAP_WIDTH_PERCENTAGE));
    this.headers.push(this.createHeader(width * WORD_WRAP_WIDTH_PERCENTAGE));

    const y = (height * HEIGHT_PERCENTAGE) / 2;
    this.header.text = this.getDataText(0);
    this.header.position.set(width / 2, y);
    this.header.alpha = 0;
    this.header.zIndex = -1;
    this.oldHeader.text = this.getDataText(1);
    this.oldHeader.position.set(width / 2, 0);
    this.oldHeader.alpha = 0;
    this.oldHeader.zIndex = -1;

    // for (const header of this.headers) {
    //   header.enableFilters();
    //   const strength = header === this.header ? 0 : BLUR_STRENGTH;
    //   const blur = header.filters?.internal.addBlur(0, 2, 2, strength);
    //   header.setData("blur", blur);
    // }
  }

  private getDataText(index: number) {
    return this.data[index].text.filter((text) => typeof text === "string").join(" ");
  }

  private get header() {
    return this.headers[0];
  }

  private get oldHeader() {
    return this.headers[1];
  }

  private swapHeaders() {
    const tmp = this.headers[0];
    this.headers[0] = this.headers[1];
    this.headers[1] = tmp;
  }

  public async next(stopIfLast: boolean = false) {
    if (this.firstTime) {
      this.firstTime = false;
      await this.appearHeader();
      return;
    }
    this.currentIndex = (this.currentIndex + 1) % this.data.length;
    this.header.text = this.getDataText(this.currentIndex);
    if (stopIfLast && this.currentIndex === this.data.length) {
      return;
    }
    await this.appearHeader();
  }

  private async dissapearOldHeader() {
    const y = -this.oldHeader.height;

    const wordTexts = this.wordTexts;
    this.wordTexts = [];
    await Promise.all(wordTexts.map((text) => new Promise<void>((resolve) => {
      gsap.to(text, {
        duration: 0.5,
        onComplete: () => {
          text.destroy();
          resolve();
        },
        pixi: {
          positionY: text.position.y - this.oldHeader.height,
          alpha: 0,
        },
      });
    })));

    return new Promise((resolve) => {
      gsap.to(this.oldHeader, {
        duration: 0.5,
        onComplete: resolve,
        pixi: {
          positionY: y,
          alpha: 0,
        },
      });
    });
  }

  private async appearHeader() {
    // const blur = this.header.getData("blur") as Phaser.Filters.Blur;
    const y = (this.scene.app.screen.height * HEIGHT_PERCENTAGE) / 2;
    this.header.position.y = y + this.header.height / 2;

    const words = this.data[this.currentIndex].text;
    const { width } = this.scene.app.screen;
    const wrapWidth = width * WORD_WRAP_WIDTH_PERCENTAGE;
    let xOffset = 0;
    let yOffset = 0;
    const initialX = this.header.position.x - (this.header.width / 2);
    const initialY = this.header.position.y;
    const spaceWidth = 5;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (typeof word !== "string") continue;
      let nextWord = words[i + 1];
      const duration = typeof nextWord === "number" ? nextWord / 1_000 : 0.5;

      const text = this.createText(word);
      this.wordTexts.push(text);
      text.anchor.set(0);
      text.alpha = 0;
      if (xOffset + text.width + spaceWidth > wrapWidth) {
        xOffset = 0;
        yOffset += text.height;
      }
      text.position.x = initialX + xOffset;
      text.position.y = initialY + yOffset - this.header.height / 2;
      this.scene.container.addChild(text);
      xOffset += text.width + spaceWidth;

      gsap.to(text, {
        duration: Math.min(duration, 0.5),
        pixi: {
          // positionY: text.position.y - this.header.height / 2,
          alpha: 1,
        },
      });
      await new Promise((resolve) => setTimeout(resolve, duration * 1_000));
    }
  }

  private async moveHeaderToOldHeader() {
    // const blur = this.header.getData("blur") as Phaser.Filters.Blur;
    const y = (this.scene.app.screen.height * HEIGHT_PERCENTAGE) / 4;

    return Promise.all([
      new Promise((resolve) => {
        gsap.to(this.header, {
          duration: 0.5,
          onComplete: resolve,
          pixi: {
            positionY: y,
            alpha: 0,
          },
        });
      }),
      // new Promise((resolve) => {
      //   this.scene.tweens.add({
      //     targets: blur,
      //     duration: 500,
      //     onComplete: resolve,
      //     props: {
      //       strength: BLUR_STRENGTH,
      //     },
      //   });
      // }),
    ]);
  }

  private createHeader(wrapWidth: number) {
    const header = this.createText("");
    header.style.wordWrap = true;
    header.style.wordWrapWidth = wrapWidth;
    this.scene.container.addChild(header);
    return header;
  }

  private createText(text: string) {
    // @ts-ignore PixiJS typings are wrong with 'fontStyle'.
    const textObj = new PIXI.Text({
      text,
      style: {
        fontSize: 26,
        fontFamily: "Magra-Regular",
        fill: 0xffffff,

      },
      anchor: {
        x: 0.5,
        y: 0,
      },
    });
    textObj.zIndex = -1;

    return textObj;
  }

  public async runAndStopAtEnd(onStart?: () => void, onEnd?: () => void) {
    for (let i = 0; i < this.data.length; i++) {
      if (onStart) onStart();
      await this.next(true);
      const textData = this.data[i];
      if (onEnd) onEnd();
      this.dissapearOldHeader();
      this.moveHeaderToOldHeader();
      this.swapHeaders();
      const last = textData.text[textData.text.length - 1];
      const wait = typeof last === "number" ? last : 500;
      await new Promise((resolve) =>
        setTimeout(resolve, wait)
      );
    }
    await this.dissapearAll();
  }

  private async dissapearAll() {
    return Promise.all([
      this.headers.map(
        (header) =>
          new Promise((resolve) => {
            gsap.to(header, {
              duration: 0.5,
              onComplete: resolve,
              pixi: {
                positionY: `-=${header.height}`,
                alpha: 0,
              },
            });
          })
      ),
    ]);
  }
}
