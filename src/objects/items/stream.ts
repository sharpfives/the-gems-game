import { Animated } from "../animated";
import { OVERSAMPLE_FACTOR, FrameRateData } from "../../globals";


export class Stream extends Animated {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Stream.name);
		this.setRepeat('play');
		this.playAnimation('play');
	}

	protected getFrameRateData() : FrameRateData {
		return {
			play : 10	
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Stream.name,'resources/stream-waterfalls.json');
		scene.load.spritesheet(Stream.name,'resources/stream-waterfalls.png', { frameWidth : 100 * OVERSAMPLE_FACTOR, frameHeight : 73 * OVERSAMPLE_FACTOR});
	}
}