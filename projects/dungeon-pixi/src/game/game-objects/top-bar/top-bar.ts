import * as PIXI from "pixi.js";
import { SceneBase } from "../../core/scene-manager";
import { generateButton } from "../../utils/button";
import { setDMVideo, setPlayerAvatarVideo } from "../../../dom/top-bar";
import { screenPixelToPercent } from "../../utils/responsive";
import gsap from "gsap";

export class TopBarGameObject {
  private scene: SceneBase;

  constructor(scene: SceneBase) {
    this.scene = scene;
    const { width } = scene.app.screen;
    const blur = new PIXI.Sprite(
      PIXI.Assets.get("scenes.game.top-bar-blur")
    );
    blur.zIndex = -1;
    this.scene.container.addChild(blur);

    const background = new PIXI.Sprite(
      PIXI.Assets.get("scenes.game.top-bar-background")
    );
    this.scene.container.addChild(background);

    // Create DM
    // this.setVideo("/assets/scenes/game/dm-dialogue.mp4", "dm", width / 5, background.height / 2, 120, 120);
    const dm = this.createDM();
    dm.position.set(width / 5, background.height / 2);
    this.scene.container.addChild(dm);


    // Tooltips group
    const tooltips = this.createTooltips();
    tooltips.x = 750;
    tooltips.y = background.height / 2 - tooltips.height / 2;
    this.scene.container.addChild(tooltips);

    // Avatars group
    const avatars = this.createAvatars();
    avatars.x = tooltips.x + tooltips.width + 10;
    avatars.y = background.height / 2 - avatars.height / 2;
    this.scene.container.addChild(avatars);

    // this.setVideo(
    //   "/assets/scenes/game/player-avatar-01.mp4",
    //   "player-avatar-01",
    //   tooltips.x + tooltips.width + 10 + 60,
    //   60 + background.height / 2 - 60,
    //   120,
    //   120
    // );
    // this.setVideo(
    //   "/assets/scenes/game/player-avatar-02.mp4",
    //   "player-avatar-02",
    //   tooltips.x + tooltips.width + 10 + 60 + 120 + 12,
    //   60 + background.height / 2 - 60,
    //   120,
    //   120
    // );
    // this.setVideo(
    //   "/assets/scenes/game/player-avatar-03.mp4",
    //   "player-avatar-03",
    //   tooltips.x + tooltips.width + 10 + 60 + 120 + 12 + 120 + 12,
    //   60 + background.height / 2 - 60,
    //   120,
    //   120
    // );

    // Buttons group (right-aligned)
    const buttons = new PIXI.Container();
    const chatHistoryButton = generateButton(
      this.createButton("scenes.game.top-bar-button-chat-history", "Chat")
    );
    const btnMenu = generateButton(
      this.createButton("scenes.game.top-bar-button-menu", "Menu")
    );
    chatHistoryButton.x = 0;
    btnMenu.x = chatHistoryButton.width + 30;

    buttons.addChild(chatHistoryButton, btnMenu);
    buttons.x = width - buttons.width - 250;
    buttons.y = background.height / 2;
    this.scene.container.addChild(buttons);
  }

  // private setVideo(
  //   url: string,
  //   key: "dm" | "player-avatar-01" | "player-avatar-02" | "player-avatar-03",
  //   x: number,
  //   y: number,
  //   width: number,
  //   height: number
  // ) {
  //   const {
  //     x: xVideo,
  //     y: yVideo,
  //     width: widthVideo,
  //     height: heightVideo,
  //   } = screenPixelToPercent(this.scene.app, {
  //     x,
  //     y,
  //     width,
  //     height,
  //     integer: true,
  //   });
  //   const options = {
  //     visible: true,
  //     videoUrl: url,
  //     x: xVideo,
  //     y: yVideo,
  //     width: widthVideo,
  //     height: heightVideo,
  //   };
  //   if (key === "dm") {
  //     setDMVideo(options);
  //   } else if (key === "player-avatar-01") {
  //     setPlayerAvatarVideo(1, { ...options, borderColor: "#f8ff6c" });
  //   } else if (key === "player-avatar-02") {
  //     setPlayerAvatarVideo(2, { ...options, borderColor: "#ff876c" });
  //   } else if (key === "player-avatar-03") {
  //     setPlayerAvatarVideo(3, { ...options, borderColor: "#be6cff" });
  //   }
  // }

  private createButton(key: string, text: string) {
    const container = new PIXI.Container();
    const sprite = PIXI.Sprite.from(key);
    sprite.anchor.set(0.5, 1);
    // @ts-ignore PIXI.Text is not typed correctly.
    const textObj = new PIXI.Text({
      text,
      style: {
        fontSize: 18,
        fontFamily: "Magra-Regular",
        fill: 0xffffff,
        dropShadow: true,
        dropShadowDistance: 3,
      },
      anchor: {
        x: 0.5,
        y: 0,
      }
    });
    container.addChild(sprite, textObj);
    return container;
  }

  private createTooltips(): PIXI.Container {
    const container = new PIXI.Container();

    const background = PIXI.Sprite.from(
      "scenes.game.top-bar-tooltips-background"
    );
    container.addChild(background);

    const mic = generateButton(
      PIXI.Sprite.from("scenes.game.top-bar-tooltips-mic")
    );
    const audio = generateButton(
      PIXI.Sprite.from("scenes.game.top-bar-tooltips-audio")
    );
    const video = generateButton(
      PIXI.Sprite.from("scenes.game.top-bar-tooltips-video")
    );

    const spacing = 16;
    mic.y = 12;
    audio.y = mic.y + mic.height + spacing;
    video.y = audio.y + audio.height + spacing;

    container.addChild(mic, audio, video);
    background.width = Math.max(mic.width, audio.width, video.width) + 12;
    background.height = video.y + video.height + 12;
    mic.anchor.set(0.5, 0.0);
    audio.anchor.set(0.5, 0.0);
    video.anchor.set(0.5, 0.0);
    background.anchor.set(0.5, 0.0);

    return container;
  }

  private createAvatars(): PIXI.Container {
    const container = new PIXI.Container();

    const avatar1 = PIXI.Sprite.from("scenes.game.top-bar-avatar-01");
    const avatar2 = PIXI.Sprite.from("scenes.game.top-bar-avatar-02");
    const avatar3 = PIXI.Sprite.from("scenes.game.top-bar-avatar-03");
    avatar1.width = avatar2.width = avatar3.width = 120;
    avatar1.height = avatar2.height = avatar3.height = 120;

    const spacing = 12;

    avatar1.x = 0;
    avatar2.x = avatar1.x + avatar1.width + spacing;
    avatar3.x = avatar2.x + avatar2.width + spacing;

    const mask = new PIXI.Graphics();
    mask
      .roundRect(avatar1.x, avatar2.y, avatar1.width, avatar1.height, 10)
      .roundRect(avatar2.x, avatar2.y, avatar2.width, avatar2.height, 10)
      .roundRect(avatar3.x, avatar3.y, avatar3.width, avatar3.height, 10)
      .fill()
    avatar1.mask = mask;
    avatar2.mask = mask;
    avatar3.mask = mask;

    const borders = new PIXI.Graphics();
    borders
      .roundRect(avatar1.x, avatar2.y, avatar1.width, avatar1.height, 10).stroke({ color: 0xf8ff6c, width: 6 })
      .roundRect(avatar2.x, avatar2.y, avatar2.width, avatar2.height, 10).stroke({ color: 0xff876c, width: 6 })
      .roundRect(avatar3.x, avatar3.y, avatar3.width, avatar3.height, 10).stroke({ color: 0xbe6cff, width: 6 });

    container.addChild(borders, avatar1, avatar2, avatar3, mask);
    return container;
  }

  private createDM() {
    const container = new PIXI.Container({ label: "dm" });
    
    const texture = PIXI.Assets.get("scenes.game.dm-avatar");
    // Create a video texture
    const videoSprite = new PIXI.Sprite(texture);
    videoSprite.width = 120;
    videoSprite.height = 120;
    videoSprite.anchor.set(0.5);
    container.addChild(videoSprite);

const mask = new PIXI.Graphics();
mask.circle(0, 0, videoSprite.width / 2).fill();
container.addChild(mask);
videoSprite.mask = mask;

const staticBorder = new PIXI.Graphics();
staticBorder.circle(0, 0, videoSprite.width / 2).stroke({ color: 0x43efa2, width: 4, alpha: 1 });
staticBorder.zIndex = 1;
container.addChild(staticBorder);

const effectBorder = new PIXI.Graphics();
effectBorder.circle(0, 0, videoSprite.width / 2).stroke({ color: 0x98ff98, width: 4, alpha: 0.5 });
effectBorder.zIndex = -1;
container.addChild(effectBorder);

let tween: gsap.core.Tween | undefined;

container.on("play-video", () => {
  const videoSource = videoSprite.texture.source as PIXI.VideoSource;
  if (videoSource.resource.paused) videoSource.resource.play();
  if (tween) {
    tween.kill();
  }
  const temp = { value: 0 };
  tween = gsap.to(temp, {
    duration: 0.25,
    ease: "power1.inOut",
    value: 1,
    repeat: -1,
    yoyo: true,
    onUpdate: () => {
      effectBorder.clear();
      effectBorder.circle(0, 0, videoSprite.width / 2).stroke({ color: 0x98ff98, width: 4 + Math.floor(temp.value * 6), alpha: 0.5 });
    }
  });
});

 container.on("stop-video", () => {
  if (tween) {
    tween.kill();
    tween = undefined;
  }
  effectBorder.clear();
  effectBorder.circle(0, 0, videoSprite.width / 2).stroke({ color: 0x98ff98, width: 4, alpha: 0.5 });

});

    return container;
  }

  public startSpeaking() {
    const container = this.scene.container.getChildByLabel("dm") as PIXI.Container;
    if (container) {
      container.emit("play-video");
    }
  }

  public stopSpeaking() {
    const container = this.scene.container.getChildByLabel("dm") as PIXI.Container;
    if (container) {
      container.emit("stop-video");
    }
  }
}
