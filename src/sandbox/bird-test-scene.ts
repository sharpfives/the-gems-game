'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, LINE_COLOR, sleep } from '../globals';
import { rand } from '../globals';
import { SpeechBubble } from '../objects/overlays/speech-bubble';
import { Guy } from '../objects/characters/guy';

import { TouchPulse } from '../objects/touch-pulse';
import { BowControl } from '../objects/bow-control';
import { Arrow } from '../objects/arrow';
import { CampFire } from '../objects/items/camp-fire';
import { Bow } from '../objects/weapons/bow';
import { BowSight } from '../objects/weapons/bow-sight';
import { Acorn } from '../objects/items/acorn';
import { HitAcorn } from '../objects/items/hit-acorn';
import { BadGuy } from '../objects/characters/bad-guy';
import { JumpyGuy } from '../objects/characters/jumpy-guy';
import { DiagonalTransition } from '../objects/overlays/diagonal-transition';
import { Cursor } from '../objects/overlays/cursor';
import { Rope } from '../objects/rope';
import { Bird } from '../objects/characters/bird';
import { RopePiece } from '../objects/rope-piece';

export class BirdTestScene extends Phaser.Scene {

	rope1: Rope;

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
		CampFire.loadResources(this);
		Guy.loadResources(this);
		Arrow.loadResources(this);
		Bow.loadResources(this);
		Acorn.loadResources(this);
		HitAcorn.loadResources(this);
		BadGuy.loadResources(this);
		JumpyGuy.loadResources(this);
		Cursor.loadResources(this);
		Bird.loadResources(this);
	}

	create() {

	  this.add.image(0,0,'background').setOrigin(0,0);

		const cursor = new Cursor(this);
	
		const dude = new Guy(this, 348, 490);
		dude.playAnimation('rest');



		const rope = new Rope(this);
		rope.on('cut', (piece: RopePiece) => {
			bird.playAnimation('fly');
		});

		const endPt = this.matter.add.image(575,178,'particle');
		endPt.setIgnoreGravity(true);
		endPt.setStatic(true);
		endPt.setTint(LINE_COLOR);
		rope.attach(164,216,endPt);
		this.rope1 = rope;

		const pieceToAttach = rope.parts[rope.parts.length/4];
		const bird = new Bird(this, pieceToAttach.x(),pieceToAttach.y());
		bird.getGameObject().setFixedRotation();
		bird.static(false);
		bird.ignoreGravity(false);
		bird.sensor(true);
		bird.getGameObject().setMass(0.00001);
		bird.attach(pieceToAttach, {x : 0, y : -20});

		const areaSize = [14*OVERSAMPLE_FACTOR,20*OVERSAMPLE_FACTOR];
		const tmpContainer = this.add.container(dude.x()-areaSize[0]/2, dude.y()-areaSize[1]/2);
		tmpContainer.setInteractive( new Phaser.Geom.Rectangle(0,0,areaSize[0],areaSize[1]), Phaser.Geom.Rectangle.Contains);
		tmpContainer.on('pointerdown', (pointer, localX, localY, event) => {
			// console.log('STARTING');
			event.stopPropagation();
			control.start(pointer.x, pointer.y);
		});

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
			cursor.x(pointer.x); cursor.y(pointer.y);
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

	}

	update() {
		this.rope1.update();
	}

}