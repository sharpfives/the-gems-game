'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { tweenPromise, sleep, rand, OVERSAMPLE_FACTOR, setPickUpRedPiece, STATE_DID_PROTECT_SCENE, didPickUpRedPiece, DEBUG_SCENE, AUDIO_PROTECT_START, AUDIO_PROTECT_LOOP, setNumOfItem, ITEM_BOW, AUDIO_WITCH } from '../../globals';
import { Cursor } from '../../objects/overlays/cursor';
import { stateManager } from '../../utils/game-state-manager';
import { WarningIcon } from '../../objects/overlays/warning-icon';
import { Bird } from '../../objects/characters/bird';
import { Arrow } from '../../objects/arrow';
import { RedPiece } from '../../objects/items/red-piece';
import { ExitArea } from '../../objects/areas/exit-area';
import { audioManager } from '../../utils/audio-manager';

export class Protect1Scene extends LeftRightExitScene {
	warningIcon: WarningIcon;
	isDone: boolean;
	redPiece: RedPiece;
	num1stBirds: number = 4;
	didRoundOfBadGuys = false;
	num1stBadGuys: number = 3;
	didDoneSequence = false;

	birdCount: number = 0;
	badGuyCount = 0;
	badguyTimer: Phaser.Time.TimerEvent;
	badGuysAlive: Set<unknown>;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Bird.loadResources(this);
		WarningIcon.loadResources(this);
		audioManager.preload(AUDIO_PROTECT_LOOP);
		audioManager.preload(AUDIO_PROTECT_START);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_BOW,1);
			stateManager.set(STATE_DID_PROTECT_SCENE,false);
			// setPickUpRedPiece(this.name,'protect');
		}
	}

	create(data: any) {

		super.create(data);
		this.birdCount = 0;
		this.isDone = false;

		this.removeRightExit();


		if (!stateManager.get(STATE_DID_PROTECT_SCENE)) {
			(this.sceneLoader.areas['left'] as ExitArea).enabled = false;
			// audioManager.stopAll(500).then( () => {
			audioManager.stop(AUDIO_WITCH);
			audioManager.play(AUDIO_PROTECT_START).then( () => {
				audioManager.play(AUDIO_PROTECT_LOOP);
			});
			// });

			this.warningIcon = new WarningIcon(this,100,100);
			this.warningIcon.alpha(0);
			this.start();
		}
		else if (!didPickUpRedPiece(this.name,'protect')) {
			const gameHeight = this.game.config.height as number;
			const gameWidth = this.game.config.width as number;
	
			const p = this.makeRedPiece(gameWidth/2, gameHeight/2, 'protect');
			p.ignoreGravity(true);
			p.sensor(true);
		}
	}

	async start() {
		const gameHeight = this.game.config.height as number;
		const gameWidth = this.game.config.width as number;

		const redPiece = new RedPiece(this,gameWidth/2,gameHeight/2);
		redPiece.ignoreGravity(true);
		redPiece.sensor(true);
		this.redPiece = redPiece;

		const zoomLevel = 0.6;
		const zoomTime = 1000;
		this.cameras.main.zoomTo(zoomLevel, zoomTime, 'Sine.easeInOut');


		const badGuysAlive = new Set();
		this.badGuysAlive = badGuysAlive;

		await sleep(zoomTime * 4);
		this.createBird();
	}

	async startBadGuyTimer() {
		this.badguyTimer = this.time.addEvent({
			delay: 4000,                // ms
			callback:  async () => {
				if (this.isDone)
					return;
				
				const doorStartRadius = 50 * OVERSAMPLE_FACTOR;
				const gameHeight = this.game.config.height as number;
				const gameWidth = this.game.config.width as number;
		
				const r = rand(doorStartRadius, doorStartRadius + 50 * OVERSAMPLE_FACTOR);
				const angle = rand(0, Math.PI * 2);

				try {
					const guy = await this.showBadGuyEnterFromDoor( { x: gameWidth/2+ r*Math.cos(angle), y : gameHeight/2 + r*Math.sin(angle)});
					guy.invincible = false;
					this.badGuysAlive.add(guy);
					guy.walkAt(this.me);

					guy.on('killed', async () => {
						this.badGuysAlive.delete(guy);
						if (this.isDone && this.badGuysAlive.size == 0) {
							this.doDoneSequence();
						}
					});
				}
				catch(e) {
					if (this.isDone && this.badGuysAlive.size == 0) {
						this.doDoneSequence();
					}
				}
			},
			callbackScope : this,
			loop : true,
			startAt: 0,
		});
	}

	async createBadGuy() {
		const doorStartRadius = 50 * OVERSAMPLE_FACTOR;
		const gameHeight = this.game.config.height as number;
		const gameWidth = this.game.config.width as number;

		const r = rand(doorStartRadius, doorStartRadius + 50 * OVERSAMPLE_FACTOR);
		const angle = rand(0, Math.PI * 2);
		try {
			const guy = await this.showBadGuyEnterFromDoor( { x:gameWidth/2 + r*Math.cos(angle), y : gameHeight/2 + r*Math.sin(angle)});
			guy.invincible = false;
			this.badGuysAlive.add(guy);
			guy.walkAt(this.me);

			guy.on('killed', async () => {
				this.badGuysAlive.delete(guy);
				if (this.badGuyCount++ < this.num1stBadGuys) {
					this.createBadGuy();
				}
				else {
					this.didRoundOfBadGuys = true;
					this.badGuyCount = 0;
					this.createBird();
					this.startBadGuyTimer();
				}
			});
		}
		catch(e) {
			if (this.isDone && this.badGuysAlive.size == 0) {
				this.doDoneSequence();
			}
		}
	}

	async createBird() {

		const zoomLevel = 0.6;

		const gameHeight = this.game.config.height as number;
		const gameWidth = this.game.config.width as number;

		const yInset = 60;
		const xInset = 90;

		const xMin = -gameWidth * zoomLevel / 2;
		const xMax = gameWidth + (gameWidth * zoomLevel)/2; // (gameWidth/zoomLevel);


		const y = rand(yInset, gameHeight - yInset);
		const x = rand(0,1) > 0.5 ? (xMax - xInset) : xMin + xInset;
		// const x =  (xMax - xInset) ;
		this.warningIcon.y(y);
		this.warningIcon.x(x);
		await this.warningIcon.flash();
		await sleep(200);
		const bird = new Bird(this,x,y);

		bird.setContactHandler(Arrow, async () => {
			bird.stop();
			bird.breakIntoParticles({
				explode: true
			});

			this.birdCount++;
			if (this.birdCount >= this.num1stBirds && this.didRoundOfBadGuys) {
				this.badguyTimer.remove();
				this.isDone = true;
			}
			else if (this.birdCount >= this.num1stBirds) {
				this.birdCount = 0;
				this.createBadGuy();
			}
			else {
				this.createBird();
			}
		});

		bird.playAnimation('fly-in');
		try {
			
			await bird.moveTo(gameWidth/2, gameHeight/2, 40 * OVERSAMPLE_FACTOR);
			this.redPiece.alpha(0);
			this.redPiece.particleTimer.paused = true;
			bird.hasRedPiece = true;
			bird.playAnimation('fly-away');
			await bird.moveTo(x < gameWidth/2 ? xMax : xMin, y, 40 * OVERSAMPLE_FACTOR);
			bird.destroy();
			this.doFailSequence();
		} catch (e) {
			if (bird.hasRedPiece) {
				this.redPiece.alpha(1);
				this.redPiece.x(bird.x());
				this.redPiece.y(bird.y());
				this.redPiece.particleTimer.paused = false;
				tweenPromise(this, this.redPiece.getGameObject(), {x: gameWidth/2, y: gameHeight/2}, 500);
			}
			bird.destroy();

		}
	}

	async doFailSequence() {
		audioManager.stop(AUDIO_PROTECT_LOOP);
		await this.me.die();
		await this.hud.circleTransition.close();
		this.exitScene('left');
	}

	doDoneSequence() {
		if (this.didDoneSequence) {
			return;
		}
		this.didDoneSequence = true;
		(this.sceneLoader.areas['left'] as ExitArea).enabled = true;
		audioManager.stop(AUDIO_PROTECT_LOOP);
		stateManager.set(STATE_DID_PROTECT_SCENE, true);
		this.cameras.main.zoomTo(1, 1000, 'Sine.easeInOut');
		this.redPiece.onOverSetIcon(Cursor.handKey);
		this.redPiece.on('selected', async () => {
			try {
				await this.me.pickUp(this.redPiece);
				setPickUpRedPiece(this.name,'protect');
				// this.redPiece.destroy();
			}
			catch(e) {}
		});
	}

}