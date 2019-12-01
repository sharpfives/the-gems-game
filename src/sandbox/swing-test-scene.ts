'use strict';

import * as Phaser from 'phaser';
import { tweenPromise, sleep } from '../globals';
import { rand } from '../globals';
import { Guy } from '../objects/characters/guy';
import { BadGuy } from '../objects/characters/bad-guy';

import { TouchPulse } from '../objects/touch-pulse';
import { Arrow } from '../objects/arrow';
import { Rope } from '../objects/rope';
import { Bow } from '../objects/weapons/bow';
import { BowSight } from '../objects/weapons/bow-sight';
import { Cursor } from '../objects/overlays/cursor';

export class SwingTestScene extends Phaser.Scene {
	private rope1;
	private rope2;

	constructor() {
		super("");
	}

	preload() {


		this.load.image('background','resources/scene.png');

		this.load.image('smoke-cloud','resources/smoke-cloud.png');
		this.load.image('swing','resources/swing-base.png');

		this.load.image('particle','resources/square-particle-1x1.png')
		Guy.loadResources(this);
		Arrow.loadResources(this);
		Bow.loadResources(this);
		BadGuy.loadResources(this);
		Cursor.loadResources(this);

	}

	create() {

		const cursor = new Cursor(this);
	
		const dude = new Guy(this, 348, 490);
		dude.setRepeat('rest');
		dude.setRepeat('walk');
		dude.playAnimation('rest');

		const ropeY = 200;
		const startX = 200;
		const swingHeight = 150;
		const base = this.matter.add.image(startX, ropeY + swingHeight, 'swing');
		base.setSensor(true);
		base.setFixedRotation();
		base.setMass(50);
		// base.setIgnoreGravity(true);
		// base.setStatic(true);
		// base.setOrigin(0,0);

		const rope2 = new Rope(this);
		rope2.attach(startX,ropeY,base, {x : -base.width/2, y : -6});
		this.rope2 = rope2;

		const rope = new Rope(this);
		rope.attach(startX + base.width,ropeY,base, {x : base.width/2, y : -6});
		this.rope1 = rope;
		// new SpeechBubble(this,10,10);

		const j = this.matter.add.joint(dude.getGameObject(), base, 1, 1.2);
		dude.getGameObject().setFixedRotation();
		dude.getGameObject().setIgnoreGravity(false);
		dude.getGameObject().setStatic(false);
		dude.getGameObject().setSensor(true);

		j['pointB'].y = -20;
		dude.playAnimation('swing-rest');

		// base.y += 20;

		// base.y = base.y + 20;
		const bow = new Bow(this,dude.x(),dude.y());
		bow.setAlpha(0);

		const bowSight = new BowSight(this,10,100);
		bowSight.alpha(0);

		
		this.input.on('pointermove', function (pointer) {
			cursor.x = pointer.x; cursor.y = pointer.y;
		}, this);


		this.input.on('pointerdown', async () => {


			// console.log(`adding bar for ${currentBar}`);
			// drumSequence.addNote(currentBar);

			const sprite = dude.getGameObject();
			await dude.playAnimation('swing');
			sprite.applyForce(new Phaser.Math.Vector2(0.7,0));
			await sleep(300);
			await dude.playAnimation('swing',true);
			dude.playAnimation('swing-rest');

		}, this);

		const time = 4000;
		const varX = 6;
		setInterval( async () => {
			await tweenPromise(this, this.cameras.main, {x : rand(-varX,varX), y : rand(-varX,varX)}, time, 'Sine.easeInOut');
		}, time);

		// const drumSequence = new DrumSequence(60, [1,0,1,0,1]);
		// drumSequence.on('correct', () => {
		// 	console.log('YOURE DONE!!!');
		// });
		// let currentBar = -1;
		// const drumInput = new DrumInput(this,0,0,this.game.config.width as number, 100);
		// drumInput.on('bar-in-middle', () => {
		// 	console.log(`bar ${currentBar} in middle`);
		// 	currentBar++;
		// });
		// drumInput.startBars();

	}



	update() {

		this.rope1.update();
		this.rope2.update();

	}
}