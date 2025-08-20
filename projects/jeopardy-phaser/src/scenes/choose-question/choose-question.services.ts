import type Label from "phaser3-rex-plugins/templates/ui/label/Label";
import type { ChooseQuestionScene } from "./choose-question.scene";
import { GameCore } from "../../core/game/game-core";
import type Sizer from "phaser3-rex-plugins/templates/ui/sizer/Sizer";

export class ChooseQuestionServices {
  private scene: ChooseQuestionScene;

  constructor(scene: ChooseQuestionScene) {
    this.scene = scene;
  }

  public setup() {}

  public getCategory(category: string) {
    return this.scene.children
      .getChildren()
      .find((child) => child.getData("category") === category) as
      | Label
      | undefined;
  }

  public getCategories() {
    return this.scene.children.getAll("name", "category") as Label[];
  }

  // public getQuestion(category: string, question: string) {
  //   return this.scene.children
  //     .getChildren()
  //     .find(
  //       (child) =>
  //         child.getData("category") === category &&
  //         child.getData("question") === question
  //     );
  // }

  public getQuestions() {
    return this.scene.children.getAll("name", "question") as Label[];
  }

  public getQuestionsByCategory(category: string) {
    return this.scene.children
      .getAll("name", "question")
      .filter((label) => label.getData("category") === category) as Label[];
  }

  public enableInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.setTint(0xffffff);
    text.setTint(0xffffff);
    background.setInteractive({ useHandCursor: true });
    background.on(Phaser.Input.Events.POINTER_OVER, () => {
      if (!background.texture.key.endsWith("-hover"))
        background.setTexture(`${background.texture.key}-hover`);
    });
    background.on(Phaser.Input.Events.POINTER_OUT, () => {
      if (background.texture.key.endsWith("-hover"))
        background.setTexture(background.texture.key.replace("-hover", ""));
    });
    background.on(Phaser.Input.Events.POINTER_DOWN, () => {
      const category = label.getData("category");
      const questionText = label.getData("question");
      const question = GameCore.questions.getQuestionByCategoryAndQuestion(
        category,
        questionText
      );
      this.scene.events.emit("question-selected", question, label.getBounds());
    });
  }

  public disableInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.disableInteractive(true);
    background.setAlpha(1.0); // Reset alpha because of the tweens in `enableInteraction`.
  }

  public removeInteraction(label: Label) {
    const background = label.getElement("background") as
      | Phaser.GameObjects.Image
      | undefined;
    const text = label.getElement("text") as
      | Phaser.GameObjects.Text
      | undefined;
    if (!background || !text) return;

    background.setTint(0x808080);
    text.setTint(0x808080);
    background.removeInteractive(true);
  }

  public disableAllInteraction() {
    for (const label of this.getQuestions()) {
      this.disableInteraction(label);
    }
  }

  public enableAllInteraction() {
    for (const label of this.getQuestions()) {
      this.enableInteraction(label);
    }
  }

  public async startJeopardyLargeLogoAnimation(childrenRemovedCount: number) {
    const jeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    const graphics = this.scene.children.getByName(
      "jeopardy-large-logo-mask"
    ) as Phaser.GameObjects.Graphics | undefined;
    if (!jeopardyLargeLogo || !graphics) return;

    const children = this.getQuestions();
    while (children.length > 0) {
      for (let i = 0; i < childrenRemovedCount; i++) {
        const index = Math.floor(Math.random() * children.length);
        children.splice(index, 1);
      }
      this.jeopardyLargeLogoShow(children);
      await new Promise((resolve) => this.scene.time.delayedCall(500, resolve));
    }
  }

  public jeopardyLargeLogoShow(children: Label[]) {
    this.scene.creator.createJeopardyLargeLogo();
    const jeopardyLargeLogo = this.scene.children.getByName(
      "jeopardy-large-logo"
    ) as Phaser.GameObjects.Image | undefined;
    const graphics = this.scene.children.getByName(
      "jeopardy-large-logo-mask"
    ) as Phaser.GameObjects.Graphics | undefined;
    if (!jeopardyLargeLogo || !graphics) return;

    graphics.clear();
    const border = 4;
    for (const child of children) {
      const bounds = child.getBounds();
      graphics.fillRect(
        bounds.x + border / 2,
        bounds.y + border / 2,
        bounds.width - border,
        bounds.height - border
      );
    }
  }

  public getCategoriesJeopardySmallLogo() {
    return this.scene.children.getAll(
      "name",
      "category-jeopardy-small-logo"
    ) as Phaser.GameObjects.Image[];
  }

  public jeopardySmallLogoShow() {
    this.scene.creator.createCategoryJeopardySmallLogo();
    const categories = this.getCategories();
    for (const category of categories) {
      category.setScale(0, 1);
    }
  }

  public async startJeopardySmallLogoAnimation() {
    const categoriesJeopardySmallLogo = this.getCategoriesJeopardySmallLogo();
    await Promise.all(
      categoriesJeopardySmallLogo.map(
        (categoryJeopardySmallLogo) =>
          new Promise((resolve) =>
            this.scene.tweens.add({
              targets: categoryJeopardySmallLogo,
              props: {
                scaleX: { from: 1.0, to: 0.0 },
              },
              duration: 300,
              onComplete: resolve,
            })
          )
      )
    );
    await Promise.all(
      this.getCategories().map(
        (category) =>
          new Promise((resolve) =>
            this.scene.tweens.add({
              targets: category,
              props: {
                scaleX: { from: 0.0, to: 1.0 },
              },
              duration: 300,
              onComplete: resolve,
            })
          )
      )
    );
  }

  public async startInputAnimation() {
    if (!this.scene.children.getByName("input-container")) {
      this.scene.creator.createInput();
    }
    const container = this.scene.children.getByName("container") as Sizer;
    this.scene.tweens.add({
      targets: container,
      props: {
        scale: { from: 1, to: 0.85 },
      },
      duration: 500,
    });
  }
}
