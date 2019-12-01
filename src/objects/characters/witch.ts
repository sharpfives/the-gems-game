
import { Character } from './character';
import { OVERSAMPLE_FACTOR } from '../../globals';
import { Cursor } from '../overlays/cursor';

export class Witch extends Character {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene, x, y, Witch.name);
		// this.setRepeat('run');
		// this.setRepeat('eat');
		this.iconOffset.y = -150;
		this.getGameObject().setScale(OVERSAMPLE_FACTOR);
		const width = 20;
		const height = 20;
		this.updateBody(10,10,false);
		this.setupMouseEvents(new Phaser.Geom.Polygon([
			new Phaser.Geom.Point(-width/2,-height/2),
			new Phaser.Geom.Point(width/2,-height/2),
			new Phaser.Geom.Point(width/2,height/2),
			new Phaser.Geom.Point(-width/2,height/2),
		]));
		this.scaleFactor = 1;
		this.onOverSetIcon(Cursor.talkKey);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Witch.name,'resources/witch.json');
		scene.load.spritesheet(Witch.name,'resources/witch.png', { frameWidth : 50 * 1, frameHeight : 50 * 1});
	}
}