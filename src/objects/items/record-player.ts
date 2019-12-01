import { OVERSAMPLE_FACTOR, FrameRateData } from "../../globals";
import { PolygonPhysicsObject } from "../polygon-physics-object";
import { Engageable } from "./engageable";
import { Cursor } from "../overlays/cursor";
import { Animated } from "../animated";
import { PhysicsObject } from "../physics-object";

export class RecordPlayer extends PhysicsObject {	
  constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, RecordPlayer.name);

		this.setRepeat('play');
		this.playAnimation('rest');

		this.static(true);
		this.ignoreGravity(true);
		this.sensor(true);

		this.updateBody(15,46,false);

		this.getGameObject().setScale(OVERSAMPLE_FACTOR);
	}

	async play() {
		await this.playAnimation('start-play');
		this.playAnimation('play');
	}

	getScaleFactor() {
		return 1;
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(RecordPlayer.name,'resources/record-player.json');
		scene.load.spritesheet(RecordPlayer.name,'resources/record-player.png', { frameWidth : 50 * 1, frameHeight : 60 * 1});
	}
}