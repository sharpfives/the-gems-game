import { Character } from './character';
import { OVERSAMPLE_FACTOR, sleep } from '../../globals';
import { Cursor } from '../overlays/cursor';

export class Dude extends Character {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Dude.name);
		this.ignoreGravity(true);
		this.updateBody(16,14);
		this.onOverSetIcon(Cursor.talkKey);
		this.iconOffset.x = 3 * OVERSAMPLE_FACTOR;
		this.iconOffset.y = -19 * OVERSAMPLE_FACTOR;
		this.rest();
	}

	rest() {
		this.playAnimation('rest');

		const timer = this.scene.time.addEvent({
			delay: 5000,                // ms
			callback:  async () => {
				await sleep(2000);
				await this.playAnimation('leg');
				await this.playAnimation('rest');
			},
			callbackScope: this,
			loop: true
		});
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Dude.name,'resources/dude.json');
		scene.load.spritesheet(Dude.name,'resources/dude.png', { frameWidth : 20 * OVERSAMPLE_FACTOR, frameHeight : 20 * OVERSAMPLE_FACTOR});
	}	
}