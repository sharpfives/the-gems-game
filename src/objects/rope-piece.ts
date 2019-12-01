
import { PhysicsObject } from './physics-object';
import { LINE_COLOR, OVERSAMPLE_FACTOR } from '../globals';
import { Rope } from './rope';
import { Arrow } from './arrow';

export class RopePiece extends PhysicsObject {

	private ball : Phaser.Physics.Matter.Sprite;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,RopePiece.name);

		this.updateBody(1,1);
		this.ignoreGravity(false);
		this.sensor(true);
		this.getGameObject().setFixedRotation();
		this.setContactHandler(Arrow, (arrow) => {
			this.emit('cut', arrow);
		}, () => {});

		this.ball.disableInteractive()
	}

	protected initGameObject(x : number, y : number, name : string) {
		const ball = this.scene.matter.add.sprite(x, y, 'particle', null, { shape: 'circle', mass: 0.02 });
		ball['obj'] = this;
		ball.setTint(LINE_COLOR);
		ball.setScale(OVERSAMPLE_FACTOR);
		ball.setFixedRotation();
		this.ball = ball;
	}

	getGameObject() {
		return this.ball;
	}
}