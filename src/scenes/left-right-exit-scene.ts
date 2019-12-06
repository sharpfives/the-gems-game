'use strict';

import * as Phaser from 'phaser';
import { SceneBase } from './scene-base';
import { BadGuy } from '../objects/characters/bad-guy';
import { WarningIcon } from '../objects/overlays/warning-icon';
import { tweenPromise, rand } from '../globals';
import { Spirit } from '../objects/characters/spirit';
import { SpiritPool } from '../objects/items/spirit-pool';
import { PolygonArea } from '../objects/areas/polygon-area';
import { Stream } from '../objects/items/stream';
import { ExitArea } from '../objects/areas/exit-area';

export class LeftRightExitScene extends SceneBase {

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Spirit.loadResources(this);
		SpiritPool.loadResources(this);
		Stream.loadResources(this);
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		const areaWidth = gameWidth / 12;
		const areaHeight = gameHeight;

		this.addLeftExit();

		const rightArea = new ExitArea(this,gameWidth - areaWidth,0,[
			{ x : 0, y: 0 },
			{ x : areaWidth, y: 0 },
			{ x : areaWidth, y: areaHeight },
			{ x : 0, y: areaHeight }
		]);
		rightArea.on('moved-over', () => {
			if (rightArea.enabled)
				this.hud.cursor.setRightArrow();
		});
		rightArea.on('moved-out', () => {
			if (rightArea.enabled)
				this.hud.cursor.setNormal();
		});
		rightArea.on('selected', async (x,y,double) => {
			if (!rightArea.enabled)
				return;
			console.log('selected right exit area');
			try {
				await me.move(x,y,double);
				this.exitScene('right');
			}
			catch(e) {}
		});
		this.sceneLoader.areas['right'] = rightArea;

		if (typeof this.sceneLoader.exits['left'] === 'undefined')
			this.sceneLoader.exits['left'] = { x : areaWidth*2, y : areaHeight * 2 / 3};
		if (typeof this.sceneLoader.exits['right'] === 'undefined')
			this.sceneLoader.exits['right'] = { x : gameWidth - areaWidth*2, y : areaHeight * 2 / 3};

		this.setInitialPosition(data.exitName);

	}

	addLeftExit() {
		const gameWidth = this.game.config.width as number;
		const gameHeight = this.game.config.height as number;

		const areaWidth = gameWidth / 12;
		const areaHeight = gameHeight;
		const leftArea = new ExitArea(this,0,0,[
			{ x : 0, y: 0 },
			{ x : areaWidth, y: 0 },
			{ x : areaWidth, y: areaHeight },
			{ x : 0, y: areaHeight }
		]);
		leftArea.on('moved-over', () => {
			if (leftArea.enabled)
				this.hud.cursor.setLeftArrow();
		});
		leftArea.on('moved-out', () => {
			if (leftArea.enabled)
				this.hud.cursor.setNormal();
		});
		leftArea.on('selected', async (x,y,double) => {
			if (!leftArea.enabled)
				return;
			console.log('selected left exit area');
			try {
				await this.me.move(x,y,double);
				this.exitScene('left');
			}
			catch(e) {}
		});
		this.sceneLoader.areas['left'] = leftArea;
	}

	removeLeftExit() {
		this.sceneLoader.areas['left'].destroy();
	}

	removeRightExit() {
		this.sceneLoader.areas['right'].destroy();
	}


}