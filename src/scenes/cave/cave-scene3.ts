'use strict';

import { OVERSAMPLE_FACTOR, DEBUG_SCENE, didPickUpRedPiece, setPickUpRedPiece, ITEM_BOW, setNumOfItem } from '../../globals';
import { Cursor } from '../../objects/overlays/cursor';
import { Torch } from '../../objects/items/torch';
import { CaveSceneBase } from './cave-scene-base';
import { Rope } from '../../objects/rope';
import { Cage } from '../../objects/items/cage';
import { Arrow } from '../../objects/arrow';

export class CaveScene3 extends CaveSceneBase {

	rope1: Rope;
	rope2: Rope;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Torch.loadResources(this);
		Cage.loadResources(this);
		Rope.loadResources(this);
		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_BOW, 1);

		}
	}

	create(data: any) {

		super.create(data);

		this.minYForWalk = 65 * OVERSAMPLE_FACTOR;

		this.removeLeftExit();
		
		const me = this.me;

		const redPieceName = 'cave';

		if (!didPickUpRedPiece(this.name,redPieceName)) {
			const rope1 = new Rope(this);
			rope1.on('cut', () => {
				cutRope1 = true;
				if (cutRope2) {
					updateRedPiece();
				}
			});
			this.rope1 = rope1;
	
			const hangPoint = this.sceneLoader.exits['hang-point'];
			const cage = new Cage(this,hangPoint.x,hangPoint.y + 150);
			const redPiece = cage.redPiece;

			const torch = this.getAllChildrenOfType(Torch)[0];
			torch.on('lit', () => {
				redPiece.onOverSetIcon(Cursor.handKey);
			});

			redPiece.onOverSetIcon(Cursor.questionKey);
			cage.setContactHandler(Arrow, (arrow: Arrow) => {
				const mag = -14;
				arrow.destroy();
				cage.getGameObject().setVelocityX(mag);
			});
			cage.getGameObject().setFixedRotation();
			rope1.attach(hangPoint.x-30,hangPoint.y,cage.getGameObject(), {x: -30, y: -35});
			
			let cutRope1 = false;
			let cutRope2 = false;
	
			let didUpdateRedPiece = false;
			const updateRedPiece = () => {
				if (didUpdateRedPiece)
					return;
				didUpdateRedPiece = true;
				redPiece.onOverSetIcon(Cursor.handKey);
				redPiece.on('selected', async () => {
					try {
						me.pickUp(redPiece);
						setPickUpRedPiece('Cave3',redPieceName);
					} catch (e) {}
				});
			};
	
			const rope2 = new Rope(this);
			rope2.on('cut', () => {
				cutRope2 = true;
				if (cutRope1) {
					updateRedPiece();
				}
			});
			this.rope2 = rope2;
			rope2.attach(hangPoint.x+30,hangPoint.y,cage.getGameObject(), {x: 30, y: -35});
	
			const sceneWidth = this.game.config.width as number;
			this.matter.add.rectangle(sceneWidth, 85 *OVERSAMPLE_FACTOR, 152 * OVERSAMPLE_FACTOR, 10, { isStatic: true });

		}
		


	}

	update() {
		super.update();
		try {
			this.rope1.update();
			this.rope2.update();
		}
		catch(e) {
			// console.log(e);
		}
	}

}