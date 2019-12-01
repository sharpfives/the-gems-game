'use strict';

import { OVERSAMPLE_FACTOR, sleep, didPickUpRedPiece, DEBUG_SCENE, setPickUpRedPiece, InputMode, setNumOfItem, ITEM_BOW } from '../../globals';
import { BadGuy } from '../../objects/characters/bad-guy';
import { Guy } from '../../objects/characters/guy';
import { CaveSceneBase } from './cave-scene-base';
import { Arrow } from '../../objects/arrow';

export class CaveScene2 extends CaveSceneBase {

	constructor() {
		super();
	}

	preload() {
		super.preload();
		if (DEBUG_SCENE) {
			// setPickUpRedPiece('Cave3','cave');
			setNumOfItem(ITEM_BOW, 1);
		}
	}

	create(data: any) {

		super.create(data);



		if (didPickUpRedPiece('Cave3','cave')) {
			this.wake();
		}
		else {
			this.setDoNotDisturb();
		}
	}

	setDoNotDisturb() {
		const badguys = this.getAllChildrenOfType(BadGuy);
		for(let b of badguys) {
			b.invincible = true;
			b.setContactHandler(Arrow, async () => {
				this.setInputMode(InputMode.Disabled);
				await this.wakeBadGuy(b);
				await this.expandLight(0);
				this.exitScene('exit');
			});
		}
	}

	async wake() {
		// wake up bad guys
		const badguys = this.getAllChildrenOfType(BadGuy);
		await this.expandLight(20);
		for(let b of badguys) {
			const x = b.x();
			const y = b.y();
			b.updateBody(10*OVERSAMPLE_FACTOR,15*OVERSAMPLE_FACTOR,false);
			b.x(x);
			b.y(y);
			b.setContactHandler(Guy, async (guy: Guy) => {
				this.setInputMode(InputMode.Disabled);
				guy.cancelTweens();
				await guy.die();
				await sleep(200);
				await this.expandLight(0);
				this.exitScene('left');
			});
			// await sleep(200);
			this.wakeBadGuy(b).then( async () => {
				try {
					if (!b.isDead)
						b.walkAt(this.me);
				}
				catch(e){}
			});
		}
	}

	async exitScene(name) {
		const badguys = this.getAllChildrenOfType(BadGuy);
		for(let b of badguys) {
			b.destroy();
		}
		await super.exitScene(name);
	}




}