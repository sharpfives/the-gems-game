import { PhysicsObject } from '../physics-object';
import { OVERSAMPLE_FACTOR } from '../../globals';

export class BackArrow extends PhysicsObject {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,BackArrow.name);
		this.static(true);
		this.sensor(true);
		this.ignoreGravity(true);
		this.updateBody(20,20);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.image(BackArrow.name,'resources/back-arrow.png');
		// scene.load.json(BackArrow.name,'resources/back-arrow.json');
		// scene.load.spritesheet(BackArrow.name,'resources/back-arrow.png', { frameWidth : 20 * OVERSAMPLE_FACTOR, frameHeight : 20 * OVERSAMPLE_FACTOR});
	}
}