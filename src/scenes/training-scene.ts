'use strict';

import { SceneBase } from './scene-base';
import { OVERSAMPLE_FACTOR, LINE_COLOR, sleep, rand, tweenPromise, STATE_DID_COMPLETE_TRAINING, DEBUG_SCENE, setNumOfItem, ITEM_BOW, AUDIO_TRAINING, AUDIO_SPIRIT } from '../globals';
import { PhysicsObject } from '../objects/physics-object';
import { Rope } from '../objects/rope';
import { Balloon } from '../objects/items/balloon';
import { Timer } from '../objects/overlays/timer';
import { Spirit } from '../objects/characters/spirit';
import { Target } from '../objects/items/target';
import { stateManager } from '../utils/game-state-manager';
import { audioManager } from '../utils/audio-manager';

export class TrainingScene extends SceneBase {

	ropes: Rope[] = [];
	spirit: Spirit;
	target1: Target;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Balloon.loadResources(this);
		Spirit.loadResources(this);
		Target.loadResources(this);
		this.load.image('smoke-cloud','resources/smoke-cloud.png');

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_BOW,1);
		}
	}

	create(data: any) {

		super.create(data);

		this.minYForWalk = 10 * OVERSAMPLE_FACTOR;
		
		const me = this.me;
		let didShootFirstArrow = false;

		const spirit = new Spirit(this,me.x() + 200,me.y());
		spirit.alpha(0);
		spirit.hover();
		this.spirit = spirit;

		this.hidePosts();

		// this.showCircleTwoMovingTargets();
		// return;

		me.on('shot-arrow', async () => {
			// return;
			if (!didShootFirstArrow) {
				didShootFirstArrow = true;
				await this.startConversation(this.spirit, {
					handlers : {
						target : async () => {
							await spirit.playAnimation('point');
							await sleep(700);
							await spirit.playAnimation('point',true);
						}
					},
					convo : [
						{ text: "off to a good start." },
						{ text: "now, let's try aiming."},
						{ text: "after you pull back move your mouse to aim where you wanna shoot."},
						{ 
							text: "hit that target over there.",
							key : "target"
						}
					]
				});
				this.showFirstTarget();
			}
		});

		audioManager.stop(AUDIO_SPIRIT);
		audioManager.play(AUDIO_TRAINING);

		this.start();
		// this.showTwoMovingTargets();
		// this.showRopeBalloons();
	}

	async start() {
		await this.spirit.appear();
		this.startConversation(this.spirit, {
			convo : [
				{ text: "alright, nancy." },
				{ text: "here's what's gonna happen."},
				{ text: "start by clicking down on yourself and then dragging backwards."},
				{ text: "just like you're pulling back on the bow."},
				{ text: "try it."},
				{ end : 0}
			]
		});
	}

	makeTarget(x,y) {
		const target = new Target(this,x,y);
		this.createSmokeCloud(x, y);
		return target;
	}

	showFirstTarget() {
		const point = this.sceneLoader.exits['first-target'];
		const target = this.makeTarget(point.x, point.y);

		target.on('hit', async () => {
			await sleep(750);
			// this.createSmokeCloud(point.x, point.y);
			target.destroy();
			await this.startConversation(this.spirit, {
				convo : [
					{ text : "not bad."},
					{ text : "for a human, i mean."},
					{ text : "now let's get a bit trickier."}
				]
			});
			this.showTwoMovingTargets();
		});
	}

	async showTwoMovingTargets(showTimers? : boolean) {
		if (typeof showTimers === 'undefined') 
			showTimers = false;

		const point1 = this.sceneLoader.exits['first-target'];
		const target1 = this.makeTarget(point1.x, point1.y);
		let hitTarget1 = false;
		let hitTarget2 = false;

		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		target1.on('hit', async () => {
			this.tweens.killTweensOf(target1.getGameObject());
			if (showTimers)
				target1.timer.alpha(0);
			hitTarget1 = true;
			if (hitTarget2) {
				doneConvo();
			}
		});

		const point2 = this.sceneLoader.exits['second-target'];
		const target2 = this.makeTarget(point2.x, point2.y);
		target2.faceLeft();
		target2.on('hit', async () => {
			this.tweens.killTweensOf(target2.getGameObject());
			if (showTimers)
				target2.timer.alpha(0);
			hitTarget2 = true;
			if (hitTarget1) {
				doneConvo();
			}
		});

		await sleep(700);

		tweenPromise(this, target1.getGameObject(), {y : (this.game.config.height as number) - 10*OVERSAMPLE_FACTOR}, 500).then( () => {
			tweenPromise(this, target1.getGameObject(), {yoyo : true, repeat : -1, y : 10*OVERSAMPLE_FACTOR}, 2500);
		});

		tweenPromise(this, target2.getGameObject(), {y : 10*OVERSAMPLE_FACTOR}, 500).then( () => {
			tweenPromise(this, target2.getGameObject(), {yoyo : true, repeat : -1, y : (this.game.config.height as number) - 10*OVERSAMPLE_FACTOR}, 2500)
		});

		let success = false;

		if (showTimers) {
			const time = 6000;
			Promise.all([
				target2.showTimer(time),
				target1.showTimer(time)
			]).then( () => {
				if (!success) {
					failConvo();
				}
			});
		}

		const failConvo = async () => {
			target1.cancelTweens();
			target2.cancelTweens();
			target2.destroy();
			target1.destroy();
			await this.startConversation(this.spirit, {
				convo : [
					{ text : "gotta be quicker than that, son."},
					{ text : "try again"}
				]
			});
			this.showTwoMovingTargets(true);
		};

		const doneConvo = async () => {
			success = true;
			await sleep(500);
			target1.cancelTweens();
			target2.cancelTweens();
			target2.destroy();
			target1.destroy();
			if (!showTimers) {
				await this.startConversation(this.spirit, {
					convo : [
						{ text : "decent, decent."},
						{ text : "how about some time constraints?"},
						{ text : "hit the targets before the timers run out." }
					]
				});
				this.showTwoMovingTargets(true);
			}
			else {
				await this.startConversation(this.spirit, {
					convo : [
						{ text : "well look at you, princess."},
						{ text : "a regular john wayne."},
						{ text : "let's see how you do with some faster movement."},
						{ text : "hit the targets before the timers run out." }
					]
				});
				this.showCircleTwoMovingTargets();
			}

		}
	}

	async showCircleTwoMovingTargets() {
		const point1 = this.sceneLoader.exits['first-target'];
		const target1 = this.makeTarget(point1.x, point1.y);
		let hitTarget1 = false;
		let hitTarget2 = false;

		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		target1.on('hit', async () => {
			this.tweens.killTweensOf(target1.getGameObject());
			target1.timer.alpha(0);
			hitTarget1 = true;
			tween1.stop();
			if (hitTarget2) {
				doneConvo();
			}
		});

		const point2 = this.sceneLoader.exits['second-target'];
		const target2 = this.makeTarget(point2.x, point2.y);
		target2.faceLeft();
		target2.on('hit', async () => {
			this.tweens.killTweensOf(target2.getGameObject());
			target2.timer.alpha(0);
			hitTarget2 = true;
			tween2.stop();
			if (hitTarget1) {
				doneConvo();
			}
		});

		await sleep(700);

		const path = { t: 0, vec: new Phaser.Math.Vector2() };
		const curve = new Phaser.Curves.Ellipse(gameWidth/2, gameHeight/2, gameWidth/2 - 10*OVERSAMPLE_FACTOR, gameHeight/2 - 10*OVERSAMPLE_FACTOR);
    const tween1 = this.tweens.add({
        targets: path,
        t: 1,
        ease: 'Linear',
        duration: 4000,
				repeat: -1,
				onUpdate: () => {    
					curve.getPoint(path.t, path.vec);
					target1.x(path.vec.x);
					target1.y(path.vec.y);
				}
		});

		const path2 = { t: 0, vec: new Phaser.Math.Vector2() };
		const curve2 = new Phaser.Curves.Ellipse(gameWidth/2, gameHeight/2, gameWidth/2 - 30*OVERSAMPLE_FACTOR, gameHeight/2 - 30*OVERSAMPLE_FACTOR);
    const tween2 = this.tweens.add({
        targets: path2,
        t: 1,
        ease: 'Linear',
        duration: 5000,
				repeat: -1,
				onUpdate: () => {    
					curve2.getPoint(path2.t, path2.vec);
					target2.x(path2.vec.x);
					target2.y(path2.vec.y);
				}
		});

		let success = false;

		const time = 7000;
		Promise.all([
			target2.showTimer(time),
			target1.showTimer(time)
		]).then( () => {
			if (!success) {
				failConvo();
			}
		});
		

		const failConvo = async () => {
			tween1.remove();
			tween2.remove();
			target1.cancelTweens();
			target2.cancelTweens();
			target2.destroy();
			target1.destroy();
			await this.startConversation(this.spirit, {
				convo : [
					{ text : "gotta be quicker than that, son."},
					{ text : "try again"}
				]
			});
			this.showCircleTwoMovingTargets();
		}


		const doneConvo = async () => {
			success = true;
			tween1.remove();
			tween2.remove();
			target1.cancelTweens();
			target2.cancelTweens();
			await sleep(500);
			target1.destroy();
			target2.destroy();
			await this.startConversation(this.spirit, {
				convo : [
					{ text : "well well"},
					{ text : "maybe i under-estimated you."},
					{ text : "but we're not done just yet."},
					{ text : "try to hit the ropes without popping the balloons"}
				]
			});
			this.showRopeBalloons();
		}
	}


	hidePosts() {
		const posts : PhysicsObject[] = [];
		const children = this.children.list;
		for (let c of children) {
			const obj = c['obj'] as PhysicsObject;
			if (typeof obj !== 'undefined') {
				if (obj.name === 'post') {
					obj.alpha(0);
				}
			}
		}
	}

	showRopeBalloons() {

		const posts : PhysicsObject[] = [];
		const children = this.children.list;
		for (let c of children) {
			const obj = c['obj'] as PhysicsObject;
			if (typeof obj !== 'undefined') {
				if (obj.name === 'post') {
					obj.alpha(1);
					this.createSmokeCloud(obj.x(), obj.y());
					posts.push(obj);
				}
			}
		}

		const fail = async () => {
			await this.startConversation(this.spirit, {
				convo : [
					{ text: "no no no! don't pop the balloons"},
					{ text: "try again and cut the ropes"}
				]
			});
			for (let b of balloons) {
				b.playAnimation('pop').then( () =>{
					b.destroy();
				});
			}
			balloons.splice(0,balloons.length);
			for (let r of this.ropes) {
				r.destroy();
			}
			this.ropes.splice(0,this.ropes.length);
			this.showRopeBalloons();
		};

		const complete = async () => {
			stateManager.set(STATE_DID_COMPLETE_TRAINING, true);
			await this.startConversation(this.spirit, {
				convo : [
					{ text: "whoa!" },
					{ text: "i mean, nice shot"},
					{ text: "well, i think you're ready"}
				]
			});

			this.exitScene('done');
		};

		const ropesCut = [];
		const balloons: Balloon[] = [];
		let didFail = false;
		for (let p of posts) {
			const balloon = new Balloon(this,p.x(), p.y() - 100);
			balloons.push(balloon);
			balloon.on('popped', async () => {
				didFail = true;
				rope.detach();
				await fail();
			});
			const balloonSprite = balloon.getGameObject();
			const rope = new Rope(this);
			rope.on('cut', () => {
				if (didFail)
					return;
				if (!rope.didCut) {
					ropesCut.push(1);
				}
				else {
					return;
				}
				if (ropesCut.length == posts.length) {
					complete();
				}
			});
			rope.attach(p.x(), p.y() - OVERSAMPLE_FACTOR * 6, balloonSprite, {x : 0, y : 20});
			this.ropes.push(rope);
		}

	}



	update() {
		try {
			super.update();
			for(let r of this.ropes) {
				r.update();
			}
		}
		catch(e) {
			console.log(e);
		}
	}


}