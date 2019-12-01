import { PolygonPhysicsObject } from "../polygon-physics-object";
import { PhysicsObject } from "../physics-object";
import { OVERSAMPLE_FACTOR, rand, DEFAULT_BODY_NAME, FrameRateData, sleep, LINE_COLOR, AUDIO_DOOR_FADE_IN, AUDIO_DOOR_FADE_OUT, AUDIO_DOOR_CLOSE, AUDIO_DOOR_OPEN } from "../../globals";
import { Arrow } from "../arrow";
import { Engageable } from "./engageable";
import { Cursor } from "../overlays/cursor";
import { audioManager } from "../../utils/audio-manager";


export class Door extends Engageable {

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, Door.name);
		this.updateBody(20,25);
		this.static(true);
		this.sensor(true);
		this.onOverSetIcon(Cursor.handKey);
		this.iconOffset.y = -170;
	}

	async dissolve(fromX: number, fromY: number, params? : {
		dissolveIn?: boolean, 
		colorToSelect?: number,
		hover?: boolean,
		endX?: number,
		endY?: number
	}) {
		audioManager.play(params.dissolveIn ? AUDIO_DOOR_FADE_IN : AUDIO_DOOR_FADE_OUT);
		await super.dissolve(fromX, fromY, params);
	}

	async open() {
		audioManager.play(AUDIO_DOOR_OPEN);
		await this.playAnimation('open');
	}

	async close() {
		sleep(4 * 1000 / this.getFrameRateData().close).then( () => {
			audioManager.play(AUDIO_DOOR_CLOSE);
			this.scene.cameras.main.shake(70,0.01,true);
		});
		await this.playAnimation('close');
	}

	getFrameRateData() {
		return {
			close : 15
		}
	}

	isFacingRight() {
    return this.getGameObject().scaleX > 0;
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.spritesheet(Door.name,'resources/door.png',  {frameWidth: 50 * OVERSAMPLE_FACTOR, frameHeight: 50 * OVERSAMPLE_FACTOR});
		scene.load.json(Door.name,'resources/door.json');
	}
}