import { Character } from './character';
import { OVERSAMPLE_FACTOR, AUDIO_BIRD_FLY } from '../../globals';
import { audioManager } from '../../utils/audio-manager';

export class Bird extends Character {
	hasRedPiece: boolean = false;
	isDead: boolean = false;
	flyAudioKey: string;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Bird.name);
		this.setRepeat('fly-in');
		this.setRepeat('fly-away');
		this.updateBody(10,10);
		this.getGameObject().setMass(0.0001);
		this.flyAudioKey = "" + Math.random();
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Bird.name,'resources/evil-bird.json');
		scene.load.spritesheet(Bird.name,'resources/evil-bird.png', { frameWidth : 15 * OVERSAMPLE_FACTOR, frameHeight : 15 * OVERSAMPLE_FACTOR});
	}	

	stop() {
		const tweens = this.scene.tweens.getTweensOf(this.getGameObject());
		for (let t of tweens) {
			t.stop();
			t.complete();
		}
	}

	playAnimation(name: string, reverse?: boolean) {
		if (name === 'fly-in' || name === 'fly-away')
			audioManager.play(AUDIO_BIRD_FLY, this.flyAudioKey);

		return super.playAnimation(name, reverse);
	}

	destroy() {
		audioManager.stop(this.flyAudioKey);
		super.destroy();
	}

}