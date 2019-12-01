'use strict';

import { JumpyGuy } from '../../objects/characters/jumpy-guy';
import { OVERSAMPLE_FACTOR, DEBUG_SCENE, didSaveHostage, STATE_SAVED_ALL_HOSTAGES, InputMode, STATE_NUM_HOSTAGE_RED_PIECES, setNumOfItem, ITEM_RED_PIECE, numOfItem, sleep, setSavedHostage, HostageState, isHostageDead, AUDIO_HOSTAGE, AUDIO_NIGHT_BACKGROUND, AUDIO_CAMPFIRE, rand } from '../../globals';
import { Cursor } from '../../objects/overlays/cursor';
import { EnterFromDoorScene } from '../enter-from-door-scene';
import { CampFire } from '../../objects/items/camp-fire';
import { CampfireHostage } from '../../objects/characters/campfire-hostage';
import { stateManager } from '../../utils/game-state-manager';
import { MainGame } from '../../main-game';
import { audioManager } from '../../utils/audio-manager';

export class JumpyGuyScene extends EnterFromDoorScene {
	jumpyGuy: JumpyGuy;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		JumpyGuy.loadResources(this);
		CampFire.loadResources(this);
		CampfireHostage.loadResources(this);

		if (DEBUG_SCENE) {
			// setSavedHostage('a',HostageState.DEAD);
			// stateManager.set(STATE_SAVED_ALL_HOSTAGES,true);
		}
	}

	create(data: any) {

		super.create(data);


		const fireSpot = this.sceneLoader.exits['fire'];
		new CampFire(this,fireSpot.x, fireSpot.y);

		const hostageSpots = {
			a : {
				label : 'angle',
				scaleX : -1
			},
			b : {
				label : 'front',
				scaleX : -1
			},
			c : {
				label : 'front',
				scaleX : 1
			},
			d : {
				label : 'angle',
				scaleX : 1
			},
			e : {
				label : 'angle-back',
				scaleX : 1
			},
			f : {
				label : 'angle-back',
				scaleX : -1
			},
		};

		// if we're starting out and didn't save everyone already, then reset all states
		if (this.exitName === 'start' && !stateManager.get(STATE_SAVED_ALL_HOSTAGES)) {
			for(let k in hostageSpots) {
				setSavedHostage(k,HostageState.ALIVE);
			}
		}

		// if coming in from left, dont allow restart
		// if (data.exitName === 'left') {
		// 	this.removeRightExit();
		// }

		// check hostage states
		let savedAll = true;
		const totalHostages = Object.keys(hostageSpots).length;
		let count = 0;
		let failed = false;
		for(let k in hostageSpots) {
			if (isHostageDead(k)) {
				failed = true;
			}
			else if (didSaveHostage(k)) {
				count++;
			}
		}

		if (totalHostages !== count || failed) {
			savedAll = false;
		}
		else {
			stateManager.set(STATE_SAVED_ALL_HOSTAGES,true);
			// this.removeLeftExit();
		}


		for (let k in hostageSpots) {
			const meta = hostageSpots[k];
			const point = this.sceneLoader.exits[k];
			const camper = new CampfireHostage(this, point.x, point.y);
			camper.playAnimation((didSaveHostage(k) || stateManager.get(STATE_SAVED_ALL_HOSTAGES) ?  'there-' : 'missing-') + meta.label);
			camper.getGameObject().setScale(meta.scaleX * OVERSAMPLE_FACTOR, OVERSAMPLE_FACTOR);
			if (savedAll || stateManager.get(STATE_SAVED_ALL_HOSTAGES)) {
				camper.sing();
			}
		}

		const jumpyGuySpot = this.sceneLoader.exits['jumpy'];
		const jumpyGuy = new JumpyGuy(this, jumpyGuySpot.x, jumpyGuySpot.y);
		jumpyGuy.playAnimation(failed ? 'rest' : 'jump');
		jumpyGuy.onOverSetIcon(Cursor.talkKey);
		this.jumpyGuy = jumpyGuy;
		

		if (!savedAll) {
			this.removeLeftExit();
		// 	this.removeRightExit();
		}

		const walkToGuy = async () => {
			await this.me.walkTo(jumpyGuy.x() + 75, jumpyGuy.y());
			this.me.faceLeft();
		};

		// comin' in hot
		if (data.exitName === 'start') {

			jumpyGuy.on('selected', async () => {
				try {
					await walkToGuy();
					const snarkyResponses = [
						"lemme guess, 'kumbaya'?",
						"were you *that* off-key?",
						"i know a guy who gives singing lessons",
						"so is this like an a-capella group or something",
						"are you looking for new members, i'm a decent tenor",
						"you guys like singin' huh",
						"this may seem crazy but hey do you have any acorns?",
						"what about mushrooms",
						"hey there's a weird deer in the forest, what's that about",

					];
					let responseIndex = 0;
	
					const makeConvoRest = (response) => {
						const convoBase = { 
							text: "please help!", 
							responses: [
								{
									[response] : [
										{ text : "hey! this is no time for jokes! "},
										{ key : "repeat" }
									]
								},
								{
									"let's do this" : [
										{ text : "thank you! "},
										{ text : "they went to the right! "}
									]
								}
							]
						};
						return convoBase;
					};
	
					if (stateManager.get(STATE_SAVED_ALL_HOSTAGES)) {
						await this.startConversation(jumpyGuy, { 
							convo : [
								{ text: "thanks for you help!" },
								{ text: "we're singin all the jams now!" },
							]
						});
					}
					else {
						await this.startConversation(jumpyGuy, { 
							handlers: {
								repeat : (convo) => {
									convo.start([makeConvoRest(snarkyResponses[responseIndex++ % snarkyResponses.length])]);
								}
							},
							convo : [
								{ text: "oh dear!" },
								{ text: "oh heavens!" },
								{ text: "oh the horror!" },
								{ text: "please help!" },
								{ text: "we were just sitting here around the campfire" },
								{ text: "singing our favorite tunes" },
								{ text: "and these demon things showed up and started snatching people!" },
								{ key : "repeat" }
							]
						});
					}

				} catch (e) {}
			});
		}
		else if (data.exitName === 'right') {

			// jumpyGuy.on('selected', async () => {
			// 	try {
			// 		await walkToGuy();
			const responses = [
				"he was a lousy falsetto anyway",
				"guess we'll try poetry or something",
				"better luck next time",
				"better luck next time",
			];
			(async () => {
				if (failed) {
					await this.startConversation(jumpyGuy, {
						convo : [
							{ text: "well, it was a nice try" },
							{ text: responses[Math.round(rand(0,responses.length-1))] }
						]
					});
					await this.leaveAndTakeRedPieces();
				}
				else if (savedAll) {
					this.doComplete();
				}
				else {
					await this.startConversation(jumpyGuy, {
						convo : [
							{ text: "keep going! you're my hero!" }
						]
					});
				}
			})();
					
				// }
				// catch(e) {}
			// });

		}
		else {
			jumpyGuy.on('selected', async () => {
				try {
					await walkToGuy();
					this.doComplete();
				}
				catch(e) {}
			});
		}

		if (!savedAll) {
			audioManager.play(AUDIO_HOSTAGE);
		}
		else {
			audioManager.stop(AUDIO_HOSTAGE);
			audioManager.play(AUDIO_NIGHT_BACKGROUND);
		}

		audioManager.play(AUDIO_CAMPFIRE);
	}

	async initializeHud() {
		if (this.exitName === 'right') {
			this.hud.circleTransition.open();
		}
	}

	async exitScene(name) {
		audioManager.stop(AUDIO_CAMPFIRE);

		if (name === 'start') { 
			audioManager.stop(AUDIO_HOSTAGE);
			audioManager.stop(AUDIO_NIGHT_BACKGROUND);
			if (!stateManager.get(STATE_SAVED_ALL_HOSTAGES)) {
				await this.leaveAndTakeRedPieces();
			}
			else {
				await super.exitScene(name);
			}
		}
		else {
			await super.exitScene(name);
		}
	}

	async leaveAndTakeRedPieces() {
		this.setInputMode(InputMode.Disabled);
		audioManager.stop(AUDIO_HOSTAGE);
		audioManager.stop(AUDIO_NIGHT_BACKGROUND);
		audioManager.stop(AUDIO_CAMPFIRE);

		await this.hud.circleTransition.close();
		const num = stateManager.get(STATE_NUM_HOSTAGE_RED_PIECES,0);
		setNumOfItem(ITEM_RED_PIECE, numOfItem(ITEM_RED_PIECE) - num);
		if (num > 0) {
			this.hud.backpack.bringToTop();
			await this.showPickup(ITEM_RED_PIECE,-num,true);
			await sleep(1000);
			stateManager.set(STATE_NUM_HOSTAGE_RED_PIECES,0);
		}
		super.exitScene('start');
	}

	async doComplete() {
		await this.startConversation(this.jumpyGuy, {
			convo : [
				{ text: "you did it!" },
				{ text: "you saved everyone!" },
				{ text: "now we can sing again!" }
			]
		});
	}

}