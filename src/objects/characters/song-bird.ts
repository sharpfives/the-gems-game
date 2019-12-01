import { Character } from './character';
import { OVERSAMPLE_FACTOR, tweenPromise, rand, sleep } from '../../globals';

export class SongBird extends Character {
	hasRedPiece: boolean = false;
	restTimer: Phaser.Time.TimerEvent;
	
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,SongBird.name);
		this.setRepeat('fly');
		this.updateBody(10,10);
		this.speechBubbleOffset.y = -20;
	}

	async tweet(numTimes?: number) {
		if (typeof this.restTimer !== 'undefined') {
			this.restTimer.paused = true;
		}
		if (typeof numTimes === 'undefined') {
			numTimes = 1;
		}
		for(let i = 0; i < numTimes; i++) {
			const note = this.scene.add.image(this.x() - 20, this.y(), 'music-note');
			note.setScale(0.6);
			tweenPromise(this.scene, note, {x : note.x - rand(30,60), y: note.y - rand(50,70)}, 1500, "Sine.easeIn");
			sleep(750).then( () => {
				tweenPromise(this.scene, note, {alpha : 0}, 750);
			});
			await this.playAnimation('tweet');
			this.playAnimation('rest');
			await sleep(300);
		}

		if (typeof this.restTimer !== 'undefined') {
			this.restTimer.paused = false;
		}
	}

	restLoop() {
		this.restTimer = this.scene.time.addEvent({
			delay: 4000,                // ms
			callback:  async () => {
				await this.playAnimation('hop');
				await sleep(1000);
				await this.playAnimation('turn-head');
			},
			callbackScope: this,
			loop: true
		});
	}

	playSong() {

	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(SongBird.name,'resources/small-bird.json');
		scene.load.spritesheet(SongBird.name,'resources/small-bird.png', { frameWidth : 14 * OVERSAMPLE_FACTOR, frameHeight : 14 * OVERSAMPLE_FACTOR});
	}	

	stop() {
		const tweens = this.scene.tweens.getTweensOf(this.getGameObject());
		for (let t of tweens) {
			t.stop();
			t.complete();
		}
	}

	// destroy() {

	// 	// this.getAnimationGameObject().destroy();
	// 	this.getGameObject().destroy();
	// }
}