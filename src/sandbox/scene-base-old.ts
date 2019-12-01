'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, LINE_COLOR, sleep } from '../globals';
import { rand } from '../globals';
import { SmokeVent } from '../objects/smoke-vent';
import { Guy } from '../objects/characters/guy';
import { BadGuy } from '../objects/characters/bad-guy';

import { TouchPulse } from '../objects/touch-pulse';
import { BowControl } from '../objects/bow-control';
import { Arrow } from '../objects/arrow';
import { Rope } from '../objects/rope';
import { Bow } from '../objects/weapons/bow';
import { BowSight } from '../objects/weapons/bow-sight';

export class SceneBaseOld extends Phaser.Scene {
	private rope1;
	private rope2;

	constructor() {
		super("");
	}

	preload() {

		// this.game.renderer = new Phaser.WebGLRenderer()
		// const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
		// this.rgbPipeline = renderer.addPipeline('Tint', new RGBSeparatePipeline(this.game));
    // this.rgbPipeline.setFloat2('resolution', this.game.config.width as number, this.game.config.height as number);


		this.load.image('background','resources/scene.png');

		this.load.image('smoke-cloud','resources/smoke-cloud.png');

		// this.load.image('test','res/test.png');
		this.load.image('cursor','resources/cursor.png');
		this.load.image('particle','resources/square-particle-1x1.png')
		Guy.loadResources(this);
		Arrow.loadResources(this);
		Bow.loadResources(this);
		BadGuy.loadResources(this);

	}

	create() {

		// this.cameras.main.setRenderToTexture(this.rgbPipeline);


		
		// loadAnimation(this, 'guy');
	  this.add.image(0,0,'background').setOrigin(0,0);

		const cursor = this.add.image(0,0,'cursor');
		cursor.setTint(LINE_COLOR);
		cursor.setScale(OVERSAMPLE_FACTOR);

		const badguy = new BadGuy(this,685,277);
		badguy.setContactHandler(Arrow, () => {
			console.log('HIT BAD GUY WITH ARROW');
		}, () => {});

		badguy.playAnimation('rest');
		setTimeout( async () => {
			await badguy.playAnimation('cry-start');
			badguy.playAnimation('cry');
			this.cameras.main.shake(1000,0.01);
			await sleep(1000);
			await badguy.playAnimation('cry-end');
			badguy.playAnimation('rest');
			await sleep(500);
			await badguy.playAnimation('run-start');
			await badguy.playAnimation('run');
		}, 2000);
	
		const dude = new Guy(this, 348, 490);
		dude.setRepeat('rest');
		dude.setRepeat('walk');
		dude.playAnimation('rest');
		dude.floatParticlesIn();

		const areaSize = [14*OVERSAMPLE_FACTOR,20*OVERSAMPLE_FACTOR];
		const tmpContainer = this.add.container(dude.x()-areaSize[0]/2, dude.y()-areaSize[1]/2);
		tmpContainer.setInteractive( new Phaser.Geom.Rectangle(0,0,areaSize[0],areaSize[1]), Phaser.Geom.Rectangle.Contains);
		tmpContainer.on('pointerdown', (pointer, localX, localY, event) => {
			console.log('STARTING');
			event.stopPropagation();
			control.start(pointer.x, pointer.y);
		});

		// const fire = new Fire(this, 65, 75);
		// fire.setRepeat('play');
		// fire.playAnimation('play');

		new SmokeVent(this, 64, 85).start();

		{const rope = new Rope(this);
		const endPt = this.matter.add.image(454,172,'particle');
		endPt.setIgnoreGravity(true);
		endPt.setStatic(true);
		endPt.setTint(LINE_COLOR);
		rope.attach(213,205,endPt);
		this.rope2 = rope;}

		const rope = new Rope(this);
		const endPt = this.matter.add.image(575,178,'particle');
		endPt.setIgnoreGravity(true);
		endPt.setStatic(true);
		endPt.setTint(LINE_COLOR);
		rope.attach(164,216,endPt);
		this.rope1 = rope;
		// new SpeechBubble(this,10,10);

		const bow = new Bow(this,dude.x(),dude.y());
		bow.setAlpha(0);

		const bowSight = new BowSight(this,10,100);
		bowSight.alpha(0);

		const control = new BowControl(this,0,0);
		control.on('start', () => {
			bow.setAlpha(1);
			bowSight.alpha(1);
			bowSight.x(dude.x());
			bowSight.y(dude.y()+0.5);
			console.log('Control start');
			dude.playAnimation('bow-pull');
			const anim = bow.getAnimation('pull');
			bow.sprite.anims.pause(anim.frames[0]);
		});
		control.on('release', async (angle) => {
			console.log('Control release');
			bowSight.alpha(0);

			new Arrow(this,dude.x(), dude.y()-1).shoot(angle);
			bow.playAnimation('release').then( () => {
				bow.setAlpha(0);
			});
			await dude.playAnimation('bow-release');
			dude.playAnimation('rest');
		});
		control.on('change', (angle, percent) => {
			console.log('Control change');
			if (angle < 0) {
				angle += Math.PI*2;
			}
			if (angle < Math.PI / 2 || angle > 3*Math.PI/2) {
				dude.faceLeft();
			}
			else {
				dude.faceRight();
			}
			bowSight.getGameObject().rotation = angle;
			bow.sprite.rotation = angle;
			const anim = bow.getAnimation('pull');
			const frameIndex = Math.round(percent * (anim.frames.length - 1));
			bow.sprite.anims.pause(anim.frames[frameIndex]);
		});

		this.input.on('pointermove', function (pointer) {
			cursor.x = pointer.x; cursor.y = pointer.y;
		}, this);

		const pulse = new TouchPulse(this,0,0);

		this.input.on('pointerdown', async (pointer) => {
			const x = Math.round(pointer.x);
			const y = Math.round(pointer.y);
			console.log(`${x}, ${y}`);
			dude.playAnimation('walk');
			pulse.play(x,y);
			await dude.moveTo(x,y);			
			dude.playAnimation('rest');
			control.x(dude.x() - BowControl.width/2);
			control.y(dude.y() - BowControl.height/2);

			bow.x(dude.x());
			bow.y(dude.y());

			tmpContainer.x = dude.x()-areaSize[0]/2;
			tmpContainer.y = dude.y()-areaSize[1]/2;
		}, this);

		const time = 4000;
		const varX = 6;
		setInterval( async () => {
			await tweenPromise(this, this.cameras.main, {x : rand(-varX,varX), y : rand(-varX,varX)}, time, 'Sine.easeInOut');
		}, time);

		

		this.testSmokeCloud();
	}

	testCutRope(rope) {
		setTimeout( () => {
			const j = rope.joints.splice(Math.round(rope.joints.length/2));
			// const j = rope.joints[Math.round(rope.joints.length/2)];
			this.matter.world.removeConstraint(j[0] as MatterJS.Constraint , false);
		}, 2000);
	}

	async testSmokeCloud() {
		await sleep(500);
		const numClouds = 10;

		const xCenter = 50*OVERSAMPLE_FACTOR;
		const yCenter = 50*OVERSAMPLE_FACTOR;
		for(let k = 0; k < numClouds; k++) {
			const r = rand(0,10*OVERSAMPLE_FACTOR);
			const angle = rand(0, Math.PI*2);
			const x = xCenter + r*Math.cos(angle);
			const y = yCenter + r*Math.sin(angle);

			const img = this.add.sprite(x, y, 'smoke-cloud');
			const scale = 0.6 + 1/(r + 1.5); //rand( 0.2, 1/r );
			img.setScale(0);
			// img.setScale(scale*OVERSAMPLE_FACTOR);

			tweenPromise(this, img, {rotation : Math.PI*2}, 1500);
			tweenPromise(this, img, {scaleX :scale*OVERSAMPLE_FACTOR, scaleY:scale*OVERSAMPLE_FACTOR}, 200).then( async () => {
				tweenPromise(this, img, {scaleX : 0.1*OVERSAMPLE_FACTOR, scaleY: 0.1*OVERSAMPLE_FACTOR, alpha : 0}, 1500, 'Sine.easeIn');
				tweenPromise(this, img, {x : x + rand(-20,20), y: y + rand(-20,20)}, 1500, 'Sine.easeIn');
	
			});


		}
	}

	update() {

		this.rope1.update();
		this.rope2.update();

		// if(this.updateIndex++ % 2 == 0) {
    //   this.rgbPipeline.setInt1('separate', Math.random() > 0.9 ? 1 : 0);
    //   this.rgbPipeline.setFloat2('offset', 0.3*rand(-1,1), 0.3*rand(-1,1));
    // }
	}
}