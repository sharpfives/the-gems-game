'use strict';

import * as Phaser from 'phaser';
import { tweenPromise, OVERSAMPLE_FACTOR, sleep, DEBUG_SCENE, STATE_CAVE_OPEN, ITEM_ACORN, setNumOfItem, ITEM_SHELL, AUDIO_BIRD_NOTE_1, AUDIO_BIRD_NOTE_2, AUDIO_BIRD_NOTE_3, AUDIO_BIRD_NOTE_4, AUDIO_NIGHT_BACKGROUND, AUDIO_NOTE_1, AUDIO_NOTE_RUMBLE, AUDIO_CAVE_OPEN, STATE_DID_FIRST_CAVE_SONG, InputMode, AUDIO_FOOTSTEPS } from '../../globals';
import { LeftRightExitScene } from '../left-right-exit-scene';
import { CaveFront } from '../../objects/areas/cave-front';
import { Cursor } from '../../objects/overlays/cursor';
import { stateManager } from '../../utils/game-state-manager';
import { SongBird } from '../../objects/characters/song-bird';
import { NoteStaff } from '../../objects/overlays/note-staff';
import { audioManager } from '../../utils/audio-manager';

export class CaveFrontScene extends LeftRightExitScene {
	light: Phaser.GameObjects.Graphics;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		CaveFront.loadResources(this);
		SongBird.loadResources(this);

		if (DEBUG_SCENE) {
			stateManager.set(STATE_CAVE_OPEN, true);
			stateManager.set(STATE_DID_FIRST_CAVE_SONG, false);

			setNumOfItem(ITEM_ACORN,1);
			setNumOfItem(ITEM_SHELL,1);

		}

	}

	create(data: any) {

		super.create(data);

		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		const noteSequence = [0,1,2,3];

		const me = this.me;
		me.on('will-move', () => {
			if (this.isUsingShell) {
				staff.cancel();
				tweenPromise(this, staff.getGameObject(), {alpha : 0}, 1000);
				this.cameras.main.zoomTo(1,1000,'Linear',true);
				this.cameras.main.pan(gameWidth/2, gameHeight/2,1000,'Linear',true);
			}
			this.isUsingShell = false;
			bird.onOverSetIcon(me.hasShell() ? Cursor.talkKey : Cursor.questionKey);
			cave.onOverSetIcon(stateManager.get(STATE_CAVE_OPEN) ? Cursor.handKey : Cursor.questionKey);
		});

		const rockNames = ['rock1', 'rock2', 'rock3', 'rock4'];
		let noteInput: number[] = [];
		for( let r of rockNames) {
			const rock = this.sceneLoader.objects[r];
			rock.on('selected', () => {
				if (!this.isUsingShell)
					return;
				
				staff.cancel();
				bird.tweet(1);
				const which = rockNames.indexOf(r);
				audioManager.play(birdSounds[which]);
				audioManager.play(AUDIO_NOTE_1);
				audioManager.play(AUDIO_NOTE_RUMBLE);

				this.makeSoundWave(rock.x(), rock.y());
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
					console.log("YOU DID IT!");
					openCave();
					audioManager.play(AUDIO_CAVE_OPEN);
					this.cameras.main.shake(1500,0.02,true);
					cave.playAnimation('open');		
					me.playAnimation('rest');
					const panTime = 1000;
					this.cameras.main.zoomTo(1,panTime,undefined,true);
					this.cameras.main.pan(gameWidth/2, gameHeight/2,panTime,undefined,true);
					this.isUsingShell = false;
				}
			});
		}
 		const birdPoint = this.sceneLoader.exits['bird'];
		const bird = new SongBird(this,birdPoint.x, birdPoint.y);
		bird.faceLeft();
		bird.restLoop();
		bird.onOverSetIcon(me.hasShell() ? Cursor.talkKey : Cursor.questionKey);
		bird.on('selected', async (x,y,double) => {
			if (this.isUsingShell) {
				return;
			}
			try {

				await me.move(birdPoint.x - 60, birdPoint.y + 100,double);
				audioManager.stop(AUDIO_FOOTSTEPS);
				me.faceRight();
				bird.tweet(2);
				if (stateManager.get(STATE_CAVE_OPEN)) {
					await this.startConversation(bird, {
						convo : [
							{ text : "niiice"}
						]
					});
				}
				else if (me.hasShell()) {
					this.isUsingShell = true;
					noteInput = [];
					// await this.startConversation(bird, {
					// 	convo : [
					// 		{ text : "let's boogie"}
					// 	]
					// });
					me.faceLeft();
					if (!stateManager.get(STATE_DID_FIRST_CAVE_SONG)) {
						this.setInputMode(InputMode.Disabled);
					}
					else {
						await this.me.playAnimation('kneel-to-shell');
					}
					bird.removeOverSetIcon();
					cave.removeOverSetIcon();
					const time = 1500;
					this.cameras.main.zoomTo(1.1,time,undefined,true);
					this.cameras.main.pan(50 * OVERSAMPLE_FACTOR, 60 * OVERSAMPLE_FACTOR,time,undefined,true);
					await sleep(time);
					await tweenPromise(this, staff.getGameObject(), {alpha : 1}, 500);
					await staff.playNotes(noteSequence);
					tweenPromise(this, staff.getGameObject(), {alpha : 0}, 5000);
					if (!stateManager.get(STATE_DID_FIRST_CAVE_SONG)) {
						await this.me.playAnimation('kneel-to-shell');
					}
					stateManager.set(STATE_DID_FIRST_CAVE_SONG, true);
					this.setInputMode(InputMode.Walk);

				}
				else {
					await this.startConversation(bird, {
						convo : [
							{ text : "::tweety tweet::"}
						]
					});
				}

			}
			catch(e) {}
		});

		
		const birdSounds = [AUDIO_BIRD_NOTE_1,AUDIO_BIRD_NOTE_2,AUDIO_BIRD_NOTE_3,AUDIO_BIRD_NOTE_4];

		const staff = new NoteStaff(this,bird.x() - 32 * OVERSAMPLE_FACTOR,bird.y() - 18 * OVERSAMPLE_FACTOR,4);
		staff.on('note', (which) => {
			bird.tweet(2);
			audioManager.play(birdSounds[which]);
		});
		staff.alpha(0);

		const caveInsidePoint = this.sceneLoader.exits['cave'];
		const caveOutsidePoint = this.sceneLoader.exits['outside-cave'];

		const cave = this.sceneLoader.objects['cave-front'] as CaveFront;
		cave.iconOffset.x = 150;

		const walkToOutsideOfCave = async () => {
			try {
				await me.walkTo(caveOutsidePoint.x, caveOutsidePoint.y);
				await me.shrug();
			}
			catch(e) {}
		};

		const walkToInsideOfCave = async () => {
			try {
				await me.walkTo(caveInsidePoint.x, caveInsidePoint.y);
				this.exitScene('cave');
			}
			catch(e) {}
		};

		const openCave = async () => {
			cave.iconOffset.y = -75;
			stateManager.set(STATE_CAVE_OPEN, true);
			cave.on('selected', walkToInsideOfCave);
			cave.onOverSetIcon(Cursor.handKey);
		}

		if (stateManager.get(STATE_CAVE_OPEN)) {
			openCave();
			cave.playAnimation('stay-open');		
		}
		else {
			cave.iconOffset.y = -50;
			cave.onOverSetIcon(Cursor.questionKey);
			cave.on('selected', walkToOutsideOfCave);
		}
		
		this.removeLeftExit();

		audioManager.play(AUDIO_NIGHT_BACKGROUND);
	}
	
	async exitScene(name) {
		if (name === 'cave')
			audioManager.stop(AUDIO_NIGHT_BACKGROUND);
		await super.exitScene(name);
	}
	update() {
		super.update();

	}

}