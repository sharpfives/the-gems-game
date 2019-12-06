'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { OVERSAMPLE_FACTOR, STATE_DID_MEET_WITCH, sleep, tweenPromise, STATE_DID_MUSHROOM_SCENE, DEBUG_SCENE, setNumOfItem, ITEM_SHELL, AUDIO_NOTE_1, AUDIO_NOTE_RUMBLE } from '../../globals';
import { stateManager } from '../../utils/game-state-manager';
import { Witch } from '../../objects/characters/witch';
import { PolygonPhysicsObject } from '../../objects/polygon-physics-object';
import { Mushroom } from '../../objects/items/mushroom';
import { SongBird } from '../../objects/characters/song-bird';
import { Cursor } from '../../objects/overlays/cursor';
import { audioManager } from '../../utils/audio-manager';

export class SwampMushroomsScene extends LeftRightExitScene {

	preload() {
		super.preload();
		Witch.loadResources(this);
		Mushroom.loadResources(this);
		SongBird.loadResources(this);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_SHELL,1);
		}
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		const ponds : PolygonPhysicsObject[] = [
			this.sceneLoader.objects['pond1'], 
			this.sceneLoader.objects['pond2'],
			this.sceneLoader.objects['pond3']
		];
		
		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		const noteSequence = [0,1,2];

		me.on('will-move', (x,y,double) => {
			if (this.isUsingShell) {
				this.cameras.main.zoomTo(1,1000,'Linear',true);
				this.cameras.main.pan(gameWidth/2, gameHeight/2,1000,'Linear',true);
			}
			for(let b of birds) {
				b.engageable = true;
			}
			this.isUsingShell = false;
		});

		let noteInput: number[] = [];

		for( let pond of ponds ) {
			pond.depth(1);
			pond.on('selected', async () => {
				if (!this.isUsingShell)
					return;
				
				// bird.tweet(1);
				audioManager.play(AUDIO_NOTE_1);
				audioManager.play(AUDIO_NOTE_RUMBLE);

				this.makeSoundWave(pond.x(), pond.y());
				noteInput.push(ponds.indexOf(pond));

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
					stateManager.set(STATE_DID_MUSHROOM_SCENE,true);
					await sleep(1000);
					await this.hud.circleTransition.close();
					this.exitScene('shell');
					// this.showMushrooms();
					// me.playAnimation('rest');
					// const panTime = 1000;
					// this.cameras.main.zoomTo(1,panTime,undefined,true);
					// this.cameras.main.pan(gameWidth/2, gameHeight/2,panTime,undefined,true);
					// this.isUsingShell = false;
				}
			});
		}

		const birds : SongBird[] = [];
		const birdSpots = ['a','b','c'];
		for(let name of birdSpots) {
			const point = this.sceneLoader.exits[name];
			const bird = new SongBird(this,point.x,point.y);
			birds.push(bird);
			bird.onOverSetIcon(me.hasShell() ? Cursor.talkKey : Cursor.questionKey);
			bird.faceRight();
			bird.depth( bird.y() + 5 * OVERSAMPLE_FACTOR);
			bird.on('selected', async (x,y,double) => {
				if (this.isUsingShell) {
					return;
				}
				const shellPoint = this.sceneLoader.exits['shell'];
				if (stateManager.get(STATE_DID_MUSHROOM_SCENE)) {
					try {
						await this.me.move(bird.x() + 10 * OVERSAMPLE_FACTOR,bird.y() - 5 * OVERSAMPLE_FACTOR,double);
						this.me.faceLeft();
						bird.tweet(2);
						await this.startConversation(bird, {
							convo : [
								{ text: "sweet tunes, bro." }
							]
						});
					}
					catch(e) {}
				}
				else if (this.me.hasShell()) {
					try {
						await this.me.move(shellPoint.x,shellPoint.y,double);
						noteInput = [];
						await this.me.playAnimation('kneel-to-shell');
						this.isUsingShell = true;
						const time = 2000;
						this.cameras.main.zoomTo(1.2,time);
						for(let b of birds) {
							b.engageable = false;
						}
						// this.cameras.main.pan(82 * OVERSAMPLE_FACTOR, 74 * OVERSAMPLE_FACTOR,time);
					}
					catch(e) {}
				}
				else {
					try {
						await this.me.move(bird.x() + 10 * OVERSAMPLE_FACTOR,bird.y() - 5 * OVERSAMPLE_FACTOR,double);
						this.me.faceLeft();
						bird.tweet(2);
						await this.startConversation(bird, {
							convo : [
								{ text: "::tweety tweet::" }
							]
						});
					}
					catch(e) {}
				}
			});
			
		}

		const timer = this.time.addEvent( {
			callback : async () => {
				for( let n of noteSequence ) {
					const b = birds[n];
					b.playAnimation('hop');
					await sleep(400);
				}
			},
			callbackScope : this,
			delay : 4000,
			loop : true
		});
		
		// this.showMushrooms();
	}

	initializeHud() {
		if (this.exitName === 'shell') {
			this.hud.circleTransition.open();
		}
	}

	// async showMushrooms() {
	// 	super.addMushrooms();
	// 	const mushrooms = this.getAllChildrenOfType(Mushroom);
	// 	for(let m of mushrooms) {
	// 		m.getGameObject().setScale(0.1);
	// 		const y = m.y();
	// 		await sleep(300);
	// 		tweenPromise(this,m.getGameObject(),{y : y - 3 * OVERSAMPLE_FACTOR, scaleX: 1.5, scaleY: 1.5}, 100).then( async() => {
	// 			await tweenPromise(this,m.getGameObject(),{y : y, scaleX: 0.8, scaleY: 0.8}, 100)

	// 			tweenPromise(this,m.getGameObject(),{y : y, scaleX: 1, scaleY: 1}, 100)
	// 		});
	// 	}
	// }

	update() {
		try {
			super.update();
		} catch(e) {}
	}


}