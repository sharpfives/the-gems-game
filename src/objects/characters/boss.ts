import { Character } from './character';
import { OVERSAMPLE_FACTOR, tweenPromise, sleep, makeParticle, rand, RED_COLOR, TOP_DEPTH, AUDIO_LASER_CHARGE, AUDIO_LASER_SHOOT, AUDIO_GROUND_STOMP, AUDIO_BOSS_JUMP, AUDIO_BOSS_ENTER, AUDIO_BOSS_HURT } from '../../globals';
import { SceneBase } from '../../scenes/scene-base';
import { ItemWithHeight } from '../items/item-with-height';
import { Arrow } from '../arrow';
import { Laser } from '../overlays/laser';
import { audioManager } from '../../utils/audio-manager';

export class Boss extends ItemWithHeight {
	isDead: boolean = false;
	height = 0;
	life = 3;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene, x, y, Boss.name, 0, {x:0, y: 200});
		this.updateBody(10,10,false);
		this.sensor(true);
		this.static(false);
		this.ignoreGravity(true);
		this.getGameObject().setScale(OVERSAMPLE_FACTOR);
		this.scaleFactor = 1;

		this.setContactHandler(Arrow, (arrow) => {
			arrow.destroy();

			if (this.isEyeOpen()) {
				this.hurt();
			}
		});
	}

	async hurt() {
		this.life -= 1;
		if (!this.isDead) {
			if (this.life <= 0) {
				this.isDead = true;
				this.cancelTweens();
				this.getGameObject().setTint(RED_COLOR);
				this.scene.tweens.killTweensOf(this);
				this.scene.tweens.killTweensOf(this.getGameObject());
				this.playAnimation('hurt');
				this.emit('died');
			}
			else {
				const numBlinks = 7;
				audioManager.play(AUDIO_BOSS_HURT);
				for(let k = 0; k < numBlinks; k++) {
					this.alpha(1);
					this.getGameObject().setTint(RED_COLOR);
					await sleep(80);
					this.alpha(0.2);
					this.getGameObject().setTint(0xFFFFFF);
					await sleep(80);
				}
				this.alpha(1);
				// this.playAnimation('hurt');
			}
		}
	}

	isEyeOpen() {
		return this.isPlayingAnimation('blink') || this.isPlayingAnimation('rest') || this.isPlayingAnimation('jump');
	}

	isFacingRight() {
		return !super.isFacingRight();
	}

	faceLeft() {
		return super.faceRight();
	}

	faceRight() {
		return super.faceLeft();
	}

	startJumpTimer() {
		// const timer = this.scene.time.addEvent( {
		// 	callbackScope : this,
		// 	callback : () => {

		// 	},
		// 	startAt: 0,
		// 	loop : true
		// })
	}

	async laser() {
		const boss = this;
		const me = (this.scene as SceneBase).me;

		if (me.x() < boss.x()) {
			boss.faceLeft();
		}
		else {
			boss.faceRight();
		}

		await boss.playAnimation('laser');

		const numParticles = 40;
		const r = 200;
		const cx = boss.x() + (boss.isFacingRight() ? 1 : -1 ) * 3 * OVERSAMPLE_FACTOR;
		const cy = boss.y() + 14 * OVERSAMPLE_FACTOR;
		audioManager.play(AUDIO_LASER_CHARGE);
		for( let k = 0; k < numParticles; k++) {
			let p = makeParticle(this.scene, cx + r*rand(-1, 1),cy + r*rand(-1, 1));
			p.tint = RED_COLOR;
			p.alpha = 0.1;
			p.scaleX = OVERSAMPLE_FACTOR;
			p.scaleY = OVERSAMPLE_FACTOR;
			p.depth = TOP_DEPTH + 1;
			tweenPromise(this.scene, p, {x : cx, y: cy, alpha : 0.8, scaleX : 2 * OVERSAMPLE_FACTOR, scaleY : 2 * OVERSAMPLE_FACTOR}, 500).then( () => {
				p.destroy();
			});
			await sleep(50);
		}
		audioManager.stop(AUDIO_LASER_CHARGE,100);

		const l = new Laser(this.scene);
		l.x(boss.x() + (boss.isFacingRight() ? 1 : -1 ) * 3 * OVERSAMPLE_FACTOR); l.y(boss.y() + 14 * OVERSAMPLE_FACTOR);
		l.getGameObject().scaleX = boss.isFacingRight() ? -1 : 1;
		this.emit('laser',l);
		audioManager.play(AUDIO_LASER_SHOOT);
		await l.start();
		audioManager.stop(AUDIO_LASER_SHOOT);
		l.destroy();
		await boss.playAnimation('laser',true);
		
		await this.playAnimation('rest');
		await this.playAnimation('rest');
		
		if (!this.isDead) {
			await this.jump();
		}
	}

	async next() {
		if (!this.isDead) {
			if (rand(0,1) > 0.5) {
				await this.laser();
			}
			else {
				await this.jump();
			}
		}
	}


	async jump() {
		try {
			const me = (this.scene as SceneBase).me;

			await this.playAnimation('jump');
			if (this.isDead) {
				return;
			}

			audioManager.play(AUDIO_BOSS_JUMP);
			this.playAnimation('jump-rest');
			const time = 200;
			const yDiff = 1200;
			this.scene.tweens.add({
				targets: this,
				ease: 'Linear',
				duration: time,
				props: {
					height: yDiff
				}
			});
			const startY = me.y();
			await tweenPromise(this.scene, this.getGameObject(), {y : this.y() - yDiff}, time);
			await sleep(500);
			for(let k = 0; k < 5; k++) {
				this.cancelTweens();
				await this.moveTo(me.x(), me.y() - yDiff - 200, 64 * OVERSAMPLE_FACTOR);
			}

			// this.x(me.x());
			await sleep(850);
			this.playAnimation('slam');
			this.scene.tweens.add({
				targets: this,
				ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
				duration: time,
				props: {
					height: 0
				}
			});
			await tweenPromise(this.scene, this.getGameObject(), {y : me.y() - 20 * OVERSAMPLE_FACTOR}, 200);
			audioManager.play(AUDIO_GROUND_STOMP);
			this.scene.cameras.main.shake(200,0.1,true);
			await sleep(1000);
			audioManager.play(AUDIO_BOSS_ENTER);
			await this.playAnimation('slam-open');
			await this.playAnimation('rest');
			await this.playAnimation('rest');

			if (!this.isDead) {
				await this.next();
			}
		}
		catch(e) {}
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(Boss.name,'resources/boss.json');
		scene.load.spritesheet(Boss.name,'resources/boss.png', { frameWidth : 102 * 1, frameHeight : 80 * 1});
	}

}