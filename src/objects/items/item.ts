import { PhysicsObject } from "../physics-object";
import { Shadow } from "../shadow";
import { ITEM_SHELL, ITEM_ACORN, ITEM_RED_PIECE, OVERSAMPLE_FACTOR, LINE_COLOR, ITEM_MUSHROOM, ITEM_FEATHER, ITEM_BOW } from "../../globals";
import { Engageable } from "./engageable";


export class Item extends Engageable {
	container: Phaser.GameObjects.Container;
	textBox: Phaser.GameObjects.BitmapText;
	physicsContainer: Phaser.GameObjects.GameObject;

	constructor(scene : Phaser.Scene, x : number, y : number, name : string) {
		super(scene,x,y,name);
		this.getGameObject().setIgnoreGravity(true);
		this.getGameObject().setStatic(true);
		this.engageable = false;
	}

	initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		this.physicsContainer = this.scene.matter.add.gameObject(container, {});

		const sprite = this.scene.add.sprite(0,0,name);
		sprite.setOrigin(0.5);
		container.add(sprite);
		this.sprite = sprite;

		const textBox = this.scene.add.bitmapText(9*OVERSAMPLE_FACTOR, 8*OVERSAMPLE_FACTOR, 'nokia-font', '', 50);
		textBox.tint = LINE_COLOR;
		this.textBox = textBox;
		textBox.setCenterAlign();
		this.container.add(textBox);
	}
	
	getGameObject() {
		return this.physicsContainer as Phaser.Physics.Matter.Sprite;
	}

	static loadResources(scene: Phaser.Scene) {
		scene.load.image(ITEM_SHELL, 'resources/images/icons/shell-big.png');
		scene.load.image(ITEM_ACORN, 'resources/images/icons/acorn-big.png');
		scene.load.image(ITEM_RED_PIECE, 'resources/jewel-piece.png');
		scene.load.image(ITEM_MUSHROOM, 'resources/mushroom.png');
		scene.load.image(ITEM_FEATHER, 'resources/feather.png');
		scene.load.image(ITEM_BOW, 'resources/bow-and-arrow-icon.png');
	}
}