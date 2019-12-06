'use strict';

import { TOP_DEPTH, sleep, LINE_COLOR, OVERSAMPLE_FACTOR, tweenPromise } from "../../globals";
import { MoveableObject } from "../moveable-object";

export class CircleTransition extends MoveableObject {
	shapeMask: Phaser.GameObjects.Graphics;
  constructor(public scene: Phaser.Scene) {
		super(scene,0,0,CircleTransition.name);
		const gameWidth = this.scene.game.config.width as number;
		const gameHeight = this.scene.game.config.height as number;

		if (scene.game.config.renderType !== Phaser.CANVAS) {
			const shape = scene.add.graphics();
			shape.setScrollFactor(0);
			shape.fillStyle(LINE_COLOR);
			shape.fillRect(0,0,gameWidth,gameHeight);
			shape.depth = TOP_DEPTH;
	
			const shapeMask = scene.make.graphics({}, false);
			shapeMask.setScrollFactor(0);
	
			shapeMask.fillStyle(0xffffff);
			shapeMask.fillCircle(0,0, 30 * OVERSAMPLE_FACTOR);
			shapeMask.x = gameWidth/2
			shapeMask.y = gameHeight/2;
			shapeMask.scale = 3;
			this.shapeMask = shapeMask;
			const mask = shapeMask.createGeometryMask();
			mask.invertAlpha = true;
	
			shape.setMask( mask );
		}
		else {
			this.shapeMask = scene.make.graphics({}, false);
		}

    
	}
	
	getGameObject() {
		return this.shapeMask;
	}

  async close() {
		if (this.scene.game.config.renderType !== Phaser.CANVAS) {
			this.shapeMask.scale = 3;
			await tweenPromise(this.scene, this.shapeMask, {scaleX : 0, scaleY : 0}, 600);
		}
  }

  async open() {
		if (this.scene.game.config.renderType !== Phaser.CANVAS) {
			this.shapeMask.scale = 0;
			await tweenPromise(this.scene, this.shapeMask, {scaleX : 3, scaleY : 3}, 600);
		}
  }

}