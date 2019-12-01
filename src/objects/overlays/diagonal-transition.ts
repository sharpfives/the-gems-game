
'use strict';

import { EventEmitter } from "events";
import { tweenPromise, TOP_DEPTH, OVERSAMPLE_FACTOR, LINE_COLOR } from "../../globals";

export class DiagonalTransition extends EventEmitter {
	scene: Phaser.Scene;
	container: Phaser.GameObjects.Container;
	graphics: Phaser.GameObjects.Graphics[] = [];
	
  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;

    let s = this.scene.add.container(0,0);
		s.setScrollFactor(0);
		s.depth = TOP_DEPTH - 1;
    this.container = s;

		const gameWidth = scene.game.config.width as number;
		const gameHeight = scene.game.config.height as number;

		const numLines = 7;
		for(let k = 0; k < numLines; k++) {
			const bar = scene.add.graphics();
			// this.graphics = graphics;
			bar.fillStyle(LINE_COLOR,1);
			bar.fillRect(0,-gameHeight,1,gameHeight*2);
			bar.x = (k) * gameWidth / numLines;
			bar.y = gameHeight / 2;
			bar.rotation = Math.PI/ 8;
			s.add(bar);
			this.graphics.push(bar);
		}

  }

  async show(leftToRight?: number) {
    // if (typeof time === 'undefined')
		const time = 300;
		
		const promises = [];
		let i = 0;
		for(let g of this.graphics) {
			promises.push(tweenPromise(this.scene, g, {scaleX: 1.4*(this.scene.game.config.width as number)/this.graphics.length},time,'Linear',i++ * (time)/4));
		}
    await Promise.all(promises);
	}
	
	async hide() {

	}

}
