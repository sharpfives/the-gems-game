import { Animated } from "../animated";
import { OVERSAMPLE_FACTOR } from "../../globals";


export class HitAcorn extends Animated {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,HitAcorn.name);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(HitAcorn.name,'resources/hit-acorn.json');
		scene.load.spritesheet(HitAcorn.name,'resources/hit-acorn.png', { frameWidth : 30 *OVERSAMPLE_FACTOR, frameHeight : 30 * OVERSAMPLE_FACTOR});
	}
}