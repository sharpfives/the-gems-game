'use strict';

import { AUDIO_CAVE } from '../../globals';
import { Cursor } from '../../objects/overlays/cursor';
import { CaveSceneBase } from './cave-scene-base';
import { GroundAcorn } from '../../objects/items/acorn-ground';
import { audioManager } from '../../utils/audio-manager';

export class CaveScene extends CaveSceneBase {

	constructor() {
		super();
	}

	preload() {
		super.preload();
	}

	create(data: any) {

		super.create(data);

		this.removeRightExit();

		const me = this.me;

		const entrance = this.sceneLoader.objects['cave-entrance'];		
		this.maskContainer.add(entrance.getGameObject());
		
		const exitArea = this.sceneLoader.areas['exit'];
		exitArea.on('moved-over', () => {
			this.hud.cursor.setRightArrow();
		});
		exitArea.on('moved-out', () => {
			this.hud.cursor.setNormal();
		});
		exitArea.on('selected', async (x,y) => {
			try {
				await me.walkTo(x,y);
				this.exitScene('start');
			} catch (e) {}
		});

		const acorns = this.getAllChildrenOfType(GroundAcorn);
		for(let a of acorns) {
			a.onOverSetIcon(Cursor.questionKey);
		}

		audioManager.play(AUDIO_CAVE);

	}

	async exitScene(name: string) {
		this.maskContainer.removeAll(true);
		this.maskContainer.destroy();
		this.darkness.destroy();
		if (name === 'start')
			audioManager.stop(AUDIO_CAVE);
		await super.exitScene(name);
	}
}