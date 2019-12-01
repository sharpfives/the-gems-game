'use strict';

import { JumpyGuy } from '../../objects/characters/jumpy-guy';
import { LeftRightExitScene } from '../left-right-exit-scene';
import { BadGuy } from '../../objects/characters/bad-guy';
import { Arrow } from '../../objects/arrow';
import { tweenPromise, sleep, OVERSAMPLE_FACTOR, setSavedHostage, ITEM_RED_PIECE, STATE_NUM_HOSTAGE_RED_PIECES, setNumOfItem, numOfItem, DEBUG_SCENE, ITEM_BOW, HostageState, InputMode, AUDIO_HOSTAGE, AUDIO_HELP } from '../../globals';
import { Rope } from '../../objects/rope';
import { Hanger } from '../../objects/characters/hanger';
import { Guy } from '../../objects/characters/guy';
import { MainGame } from '../../main-game';
import { stateManager } from '../../utils/game-state-manager';
import { MoveableObject } from '../../objects/moveable-object';
import { audioManager } from '../../utils/audio-manager';

export class HostageSceneBase extends LeftRightExitScene {

	ropes: Rope[] = [];
	badguys: BadGuy[] = [];

	constructor() {
		super();
	}

	preload() {
		super.preload();
		BadGuy.loadResources(this);
		JumpyGuy.loadResources(this);
		Hanger.loadResources(this);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_BOW,1);
		}
	}

	create(data: any) {
		super.create(data);

		this.removeLeftExit();

		this.me.on('picked-up', (itemName) => {
			if (itemName === ITEM_RED_PIECE) {
				let num = stateManager.get(STATE_NUM_HOSTAGE_RED_PIECES,0);
				stateManager.set(STATE_NUM_HOSTAGE_RED_PIECES,num + 1);
			}
		});
	}

	makeForwardDraggingHostage(spot, hostageName) {

		const badguy = new BadGuy(this, spot.x, spot.y);
		// badguy.preallocateParticles();
		badguy.playAnimation('walk');
		badguy.faceRight();

		badguy.on('killed', () => {
			setSavedHostage(hostageName,HostageState.SAVED);
			guy.isSaved = true;
			badguy.detach(guy);
			guy.stopTimer();
			guy.depth(guy.y() + 5 * OVERSAMPLE_FACTOR);
			guy.playAnimation('run');
			guy.faceLeft();
			guy.moveTo(-OVERSAMPLE_FACTOR*10, guy.y());
		});

		badguy.on('red-piece', (x,y) =>{
			const redPiece = this.makeRedPiece(x,y,hostageName);
			redPiece.getGameObject().setVelocityY(-9);
		});
		const guy = new JumpyGuy(this,badguy.x(),badguy.y());
		guy.playAnimation('drag');
		// guy.updateBody(7,7,false);
		guy.updateBody(7*OVERSAMPLE_FACTOR,7*OVERSAMPLE_FACTOR,false);
		guy.static(false);
		guy.sensor(true);
		guy.getGameObject().setFixedRotation();
		guy.ignoreGravity(true);

		const body = guy.getGameObject().body as any;
		body.position.y -= 30;
		guy.static(false);
		guy.getGameObject().setVelocity(0);

		const killGuy = (who: JumpyGuy) => {
			setSavedHostage(hostageName,HostageState.DEAD);
			if (who.isDead || who.isSaved)
				return;
			this.setInputMode(InputMode.Disabled);
			badguy.invincible = true;
			who.isDead = true;
			badguy.detach(who);
			badguy.playAnimation('run');
			badguy.cancelTweens();
			badguy.runTo((this.game.config.width as number) + 100, badguy.y());
			who.getGameObject().setStatic(true);
			guy.getGameObject().setVelocity(0);
			who.getGameObject().setSensor(true);
			who.stopTimer();

			who.playAnimation('fall-die');
			this.showCircleOutAndExit(who);
		};

		guy.setContactHandler(Arrow, (arrow: Arrow) => {
			killGuy(guy);
			console.log("OH NO");
			arrow.destroy();
		});
		badguy.attach(guy, {x : 60, y : -15});

		const timeToMove = 5000;
		guy.showTimer(timeToMove, {x : 0, y: -100});
		audioManager.play(AUDIO_HELP);
		tweenPromise(this, badguy.getGameObject(), {x : (this.game.config.width as number) - OVERSAMPLE_FACTOR*15}, timeToMove).then( () => {
			killGuy(guy);
		});
	}

	async showCircleOutAndExit(who: MoveableObject) {
		this.hud.circleTransition.x(who.x());
		this.hud.circleTransition.y(who.y());
		await tweenPromise(this, this.hud.circleTransition.shapeMask, {scaleX : 1, scaleY : 1}, 300);
		await sleep(1000);
		audioManager.stop(AUDIO_HOSTAGE);
		await tweenPromise(this, this.hud.circleTransition.shapeMask, {scaleX : 0, scaleY : 0}, 200);
			(this.game as MainGame).sceneMap.loadScene('Jumpy','right',this);
	}

	makeBackwardDraggingHostage(spot, hostageName:string) {
		const badguy = new BadGuy(this, spot.x, spot.y);
		// badguy.preallocateParticles();
		badguy.playAnimation('step-back');
		
		badguy.on('killed', () => {
			setSavedHostage(hostageName,HostageState.SAVED);
			guy.isSaved = true;
			badguy.detach(guy);
			guy.stopTimer();
			guy.playAnimation('run');
			guy.faceLeft();
			guy.moveTo(-OVERSAMPLE_FACTOR*10, guy.y());
		});

		badguy.on('red-piece', (x,y) => {
			const redPiece = this.makeRedPiece(x,y,hostageName);
			redPiece.getGameObject().setVelocityY(-9);
		});

		const guy = new JumpyGuy(this,badguy.x(),badguy.y());
		guy.playAnimation('strangle');
		guy.updateBody(7*OVERSAMPLE_FACTOR,12*OVERSAMPLE_FACTOR,false);
		guy.static(false);
		guy.sensor(true);
		guy.getGameObject().setFixedRotation();
		guy.ignoreGravity(true);

		const killGuy = (who: JumpyGuy) => {
			setSavedHostage(hostageName,HostageState.DEAD);
			if (who.isSaved || who.isDead)
				return;
			this.setInputMode(InputMode.Disabled);
			badguy.detach(who);
			who.getGameObject().setStatic(true);
			who.getGameObject().setSensor(true);
			badguy.playAnimation('run');
			badguy.cancelTweens();
			badguy.runTo((this.game.config.width as number) + 100, badguy.y());

			who.stopTimer();
			this.showCircleOutAndExit(who);
			who.playAnimation('fall-die');
		};

		guy.setContactHandler(Arrow, (arrow: Arrow) => {
			killGuy(guy);
			console.log("OH NO");
			arrow.destroy();
		});
		badguy.attach(guy, {x : 20, y : -15});

		const timeToMove = 6000;
		guy.showTimer(timeToMove, {x : -30, y: -100});
		audioManager.play(AUDIO_HELP);

		tweenPromise(this, badguy.getGameObject(), {x : (this.game.config.width as number) - OVERSAMPLE_FACTOR*15}, timeToMove).then( () => {
			killGuy(guy);
		});

	}

	makeHangerAndBadGuy(hangPoint,hostageName) {
		const rope = new Rope(this);
		rope.once('cut', async () => {
			hanger.stopTimer();
			if (!hanger.isDead) {
				hanger.isSaved = true;
				hanger.playAnimation('fall');
			}
			hanger.getGameObject().setAngle(0);
			hanger.getGameObject().setFixedRotation();
			hanger.static(true);
			hanger.sensor(true);
			hanger.ignoreGravity(true);
			rope.detach();
			await tweenPromise(this, hanger.getGameObject(), {y : hanger.y() + 120}, 800);
			await hanger.playAnimation('hit-ground');
			if (!hanger.isDead) {
				setSavedHostage(hostageName,HostageState.SAVED);
				await sleep(1000);
				await hanger.playAnimation('rise');
				hanger.faceLeft();
				await sleep(300)
				hanger.playAnimation('run');
				hanger.moveTo(-OVERSAMPLE_FACTOR*10, hanger.y());
			}
			else {
				hanger.dissolve(hanger.x(), -10, { dissolveIn: false});
			}
		});

		const killGuy = async () => {
			setSavedHostage(hostageName,HostageState.DEAD);
			hanger.die();
			this.showCircleOutAndExit(hanger);
		};

		const hanger = new Hanger(this, hangPoint.x, hangPoint.y + 30);
		hanger.getGameObject().setMass(0.1);
		hanger.hang();
		hanger.setContactHandler(Arrow, (obj: Arrow) => {
			if (!hanger.isSaved) {
				killGuy();
				hanger.stopTimer();
				obj.destroy();
			}
		});
		audioManager.play(AUDIO_HELP);

		hanger.showTimer(10000, {x:0, y:100}).then( () => {
			killGuy();
		}).catch( () => {});
		rope.attach(hangPoint.x,hangPoint.y,hanger.getGameObject(), {x : 0, y : -50});
		this.ropes.push(rope);

		const badguy = new BadGuy(this, hangPoint.x + 19 * OVERSAMPLE_FACTOR, hangPoint.y + 25 * OVERSAMPLE_FACTOR);
		badguy.setContactHandler(Guy, async () => {
			moveTimer.remove();
			await this.me.die();
			badguy.destroy();
			
			await this.hud.circleTransition.close();
			const num = stateManager.get(STATE_NUM_HOSTAGE_RED_PIECES,0);
			setNumOfItem(ITEM_RED_PIECE, numOfItem(ITEM_RED_PIECE) - num);
			if (num > 0) {
				this.hud.backpack.bringToTop();
				await this.showPickup(ITEM_RED_PIECE,-num,true);
				await sleep(1000);
				stateManager.set(STATE_NUM_HOSTAGE_RED_PIECES,0);
			}
			// await this.me.dissolve(this.me.x(), -10, { dissolveIn: false});
			audioManager.stop(AUDIO_HOSTAGE);
			(this.game as MainGame).sceneMap.loadScene('Spirit','died',this);
		});

		badguy.on('red-piece', (x,y) => {
			const redPiece = this.makeRedPiece(x,y,hostageName);
			redPiece.getGameObject().setVelocityY(-9);
		});

		badguy.rest();
		badguy.faceLeft();
		this.badguys.push(badguy);
		const moveTimer = this.time.addEvent( {
			delay : 3000,
			callbackScope: this,
			callback : () => {
				badguy.walkAt(this.me);
			},
			loop : false
		});

		badguy.on('killed', () => {
			moveTimer.remove();
		});

		// badguy.on('red-piece', (x,y) => {
		// 	const redPiece = this.makeRedPiece(x,y,hostageName);
		// 	redPiece.getGameObject().setVelocityY(-9);
		// });
	}

	update() {
		try {
			super.update();
			for(let r of this.ropes)
				r.update();
			
			for(let b of this.badguys)
				b.depth(b.y() + 9 * OVERSAMPLE_FACTOR);
		}
		catch(e) {}
	}


}