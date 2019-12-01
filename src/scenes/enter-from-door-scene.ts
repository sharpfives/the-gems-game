'use strict';

import * as Phaser from 'phaser';
import { SceneBase } from './scene-base';
import { BadGuy } from '../objects/characters/bad-guy';
import { WarningIcon } from '../objects/overlays/warning-icon';
import { tweenPromise, rand, InputMode, AUDIO_DOOR_FADE_IN } from '../globals';
import { Spirit } from '../objects/characters/spirit';
import { SpiritPool } from '../objects/items/spirit-pool';
import { PolygonArea } from '../objects/areas/polygon-area';
import { LeftRightExitScene } from './left-right-exit-scene';
import { Door } from '../objects/items/door';
import { audioManager } from '../utils/audio-manager';

export class EnterFromDoorScene extends LeftRightExitScene {

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Door.loadResources(this);
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		if (data.exitName === 'start' || data.exitName === 'intro') {
			this.showEnterFromDoor(data.exitName);
		}
		else {
			this.showReturnDoor();
		}
		this.setInitialPosition(data.exitName);

	}

	showReturnDoor() {
		const exit = this.sceneLoader.exits['start']
		const door = new Door(this, exit.x, exit.y);
		door.on('selected', async () => {
			try {
				await this.me.walkTo(door.x(), door.y() + 30);
				await this.enterDoor(door, this.getExitBackName());
			}
			catch(e) {}
		});
	}

	async showEnterFromDoor(exitName: string) {
		const me = this.me;
		this.inputMode = InputMode.Disabled;
		me.alpha(0);
		const exit = this.sceneLoader.exits[exitName];
		const door = new Door(this, exit.x, exit.y);
		door.on('selected', async () => {
			try {
				await me.walkTo(door.x(), door.y() + 30);
				await this.enterDoor(door, this.getExitBackName());
			}
			catch(e) {}
		});
		me.x(door.x()); me.y(door.y());
		await door.dissolve(door.x(), door.y(), { dissolveIn: true});
		door.getGameObject().depth = me.getGameObject().depth + 1;
		me.alpha(1);
		await door.open();
		await me.walkTo(me.x(), me.y() + 40);
		await door.close();
		me.emit('entered', door);
		this.inputMode = InputMode.Walk;
		return door;
		// await door.dissolve(door.x(), -10, false);
	}

	getExitBackName() {
		return 'start';
	}

}