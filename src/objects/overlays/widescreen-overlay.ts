
'use strict';

import { EventEmitter } from "events";
import { tweenPromise, TOP_DEPTH, OVERSAMPLE_FACTOR, LINE_COLOR } from "../../globals";

export class WideScreen extends EventEmitter {
	scene: Phaser.Scene;
	container: Phaser.GameObjects.Container;
	topBar: Phaser.GameObjects.Graphics;
	bottomBar: Phaser.GameObjects.Graphics;
	barHeight: number;
	
  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    let barSize = 13 * OVERSAMPLE_FACTOR;

    // bmd.addToWorld();
    let s = this.scene.add.container(0,0);
		s.setScrollFactor(0);
		s.depth = TOP_DEPTH - 1;
    this.container = s;

    let topBar = scene.add.graphics();
    // this.graphics = graphics;
    topBar.fillStyle(LINE_COLOR,1);
		topBar.fillRect(0,0,scene.game.config.width as number,barSize);
		topBar.y = -barSize;
    s.add(topBar);

    let bottomBar = scene.add.graphics();
    // this.graphics = graphics;
    bottomBar.fillStyle(LINE_COLOR,1);
		bottomBar.fillRect(0,0,scene.game.config.width as number,barSize);
		bottomBar.y = -barSize;
    // bottomBar.setScrollFactor(0);
    s.add(bottomBar);


    this.topBar = topBar;
    this.bottomBar = bottomBar;
    this.barHeight = barSize;

    // this.hide(1);
  }

  async show(time?: number) {
    if (typeof time === 'undefined')
      time = 1000;
		this.topBar.y = -this.barHeight;
		const gameHeight = this.scene.game.config.height as number;
    this.bottomBar.y = gameHeight;
    let a = tweenPromise(this.scene, this.topBar, {y : 0}, time);
    let b = tweenPromise(this.scene, this.bottomBar, {y : gameHeight - this.barHeight}, time);
    await Promise.all([a, b]);
  }

  async hide(time?: number) {
    if (typeof time === 'undefined')
      time = 1000;
		this.topBar.y = 0;
		const gameHeight = this.scene.game.config.height as number;

    this.bottomBar.y = gameHeight - this.barHeight;
    let a = tweenPromise(this.scene, this.topBar, {y : -this.barHeight}, time);
    let b = tweenPromise(this.scene, this.bottomBar, {y : this.scene.game.config.height}, time);
    await Promise.all([a, b]);
  }

}
