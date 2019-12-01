import {MoveableObject} from '../moveable-object';
import { LINE_COLOR, OVERSAMPLE_FACTOR, BG_COLOR } from '../../globals';

export class BowControl extends MoveableObject {
	container: Phaser.GameObjects.Container;
	private width: 40;
	private height: 40;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,"");
	}

	protected initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		
		const g = this.scene.add.graphics();
		g.lineStyle(OVERSAMPLE_FACTOR, LINE_COLOR,1);
		g.fillStyle(BG_COLOR, 1);
		g.fillRoundedRect(0,0,this.width,this.height,10);
		g.strokeRoundedRect(0,0,this.width,this.height,10);

		container.add(g);
	}

	getGameObject() {
		return this.container;
	}

}