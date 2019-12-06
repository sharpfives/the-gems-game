'use strict';

import { tweenPromise, sleep, DEBUG_SCENE, STATE_DID_MEET_SPIRIT, OVERSAMPLE_FACTOR, InputMode, STATE_DID_COMPLETE_TRAINING, ITEM_BOW, numRedPieces, TOTAL_RED_PIECES, setNumOfItem, RED_COLOR, TOTAL_MUSHROOMS, AUDIO_SPIRIT, AUDIO_TRAINING, TOP_DEPTH, AUDIO_SPIRIT_LAUGH, ITEM_RED_PIECE } from '../globals';
import { Spirit } from '../objects/characters/spirit';
import { SpiritPool } from '../objects/items/spirit-pool';
import { Door } from '../objects/items/door';
import { stateManager } from '../utils/game-state-manager';
import { EnterFromDoorScene } from './enter-from-door-scene';
import { Animated } from '../objects/animated';
import { FlashOverlay } from '../objects/overlays/flash-overlay';
import { audioManager } from '../utils/audio-manager';
import { Laser } from '../objects/overlays/laser';

export class SpiritScene extends EnterFromDoorScene {
	spirit: Spirit;
	lastIncomingDoorName: any;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Door.loadResources(this);
		Spirit.loadResources(this);
		SpiritPool.loadResources(this);

		this.load.image('jewel','resources/jewel-upright-pointy.png');

		if (DEBUG_SCENE) {
			stateManager.set(STATE_DID_MEET_SPIRIT, false);
			stateManager.set(STATE_DID_COMPLETE_TRAINING, false);
			setNumOfItem(ITEM_RED_PIECE, TOTAL_RED_PIECES-1);
		}
	}

	create(data: any) {

		super.create(data);

		this.removeLeftExit();
		this.removeRightExit();

		this.minYForWalk = 20 * OVERSAMPLE_FACTOR;

		const me = this.me;

		
		const weaponConvo = [
			{ text : "..." },
			{ text : "you're still here" },
			{ text : "what?" },
			{ text : "a weapon?!" },
			{ text : "hahaha" },
			{ text : "come on, man." },
			{ text : "alright, fine. FINE." },
			{ 
				text : "take this",
				key : "bow"
			},
			{ text : "don't shoot your eye out, rookie." },
		];

		const repeat1Convo = [
			{ text : "a while ago i lost something very important" },
			{ text : "VERY important" },
			{ 
				text : "it's my magic gem-stone",
				key: "gem"
			},
			{ text : "it is, as you would expect, very magical" },
			{ text : "and ever since i lost it" },
			{ text : "these demons are like, ALL over the place" },
			{ text : "i know, weird, right?" },
			{ text : "could be a coincidence" },
			{ text : "i dunno" },
			{ text : "not for me to decide" },
			{ text : "but if i had to guess" },
			{ text : "and this is just a guess" },
			{ text : "there are like " + TOTAL_RED_PIECES + " pieces of my gem-stone out there" },
			{ text : "if you could bring them all back to me, that'd be super neat" },
			{ text : "heck" },
			{ text : "i'd be surprised if you get half that" },
			{ text : "well anyway" },
			{ text : "whenever you're ready, dorothy" },
			{ 
				text : "see these doors?",
				key : "doors"
			},
			{ text : "these will take you where you need to go" },
			{ text : "pick one to get started" },
		];

		
		const pool = this.sceneLoader.objects['pool'] as SpiritPool;
		pool.depth(1);
		pool.on('selected', async () => {
			try {
				await me.walkTo(pool.x() - 20*OVERSAMPLE_FACTOR, pool.y());
				this.setInputMode(InputMode.Disabled);
				me.faceRight();
				await tweenPromise(this, spirit.getGameObject(), {alpha : 1}, 750);
				if (numRedPieces() >= TOTAL_RED_PIECES) {

					await this.startConversation(spirit, {
						convo: [
							{ text: "hey!" },
							{ text: "you found all the pieces" },
							{ text: "wow" },
							{ text: "that was really impressive" },
							{ text: "i might get a little teary-eyed" },
							{ text: "just kidding" },
						]
					});

					this.setInputMode(InputMode.Disabled);

					const gemX = spirit.x() + 20 * OVERSAMPLE_FACTOR;
					const gemY = spirit.y() - 5 * OVERSAMPLE_FACTOR;

					const jewel = new Animated(this, gemX, gemY,'jewel');
					jewel.scaleFactor = 1;
					jewel.getGameObject().setScale(OVERSAMPLE_FACTOR);
					sleep(6000).then( async () => {
						this.cameras.main.shake(1500, 0.01);
					});
					await jewel.dissolve(this.me.x(),this.me.y(),{ dissolveIn: true, colorToSelect: RED_COLOR, hover: true });
					jewel.alpha(1);
					jewel.depth(TOP_DEPTH+1);
					new FlashOverlay(this).show();
					spirit.faceRight();
					await spirit.playAnimation('point');
					await tweenPromise(this, jewel.getGameObject(), {scale: 0.05, x : spirit.x() + 7 * OVERSAMPLE_FACTOR, y : spirit.y() - 4 * OVERSAMPLE_FACTOR}, 750);
					jewel.destroy();
					await spirit.playAnimation('open-pocket-jewel');
					await sleep(500);
					await spirit.playAnimation('drop-in-pocket');
					await sleep(500);
					await spirit.playAnimation('close-pocket');
					await sleep(500);
					spirit.faceLeft();
					await this.startConversation(spirit, {
						convo: [
							{ text: "'scuse me for a moment" },
						]
					});
					
					const doors: Door[] = [];
					for(let c of this.children.list) {
						const obj = c['obj'];
						if (obj instanceof Door) {
							doors.push(obj);
						}
					}

					for(let d of doors) {
						this.createSmokeCloud(d.x(), d.y());
						d.destroy();
					}

					const door = new Door(this, pool.x(), pool.y());
					door.on('selected', async () => {
						try {
							await this.me.walkTo(door.x(), door.y() + 30);
							await this.enterDoor(door, 'ending');
						}
						catch(e) {}
					});
					this.createSmokeCloud(pool.x(), pool.y());
					pool.destroy();

				}
				else if (!stateManager.get(STATE_DID_MEET_SPIRIT)) {
					stateManager.set(STATE_DID_MEET_SPIRIT, true);
					await sleep(1000);
					await spirit.playAnimation('laugh-start');
					spirit.playAnimation('laugh');
					audioManager.play(AUDIO_SPIRIT_LAUGH);
					const end = await this.startConversation(spirit, { 
						handlers : {
							'stop-laughing' : () => {
								spirit.playAnimation('rest');
							},
							'doors' : async () => { 
								spirit.playAnimation('point');
								this.showDoors(true);
								await sleep(1000);
								await spirit.playAnimation('point',true);
								spirit.playAnimation('rest');
							},
							'bow' : () => {
								this.showPickup(ITEM_BOW);
								setNumOfItem(ITEM_BOW,1);
							},
							'gem' : async () => {
								spirit.faceRight();
								await spirit.playAnimation('point');
								const gemX = spirit.x() + 20 * OVERSAMPLE_FACTOR;
								const gemY = spirit.y() - 5 * OVERSAMPLE_FACTOR;
								const jewel = new Animated(this, gemX, gemY,'jewel');
								jewel.scaleFactor = 1;
								jewel.getGameObject().setScale(OVERSAMPLE_FACTOR);
								await jewel.dissolve(gemX, gemY, { dissolveIn: true, colorToSelect : RED_COLOR, hover: true, endX: gemX, endY: gemY});
								await spirit.playAnimation('point',true);
								spirit.faceLeft();
							}
						},
						convo : [
							{ text : "hahahaha"},
							{ text : "wow!" },
							{ text : "that thing almost got you!" },
							{ text : "you should have seen the look on your face" },
							{ text : "haha" },
							{ text : "you were all like:" },
							{ text : "\"AHHHHHH!!!\""},
							{ text : "hilarious"},
							{ text : "i mean, priceless"},
							{ text : "seriously" },
							{ text : "i have never"},
							{ text : "in all my 628 years"},
							{ text : "seen anyone run that fast"},
							{ text : "wheww hahaha"},
							{
								text : "...",
								key : "stop-laughing"
							},
							{ text : "oh you're not laughing"},
							{ text : "guess it was kinda serious"},
							{ text : "being chased by a demon and all"},
							{ text : "my bad"},
							{ text : "well hey"},
							{ text : "cheer up, buttercup"},
							{ text : "no time to be complaining about being a hero"},
							{ text : "the world is being taken over by demons"},
							{ text : "yes"},
							{ text : "demons"},
							...repeat1Convo,
							...weaponConvo,
							{ text: "that's it."},
							{ text: "simple, right?"},
							{
								text : "anything else?",
								responses : [
									{
										"umm, how do i use this bow?" : [
											{ text: "guess i should show you the ropes"},
											{ text: "right this way..." },
											{ end: "training" }
										]
									},
									{
										"i think i'm good." : [
											{ text: "mhmm." }
										],
									}
								]
							}
						]
					});
					if (end === 'training') {
						this.exitScene('training');
					}
				}
				else {
					if (stateManager.get(STATE_DID_COMPLETE_TRAINING)) {
						const end = await this.startConversation(spirit, { 
							convo : [
								{
									text: "what now?",
									responses: [
										{
											"so about these demons..." : [
												{ text: "yeah"},
												...repeat1Convo
											]
										},
										{
											"i need some more bow practice" : [
												{ text : "right this way..." },
												{ end : "training" }
											]
										},
										{
											"nothin" : [
												{ text : "nerd" },
												{ end : 0 }
											]
										}
									]
								}
							]
						});
						if (end === 'training') {
							this.exitScene('training');
						}
					}
					else {
						const end = await this.startConversation(spirit, { 
							convo : [
								{ 
									text : "what's up?",
									responses: [
										{
											"what was that thing about the demons?" : [
												{ text: "yep" },
												...repeat1Convo
											]
										},
										{
											"how do i use this bow?" : [
												{ text: "guess i should show you the ropes"},
												{ text: "right this way..." },
												{ end: "training" }
											]
										},
										{
											"nothin" : [
												{ text : "alright" },
												{ end : 0 }
											]
										}
									]
								}
							]
						});
						if (end === 'training') {
							this.exitScene('training');
						}
					}

					
				}

				await tweenPromise(this, spirit.getGameObject(), {alpha : 0}, 1000);

			} catch (e) {}
		});

		const spirit = new Spirit(this,pool.x(),pool.y() - 100);
		spirit.depth(TOP_DEPTH);
		spirit.alpha(0);
		spirit.hover();
		this.spirit = spirit;
		
		this.lastIncomingDoorName = data.exitName;
		
		if (data.exitName === 'from-training') {
			audioManager.stop(AUDIO_TRAINING);
			this.doDoneTraining();
			this.showDoors(false);
		}
		else if (stateManager.get(STATE_DID_MEET_SPIRIT)) {
			this.showDoors(false, data.exitName);

			if (data.exitName === 'died') {
				this.doWakeUpIntro();
			}
			else {
				this.showEnterFromDoor(data.exitName);
			}
		}
		else {
			this.doWakeUpIntro();
		}

		audioManager.play(AUDIO_SPIRIT);
	}

	initializeHud() {
		if (this.exitName === 'died') {
			this.hud.circleTransition.open();
		}
	}

	async showEnterFromDoor(exitName: string) {
		if (exitName !== 'start') {
			return super.showEnterFromDoor(exitName);
		}
	}

	showReturnDoor() {

	}

	async doDoneTraining() {
		this.inputMode = InputMode.Disabled;
		this.me.faceRight();
		this.me.alpha(1);
		await tweenPromise(this, this.spirit.getGameObject(), {alpha : 1}, 1000);
		await this.startConversation(this.spirit, {
			convo : [
				{ text : "well that wasn't so bad" },
				{ text : "if you ever need more practice, just ask" },
				{ text : "see ya" }
			]
		});
		await tweenPromise(this, this.spirit.getGameObject(), {alpha : 0}, 1000);
	}

	async showDoors(animate: boolean, cameFrom?: string) {
		const me = this.me;

		const exitNames = ['hostage', 'chase', 'witch', 'cave'];
		if (cameFrom) {
			const doorIndex = exitNames.indexOf(cameFrom);
			if (doorIndex >= 0)
				exitNames.splice(doorIndex,1);
		}

		const doors: Door[] = [];
		for (let k = 0; k < exitNames.length; k++) {
			const point = this.sceneLoader.exits[exitNames[k]];
			const door = new Door(this, point.x, point.y);
			door.on('selected', async () => {
				try {
					await me.walkTo(door.x(), door.y() + 30);
					await this.enterDoor(door, exitNames[k]);
				}
				catch(e) {}
			});
			doors.push(door);
			if (animate) {
				door.alpha(0);
			}
		}

		if (animate) {
			for (let k = 0; k < doors.length; k++) {
				const d = doors[k];
				this.cameras.main.shake(20,0.01);
				this.createSmokeCloud(d.x(), d.y());
				await tweenPromise(this, d.getGameObject(), {alpha : 1}, 500);
			}
		}
	}

	getExitBackName() {
		return this.lastIncomingDoorName;
	}

	async exitScene(name) {
		if (name !== 'ending')
			audioManager.stop(AUDIO_SPIRIT);
		await super.exitScene(name);
	}

	async doWakeUpIntro() {
		this.setInputMode(InputMode.Disabled);
		const me = this.me;
		me.alpha(0);
		await me.playAnimation('down-rest');
		await me.dissolve(me.x(), 0, { dissolveIn: true });
		await sleep(500);
		await me.playAnimation('rise');
		this.setInputMode(InputMode.Walk);
	}

}