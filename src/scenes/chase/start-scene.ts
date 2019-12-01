'use strict';

import { tweenPromise, AUDIO_FOREST, DEBUG_SCENE, STATE_DID_CHASE_SCENE, STATE_DID_START_GAME, rand, AUDIO_FOREST_BACKGROUND } from '../../globals';
import { EnterFromDoorScene } from '../enter-from-door-scene';
import { Squirrel } from '../../objects/characters/squirrel';
import { audioManager } from '../../utils/audio-manager';
import { Door } from '../../objects/items/door';
import { stateManager } from '../../utils/game-state-manager';
import { CircleTransition } from '../../objects/overlays/circle-transition';
import { Animated } from '../../objects/animated';

export class StartScene extends EnterFromDoorScene {
	exitName: string;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Squirrel.loadResources(this);

		if (DEBUG_SCENE) {

		}
	}

	create(data: any) {

		super.create(data);

		stateManager.set(STATE_DID_START_GAME,true);

		const me = this.me;

		this.exitName = data.exitName;
		
		const clouds = this.sceneLoader.objects['clouds'] as Animated;
		clouds.getGameObject().setScrollFactor(0);
		// console.log(clouds);

		if (data.exitName === 'intro') {
			(async () => {
				const circleTransition = new CircleTransition(this);
				circleTransition.shapeMask.scale = 0;
				await tweenPromise(this, circleTransition.shapeMask, {scaleX : 3, scaleY : 3}, 600);
				me.on('entered', async (door: Door) => {
					me.faceRight();
					this.createSmokeCloud(door.x(), door.y());
					door.destroy();
					// await sleep(2000);
					// this.hud.wideScreen.hide();

				});
			})();
			audioManager.play(AUDIO_FOREST_BACKGROUND);
		}
		else {
			audioManager.play(AUDIO_FOREST);
		}


		const time = 10000;
		const varX = 10;

		this.time.addEvent({
			callback: () => {
				this.cameras.main.pan((this.game.config.width as number)/2 + rand(-varX,varX), (this.game.config.height as number)/2 + rand(-varX,varX), time,'Sine',true);
				// tweenPromise(this, this.cameras.main, {x : rand(-varX,varX), y : rand(-varX,varX)}, time, 'Sine.easeInOut');
			},
			callbackScope: this,
			loop: true,
			startAt: 0,
			delay: time
		});
		// this.cameras.main.pan(-200,(this.game.config.width as number)/2, 1000);
	}

	initializeHud() {
		// if (this.exitName === 'intro')
			// this.hud.wideScreen.show();
	}

	async exitScene(name) {
		if (name === 'start') {
			audioManager.stop(AUDIO_FOREST);
		}
		await super.exitScene(name);
	}

	showReturnDoor() {
		if (stateManager.get(STATE_DID_CHASE_SCENE)) {
			super.showReturnDoor();
		}
	}

	update() {
		super.update();
	}

}