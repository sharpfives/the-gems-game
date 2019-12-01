
import { Character } from './character';
import { OVERSAMPLE_FACTOR } from '../../globals';

export class Duck extends Character {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene, x, y, Duck.name);
		this.setRepeat('run');
		this.setRepeat('eat');
		this.iconOffset.y = -100;
		this.updateBody(10,10);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Duck.name,'resources/small-bird.json');
		scene.load.spritesheet(Duck.name,'resources/small-bird.png', { frameWidth : 14 * OVERSAMPLE_FACTOR, frameHeight : 14 * OVERSAMPLE_FACTOR});
	}
}