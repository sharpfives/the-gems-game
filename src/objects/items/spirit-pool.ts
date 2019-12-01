import { OVERSAMPLE_FACTOR, FrameRateData } from "../../globals";
import { PolygonPhysicsObject } from "../polygon-physics-object";
import { Engageable } from "./engageable";
import { Cursor } from "../overlays/cursor";

export class SpiritPool extends Engageable {	
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, shapes, public yOffset: number) {
		super(scene, x, y, SpiritPool.name, shapes);
		this.ignoreGravity(true);
		// this.updateBody(20,20);
		this.setRepeat('rest');
		this.playAnimation('rest');
		this.onOverSetIcon(Cursor.talkKey);
		this.iconOffset.y = -130;
		this.iconOffset.x = 0;

	}

	protected getFrameRateData() : FrameRateData {
		return {
			rest : 1	
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(SpiritPool.name,'resources/images/scenes/spirit/pool.json');
		scene.load.spritesheet(SpiritPool.name,'resources/images/scenes/spirit/pool.png', { frameWidth : 30 * OVERSAMPLE_FACTOR, frameHeight : 30 * OVERSAMPLE_FACTOR});
	}
}