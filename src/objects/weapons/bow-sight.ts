import { MoveableObject } from '../moveable-object';
import { OVERSAMPLE_FACTOR, LINE_COLOR } from '../../globals';

export class BowSight extends MoveableObject {
	container: Phaser.GameObjects.Container;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,"");
		const container = scene.add.container(x,y);
		this.container = container;
		
		const g = scene.add.graphics();
		g.fillStyle(LINE_COLOR, 0.1);
		g.fillRect(0,0,100000,OVERSAMPLE_FACTOR);
		container.add(g);

	}

	getGameObject() {
		return this.container;
	}
}