'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR } from '../globals';
import { Guy } from '../objects/characters/guy';

import { TouchPulse } from '../objects/touch-pulse';
import { BowControl } from '../objects/bow-control';
import { Arrow } from '../objects/arrow';
import { Bow } from '../objects/weapons/bow';
import { BowSight } from '../objects/weapons/bow-sight';
import { HitAcorn } from '../objects/items/hit-acorn';
import { SceneLoader } from '../utils/scene-loader';
import { Cursor } from '../objects/overlays/cursor';

export class TilemapTestScene extends Phaser.Scene {


	constructor() {
		super("");
	}

	preload() {

		this.load.bitmapFont('thick-font', 'resources/fonts/thick font.png', 'resources/fonts/thick font.xml');
    this.load.bitmapFont('nokia-font', 'resources/fonts/nokia.png', 'resources/fonts/nokia.xml');

		this.load.image('background','resources/images/scenes/test/background.png');
		this.load.image('test-tree','resources/images/scenes/test/test-tree.png');
		this.load.image('grass','resources/images/scenes/test/grass1.png');

		this.load.image('smoke-cloud','resources/smoke-cloud.png');
		this.load.json('scene','resources/config/scenes/test/tilemap.json');

		Cursor.loadResources(this);

		this.load.image('particle','resources/square-particle-1x1.png')
		Guy.loadResources(this);
		Bow.loadResources(this);
		HitAcorn.loadResources(this);
	}

	create() {

	  // this.add.image(0,0,'background').setOrigin(0,0);

		const sceneLoader = new SceneLoader();
		sceneLoader.load(this,this.cache.json.get('scene'));



		const cursor = new Cursor(this);
		// let cursor = this.add.image(0,0,'cursor');
		// cursor.setScrollFactor(0);

		this.input.setDefaultCursor('none');

		const dude = new Guy(this, 300, 490);
		dude.setRepeat('rest');
		dude.setRepeat('walk');
		dude.playAnimation('rest');
		dude.alpha(0);
		dude.dissolve(0, dude.y());

		// this.cameras.main.startFollow(dude.getGameObject());

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
			cursor.x(pointer.x); cursor.y(pointer.y);
		}, this);

		this.input.on('gameobjectover', function (pointer, gameObject) {
			if (typeof gameObject.setTint === 'function')
				gameObject.setTint(0x7878ff);
		});

		const pulse = new TouchPulse(this,0,0);

		this.input.on('pointerdown', async (pointer) => {
			const x = Math.round(pointer.worldX);
			const y = Math.round(pointer.worldY);
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

}