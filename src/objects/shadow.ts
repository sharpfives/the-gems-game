import { MoveableObject } from "./moveable-object";
import { LINE_COLOR, OVERSAMPLE_FACTOR } from "../globals";
import { ItemWithHeight } from './items/item-with-height';

export class Shadow extends MoveableObject {

	public graphics : Phaser.GameObjects.Graphics;
	static alpha = 0.1;
	baseScale: number;

	constructor(scene : Phaser.Scene, public item : ItemWithHeight, public offset?: {x: number, y: number}) {
		super(scene,0,0,'');

		this.offset = (typeof offset === 'undefined' ? {x: 0, y: 0}: offset);
		this.graphics.z = item.getGameObject().z - 1;
		const sprite = (this.item.getAnimationGameObject() as Phaser.GameObjects.Sprite);
		const baseWidth = sprite.width * 0.8;
		const height = baseWidth * 0.3;
		this.graphics.fillStyle(0x000000,0.2);
		this.graphics.fillEllipse(0,0,baseWidth,height);
		this.baseScale = item.scaleFactor;
	}

	initGameObject(x : number, y : number, name : string) {
		const g = this.scene.add.graphics();
		this.graphics = g;
	}

	getGameObject() {
		return this.graphics;
	}

	update() {
		this.depth(this.item.depth() - 1);
		const sprite = (this.item.getAnimationGameObject() as Phaser.GameObjects.Sprite);
		const baseWidth = sprite.width * 0.8;
		const widthProportion = baseWidth / (baseWidth + this.item.height);
		this.getGameObject().setScale(widthProportion * OVERSAMPLE_FACTOR / this.item.scaleFactor );
		this.graphics.x = this.item.x() + this.offset.x;
		this.graphics.y = this.item.y() + this.item.height + this.offset.y;
	}
}