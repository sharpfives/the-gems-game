'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { tweenPromise, AUDIO_FOREST, DEBUG_SCENE, STATE_DID_GET_ACORNS_FROM_SQUIRREL, STATE_DID_CHASE_SCENE, OVERSAMPLE_FACTOR, setNumOfItem, ITEM_SHELL, ITEM_FEATHER, sleep, AUDIO_SQUIRREL, InputMode } from '../../globals';
import { Squirrel } from '../../objects/characters/squirrel';
import { audioManager } from '../../utils/audio-manager';
import { Door } from '../../objects/items/door';
import { stateManager } from '../../utils/game-state-manager';
import { CircleTransition } from '../../objects/overlays/circle-transition';
import { GroundAcorn } from '../../objects/items/acorn-ground';
import { Cursor } from '../../objects/overlays/cursor';
import { RedPiece } from '../../objects/items/red-piece';

export class SquirrelScene extends LeftRightExitScene {
	exitName: string;
	squirrel: Squirrel;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Squirrel.loadResources(this);
		GroundAcorn.loadResources(this);

		if (DEBUG_SCENE) {
			stateManager.set(STATE_DID_GET_ACORNS_FROM_SQUIRREL,false);
			setNumOfItem(ITEM_SHELL,1);
			setNumOfItem(ITEM_FEATHER,1);
		}
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		let isInChaseMode = false;
		let isSquirrelInOriginalPosition = true;

		if (!stateManager.get(STATE_DID_GET_ACORNS_FROM_SQUIRREL)) {
			const squirrelPoint = this.sceneLoader.exits['squirrel'];

			const squirrel = new Squirrel(this, squirrelPoint.x, squirrelPoint.y);
			squirrel.sensor(true);
			this.squirrel = squirrel;

			squirrel.playAnimation('eat');
			squirrel.onOverSetIcon(me.hasShell() ? Cursor.talkKey : Cursor.questionKey);
			squirrel.on('selected', async (x,y,double) => {
				try {
					await this.me.move(squirrel.x() - 13 * OVERSAMPLE_FACTOR, squirrel.y(),double);
					this.me.faceRight();
					if (isInChaseMode) {
						if (!squirrel.isPlayingAnimation('run'))
							squirrel.stopTimer();
					}
					else if (me.hasShell() && isSquirrelInOriginalPosition) {
						this.setInputMode(InputMode.Disabled);
						squirrel.playAnimation('freak-out');
						audioManager.play(AUDIO_SQUIRREL);
						await this.startConversation(squirrel, { convo : [
							{ text: "fast!" },
							{ text: "gotta go fast!" },
							{ text: "keep up if you can!!" }
						]});

						isInChaseMode = true;
						isSquirrelInOriginalPosition = false;
						const timeLimit = 2000; 

						squirrel.removeOverSetIcon();
						const pointsToRunTo = [
							[19, 87],
							[109, 79],
							[18, 52],
							[65, 34],
						];

						let didFail = false;
						for( let k = 0; k < pointsToRunTo.length; k++) {
							const point = pointsToRunTo[k];
							await squirrel.runTo(point[0]*OVERSAMPLE_FACTOR, point[1]*OVERSAMPLE_FACTOR);
							try {
								await squirrel.showTimer(timeLimit);
								didFail = true;
								break;
							} catch(e) {}
						}

						isInChaseMode = false;

						if (didFail) {
							audioManager.play(AUDIO_SQUIRREL);
							await this.startConversation(squirrel, { convo : [
								{ text: "you gotta work!" },
								{ text: "work on that speed!" },
								{ text: "gotta go!" },
							]});
							await squirrel.walkTo(squirrelPoint.x,squirrelPoint.y);
							squirrel.onOverSetIcon(Cursor.talkKey);
							isSquirrelInOriginalPosition = true;
						}
						else {
							stateManager.set(STATE_DID_GET_ACORNS_FROM_SQUIRREL,true);
							audioManager.play(AUDIO_SQUIRREL);
							await this.startConversation(squirrel, { convo : [
								{ text: "dang, son!" },
								{ text: "nice moves!" },
							]});
							this.showRedPieces();
						}
					}
					else if (!me.hasShell()) {
						this.setInputMode(InputMode.Disabled);
						squirrel.removeOverSetIcon();
						squirrel.removeAllListeners('selected');
						audioManager.play(AUDIO_SQUIRREL);
						sleep(500).then(() => {
							me.shrug();
						});
						await this.startConversation(squirrel, { convo : [
							{ text: "::squirrel sounds::" }
						]});

						squirrel.walkTo((this.game.config.width as number) + 20 * OVERSAMPLE_FACTOR, squirrel.y());
					}

				} catch (e) {}
			});
		}
		else {
			this.addRedPieces();
		}
	
	}


	async showRedPieces() {
		super.addRedPieces();
		const acorns = this.getAllChildrenOfType(RedPiece);
		for(let m of acorns) {
			m.sensor(true);
			m.getGameObject().setScale(0.1);
			m.alpha(0);
		}

		for(let m of acorns) {
			const y = m.y();
			await this.squirrel.walkTo(m.x(),m.y());
			await sleep(300);
			m.alpha(1);
			tweenPromise(this,m.getGameObject(),{y : y - 3 * OVERSAMPLE_FACTOR, scaleX: 1.5, scaleY: 1.5}, 100).then( async() => {
				await tweenPromise(this,m.getGameObject(),{y : y, scaleX: 0.8, scaleY: 0.8}, 100)

				tweenPromise(this,m.getGameObject(),{y : y, scaleX: 1, scaleY: 1}, 100)
			});
		}

		this.squirrel.walkTo((this.game.config.width as number) + 20 * OVERSAMPLE_FACTOR, this.squirrel.y());
	}


	update() {
		super.update();
	}

}