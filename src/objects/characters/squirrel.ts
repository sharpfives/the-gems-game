
import { Character } from './character';
import { OVERSAMPLE_FACTOR } from '../../globals';

export class Squirrel extends Character {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene, x, y, Squirrel.name);
		this.setRepeat('run');
		this.setRepeat('eat');
		this.setRepeat('freak-out');

		this.iconOffset.y = -100;
		this.updateBody(15,15);
	}

	async runTo(x: number,y: number) {
		this.playAnimation('run');
		await super.runTo(x,y);
		this.playAnimation('eat');
	}

	async walkTo(x: number, y: number) {
		this.playAnimation('run');
		await this.moveTo(x,y, 40 * OVERSAMPLE_FACTOR);
		this.playAnimation('eat');
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Squirrel.name,'resources/squirrel.json');
		scene.load.spritesheet(Squirrel.name,'resources/squirrel.png', { frameWidth : 30 * OVERSAMPLE_FACTOR, frameHeight : 30 * OVERSAMPLE_FACTOR});
	}
}