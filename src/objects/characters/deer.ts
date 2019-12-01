
import { Character } from './character';
import { OVERSAMPLE_FACTOR, sleep } from '../../globals';

export class Deer extends Character {
	drinkTimer: Phaser.Time.TimerEvent;
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene, x, y, Deer.name);
		this.setRepeat('run');
		this.updateBody(15,15,true);
		this.sensor(true);
	}

	async drinkLoop() {
		const timer = this.scene.time.addEvent({
			delay: 5000,                // ms
			callback:  async () => {
				await this.playAnimation('drink');
				this.emit('drink');
				await this.playAnimation('drink',true);
				// await sleep(2000);
				// await this.sing();
			},
			callbackScope: this,
			loop: true
		});
		this.drinkTimer = timer;
	}

	async sing() {
		await this.playAnimation('sing');
		await sleep(300);
		await this.playAnimation('sing',true);
	}


	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Deer.name,'resources/deer.json');
		scene.load.spritesheet(Deer.name,'resources/deer.png', { frameWidth : 30 * OVERSAMPLE_FACTOR, frameHeight : 30 * OVERSAMPLE_FACTOR});
	}
}