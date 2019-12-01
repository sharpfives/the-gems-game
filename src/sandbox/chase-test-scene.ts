'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, LINE_COLOR } from '../globals';
import { rand } from '../globals';
import { Guy } from '../objects/characters/guy';
import { BadGuy } from '../objects/characters/bad-guy';

import { TouchPulse } from '../objects/touch-pulse';
import { Arrow } from '../objects/arrow';
import { WarningIcon } from '../objects/overlays/warning-icon';

export class ChaseTestScene extends Phaser.Scene {

	constructor() {
		super("");
	}

	preload() {

		this.load.bitmapFont('thick-font', 'resources/fonts/thick font.png', 'resources/fonts/thick font.xml');
    this.load.bitmapFont('nokia-font', 'resources/fonts/nokia.png', 'resources/fonts/nokia.xml');

		this.load.image('background','resources/scene2.png');
		this.load.image('smoke-cloud','resources/smoke-cloud.png');

		this.load.image('grass','resources/images/scenes/test/grass1.png');

		this.load.image('cursor','resources/cursor.png');
		this.load.image('particle','resources/square-particle-1x1.png')
		Guy.loadResources(this);
		BadGuy.loadResources(this);
	}

	create() {

	  // this.add.image(0,0,'background').setOrigin(0,0);

		const cursor = this.add.image(0,0,'cursor');
		cursor.setTint(LINE_COLOR);
		cursor.setScale(OVERSAMPLE_FACTOR);
	
		const dude = new Guy(this, 348, 490);
		dude.setRepeat('rest');
		dude.setRepeat('walk');
		dude.setRepeat('run');
		dude.playAnimation('run');
		dude.faceLeft();
		// dude.floatParticlesIn();

		const badguy = new BadGuy(this,685,277);
		
		badguy.setContactHandler(Arrow, () => {
			console.log('HIT BAD GUY WITH ARROW');
		}, () => {});

		badguy.playAnimation('rest');
		badguy.scream();


		this.input.on('pointermove', function (pointer) {
			cursor.x = pointer.x; cursor.y = pointer.y;
		}, this);

		const pulse = new TouchPulse(this,0,0);

		this.input.on('pointerdown', async (pointer) => {
			const x = Math.round(pointer.x);
			const y = Math.round(pointer.y);
			console.log(`${x}, ${y}`);
			pulse.play(x,y);
			await dude.moveTo(dude.x(),y);			

		}, this);

		const time = 4000;
		const varX = 6;
		setInterval( async () => {
			await tweenPromise(this, this.cameras.main, {x : rand(-varX,varX), y : rand(-varX,varX)}, time, 'Sine.easeInOut');
		}, time);


		setInterval( async () => {
			const grass = this.add.image(0,rand(0,this.game.config.height as number), 'grass');
			await tweenPromise(this,grass, {x : this.game.config.width as number}, 700);
			grass.destroy();
		}, 150);

		new WarningIcon(this,100,100);
	}


}