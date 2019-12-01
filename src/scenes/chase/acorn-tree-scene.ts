'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { Acorn } from '../../objects/items/acorn';
import { HitAcorn } from '../../objects/items/hit-acorn';
import { Arrow } from '../../objects/arrow';
import { TOP_DEPTH, OVERSAMPLE_FACTOR, sleep, setPickUpAcorn, didPickUpAcorn } from '../../globals';
import { Cursor } from '../../objects/overlays/cursor';

export class AcornTreeScene extends LeftRightExitScene {
	acorn: Acorn;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Acorn.loadResources(this);
		HitAcorn.loadResources(this);
		Arrow.loadResources(this);
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		if (!didPickUpAcorn(this,1)) {
			const acornPoint = this.sceneLoader.exits['acorn'];
			const acornHeight = 275;
			const acorn = new Acorn(this, acornPoint.x, acornPoint.y, acornHeight);
			acorn.playAnimation('air');
			acorn.depth(TOP_DEPTH);
			acorn.onOverSetIcon(Cursor.handKey);

			const acornSelectHandler = async () => {
				try {
					await me.walkTo(acorn.x(), acorn.y() + acornHeight - 14 *OVERSAMPLE_FACTOR);
					await me.playAnimation('jump');
					await me.playAnimation('jump');
					me.playAnimation('rest');
					await sleep(200);
					await me.shrug();
				}
				catch (e) {}
			};

			const acornOnGroundHandler = async () => {
				try {
					// await me.walkTo(acorn.x() - 5 * OVERSAMPLE_FACTOR, acorn.y());
					await me.pickUp(acorn);
					setPickUpAcorn(this,1);
				}
				catch (e) {}
			};

			acorn.on('selected', acornSelectHandler);

			this.acorn = acorn;

			acorn.setContactHandler(Arrow, (arrow: Arrow) => {
				acorn.removeListener('selected', acornSelectHandler);
				acorn.on('selected', acornOnGroundHandler);
				console.log('hit!');
				arrow.destroy();
				this.cameras.main.shake(70,0.01);
				const effect = new HitAcorn(this, acorn.x(), acorn.y());
				effect.depth(TOP_DEPTH);
				effect.playAnimation('play');
				acorn.getGameObject().setIgnoreGravity(false);
				acorn.getGameObject().setStatic(false);
				acorn.getGameObject().setBounce(0.5);
				acorn.getGameObject().setFriction(0.5);
				acorn.getGameObject().setFixedRotation();
			}, ()=>{});
		}
	}


	update() {
		super.update();
		try {
			if (typeof this.acorn !== 'undefined')
				this.acorn.update();
		}
		catch(e) {}

	}


}