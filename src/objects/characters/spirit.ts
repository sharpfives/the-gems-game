import { FrameRateData, OVERSAMPLE_FACTOR, tweenPromise, rand } from "../../globals";
import { Character } from "./character";

export class Spirit extends Character {

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Spirit.name);
		this.setRepeat('laugh');
		this.setRepeat('fix');
		const sprite = this.getGameObject();
		this.updateBody(10,10,false);
		sprite.setIgnoreGravity(true);
		sprite.setStatic(true);
		sprite.setSensor(true);
		sprite.setScale(OVERSAMPLE_FACTOR);
		sprite.removeInteractive();
		this.scaleFactor = 1;
	}

	async appear() {
		await tweenPromise(this.scene, this.getGameObject(), {alpha : 1}, 1000);
	}
	
	async laugh() {
		await this.playAnimation('laugh-start');
		this.playAnimation('laugh');
	}

	rest() {

	}

	hover() {
		let up = false;
		const time = 3000;
		this.scene.time.addEvent({
			callback : () => {
				tweenPromise(this.scene, this.getGameObject(), {y : this.y() + 50*(up ? 1 : -1)}, time, 'Sine.EaseInOut');
				up = !up;
			},
			loop: true,
			delay : time,
			callbackScope : this,
			startAt: 0
		});

	}


	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Spirit.name,'resources/spirit.json');
		scene.load.spritesheet(Spirit.name,'resources/spirit.png', { frameWidth : 46 * 1, frameHeight : 58 * 1});
	}
}