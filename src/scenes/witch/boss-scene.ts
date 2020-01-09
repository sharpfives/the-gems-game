'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { InputMode, sleep, tweenPromise, numRedPieces, STATE_DID_BEAT_BOSS, didPickUpRedPiece, OVERSAMPLE_FACTOR, DEBUG_SCENE, setNumOfItem, ITEM_BOW, ITEM_FEATHER, AUDIO_BOSS_LOOP, AUDIO_BOSS_START, makeParticle, rand, RED_COLOR, TOP_DEPTH, AUDIO_GROUND_STOMP, AUDIO_DOOR_EXPLODE, AUDIO_WITCH, AUDIO_BOSS_ENTER } from '../../globals';
import { Door } from '../../objects/items/door';
import { Boss } from '../../objects/characters/boss';
import { stateManager } from '../../utils/game-state-manager';
import { ExitArea } from '../../objects/areas/exit-area';
import { Guy } from '../../objects/characters/guy';
import { audioManager } from '../../utils/audio-manager';
import { Laser } from '../../objects/overlays/laser';
import { DoorBackground } from '../../objects/overlays/door-background';

export class BossScene extends LeftRightExitScene {
	boss: Boss;
	numRedPiecesEnd: number = 5;

	preload() {
		super.preload();
		Boss.loadResources(this);
		audioManager.preload(AUDIO_BOSS_LOOP);
		audioManager.preload(AUDIO_BOSS_START);

		if (DEBUG_SCENE) {
			stateManager.set(STATE_DID_BEAT_BOSS, false);
			setNumOfItem(ITEM_BOW,1);
			setNumOfItem(ITEM_FEATHER,1);
		}
	}

	create(data: any) {

		super.create(data);
		this.removeRightExit();

		const sceneWidth = (this.game.config.width as number);
		const sceneHeight = (this.game.config.height as number);

		if (stateManager.get(STATE_DID_BEAT_BOSS)) {
			audioManager.play(AUDIO_WITCH);
			for( let k = 0; k < this.numRedPiecesEnd; k++) {
				if (!didPickUpRedPiece(this.name,'boss'+k)) {
					const rp = this.makeRedPiece(sceneWidth/2 + (k + 5) * OVERSAMPLE_FACTOR, sceneHeight/2,'boss'+k);
					rp.ignoreGravity(true);
					rp.sensor(true);
				}
			}
		}
		else {
			this.removeLeftExit();
			this.doBossEnter();
			this.setInputMode(InputMode.Disabled);
			audioManager.play(AUDIO_BOSS_START).then( () => {
				audioManager.play(AUDIO_BOSS_LOOP);
			});
		}

		// const exit = this.sceneLoader.exits['boss'];
		// const boss = new Boss(this,exit.x,exit.y);
		// this.boss = boss;

		// boss.laser();

		// tweenPromise(this, boss.getGameObject(), {y : boss.y() - 200}, 1000);
		// this.boss.jump();
		// (async () => {


	}


	async exitScene(name) {
		audioManager.stop(AUDIO_BOSS_LOOP);
		audioManager.stop(AUDIO_BOSS_START);

		await super.exitScene(name);
	}

	async doDieExit() {
		const boss = this.boss;
		if (boss.isDead)
			return;
		this.me.cancelTweens();
		await this.me.die();
		await this.hud.circleTransition.close();
		this.exitScene('left');
	}

	async doBossEnter() {

		const sceneWidth = (this.game.config.width as number);
		const sceneHeight = (this.game.config.height as number);
		this.matter.add.rectangle(sceneWidth/2, sceneHeight/2 + 10 * OVERSAMPLE_FACTOR, sceneWidth, 10, { isStatic: true });

		const zoomLevel = 0.5;
		this.cameras.main.zoomTo(zoomLevel, 1500, 'Sine.easeInOut', true);
		await sleep(2000);
		this.tmpContainer.setScale(2);
		const me = this.me;
		this.inputMode = InputMode.Disabled;
		const exitName = 'boss';
		const exit = this.sceneLoader.exits[exitName];
		const boss = new Boss(this,exit.x, exit.y);
		boss.static(true);
		boss.updateBody(40 * OVERSAMPLE_FACTOR,20 * OVERSAMPLE_FACTOR,false);
		const body = boss.getGameObject().body as any;
		body.position.y -= 100;
		body.position.x += 20;
		boss.static(false);
		boss.getGameObject().setVelocity(0);

		boss.shadow.alpha(0);
		this.matter.world.remove(boss.groundBlock,false);

		boss.setContactHandler(Guy, (guy) => {
			this.doDieExit();
		});

		boss.on('laser', (l: Laser) => {
			l.setContactHandler(Guy, (guy) => {
				console.log("LAAASSERRRR");
				this.doDieExit();
			});
		})

		boss.on('died', async () => {
			stateManager.set(STATE_DID_BEAT_BOSS,true);
			(this.sceneLoader.areas['left'] as ExitArea).enabled = true;
			boss.faceLeft();
			this.cameras.main.shake(2000,0.01,true);
			await tweenPromise(this, boss.getGameObject(), {x : sceneWidth/2, y : sceneHeight/2 - 10 * OVERSAMPLE_FACTOR}, 2000);
			const shakeTime = 2000;
			this.cameras.main.shake(shakeTime,0.03,true);
			await sleep(shakeTime);
			boss.breakIntoParticles({
				limit: 150,
				explode: true
			});
			audioManager.stop(AUDIO_BOSS_LOOP);
			audioManager.stop(AUDIO_BOSS_START);
			audioManager.play(AUDIO_WITCH);
			for(let k = 0; k < this.numRedPiecesEnd; k++) {
				const rp = this.makeRedPiece(boss.x(), boss.y(),'boss'+k);
				rp.getGameObject().setVelocityY(-9);
			}
			boss.destroy();
			this.addLeftExit();
			this.cameras.main.zoomTo(1, 1500, 'Sine.easeInOut', true);
			this.cameras.main.pan(sceneWidth/2, sceneHeight/2,1500,undefined,true);
		});
		this.boss = boss;

		const door = new Door(this, exit.x, exit.y);
		await door.dissolve(door.x(), door.y(), { dissolveIn: true});

		const background = new DoorBackground(this);
		background.setDoor(door);

		const numShakes = 4;

		for(let k = 0; k < numShakes; k++) {
			await sleep(1000);
			audioManager.play(AUDIO_GROUND_STOMP);
			this.cameras.main.shake(200,0.1,true);
		}
		await sleep(2000);
		this.cameras.main.shake(200,0.1,true);
		audioManager.play(AUDIO_DOOR_EXPLODE);
		await door.playAnimation('explode');

		boss.faceLeft();
		await sleep(300);
		tweenPromise(this, boss.shadow.getGameObject(), {alpha : 1}, 1500);
		audioManager.play(AUDIO_BOSS_ENTER);
		await boss.playAnimation('emerge');
		await boss.playAnimation('rest');
		await boss.playAnimation('blink');

		this.setInputMode(InputMode.Walk);

		boss.jump();
		sleep(500).then( () => {
			this.createSmokeCloud(door.x(), door.y());
			background.destroy();
			door.destroy();
		});


	}

	update() {
		try {
			super.update();
			this.boss.update();
		} catch(e) {}
	}


}