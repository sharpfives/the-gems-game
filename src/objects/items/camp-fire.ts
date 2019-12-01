import { Animated } from "../animated";
import { OVERSAMPLE_FACTOR } from "../../globals";

export class CampFire extends Animated {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,CampFire.name);
		this.setRepeat('play');
		this.playAnimation('play');
	}

	getFrameRateData() {
		return {
			play : 12
		}
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(CampFire.name,'resources/camp-fire.json');
		scene.load.spritesheet(CampFire.name,'resources/camp-fire.png', { frameWidth : 16 * OVERSAMPLE_FACTOR, frameHeight : 43 * OVERSAMPLE_FACTOR });
	}
}