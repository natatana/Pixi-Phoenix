import * as PIXI from 'pixi.js';
import { trimText } from '../../../utils/responsive';
import { type Character } from '../character';

export class HudComponent {
  private character: Character;
  public container: PIXI.Container;
  private nameText: PIXI.Text;
  private roleText: PIXI.Text;
  private hpBar: PIXI.Sprite;
  public x: number;
  public y: number;

  constructor(character: Character, x: number, y: number) {
    this.character = character;
    const charData = this.character.charData;

    // Create container
    this.container = new PIXI.Container();
    this.x = x;
    this.y = y;
    this.container.zIndex = 1;

    // Style objects
    const nameStyle = new PIXI.TextStyle({
      fontFamily: 'Magra-Regular',
      fontSize: 25,
      fontWeight: 'bold',
      fill: 0xffffff,
    });

    const roleStyle = new PIXI.TextStyle({
      fontFamily: 'Magra-Regular',
      fontSize: 19,
      fontWeight: 'bold',
      fill: 0xffffff,
    });

    // Name text
    this.nameText = new PIXI.Text({ text: trimText(charData.name, 12), style: nameStyle });
    this.nameText.anchor.set(0.5, 1);
    this.container.addChild(this.nameText);

    // Role text
    this.roleText = new PIXI.Text({ text: charData.role, style: roleStyle });
    this.roleText.anchor.set(0.5, 1);
    this.container.addChild(this.roleText);

    // HP bar (assumes texture is already loaded)
    this.hpBar = PIXI.Sprite.from('scenes.game.hp-bar');
    this.hpBar.position.y = -35;
    this.hpBar.anchor.set(0.5);
    this.hpBar.scale.set(1.3); // 1.5x bigger in both width and height
    this.container.addChild(this.hpBar);

    // @ts-ignore PIXI.Text is not typed correctly.
    const hpText = new PIXI.Text({
      text: "20/20",
      style: {
        fontFamily: 'Magra-Regular',
        fontSize: 22,
        fill: 0xffffff,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowDistance: 2,
        dropShadowBlur: 2,
      },
      position: {
        x: this.hpBar.x,
        y: this.hpBar.y
      }
    });
    hpText.anchor.set(0.5);
    this.container.addChild(hpText);

    this.refreshPosition();
  }

  refreshPosition() {
    this.roleText.y = this.hpBar.y - this.hpBar.height + 7;
    this.nameText.y = this.roleText.y - this.roleText.height - 5;
    const bounds = this.container.getBounds();
    this.container.x = this.x;
    this.container.y = this.y - bounds.height / 2;
  }

  setName(name: string) {
    this.nameText.text = name;
  }

  setRole(role: string) {
    this.roleText.text = role;
  }
}
