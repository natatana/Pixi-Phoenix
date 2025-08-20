import { ChooseQuestionServices } from "./choose-question.services";
import { ChooseQuestionSceneCreator } from "./choose-question.creator";
import { GameCore } from "../../core/game/game-core";
import type { Question } from "../../core/game/models/questions.model";

export class ChooseQuestionScene extends Phaser.Scene {
  public creator: ChooseQuestionSceneCreator;
  public services: ChooseQuestionServices;

  constructor() {
    super("choose-question");
    this.creator = new ChooseQuestionSceneCreator(this);
    this.services = new ChooseQuestionServices(this);
  }

  init() {
    console.log("ChooseQuestionScene init");
  }

  create() {
    console.log("ChooseQuestionScene create");
    this.creator.setup();
    this.services.setup();
    // console.log(this.services.getCategory("Capitals"));
    for (const categoryLabel of this.services.getCategories()) {
      const category = categoryLabel.getData("category");

      // Check if all questions are answered.
      let allQuestionsAreAnswered = true;
      const questionsLabel = this.services.getQuestionsByCategory(category);
      for (const questionLabel of questionsLabel) {
        const question = GameCore.questions.getQuestionByCategoryAndQuestion(
          category,
          questionLabel.getData("question")
        );
        if (!question) throw new Error("Question not found");
        if (question.winner) {
          this.services.disableInteraction(questionLabel);
        } else {
          this.services.enableInteraction(questionLabel);
          allQuestionsAreAnswered = false;
        }
      }

      // Enable or disable the category based on the answers.
      if (allQuestionsAreAnswered) {
        this.services.disableInteraction(categoryLabel);
      }
    }

    this.events.on("question-selected", (question: Question, questionBounds: Phaser.Geom.Rectangle) => {
      console.log(question, questionBounds);
      this.services.disableAllInteraction();
      this.time.delayedCall(200, () => {
        // this.scene.start("reply-question", { question });
        // this.scene.pause();

        this.renderer.snapshot((image) => {
          this.textures.addImage(
            "snapshot-choose-question",
            image as HTMLImageElement
          );
          this.scene.start("clue-card", { question, questionBounds });
          // this.scene.sleep();
          // this.scene.bringToTop("clue-card");
        });
        // this.scene.start("clue-card", { question });
      });
    });

    if (import.meta.env.PROD) {
      this.services.disableAllInteraction();
      this.services.jeopardySmallLogoShow();
      this.services.jeopardyLargeLogoShow(this.services.getQuestions());
      this.time.delayedCall(1_000, async () => {
        await this.services.startJeopardyLargeLogoAnimation(2);
        this.time.delayedCall(500, async () => {
          await this.services.startJeopardySmallLogoAnimation();
          this.services.enableAllInteraction();
        });
      });
    }
    // this.services.enable(this.services.getCategory("Capitals")!);
    // console.log(this.services.getQuestion("Capitals", "What is the capital of France?"));
    // console.log(this.services.getQuestions());

    // this.time.delayedCall(1000, () => {
    //   // this.scene.stop();
    //   this.scene.start("game");
    // });
    // this.add
    //   .text(500 * Math.random(), 100, "Hello World")
    //   .setFontFamily("'Swiss 911 Ultra Compressed BT'")
    //   .setFontSize(80);

    this.services.startInputAnimation();
    // console.log(this.children.getByName("container"))
    // const container = this.children.getByName("container");
    // this.tweens.add({
    //   targets: container,
    //   props: {
    //     scale: { from: 1, to: 0.85 },
    //   },
    //   duration: 500,
    // })
    // this.scene.launch("podium", { podiums: [{ name: "Morgan" }, { name: "You" }, { name: "Jessica" }] });
  }
}
