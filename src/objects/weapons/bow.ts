import { Animated } from "../animated";
import { FrameRateData, OVERSAMPLE_FACTOR } from "../../globals";

export class Bow extends Animated {
	constructor(scene : Phaser.Scene, x : number, y : number) {
    super(scene,x,y,Bow.name);
  }
	
	protected getFrameRateData() : FrameRateData {
		return {
			walk : 20
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Bow.name,'resources/bow.json');
		scene.load.spritesheet(Bow.name,'resources/bow.png', { frameWidth : 64 *OVERSAMPLE_FACTOR, frameHeight : 64 * OVERSAMPLE_FACTOR});
	}
}