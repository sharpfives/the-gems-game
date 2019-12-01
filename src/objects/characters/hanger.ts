import { Character } from './character';
import { OVERSAMPLE_FACTOR, FrameRateData, sleep } from '../../globals';
import { join } from 'path';
import { Animated } from '../animated';

export class Hanger extends Character {
	public hangPoint: Phaser.Physics.Matter.Image;
	public isDead: boolean = false;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Hanger.name);
		this.updateBody(7,11);
		this.setRepeat('hang');
		this.setRepeat('run');

		this.getGameObject().setIgnoreGravity(false);
		this.getGameObject().setStatic(false);
		this.getGameObject().setSensor(true);

		// const block = this.scene.matter.add.image(x, y, 'particle', null, { ignoreGravity: true });
		// block.setScale(OVERSAMPLE_FACTOR);
		// block.setFixedRotation();
		// block.setMass(0.02);
		// block.setSensor(true);
		// block.setTint(0xff0000);
		// block.depth = 1000000;
		// this.hangPoint = block;
		// const joint = this.scene.matter.add.joint(this.getGameObject(), block, 1, 1);
		// joint['pointA'].y = Math.round( - this.sprite.height/2);
	}

	faceLeft() {
    this.getGameObject().setScale(-1,1);
  }

  faceRight() {
    this.getGameObject().setScale(1,1);
	}

	die() {
		this.playAnimation('dead');
		this.isDead = true;
	}

	hang() {
		this.playAnimation('hang');
		this.getGameObject().setVelocityX(0.01);
	}

	save() {
		this.isSaved = true;
		this.stopTimer();
	}
	
	protected getFrameRateData() : FrameRateData {
		return {
			hang : 15
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Hanger.name,'resources/hanger.json');
		scene.load.spritesheet(Hanger.name,'resources/hanger.png', { frameWidth : 30 * OVERSAMPLE_FACTOR, frameHeight : 30 * OVERSAMPLE_FACTOR});
	}
}