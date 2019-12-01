import { Animated } from "../animated";
import { FrameRateData, OVERSAMPLE_FACTOR, tweenPromise, rand, DEFAULT_BODY_NAME, sleep } from "../../globals";
import { Character } from "./character";
import { ChaseRock } from "../items/chase-rock";
import { Arrow } from "../arrow";
import { Timer } from "../overlays/timer";

export class JumpyGuy extends Character {
	isDead: boolean;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,JumpyGuy.name);
		this.setRepeat('jump');
		this.setRepeat('strangle');
		this.setRepeat('run');
		this.setRepeat('drag');

		const sprite = this.getGameObject();
		this.updateBody(7*OVERSAMPLE_FACTOR,12*OVERSAMPLE_FACTOR);
		sprite.setStatic(false);
		sprite.setSensor(true);
		sprite.setFixedRotation();
		sprite.setIgnoreGravity(true);
		sprite.setScale(OVERSAMPLE_FACTOR);

		// this.scaleFactor = 1;
		
		this.isDead = false;
	}

	faceLeft() {
    this.getGameObject().setScale(-OVERSAMPLE_FACTOR,OVERSAMPLE_FACTOR);
  }

  faceRight() {
    this.getGameObject().setScale(OVERSAMPLE_FACTOR,OVERSAMPLE_FACTOR);
	}
	
	getScaleFactor() {
		return 1;
	}
	protected getFrameRateData() : FrameRateData {
		return {
			jump : 15	
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(JumpyGuy.name,'resources/jumpy-guy.json');
		scene.load.spritesheet(JumpyGuy.name,'resources/jumpy-guy.png', { frameWidth : 30 * 1, frameHeight : 30 * 1});
	}
}