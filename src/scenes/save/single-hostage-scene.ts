'use strict';

import { OVERSAMPLE_FACTOR, didCompleteHostage, didPickUpRedPiece, didSaveHostage } from '../../globals';
import { HostageSceneBase } from './hostage-scene-base';

export class SingleHostageScene extends HostageSceneBase {

	create(data: any) {

		super.create(data);

		const hostageName = 'a';
		if (!didCompleteHostage(hostageName)) {
			this.makeForwardDraggingHostage(this.sceneLoader.exits['hostage'],hostageName);
		}
		else {
			if (!didPickUpRedPiece(this.name,hostageName) && didSaveHostage(hostageName)) {
				const p = this.makeRedPiece(93*OVERSAMPLE_FACTOR, 66 *OVERSAMPLE_FACTOR, hostageName);
				p.static(true);
				p.ignoreGravity(true);
				p.sensor(true);
			}

		}
	}


}