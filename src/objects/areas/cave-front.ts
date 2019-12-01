import { OVERSAMPLE_FACTOR, FrameRateData } from "../../globals";
import { PhysicsObject } from "../physics-object";
import { PolygonPhysicsObject } from "../polygon-physics-object";
import { Engageable } from "../items/engageable";

export class CaveFront extends Engageable {	
  constructor(scene: Phaser.Scene, x: number, y: number, name: string, shapes, public yOffset: number) {
		super(scene, x, y, CaveFront.name, shapes, yOffset);
		this.ignoreGravity(true);
		this.static(true);
		this.sensor(true);
	}

	async open() {
		this.scene.cameras.main.shake(13 * 1000 / this.getFrameRateData().open,0.01);
		await this.playAnimation('open');
	}

	protected getFrameRateData() : FrameRateData {
		return {
			open : 10
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(CaveFront.name,'resources/cave-front.json');
		scene.load.spritesheet(CaveFront.name,'resources/cave-front.png', { frameWidth : 83 * OVERSAMPLE_FACTOR, frameHeight : 94 * OVERSAMPLE_FACTOR});
	}
}