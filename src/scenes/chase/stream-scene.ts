'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { tweenPromise, makeParticle, rand, sleep, TOP_DEPTH, OVERSAMPLE_FACTOR, InputMode, DEBUG_SCENE, ITEM_SHELL, STATE_DID_STREAM_SCENE, STATE_LAST_SCENE, STATE_LAST_EXIT, setNumOfItem, didPickUpRedPiece, AUDIO_DEER_NOTE_1, AUDIO_DEER_NOTE_2, AUDIO_DEER_NOTE_3, AUDIO_STREAM, AUDIO_NOTE_1, ITEM_BOW, STATE_DID_FIRST_STREAM_SONG, AUDIO_FOREST, AUDIO_NOTE_PAD, AUDIO_BADGUY_BACKGROUND } from '../../globals';
import { Cursor } from '../../objects/overlays/cursor';
import { Deer } from '../../objects/characters/deer';
import { PolygonArea } from '../../objects/areas/polygon-area';
import { TouchPulse } from '../../objects/touch-pulse';
import { Stream } from '../../objects/items/stream';
import { stateManager } from '../../utils/game-state-manager';
import { NoteStaff } from '../../objects/overlays/note-staff';
import { Guy } from '../../objects/characters/guy';
import { MainGame } from '../../main-game';
import { audioManager } from '../../utils/audio-manager';

export class StreamScene extends LeftRightExitScene {
	deer: Deer;

	preload() {
		super.preload();
		Deer.loadResources(this);
		if (DEBUG_SCENE) {
			stateManager.set(STATE_DID_FIRST_STREAM_SONG,false);
			stateManager.set(STATE_DID_STREAM_SCENE, false);
			setNumOfItem(ITEM_SHELL,1);
			setNumOfItem(ITEM_BOW,1);
			// setPickUpRedPiece(this.name,'stream');
		}
	}

	create(data: any) {
		super.create(data);

		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		const me = this.me;
		me.on('will-move', () => {
			if (this.isUsingShell) {
				staff.cancel();
				tweenPromise(this, staff.getGameObject(), {alpha : 0}, 1000);
				this.cameras.main.zoomTo(1,1000,'Linear',true);
				this.cameras.main.pan(gameWidth/2, gameHeight/2,1000,'Linear',true);
			}
			deer.onOverSetIcon(me.hasShell() ? Cursor.talkKey : Cursor.questionKey);
			deer.drinkTimer.paused = false;
			this.isUsingShell = false;
			audioManager.play(AUDIO_FOREST);
			audioManager.stop(AUDIO_NOTE_PAD);
		});

		const allAreas = this.sceneLoader.areas;
		const area1 = allAreas['area1'] as PolygonArea;
		const area2 = allAreas['area2'] as PolygonArea;
		const area3 = allAreas['area3'] as PolygonArea;

		const stream = this.sceneLoader.objects['stream'] as Stream;
		stream.depth(1);

		const deerPoint = this.sceneLoader.exits['deer'];
		const deer = new Deer(this, deerPoint.x, deerPoint.y);
		this.deer = deer;
		deer.on('drink', async () => {
			const pulse = new TouchPulse(this,0,0);
			pulse.getGameObject().depth = TOP_DEPTH;

			const mask = stream.getGameObject().createBitmapMask();
			pulse.getGameObject().mask = mask;

			await pulse.play(deer.x() - 35, deer.y() + 55);
			mask.destroy();
			pulse.destroy();
		});
		deer.depth(deer.y());
		deer.faceLeft();
		deer.drinkLoop();
		if (!this.me.hasShell()) {
			deer.onOverSetIcon(Cursor.questionKey);
			deer.on('selected', async () => {
				try {
					await this.me.walkTo(deer.x() - 14 * OVERSAMPLE_FACTOR, deer.y() + 20);
					sleep(1000).then( () => {
						me.shrug();
					});
					await this.startConversation(deer, { convo : [
						{ text: "::deer sounds::" }
					]});
				}
				catch(e) {}
			});
		}
		else if (!didPickUpRedPiece(this.name,'stream')) {
			deer.onOverSetIcon(Cursor.talkKey);
			deer.on('selected', async (x,y,double) => {
				try {
					if (this.isUsingShell) {
						return;
					}
					const point = this.sceneLoader.exits['sing'];
					await this.me.move(point.x, point.y, double);
					deer.removeOverSetIcon();
					this.isUsingShell = true;
					noteInput = [];
					this.me.faceRight();
					if (!stateManager.get(STATE_DID_FIRST_STREAM_SONG)) {
						this.setInputMode(InputMode.Disabled);
					}
					else {
						await this.me.playAnimation('kneel-to-shell');
					}
					deer.drinkTimer.paused = true;
					const time = 2000;
					audioManager.stop(AUDIO_FOREST);
					audioManager.play(AUDIO_NOTE_PAD);
					this.cameras.main.zoomTo(1.2,time);
					this.cameras.main.pan(82 * OVERSAMPLE_FACTOR, 74 * OVERSAMPLE_FACTOR,time);
					await tweenPromise(this, staff.getGameObject(), {alpha : 1}, 500);
					await staff.playNotes(noteSequence);
					tweenPromise(this, staff.getGameObject(), {alpha : 0}, 500);
					deer.playAnimation('sing',true);

					if (!stateManager.get(STATE_DID_FIRST_STREAM_SONG)) {
						await this.me.playAnimation('kneel-to-shell');
					}
					this.setInputMode(InputMode.Walk);

					stateManager.set(STATE_DID_FIRST_STREAM_SONG,true);

				}
				catch(e) {}
			});
		}
		else {
			deer.onOverSetIcon(Cursor.talkKey);
			deer.on('selected', async () => {
				try {
					await this.me.walkTo(deer.x() - 14 * OVERSAMPLE_FACTOR, deer.y() + 20);
					await this.startConversation(deer, { convo : [
						{ text: "well that was crazy." }
					]});
				}
				catch(e) {}
			});
		}

		const noteSequence = [0,2,1,2];
		let noteInput: number[] = [];

		const deerSounds = [AUDIO_DEER_NOTE_1, AUDIO_DEER_NOTE_2, AUDIO_DEER_NOTE_3];
		const noteSounds = [AUDIO_NOTE_1, AUDIO_NOTE_1, AUDIO_NOTE_1];

		const staff = new NoteStaff(this,deer.x() - 10 * OVERSAMPLE_FACTOR,deer.y() - 20 * OVERSAMPLE_FACTOR,3);
		staff.on('note', async (which) => {
			deer.playAnimation('sing');
			await audioManager.play(deerSounds[which]);
		});
		staff.depth(TOP_DEPTH);
		staff.alpha(0);

		const areas = [area3, area2, area1];
		areas.forEach( (a) => {
			a.on('selected', async (x,y) => {
				if (!this.isUsingShell) {
					return;
				}
				staff.cancel();
				const which = areas.indexOf(a);
				audioManager.play(deerSounds[which]);
				audioManager.play(noteSounds[which]);

				const numParticles = 30;
				for(let k = 0; k < numParticles; k++) {
					this.cameras.main.shake(1000,0.005);
					sleep(rand(0,1000)).then( async () => {
						const p = makeParticle(this,a.x() + rand(-30,30), a.y()  + rand(-10,10));
						p.setAlpha(0.85);
						p.depth = TOP_DEPTH;
						const pulse = new TouchPulse(this,x,y);
						pulse.alpha(0.5);
						pulse.depth(TOP_DEPTH);
						Promise.all( [pulse.play(x,y, 50),
							tweenPromise(this, pulse.getGameObject(), {y : 0}, 1500)]).then( () => {
								pulse.destroy();
							});
						await tweenPromise(this, p, {y : 0, alpha : 0},1000);
						p.destroy();
					});
				}
				
				noteInput.push(which);

				if (noteInput.length > noteSequence.length) {
					noteInput.splice(0,noteInput.length - noteSequence.length);
				}

				console.log(noteInput);

				let correct = true;
				if(noteInput.length == noteSequence.length) {
					for(let k in noteInput) {
						if (noteInput[k] !== noteSequence[k]) {
							correct = false;
							break;
						}
					}
				}
				else {
					correct = false;
				}

				if (correct) {
					tweenPromise(this, staff.getGameObject(), {alpha : 0}, 1000);
					this.enterBadGuy();
				}

				const pulse = new TouchPulse(this,x,y)
				pulse.getGameObject().depth = TOP_DEPTH;

				const mask = stream.getGameObject().createBitmapMask();
				pulse.getGameObject().mask = mask;

				await pulse.play(x,y);
				mask.destroy();
				pulse.destroy();
			});
		});

		audioManager.play(AUDIO_STREAM);


		// setTimeout( () => {
		// 	this.startConversation(deer, {
		// 		convo: [
		// 			{ text: "whoa"},
		// 			{ text: "WHOAAAAA"},
		// 			{ text: "dialog boxes?"},
		// 			{ text: "sweet"},
		// 			{ text: "..."},
		// 			{ text: "wait"},
		// 			{ text: "im a deer"},
		// 			{ 
		// 				text: "i can talk?",
		// 				responses: [
		// 					{
		// 						"you betcha" : [
		// 							{ text : "ok"}
		// 						]
		// 					},
		// 					{
		// 						"nah not really" : [
		// 							{ text : "ok"}
		// 						]
		// 					}
		// 				]
		// 			}
		// 		]
		// 	});
		// }, 3000);


	}

	async exitScene(name) {
		audioManager.stop(AUDIO_STREAM);
		audioManager.stop(AUDIO_BADGUY_BACKGROUND);
		audioManager.stop(AUDIO_NOTE_PAD);
		await super.exitScene(name);
	}

	async enterBadGuy() {
		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		const camTime = 2000;
		this.cameras.main.zoomTo(1,camTime);
		this.cameras.main.pan(gameWidth/2, gameHeight/2);

		this.me.playAnimation('rest');
		this.setInputMode(InputMode.Disabled);
		this.hud.wideScreen.show();
		audioManager.play(AUDIO_BADGUY_BACKGROUND);
		const badguy = await this.showBadGuyEnterFromDoor(this.sceneLoader.exits['badguy']);
		badguy.invincible = false;
		badguy.depth(TOP_DEPTH);
		badguy.setContactHandler(Guy, async () => {
			await this.me.die();
			audioManager.stop(AUDIO_STREAM);
			badguy.destroy();
			const lastSceneName = stateManager.get(STATE_LAST_SCENE);
			const lastExitName = stateManager.get(STATE_LAST_EXIT);
			(this.game as MainGame).sceneMap.loadScene(lastSceneName,lastExitName,this);
		});
		badguy.on('killed', () => {
			audioManager.play(AUDIO_FOREST);
			audioManager.stop(AUDIO_NOTE_PAD);
			audioManager.stop(AUDIO_BADGUY_BACKGROUND);
		});
		badguy.on('red-piece', (x,y) => {
			const redPiece = this.makeRedPiece(x,y,'stream');
			redPiece.getGameObject().setVelocityY(-9);
			redPiece.depth(TOP_DEPTH);
		});
		this.deer.moveTo(20 * OVERSAMPLE_FACTOR +  (this.game.config.width as number), this.deer.y());
		this.deer.playAnimation('run');
		await sleep(1000);
		await badguy.scream();
		this.hud.wideScreen.hide();
		badguy.walkAt(this.me, 20 *OVERSAMPLE_FACTOR);
		this.setInputMode(InputMode.Walk);
	}

	update() {
		super.update();
	}


}