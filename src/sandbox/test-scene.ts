'use strict';

import * as Phaser from 'phaser';

export class TestScene extends Phaser.Scene {
	constructor() {
		super("");
	}

	preload() {
		// load in the image
		this.load.image('cursor','resources/cursor.png');
	}

	create() {

		// add an image to the scene
		const cursor = this.add.image(0,0,'cursor');

		// move the image when you move the mouse
		this.input.on('pointermove', function (pointer) {
			cursor.x = pointer.x; 
			cursor.y = pointer.y;
		}, this);

	}

}