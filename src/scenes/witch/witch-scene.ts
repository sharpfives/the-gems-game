'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { OVERSAMPLE_FACTOR, STATE_DID_MEET_WITCH, numAcorns, TOTAL_ACORNS, ITEM_FEATHER, setNumOfItem, numOfItem, DEBUG_SCENE, ITEM_ACORN, STATE_DID_WITCH_APPEAR, sleep, InputMode } from '../../globals';
import { stateManager } from '../../utils/game-state-manager';
import { Witch } from '../../objects/characters/witch';

export class WitchScene extends LeftRightExitScene {

	preload() {
		super.preload();
		Witch.loadResources(this);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_ACORN,TOTAL_ACORNS);
			setNumOfItem(ITEM_FEATHER,0);
			stateManager.set(STATE_DID_WITCH_APPEAR, true);
		}
	}

	create(data: any) {

		super.create(data);
		this.removeLeftExit();

		const me = this.me;
		this.minYForWalk = 63 * OVERSAMPLE_FACTOR;
		const witchPoint = this.sceneLoader.exits['witch'];

		if (data.exitName === 'witch-appear') {
			return;
		}
		else if (!stateManager.get(STATE_DID_WITCH_APPEAR)) {
			return;
		}

		const question = { 
			text : "so do you have those acorns",
			responses : [
				{
					"still workin on it" : [
						{ text: "ugh" },
						{ text: "come back when you have " + TOTAL_ACORNS + ", and maybe" },
						{ text: "MAYBE" },
						{ text: "i'll trade you for something neato" },
					]
				},
				{
					"how many again?" : [
						{ text : TOTAL_ACORNS + " acorns"},
						{ text : "and if you find them"},
						{ text : "i might trade you for something"},
						{ text : "and remember"},
						{ text : "no mushrooms"},
						{ text : "gross"}
					]
				},
				{
					"witches be crazy." : [
						{ text : "really man?" },
						{ text : "i'll turn you into a chicken" }
					]
				},
				{
					"yep" : (numAcorns() >= TOTAL_ACORNS) ? [
						{ text: "hey!" },
						{ text: "thanks for the acorns" },
						{ 
							text: "have this sweet feather",
							key: "feather"
						},
						{ text: "i've heard that it makes you run super fast if you double click where you want to go"},
						{ text: "just a rumor"},
						{ text: "i mean how would i know"},
						{ text: "i'm just an old witch"},
						{ text: "have fun"}
					] : [
						{ text: "no no no" },
						{ text: "i said " + TOTAL_ACORNS + " acorns." },
						{ text: "i'll be here waiting" },
						{ text: "witchin' it up."}
					]
				}
			]
		};

		const witch = new Witch(this,witchPoint.x,witchPoint.y);
		witch.faceRight();
		witch.on('selected', async (x,y,double) => {
			try {
				await me.move(witch.x() + 20 * OVERSAMPLE_FACTOR, witch.y() + 2 * OVERSAMPLE_FACTOR ,double);
				me.faceLeft();
				if (numOfItem(ITEM_FEATHER) > 0) {
					await this.startConversation(witch, {
						convo: [
							{ text: "thanks again for the acorns" },
							{ text: "remember" },
							{ text: "if you wanna run fast" },
							{ text: "double click" },
							{ text: "toodaloo" },
						]
					});
				}
				else if (!stateManager.get(STATE_DID_MEET_WITCH)) {
					await this.startConversation(witch, {
						handlers: {
							hat : () => {
								witch.playAnimation('knod');
							},
							feather : () => {
								this.showPickup(ITEM_FEATHER);
								setNumOfItem(ITEM_FEATHER,1);
								setNumOfItem(ITEM_ACORN,0);
							}
						},
						convo: [
							{ text: "hi there!" },
							{ text: "nice to meet you" },
							{ text: "what's your name?" },
							{ text: "just passing through the swamp?" },
							{ text: "..." },
							{ text: "ok, you can stop staring" },
							{ 
								text: "it's just a big floppy hat",
								key: "hat"
							},
							{ text: "and yes, you don't have to point it out" },
							{ text: "my nose is a little big too" },
							{ text: "..." },
							{ text: "LOOK MAN" },
							{ text: "should we just clear the air?" },
							{ text: "i am a witch. there" },
							{ text: "happy?!" },
							{ text: "you think this is easy?!" },
							{ text: "wearing this stupid hat?!" },
							{ text: "holding this oversized cane?!" },
							{ text: "i can walk just fine!" },
							{ text: "but noooo" },
							{ text: "since i'm a witch i have to act the part." },
							{ text: "you know, i actually enjoy jazz." },
							{ text: "smooth jazz." },
							{ text: "but nooOooOOo" },
							{ text: "you would never ask me about that" },
							{ text: "you'd just assume i listen to some goth bands." },
							{ text: "..." },
							{ text: "well since you're stereotyping me" },
							{ text: "you're probably thinking i'll take some of your mushrooms" },
							{ text: "and make you some strange magic potion" },
							{ text: "that'll give you a strategic advantage and help you beat this game" },
							{ text: "well HA" },
							{ text: "that's where you're wrong" },
							{ text: "i don't even like mushrooms" },
							{ text: "they're gross" },
							{ text: "i DO however enjoy a good acorn" },
							{ text: TOTAL_ACORNS + " to be exact" },
							{ text: "well since you're here and all"},
							question
						]
					});
					stateManager.set(STATE_DID_MEET_WITCH,true);
				}
				else {
					await this.startConversation(witch, {
						handlers : {
							feather : () => {
								this.showPickup(ITEM_FEATHER);
								setNumOfItem(ITEM_FEATHER,1);
								setNumOfItem(ITEM_ACORN,0);
							}
						},
						convo: [
							question
						]
					});
				}
			
			} catch(e) {}
		});
	}

	initializeHud() {
		if (this.exitName === 'witch-appear') {
			const witchPoint = this.sceneLoader.exits['witch'];

			this.setInputMode(InputMode.Disabled);
			this.me.alpha(0);
			stateManager.set(STATE_DID_WITCH_APPEAR,true);
			const witch = new Witch(this,witchPoint.x,witchPoint.y);
			witch.faceRight();
			witch.alpha(0);
			( async () => {
				await this.hud.circleTransition.open();

				await sleep(1000);
				this.createSmokeCloud(witch.x(), witch.y());
				witch.alpha(1);
				await sleep(2500);
				await this.hud.circleTransition.close();
				this.exitScene('witch-appear');
			} )();
		}
	}

	update() {
		try {
			super.update();
		} catch(e) {}
	}


}