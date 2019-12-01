'use strict';

import { OVERSAMPLE_FACTOR, didSaveHostage, didCompleteHostage, didPickUpRedPiece } from '../../globals';
import { HostageSceneBase } from './hostage-scene-base';

export class HostageScene extends HostageSceneBase {

	create(data: any) {

		super.create(data);


		const hostageName1 = 'b';
		const hostageName2 = 'c';

		if (!didCompleteHostage(hostageName1) || !didCompleteHostage(hostageName2)) {
			this.makeForwardDraggingHostage(this.sceneLoader.exits['hostage1'], hostageName1);
			this.makeBackwardDraggingHostage(this.sceneLoader.exits['hostage2'], hostageName2);
		}
		else {
			if (didSaveHostage(hostageName1) && !didPickUpRedPiece(this.name,hostageName1))
				this.makeRedPiece(72 * OVERSAMPLE_FACTOR, 56 * OVERSAMPLE_FACTOR, hostageName1).static(true);
			
			if (didSaveHostage(hostageName2) && !didPickUpRedPiece(this.name,hostageName2))
				this.makeRedPiece(89 * OVERSAMPLE_FACTOR, 77 * OVERSAMPLE_FACTOR, hostageName2).static(true);

		}
	}

}