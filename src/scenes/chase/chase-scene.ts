'use strict';

import * as Phaser from 'phaser';
import { SceneBase } from '../scene-base';
import { BadGuy } from '../../objects/characters/bad-guy';
import { WarningIcon } from '../../objects/overlays/warning-icon';
import { WideScreen } from '../../objects/overlays/widescreen-overlay';
import { tweenPromise, rand, sleep, OVERSAMPLE_FACTOR, InputMode, STATE_DID_CHASE_SCENE, AUDIO_SWING_END, AUDIO_CHASE_LOOP } from '../../globals';
import { Animated } from '../../objects/animated';
import { ChaseRock } from '../../objects/items/chase-rock';
import { Guy } from '../../objects/characters/guy';
import { LeftRightTransition } from '../../objects/overlays/left-right-transition';
import { stateManager } from '../../utils/game-state-manager';
import { audioManager } from '../../utils/audio-manager';
import { ChaseTree } from '../../objects/items/chase-tree';

export class ChaseScene extends SceneBase {
	warningIcon: WarningIcon;
	badguy: BadGuy;
	done: boolean = false;
	obstacleTimer: Phaser.Time.TimerEvent;
	grassTimer: Phaser.Time.TimerEvent;
	resetting: boolean = false;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		BadGuy.loadResources(this);
		ChaseRock.loadResources(this);
		ChaseTree.loadResources(this);
	}

	create(data) {

		super.create(data);

		const me = this.me;
		// me.getGameObject().setStatic(false);

		const badguy = new BadGuy(this,114 * OVERSAMPLE_FACTOR,me.y());
		badguy.updateBody(10 * OVERSAMPLE_FACTOR, 20 *OVERSAMPLE_FACTOR, false);
		badguy.playAnimation('run');
		badguy.getGameObject().setStatic(false);
		badguy.getGameObject().setSensor(true);
		badguy.setContactHandler(Guy, async (guy: Guy) => {
			this.resetting = true;
			this.setInputMode(InputMode.Disabled);
			this.obstacleTimer.remove();
			this.grassTimer.paused = true;
			badguy.x(114 * OVERSAMPLE_FACTOR);
			badguy.alpha(0);
			await me.playAnimation('kneel-fall-down');
			await sleep(1000);
			transition.hide();
			this.start();
		});
		this.badguy = badguy;

		const grassList : Phaser.GameObjects.Image[] = [];
		const timer = this.time.addEvent({
			callbackScope : this,
			delay : 150,
			loop : true,
			callback : async () => {
				if (!this.done) {
					const grass = this.add.image(0,rand(0,this.game.config.height as number), 'grass');
					grassList.push(grass);
					const toX = this.game.config.width as number;
					await tweenPromise(this,grass, {x : toX}, 700);
					if (grass['leave'] !== true) {
						grass.destroy();
						grassList.splice(grassList.indexOf(grass));
					}
				}
				else {
					timer.remove()
					for (let g of grassList) {
						g['leave'] = true;
						this.tweens.killTweensOf(g);
						tweenPromise(this, g, {x : g.x + 200}, 2000);
					}
				}
			}
		});
		this.grassTimer = timer;
		
		this.warningIcon = new WarningIcon(this,100,100);
		this.warningIcon.alpha(0);

		// const rock = new ChaseRock(this,0,me.y());
		// tweenPromise(this, rock.getGameObject(), {x : 500}, 2000);

		const transition = new LeftRightTransition(this);
		transition.hide();

		this.start();

		audioManager.play(AUDIO_CHASE_LOOP);
	}

	initializeHud() {
		this.hud.backpack.alpha(0);
	}

	reset() {

	}

	start() {
		this.setChaseMode();
		this.grassTimer.paused = false;
		this.resetting = false;
		const me = this.me;
		me.playAnimation('run');
		me.faceLeft();
		me.x(45 * OVERSAMPLE_FACTOR);
		me.y( (this.game.config.height as number) /2);
		
		this.badguy.alpha(1);
		this.badguy.x(114 * OVERSAMPLE_FACTOR);
		this.badguy.y( this.me.y() );

		// if (typeof this.obstacleTimer !== 'undefined') {
		// 	this.obstacleTimer.paused = false;
		// 	return;
		// }

		const hurdleTypes = [];
		const hurdles = [];

		const gameHeight = this.game.config.height as number;
		const gameWidth = this.game.config.width as number;
		const yInset = 30;

		const obstacleTypes = [ChaseRock, ChaseTree];

		const timer = this.time.addEvent({
			delay: 5000,                // ms
			callback:  async () => {

				const y = this.me.y();
				// const y = rand(yInset, gameHeight - yInset);
				this.warningIcon.y(y);
				await this.warningIcon.flash();
				await sleep(200);
				if (this.resetting) {
					return;
				}

				const TypeToUse = obstacleTypes[Math.round(rand(0,obstacleTypes.length-1))];
				const rock = new TypeToUse(this,0,y);
				rock.x(-rock.sprite.width/2);
				rock.setContactHandler(Guy, async (guy: Guy) => {
					console.log('hit guy!');
					if (this.resetting) {
						return;
					}
					rock.destroy();
					guy.playAnimation('die');
					await tweenPromise(this, me.getGameObject(), {x : me.x() + 5 * OVERSAMPLE_FACTOR}, 300);
					await guy.playAnimation('run');
				});

				rock.setContactHandler(BadGuy, async (guy: BadGuy) => {
					console.log('hit badguy!');

					guy.playAnimation('run-fall').then( () => {
						guy.playAnimation('run');
					});
					// timer.remove();
					await tweenPromise(this, guy.getGameObject(), {x : guy.x() + 25 * OVERSAMPLE_FACTOR}, 200);
					if (guy.x() > (this.game.config.width as number)) {
						this.done = true;
						// guy.destroy();
						guy.x((this.game.config.width as number) * 2)
						timer.remove();
						this.doDoneSequence();
						// guy.destroy();
					}
				});

				await tweenPromise(this, rock.getGameObject(), {x : gameWidth}, 700);
				rock.destroy();

			},
			callbackScope: this,
			loop: true
		});
		this.obstacleTimer = timer;
	}

	async doDoneSequence() {
		audioManager.stop(AUDIO_CHASE_LOOP,2000);
		audioManager.play(AUDIO_SWING_END);

		this.setInputMode(InputMode.Disabled);
		stateManager.set(STATE_DID_CHASE_SCENE, true);
		this.hud.wideScreen.show();
		const me = this.me;
		const numBreaths = 3;
		await me.moveTo(me.x()-1, (this.game.config.height as number)/2);
		await me.playAnimation('run-stop');
		for(let k = 0; k < numBreaths; k++) {
			await me.playAnimation('out-of-breath');
		}
		await me.playAnimation('kneel-fall-down');
		await sleep(500);
		me.alpha(0);
		await me.dissolve(me.x(), 0, { dissolveIn: false });
		this.exitScene('done');
	}

	setChaseMode() {
		const me = this.me;
		this.setInputMode(InputMode.Walk);
		this.inputHandler.setOnTap(this, async (x: number, y: number) => {
			const distY = Math.abs(y - me.y());
			const speed = 24*OVERSAMPLE_FACTOR;
			const time = 1000 * distY / speed;
			tweenPromise(this, this.badguy.getGameObject(), {y : y}, time * 1.5, 'Linear', 1500);
			await tweenPromise(this, me.getGameObject(), {y : y}, time);
		});
	}

	update() {
		super.update();

		try {
			if (!this.done) {
				// const velocityUpdate = 1 * (this.me.x() < this.badguy.x() ? -1 : 1);

				const velocityUpdate = 0.2 * (this.me.x() < this.badguy.x() ? -1 : 1);
				// const velocityUpdate = 0.15 * (this.me.x() < this.badguy.x() ? -1 : 1);
				this.badguy.getGameObject().setVelocityX(velocityUpdate);
			}
		}
		catch(e) {}

	}

}