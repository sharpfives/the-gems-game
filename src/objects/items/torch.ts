
import { Engageable } from './engageable';
import { Cursor } from '../overlays/cursor';
import { OVERSAMPLE_FACTOR } from '../../globals';

export class Torch extends Engageable {
	isLit = false;
	
	constructor(scene: Phaser.Scene, x: number, y: number, name, shapes?, yOffset?) {
		super(scene,x,y,Torch.name,shapes, yOffset);
		this.setRepeat('play');
		this.onOverSetIcon(Cursor.questionKey);
		this.playAnimation('rest');
		this.ignoreGravity(true);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.spritesheet(Torch.name,'resources/torch-flame.png',  {frameWidth: 14 * OVERSAMPLE_FACTOR, frameHeight: 54 * OVERSAMPLE_FACTOR});
		scene.load.json(Torch.name,'resources/torch-flame.json');
	}

}