'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, LINE_COLOR } from '../globals';
import { rand } from '../globals';
import { SpeechBubble } from '../objects/overlays/speech-bubble';
import { Guy } from '../objects/characters/guy';
import { Conversation } from '../conversation';


export class ConvoTestScene extends Phaser.Scene {

	private convo;
	constructor() {
		super("");
	}

	preload() {

		this.load.bitmapFont('thick-font', 'resources/fonts/thick font.png', 'resources/fonts/thick font.xml');
    this.load.bitmapFont('nokia-font', 'resources/fonts/nokia.png', 'resources/fonts/nokia.xml');

		this.load.image('background','resources/scene2.png');

		this.load.image('cursor','resources/cursor.png');
		this.load.image('particle','resources/square-particle-1x1.png')
		this.load.json('convo','resources/test-conversation.json');
		Guy.loadResources(this);

	}

	create() {

	  this.add.image(0,0,'background').setOrigin(0,0);

		const cursor = this.add.image(0,0,'cursor');
		cursor.setTint(LINE_COLOR);
		cursor.setScale(OVERSAMPLE_FACTOR);
	
		const dude = new Guy(this, 348, 490);
		dude.setRepeat('rest');
		dude.setRepeat('walk');
		dude.playAnimation('rest');

		this.input.on('pointermove', function (pointer) {
			cursor.x = pointer.x; cursor.y = pointer.y;
		}, this);

		this.input.on('pointerup', async () => {
			console.log('click');
			this.convo.next();
		});

		const time = 4000;
		const varX = 6;
		setInterval( async () => {
			await tweenPromise(this, this.cameras.main, {x : rand(-varX,varX), y : rand(-varX,varX)}, time, 'Sine.easeInOut');
		}, time);

		this.testConversation();
	}

	testConversation() {
		const speechBubble = new SpeechBubble(this,100,100);
		speechBubble.on('selected', (index, text) => {
			this.convo.selectResponse(index);
		});

		const convo = new Conversation(this);
		convo.on('start', () => {
			console.log('starting conversation');
		});
		convo.on('text', (text, responses) => {
			speechBubble.show(100,100,text,responses);
		});
		convo.on('responses', (text, responses) => {	
			speechBubble.show(100,100,text,responses);
		});
		convo.on('end', (text, value) => {
			speechBubble.show(100,100,text);
		});
		convo.start('convo');
		this.convo = convo;
	}

}