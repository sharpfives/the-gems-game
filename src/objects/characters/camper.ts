import { Character } from './character';
import { OVERSAMPLE_FACTOR, sleep } from '../../globals';
import { Cursor } from '../overlays/cursor';

export class Camper extends Character {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Camper.name);
		this.updateBody(10,10);
		this.onOverSetIcon(Cursor.talkKey);
		this.restLoop();
	}

	async restLoop() {
		this.playAnimation('rest')
		const timer = this.scene.time.addEvent({
			delay: 5000,               
			callback:  async () => {
				for(let i = 0; i < 2; i++) {
					await this.playAnimation('swing');
					await this.playAnimation('swing',true);
				}
				this.playAnimation('rest')
			},
			callbackScope: this,
			loop: true,
			startAt: 0
		});

	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Camper.name,'resources/camper.json');
		scene.load.spritesheet(Camper.name,'resources/camper.png', { frameWidth : 25 * OVERSAMPLE_FACTOR, frameHeight : 25	 * OVERSAMPLE_FACTOR});
	}	
}