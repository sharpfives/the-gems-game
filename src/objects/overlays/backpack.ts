import { PhysicsObject } from '../physics-object';
import { OVERSAMPLE_FACTOR } from '../../globals';

export class Backpack extends PhysicsObject {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Backpack.name);
		const mouseInputSize = 20 * OVERSAMPLE_FACTOR;
		this.static(true);
		this.sensor(true);
		this.ignoreGravity(true);
		this.updateBody(20,20);
	  // this.setupMouseEvents(new Phaser.Geom.Polygon([
		// 	new Phaser.Geom.Point(-mouseInputSize/2,-mouseInputSize/2),
		// 	new Phaser.Geom.Point(mouseInputSize/2,-mouseInputSize/2),
		// 	new Phaser.Geom.Point(mouseInputSize/2,mouseInputSize/2),
		// 	new Phaser.Geom.Point(-mouseInputSize/2,mouseInputSize/2),
		// ]));	
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Backpack.name,'resources/backpack.json');
		scene.load.spritesheet(Backpack.name,'resources/backpack.png', { frameWidth : 21 * OVERSAMPLE_FACTOR, frameHeight : 22 * OVERSAMPLE_FACTOR});
	}
}