import { MoveableObject } from "../moveable-object";


export class Cursor extends MoveableObject {

	private image: Phaser.GameObjects.Image;

	static handKey = 'hand';
	static normalKey = 'cursor';
	static arrowKey = 'arrow';
	static talkKey = 'talk';
	static questionKey = 'question';

	constructor(scene: Phaser.Scene) {
		super(scene,0,0,Cursor.normalKey);
	}

	protected initGameObject(x: number, y : number, name : string) {
		this.image = this.scene.add.image(x,y,name);
		this.image.setScrollFactor(0);
	}

	static loadResources(scene: Phaser.Scene) {
		scene.load.image(Cursor.handKey, 'resources/images/cursors/hand-cursor.png');
		scene.load.image(Cursor.arrowKey, 'resources/images/cursors/arrow-cursor.png');
    scene.load.image(Cursor.normalKey, 'resources/images/cursors/cursor.png');
		scene.load.image(Cursor.questionKey, 'resources/images/cursors/question-mark.png');
		scene.load.image(Cursor.talkKey, 'resources/images/cursors/talk icon.png');

		scene.load.image('hand-full', 'resources/images/cursors/hand-icon-small-full.png');
		scene.load.image('hand-full-closed', 'resources/images/cursors/hand-icon-small-full-closed.png');

	}

	private updateCursor(name: string) {
		const lastX = this.image.x; const lastY = this.image.y;
		this.image.destroy();
		this.initGameObject(lastX,lastY,name);
	}

	getGameObject() {
		return this.image;
	}

	setNormal() {
		this.updateCursor(Cursor.normalKey);
	}

	setLeftArrow() {
		this.updateCursor(Cursor.arrowKey);
	}

	setHand() {
		this.updateCursor('hand-full');
	}

	isHand() {
		return this.image.name === 'hand-full';
	}

	setHandClosed() {
		this.updateCursor('hand-full-closed');
	}

	setRightArrow() {
		this.setLeftArrow();
		this.image.setScale(-1,1);
	}
}