import { MoveableObject } from '../moveable-object';
import { TOP_DEPTH, LINE_COLOR, tweenPromise } from '../../globals';

export class LeftRightTransition extends MoveableObject {
	shape: Phaser.GameObjects.Graphics;
	constructor(public scene: Phaser.Scene) {
		super(scene,0,0,'');
	}

	protected initGameObject(x: number, y : number, name : string) {
		let shape = this.scene.add.graphics();
		shape.setScrollFactor(0);
		shape.fillStyle(LINE_COLOR,1);
		const gameWidth = this.scene.game.config.width as number;

    shape.fillRect(0,0,gameWidth,this.scene.game.config.height as number);
		shape.depth = TOP_DEPTH + 2;
		shape.x = gameWidth;
		this.shape = shape;
	}

	getGameObject() {
		return this.shape;
	}

	async show(time?: number) {
		if (!time)
			time = 300;

		const gameWidth = this.scene.game.config.width as number;

		this.x(gameWidth);
		await tweenPromise(this.scene, this.getGameObject(), {x : 0}, 300);
	}

	async hide(time?: number) {
		if (!time)
			time = 300;

		const gameWidth = this.scene.game.config.width as number;

		this.x(0);
		await tweenPromise(this.scene, this.getGameObject(), {x : gameWidth}, 300);
	}
}