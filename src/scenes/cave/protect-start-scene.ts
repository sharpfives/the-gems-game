'use strict';

import { EnterFromDoorScene } from '../enter-from-door-scene';
import { audioManager } from '../../utils/audio-manager';
import { AUDIO_NIGHT_BACKGROUND } from '../../globals';

export class ProtectStartScene extends EnterFromDoorScene {

	constructor() {
		super();
	}

	preload() {
		super.preload();
	}

	create(data: any) {

		super.create(data);
		audioManager.play(AUDIO_NIGHT_BACKGROUND);
	}

	async exitScene(name) {
		// audioManager.stop(AUDIO_WITCH);
		if (name !== 'left')
			audioManager.stop(AUDIO_NIGHT_BACKGROUND);
		await super.exitScene(name);
	}



}