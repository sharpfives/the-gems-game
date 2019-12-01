'use strict';

import { EnterFromDoorScene } from '../enter-from-door-scene';
import { Dude } from '../../objects/characters/dude';
import { Rope } from '../../objects/rope';
import { LINE_COLOR, AUDIO_WITCH } from '../../globals';
import { RopePiece } from '../../objects/rope-piece';
import { audioManager } from '../../utils/audio-manager';

export class SimpleLineScene extends EnterFromDoorScene {
	rope1: Rope;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Rope.loadResources(this);
		RopePiece.loadResources(this);
	}

	create(data: any) {

		super.create(data);


		const p1 = this.sceneLoader.exits['rope1'];
		const p2 = this.sceneLoader.exits['rope2'];

		{
			const rope = new Rope(this);
			const endPt = this.matter.add.image(p1.x,p1.y,'particle');
			endPt.setIgnoreGravity(false);
			endPt.setStatic(false);
			endPt.setTint(LINE_COLOR);
			rope.attach(p2.x,p2.y,endPt);
			this.rope1 = rope;
		}

		audioManager.play(AUDIO_WITCH);
	}

	async exitScene(name) {
		if (name === 'right' || name === 'start') {
			audioManager.stop(AUDIO_WITCH);
		}
		await super.exitScene(name);
	}

	update() {
		try {
			super.update();
			this.rope1.update();
		} catch(e) {}
	}

}