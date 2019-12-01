'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, LINE_COLOR, sleep } from '../globals';
import { rand } from '../globals';
import { SpeechBubble } from '../objects/overlays/speech-bubble';
import { Guy } from '../objects/characters/guy';

import { TouchPulse } from '../objects/touch-pulse';
import { BowControl } from '../objects/bow-control';
import { Arrow } from '../objects/arrow';
import { Bow } from '../objects/weapons/bow';
import { BowSight } from '../objects/weapons/bow-sight';
import { Acorn } from '../objects/items/acorn';
import { HitAcorn } from '../objects/items/hit-acorn';
import { BadGuy } from '../objects/characters/bad-guy';
import { JumpyGuy } from '../objects/characters/jumpy-guy';
import { DiagonalTransition } from '../objects/overlays/diagonal-transition';

export class ForestTestScene extends Phaser.Scene {

	private acorn: Acorn;

	constructor() {
		super("");
	}

	preload() {

		this.load.bitmapFont('thick-font', 'resources/fonts/thick font.png', 'resources/fonts/thick font.xml');
    this.load.bitmapFont('nokia-font', 'resources/fonts/nokia.png', 'resources/fonts/nokia.xml');

		this.load.image('background','resources/scene2.png');
		this.load.image('smoke-cloud','resources/smoke-cloud.png');

		this.load.image('cursor','resources/images/cursors/cursor.png');
		this.load.image('particle','resources/square-particle-1x1.png')
		Guy.loadResources(this);
		Arrow.loadResources(this);
		Bow.loadResources(this);
		Acorn.loadResources(this);
		HitAcorn.loadResources(this);
		BadGuy.loadResources(this);
		JumpyGuy.loadResources(this);

	}

	create() {

	  this.add.image(0,0,'background').setOrigin(0,0);

		const cursor = this.add.image(0,0,'cursor');
	
		const dude = new Guy(this, 348, 490);
		dude.playAnimation('rest');
		// sleep(1000).then( async () => {
		// 	await dude.playAnimation('out-of-breath');
		// 	await dude.playAnimation('out-of-breath');
		// 	await dude.playAnimation('kneel-fall-down');
		// 	await sleep(500);
		// 	dude.dissolve(dude.x(), 0, false);
		// 	dude.alpha(0);
		// });

		const badguy = new BadGuy(this, dude.x() + 150, dude.y());
		badguy.playAnimation('step-back');
		
		badguy.on('killed', () => {
			badguy.detach(guy);
			guy.playAnimation('run');
			guy.faceLeft();
			guy.moveTo(0, guy.y());
		});
		const guy = new JumpyGuy(this,badguy.x(),badguy.y());
		guy.playAnimation('strangle');
		guy.setContactHandler(Arrow, (arrow: Arrow) => {
			guy.playAnimation('fall-die').then( () => {
				guy.dissolve(guy.x(),0,{ dissolveIn: false});
				guy.alpha(0);
			});
			badguy.detach(guy);
			guy.getGameObject().setStatic(true);
			guy.getGameObject().setVelocity(0,0);
			console.log("OH NO");
			arrow.destroy();
		});
		badguy.attach(guy, {x : 20, y : -15});

		tweenPromise(this, badguy.getGameObject(), {x : this.game.config.width as number}, 6000);


		const areaSize = [14*OVERSAMPLE_FACTOR,20*OVERSAMPLE_FACTOR];
		const tmpContainer = this.add.container(dude.x()-areaSize[0]/2, dude.y()-areaSize[1]/2);
		tmpContainer.setInteractive( new Phaser.Geom.Rectangle(0,0,areaSize[0],areaSize[1]), Phaser.Geom.Rectangle.Contains);
		tmpContainer.on('pointerdown', (pointer, localX, localY, event) => {
			// console.log('STARTING');
			event.stopPropagation();
			control.start(pointer.x, pointer.y);
		});

		const acorn = new Acorn(this, 601, 245, 300);
		this.acorn = acorn;
		acorn.setContactHandler(Arrow, (arrow: Arrow) => {
			console.log('hit!');
			arrow.destroy();
			this.cameras.main.shake(70,0.01);
			new HitAcorn(this, acorn.x(), acorn.y()).playAnimation('play');
			acorn.getGameObject().setIgnoreGravity(false);
			acorn.getGameObject().setStatic(false);
			acorn.getGameObject().setBounce(0.5);
			acorn.getGameObject().setFriction(0.5);
			acorn.getGameObject().setFixedRotation();
		}, ()=>{});

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
				dude.faceRight();
			}
			else {
				dude.faceLeft();
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


		// const speechBubble = new SpeechBubble(this,100,100);
		// speechBubble.show(100,100,"let's try something longer\nwith line breaks");
		
		// const diagonal = new DiagonalTransition(this);
		// diagonal.show();

	}

	update() {
		this.acorn.update();
	}

}