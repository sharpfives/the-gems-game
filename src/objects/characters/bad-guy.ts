import { Character } from './character';
import { OVERSAMPLE_FACTOR, FrameRateData, sleep, DEFAULT_BODY_NAME, AUDIO_ARROW_HIT, AUDIO_BADGUY_STEP, AUDIO_BADGUY_BREATH, AUDIO_BADGUY_DIE, AUDIO_BADGUY_BREAK, AUDIO_BADGUY_SCREAM, AUDIO_BADGUY_SNORE } from '../../globals';
import { Arrow } from '../arrow';
import { SceneBase } from '../../scenes/scene-base';
import { audioManager } from '../../utils/audio-manager';

export class BadGuy extends Character {
	walkTimer: Phaser.Time.TimerEvent;
	invincible: boolean = false;
	isDead: boolean = false;
	walkSoundKey: string;
	restSoundKey: string;
	screamSoundKey: string;
	snoreSoundKey: string;
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,BadGuy.name);
		this.setRepeat('rest');
		this.setRepeat('run');
		this.setRepeat('step-back');
		this.setRepeat('walk');
		this.setRepeat('cry');
		this.setRepeat('sleep');

		const sprite = this.getGameObject();
		this.updateBody(7,25);

		sprite.setIgnoreGravity(true);
		sprite.setStatic(false);
		sprite.setSensor(true);
		sprite.setScale(OVERSAMPLE_FACTOR);
		sprite.setMass(1000000);

		this.walkSoundKey = "" + Math.random();
		this.restSoundKey = "" + Math.random();
		this.screamSoundKey = "" + Math.random();
		this.snoreSoundKey = "" + Math.random();

		this.setContactHandler(Arrow, (obj : Arrow) => {
			if (this.invincible) {
				return;
			}
			if (this.isDead) {
				return;
			}
			audioManager.play(AUDIO_BADGUY_BREAK);

			audioManager.play(AUDIO_BADGUY_DIE);
			this.isDead = true;
			console.log("SHOT EM");
			this.emit('killed');
			// if (typeof this.walkTimer !== 'undefined') {
			// 	this.walkTimer.remove();
			// }
			this.getGameObject().setSensor(true);
			this.breakIntoParticles();
			const sceneWidth = this.scene.game.config.width as number
			const groundBlock = scene.matter.add.rectangle(this.x(), this.y() + 12 * OVERSAMPLE_FACTOR, sceneWidth, 10, { isStatic: true });

			this.destroy();

		}, () => {});

	}
	
	async runTo(x : number,y : number) {
		audioManager.stop(this.restSoundKey);
		audioManager.stop(this.walkSoundKey);
		this.playAnimation('run');
		await this.moveTo(x,y,32 * OVERSAMPLE_FACTOR);
		this.rest();
	}

	async walkTo(x : number,y : number, speed?: number) {
		this.playAnimation('walk');
		audioManager.stop(this.restSoundKey);
		audioManager.play(AUDIO_BADGUY_STEP, this.walkSoundKey);
		await this.moveTo(x,y,speed);
		audioManager.stop(this.walkSoundKey);
		this.rest();

	}

	sleep() {
		audioManager.play(AUDIO_BADGUY_SNORE, this.snoreSoundKey);
		this.playAnimation('sleep');
	}

	async scream() {
		audioManager.stop(this.restSoundKey,100);
		audioManager.stop(this.walkSoundKey,100);
		audioManager.stop(this.snoreSoundKey,100);

		audioManager.play(AUDIO_BADGUY_SCREAM,this.screamSoundKey);
		await this.playAnimation('cry-start');
		this.playAnimation('cry');
		this.scene.cameras.main.shake(1000,0.01);
		await sleep(1000);
		await this.playAnimation('cry-end');
		this.rest();
	}

	faceRight() {
		this.getGameObject().setScale(-1*OVERSAMPLE_FACTOR/this.getScaleFactor(), OVERSAMPLE_FACTOR/this.getScaleFactor());
	}

	faceLeft() {
		this.getGameObject().setScale(OVERSAMPLE_FACTOR/this.getScaleFactor());
	}
	
	getScaleFactor() {
		return 1;
	}

	protected getFrameRateData() : FrameRateData {
		return {
			rest : 15
		};
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(BadGuy.name,'resources/bad-guy.json');
		scene.load.spritesheet(BadGuy.name,'resources/bad-guy.png', { frameWidth : 30, frameHeight : 30});
	}

	rest() {
		audioManager.stop(this.walkSoundKey,100);
		audioManager.play(AUDIO_BADGUY_BREATH, this.restSoundKey);
		this.playAnimation('rest');
	}

	walkAt(who : Character, speed? : number) {
		this.playAnimation('walk');
		audioManager.stop(this.restSoundKey,100);
		audioManager.play(AUDIO_BADGUY_STEP, this.walkSoundKey);
		const timer = this.scene.time.addEvent({
			callback : () => {
				try {
					// this.cancelTweens();
					// this.moveTo(who.x(),who.y(),speed);
					let angle = Math.atan2(who.y() - this.y(), who.x() - this.x());
					angle = (angle < 0 ? angle + 2*Math.PI : angle);
					const mag = 2;
					const vx = mag * Math.cos(angle);
					const vy = mag * Math.sin(angle);
					if (vx > 0) {
						this.faceRight();
					}
					else {
						this.faceLeft();
					}
					this.getGameObject().setVelocity(vx,vy);
				}
				catch(e) {
					timer.remove();
				}
			},
			callbackScope : this,
			loop : true,
			delay : 200
		});
		this.walkTimer = timer;
	}

	async breakIntoParticles(options?) {
		audioManager.stop(this.restSoundKey);
		audioManager.stop(this.walkSoundKey);
		await super.breakIntoParticles(options);
	}

	destroy() {
		if (typeof this.walkTimer !== 'undefined')
			this.walkTimer.remove();

		audioManager.stop(this.restSoundKey,100);
		audioManager.stop(this.walkSoundKey,100);
		audioManager.stop(this.snoreSoundKey,100);
		audioManager.stop(this.screamSoundKey,100);

		super.destroy();
	}
}