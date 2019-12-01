'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, LINE_COLOR } from '../globals';
import { rand } from '../globals';
import { SpeechBubble } from '../objects/overlays/speech-bubble';
import { Guy } from '../objects/characters/guy';
import { BadGuy } from '../objects/characters/bad-guy';

import { Conversation } from '../conversation';
import { collisionManager } from '../utils/collision-manager';


export class CollisionTestScene extends Phaser.Scene {

	private convo;
	dude2: BadGuy;
	constructor() {
		super("");
	}

	preload() {

		this.load.bitmapFont('thick-font', 'resources/fonts/thick font.png', 'resources/fonts/thick font.xml');
    this.load.bitmapFont('nokia-font', 'resources/fonts/nokia.png', 'resources/fonts/nokia.xml');

		this.load.image('background','resources/scene2.png');

		this.load.image('particle','resources/square-particle-1x1.png')
		Guy.loadResources(this);
		BadGuy.loadResources(this);

	}

	create() {


		const dude1 = new Guy(this, 348, 490);
		dude1.playAnimation('rest');
		dude1.setContactHandler(BadGuy, (obj: BadGuy) => {
			console.log("BAD GUY HIT YA");
		});
		const dude2 = new BadGuy(this, 548, 490);
		dude2.getGameObject().setStatic(false);
		dude2.playAnimation('rest');
		
		collisionManager.removeCollidesWith(dude2,dude1);

		this.dude2 = dude2;


	}

	update() {
		this.dude2.getGameObject().setVelocityX(-5);
	}

}