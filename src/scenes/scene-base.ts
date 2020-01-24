'use strict';

import * as Phaser from 'phaser';
import { OVERSAMPLE_FACTOR, tweenPromise, sleep, TOP_DEPTH, AUDIO_BOW_PULL, AUDIO_ARROW, InputMode, STATE_LAST_EXIT, STATE_LAST_SCENE, setPickUpRedPiece, didPickUpMushroom, didPickUpAcorn, makeParticle, setPickUpMushroom, setPickUpAcorn, BG_COLOR, didPickUpRedPiece, STATE_CURRENT_SCENE, STATE_CURRENT_EXIT, AUDIO_DOOR_FADE_OUT, AUDIO_SMOKE_CLOUD, AUDIO_FOOTSTEPS, AUDIO_BADGUY_BREATH, AUDIO_BADGUY_STEP } from '../globals';
import { rand } from '../globals';
import { SpeechBubble } from '../objects/overlays/speech-bubble';
import { Guy } from '../objects/characters/guy';

import { TouchPulse } from '../objects/touch-pulse';
import { BowControl } from '../objects/bow-control';
import { Arrow } from '../objects/arrow';
import { Bow } from '../objects/weapons/bow';
import { BowSight } from '../objects/weapons/bow-sight';
import { Acorn } from '../objects/items/acorn';
import { HitAcorn } from '../objects/items/hit-acorn';
import { SceneLoader } from '../utils/scene-loader';
import { Cursor } from '../objects/overlays/cursor';
import { MainGame } from '../main-game';
import { InputHandler } from '../utils/input-handler';
import { Item } from '../objects/items/item';
import { Conversation, ConversationConfig } from '../conversation';
import { Character } from '../objects/characters/character';
import { collisionManager } from '../utils/collision-manager';
import { Backpack } from '../objects/overlays/backpack';
import { audioManager } from '../utils/audio-manager';
import { Door } from '../objects/items/door';
import { Animated } from '../objects/animated';
import { BagItem } from '../objects/items/bag-item';
import { BackArrow } from '../objects/overlays/back-arrow';
import { BadGuy } from '../objects/characters/bad-guy';
import { DoorBackground } from '../objects/overlays/door-background';
import { stateManager } from '../utils/game-state-manager';
import { HudScene } from './hud-scene';
import { RedPiece } from '../objects/items/red-piece';
import { Mushroom } from '../objects/items/mushroom';
import { GroundAcorn } from '../objects/items/acorn-ground';
import { ExitArea } from '../objects/areas/exit-area';
import { MoveMarker } from '../objects/overlays/move-marker';
import { Bird } from '../objects/characters/bird';

export class SceneBase extends Phaser.Scene {

	public me: Guy;
	public sceneData: {
		imagesRootDir: string,
		tilemap: string,
		images: {
			[key: string]: string
		},
	};
	public name: string;
	protected inputHandler: InputHandler = new InputHandler();
	sceneLoader: SceneLoader;
	control: BowControl;
	bow: Bow;
	tmpContainer: Phaser.GameObjects.Container;
	areaSize: number[];
	isUsingBow: boolean;
	convo: Conversation;
	public inputMode: InputMode = InputMode.Walk;
	hud: HudScene;
	public minYForWalk = 50 * OVERSAMPLE_FACTOR;
	moveMarker: MoveMarker;
	exitName: string;
	isUsingShell: boolean;

	constructor() {
		super("");
	}

	preload() {

		collisionManager.setScene(this);

		if (typeof this.sceneData !== 'undefined') {
			if (typeof this.sceneData.tilemap !== 'undefined') {
				this.cache.json.remove('tilemap');
				this.load.json('tilemap', this.sceneData.tilemap);
			}
			const sceneData = this.sceneData;
			const images = sceneData.images;
			const rootDir = sceneData.imagesRootDir;
			for (let k in images) {
				let img = images[k];
				this.load.image(k, rootDir + '/' + img);
			}
		}

		this.load.bitmapFont('thick-font', 'resources/fonts/thick font.png', 'resources/fonts/thick font.xml');
		this.load.bitmapFont('nokia-font', 'resources/fonts/nokia.png', 'resources/fonts/nokia.xml');

		this.load.image('smoke-cloud', 'resources/smoke-cloud.png');
		this.load.json('convo','resources/test-conversation.json');

		Cursor.loadResources(this);

		this.load.image('particle', 'resources/square-particle-1x1.png')
		Guy.loadResources(this);
		Bow.loadResources(this);
		HitAcorn.loadResources(this);
		Item.loadResources(this);
		Arrow.loadResources(this);
		Backpack.loadResources(this);
		Acorn.loadResources(this);
		BackArrow.loadResources(this);
		Door.loadResources(this);
		RedPiece.loadResources(this);
		DoorBackground.loadResources(this);
		BadGuy.loadResources(this);
		GroundAcorn.loadResources(this);
		Mushroom.loadResources(this);
	}

	create(data) {

		this.isUsingShell = false;

		this.exitName = data.exitName;
		
		this.setCurrentScene();

		const sceneLoader = new SceneLoader();
		this.sceneLoader = sceneLoader;

		sceneLoader.load(this, this.cache.json.get('tilemap'));

		this.scene.launch('hud');
		this.hud = this.scene.get('hud') as HudScene;
		this.hud.base = this;
		this.scene.bringToTop('hud');
		this.input.setDefaultCursor('none');

		const me = new Guy(this, 300, 490);
		me.playAnimation('rest');
		this.me = me;
		me.on('picked-up', (thing: string) => {
			this.showPickup(thing);
		});
		// this.cameras.main.startFollow(me.getGameObject());

		this.setInitialPosition(data.exitName);

		const areaSize = [14 * OVERSAMPLE_FACTOR, 20 * OVERSAMPLE_FACTOR];
		this.areaSize = areaSize;
		const tmpContainer = this.add.container(me.x() - areaSize[0] / 2, me.y() - areaSize[1] / 2);
		tmpContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, areaSize[0], areaSize[1]), Phaser.Geom.Rectangle.Contains);
		tmpContainer.on('pointerover', () => {
			const bowEnabled = me.hasBow();
			if (this.isUsingShell || !bowEnabled || this.inputMode !== InputMode.Walk) {
				return;
			}
			this.hud.cursor.setHand();
		});
		tmpContainer.on('pointerout', () => {
			if (!this.isUsingBow)
				this.hud.cursor.setNormal();
		});
		tmpContainer.on('pointerdown', (pointer, localX, localY, event) => {
			// console.log('STARTING');
			const bowEnabled = me.hasBow();

			if (this.isUsingShell || !bowEnabled || this.inputMode !== InputMode.Walk) {
				return;
			}
			this.hud.cursor.setHandClosed();

			event.stopPropagation();
			control.start(pointer.x, pointer.y);
			me.cancelTweens();
		},this);

		if (this.game.config.physics.matter.debug)
			this.input.enableDebug(tmpContainer);

		this.tmpContainer = tmpContainer;

		const bow = new Bow(this,me.x(),me.y());
		bow.setAlpha(0);
		this.bow = bow;
		
		const bowSight = new BowSight(this,10,100);
		bowSight.alpha(0);

		const control = new BowControl(this,0,0);
		control.on('start', () => {
			this.isUsingBow = true;
			this.enableAllMouseOvers(false);
			this.setInputMode(InputMode.Bow);
			this.hud.cursor.setHandClosed();
			bow.setAlpha(1);
			bow.depth(TOP_DEPTH);
			bowSight.alpha(1);
			bowSight.x(me.x());
			bowSight.y(me.y()+0.5);
			bowSight.depth(TOP_DEPTH);
			console.log('Control start');
			me.playAnimation('bow-pull');
			const anim = bow.getAnimation('pull');
			bow.sprite.anims.pause(anim.frames[0]);
			audioManager.play(AUDIO_BOW_PULL);
			audioManager.stop(AUDIO_FOOTSTEPS,100);
		});
		control.on('release', async (angle) => {
			console.log('Control release');
			this.enableAllMouseOvers(true);
			if (this.inputMode !== InputMode.Convo)
				this.setInputMode(InputMode.Walk);

			bowSight.alpha(0);

			const arrow = new Arrow(this,me.x(), me.y()-1);
			arrow.shoot(angle);
			audioManager.play(AUDIO_ARROW);
			bow.playAnimation('release').then( () => {
				bow.setAlpha(0);
			});
			await me.playAnimation('bow-release');
			this.isUsingBow = false;
			me.playAnimation('rest');
			me.emit('shot-arrow', arrow);
			audioManager.stop(AUDIO_FOOTSTEPS,100);
		});
		control.on('change', (angle, percent) => {
			console.log('Control change');
			if (angle < 0) {
				angle += Math.PI*2;
			}
			if (angle < Math.PI / 2 || angle > 3*Math.PI/2) {
				me.faceRight();
			}
			else {
				me.faceLeft();
			}
			bowSight.getGameObject().rotation = angle;
			bow.sprite.rotation = angle;
			const anim = bow.getAnimation('pull');
			const frameIndex = Math.round(percent * (anim.frames.length - 1));
			bow.sprite.anims.pause(anim.frames[frameIndex]);
		});
		this.control = control;

		const self = this;
		this.input.on('gameobjectover', function (pointer, gameObject) {
			if (this.isUsingBow) {
				return;
			}
			if (self.inputMode === InputMode.Walk && typeof gameObject['obj'] !== 'undefined') {
				pointer.event.stopPropagation();
				const obj = gameObject['obj'];
				obj.emit('moved-over', pointer.worldX, pointer.worldY);
			}
		},this);

		this.input.on('gameobjectout', function (pointer, gameObject) {
			if (this.isUsingBow) {
				return;
			}
			if (self.inputMode === InputMode.Walk && typeof gameObject['obj'] !== 'undefined') {
				pointer.event.stopPropagation();
				const obj = gameObject['obj'];
				obj.emit('moved-out', pointer.worldX, pointer.worldY);
			}
		},this);

		let didSelectObject = false;
		this.input.on('gameobjectup', function (pointer, gameObject) {
			// if (!this.inputEnabled)
			// 	return;
			if (this.isUsingBow) {
				return;
			}

			if ( gameObject['obj'] instanceof BackArrow || (this.inputMode === InputMode.Walk && typeof gameObject['obj'] !== 'undefined')) {
				didSelectObject = true;
				pointer.event.stopPropagation();
				const obj = gameObject['obj'];
				let y = pointer.worldY;
				const x = pointer.worldX;
				if (obj instanceof ExitArea) {
					y = Math.max(this.minYForWalk, y);
				}
				const currentTime = Date.now();

				const doTap = (isDouble: boolean) => {
					console.log(`${x}, ${y}`);
					obj.emit('selected',x,y,isDouble && this.me.hasFeather());
				};
	
				numTaps++;
	
				if (currentTime - lastDownTime < doubleClickThreshold) {
					if (numTaps >= 2) {
						if (typeof clickTimer !== 'undefined') {
							clickTimer.remove();
							doTap(true);
						}
						numTaps = 0;
					}
				}
				else {
					clickTimer = this.time.addEvent( {
						delay: doubleClickThreshold,
						callback: () => {
							doTap(false);
						},
						callbackScope : this,
						loop : false,
					});
				}
	
				lastDownTime = currentTime;

			}
			// console.log(gameObject);
		}, this);


		let lastDownTime = 0;
		const doubleClickThreshold = 200;
		let numTaps = 0;
		let clickTimer: Phaser.Time.TimerEvent;

		this.input.on('pointerdown', async () => {
			if (this.hud.cursor.isHand()) {
				this.hud.cursor.setHandClosed();
			}
			this.hud.cursor.y(this.hud.cursor.y() + 5);
		},this);

		this.input.on('pointerup', async (pointer) => {
			this.hud.cursor.setNormal();

			if (this.isUsingBow)
				return;

			this.hud.cursor.y(this.hud.cursor.y() - 5);

			if (didSelectObject) {
				didSelectObject = false;
				return;
			}

			const doTap = (isDouble: boolean) => {
				const x = Math.round(pointer.worldX);
				const y = Math.round(pointer.worldY);
				console.log(`${x}, ${y}`);
				this.inputHandler.tap(x,y,isDouble);
			};

			if (self.inputMode === InputMode.Disabled) {
				console.log('input disabled, returning');
				return;
			}
			else if (self.inputMode === InputMode.Convo) {
				doTap(false);
				return;
			}

			const currentTime = Date.now();

			numTaps++;

			if (currentTime - lastDownTime < doubleClickThreshold) {
				if (numTaps >= 2) {
					if (typeof clickTimer !== 'undefined') {
						clickTimer.remove();
						doTap(true);
					}
					numTaps = 0;
				}
			}
			else {
				clickTimer = this.time.addEvent( {
					delay: doubleClickThreshold,
					callback: () => {
						doTap(false);
					},
					callbackScope : this,
					loop : false,
				});
			}

			lastDownTime = currentTime;

		},this);

		this.moveMarker = new MoveMarker(this,-50,-50);
		

		this.addMushrooms();
		this.addAcorns();

		this.setWalkMode();

		// me.emit('picked-up', ITEM_FEATHER);
		// me.emit('picked-up', new Mushroom(this,0,0));
		// me.emit('picked-up', new GroundAcorn(this,0,0));
		// this.showPickup(ITEM_RED_PIECE);
	}

	setCurrentScene() {
		stateManager.set(STATE_CURRENT_SCENE, this.name);
		stateManager.set(STATE_CURRENT_EXIT, this.exitName);
	}

	initializeHud() {

	}

	enableAllMouseOvers(isOn) {
		for(let c of this.children.list) {
			if (c.input == null || typeof c.input === 'undefined')
				continue;
			if (!isOn)
				c.disableInteractive();
			else
				c.setInteractive();
		}
	}

	addRedPieces() {
		const me = this.me;
		for(let name in this.sceneLoader.exits) {
			const exit = this.sceneLoader.exits[name];
			if (exit.type === 'red-piece') {
				if (!didPickUpRedPiece(this.name, name)) {
					const p = this.makeRedPiece(exit.x, exit.y,name);
					p.sensor(true);
					p.ignoreGravity(true);
				}
			}
		}
	}

	addAcorns() {
		const me = this.me;
		for(let name in this.sceneLoader.exits) {
			const exit = this.sceneLoader.exits[name];
			if (exit.type === 'acorn') {
				if (!didPickUpAcorn(this,Number(name))) {
					const acorn = new GroundAcorn(this, exit.x, exit.y);
					acorn.onOverSetIcon(Cursor.handKey);
					acorn.on('selected', async () => {
						try {
							// await me.walkTo(acorn.x() - 5 * OVERSAMPLE_FACTOR, acorn.y());
							await me.pickUp(acorn);
							setPickUpAcorn(this,Number(name));
						}
						catch (e) {}
					});
				}
			}
		}
	}

	addMushrooms() {
		const me = this.me;
		for(let name in this.sceneLoader.exits) {
			const exit = this.sceneLoader.exits[name];
			if (exit.type === 'mushroom') {
				if (!didPickUpMushroom(this,Number(name))) {
					const mushroom = new Mushroom(this, exit.x, exit.y);
					mushroom.onOverSetIcon(Cursor.handKey);
					mushroom.on('selected', async () => {
						try {
							// await me.walkTo(mushroom.x() - 5 * OVERSAMPLE_FACTOR, mushroom.y());
							await me.pickUp(mushroom);
							setPickUpMushroom(this,Number(name));
						}
						catch (e) {}
					});
				}
			}
		}
	}


	async showPickup(itemName: string, value?: number, invert?: boolean) {
		await this.hud.showPickup(itemName, value, invert);
	}

	setInitialPosition(exitName: string) {
		if (typeof exitName !== 'undefined') {
			const me = this.me;
			const exitInfo = this.sceneLoader.exits[exitName];
			if (typeof exitInfo !== 'undefined') {
				me.x(exitInfo.x);
				me.y(exitInfo.y);
			}
			else {
				console.log(`no exit data found for name ${exitName}`);
			}

			if (exitName === 'left') {
				me.faceRight();
			}
			else if (exitName === 'right') {
				me.faceLeft();
			}
		}
	}

	setBagMode() {
		this.inputHandler.setOnTap(this, async () => {
			this.setWalkMode();
		});
	}

	setWalkMode() {
		const me = this.me;
		this.setInputMode(InputMode.Walk);
		this.inputHandler.setOnTap(this, async (x: number, y: number, double: boolean) => {
			if (this.isUsingBow)
				return;

			try {
				y = Math.max(this.minYForWalk, y);
				double = double && me.hasFeather();
				me.emit('will-move',x,y,double);
				this.moveMarker.show(x,y + 6 * OVERSAMPLE_FACTOR);
				await me.move(x,y,double);
				me.emit('did-move',x,y,double);
			}
			catch (e) {}
		});
	}

	setConvoMode() {
		this.setInputMode(InputMode.Convo);
		this.hud.cursor.setNormal();
		this.inputHandler.setOnTap(this, async () => {
			if (this.inputMode === InputMode.Convo)
				this.convo.next();
		});
	}

	async exitScene(exitName: string) {
		// this.me.isExitingScene = true;

		// if (Globals.DO_CIRCLE_TRANSITION)
			// await this.circleTransition.close();

		for(let r of this.getAllChildrenOfType(RedPiece)) {
			r.destroy();
		}

		for(let r of this.getAllChildrenOfType(Bird)) {
			r.destroy();
		}

		for(let r of this.getAllChildrenOfType(BadGuy)) {
			r.destroy();
		}

		audioManager.stopAllWithPath(AUDIO_BADGUY_BREATH);
		audioManager.stopAllWithPath(AUDIO_BADGUY_STEP);

		audioManager.stop(AUDIO_FOOTSTEPS);

		stateManager.set(STATE_LAST_EXIT, exitName);
		stateManager.set(STATE_LAST_SCENE, this.name);

		const game = this.game as MainGame;
    game.sceneMap.exit(this.name, exitName, this);
	}

	async startConversation(who: Character, config: ConversationConfig) {

		if (!config.handlers) {
			config.handlers = {};
		}
		
		this.setConvoMode();

		const speechBubble = new SpeechBubble(this,who.x(),who.y() - 75);
		speechBubble.getGameObject().depth = TOP_DEPTH;

		const result = await new Promise<string>( (resolve) => {

			const convo = new Conversation(this);
			this.convo = convo;

			convo.on('start', () => {
				this.cameras.main.zoomTo(1.05, 2000,'Expo.easeOut',true);
				console.log('starting conversation');
			});
			convo.on('text', (text, key, responses: any[]) => {
				if (typeof config.handlers[key] === 'function') {
					config.handlers[key](convo);
				}

				if (typeof responses !== 'undefined' && responses.length > 0) {
					this.setInputMode(InputMode.ConvoResponse);
				}
				if (typeof text !== 'undefined') {
					speechBubble.cancelled = true;
					speechBubble.show(who.x() + who.speechBubbleOffset.x, who.y() + who.speechBubbleOffset.y - who.getAnimationGameObject().height/2 * OVERSAMPLE_FACTOR / who.getScaleFactor(),text,responses).finally( () => {
						speechBubble.isReady = true;
					});
					if (speechBubble.y() - speechBubble.boxHeight/2 < 0) {
						this.cameras.main.pan(who.x(), (speechBubble.y() - speechBubble.boxHeight - 20) + (this.game.config.height as number)/2,2000,'Expo.easeOut', true);
					}
					else {
						this.cameras.main.pan(who.x(), who.y(),2000,'Expo.easeOut', true);
					}
				}
			});
			convo.on('end', async (value) => {
				await speechBubble.hide();
				this.setWalkMode();
				return resolve(value);
			});
			convo.start(config.convo);
			
			speechBubble.on('selected', (index) => {
				this.setInputMode(InputMode.Convo);
				this.convo.selectResponse(index);
			});
		});

		speechBubble.destroy();

		this.cameras.main.panEffect.reset();
		this.cameras.main.zoomEffect.reset();

		this.cameras.main.pan((this.game.config.width as number) / 2, (this.game.config.height as number) / 2,2000,'Expo.easeOut',true);
		this.cameras.main.zoomTo(1, 2000,'Expo.easeOut', true);

		return result;

	}
	
	async createSmokeCloud(xCenter,yCenter) {
		const numClouds = 10;

		const totalTime = 1200;

		audioManager.play(AUDIO_SMOKE_CLOUD);

		for(let k = 0; k < numClouds; k++) {
			const r = rand(0,10*OVERSAMPLE_FACTOR);
			const angle = rand(0, Math.PI*2);
			const x = xCenter + r*Math.cos(angle);
			const y = yCenter + r*Math.sin(angle);

			const img = this.add.sprite(x, y, 'smoke-cloud');
			const scale = 0.6 + 1/(r/OVERSAMPLE_FACTOR + 1.5); //rand( 0.2, 1/r );
			img.setScale(0.1);
			// img.setScale(scale*OVERSAMPLE_FACTOR);

			tweenPromise(this, img, {rotation : Math.PI*2}, totalTime);
			tweenPromise(this, img, {scaleX :scale, scaleY:scale}, 50).then( async () => {
				tweenPromise(this, img, {scaleX : 0.1, scaleY: 0.1, alpha : 0}, totalTime, 'Sine.easeIn');
				tweenPromise(this, img, {x : x + rand(-20,20), y: y + rand(-20,20)}, totalTime, 'Sine.easeIn');
	
			});
		}
	}

	async enterDoor(door: Door, exitName: string) {
		this.setInputMode(InputMode.Disabled);
		const me = this.me;
		await door.open();
		await me.walkTo(door.x(), door.y() - 10);
		door.getGameObject().depth = me.getGameObject().depth + 1;
		await door.close();
		me.alpha(0);
		await door.dissolve(door.x(), -10, { dissolveIn: false});
		this.exitScene(exitName);
	}

	setInputMode(mode: InputMode) {
		this.inputMode = mode;
	}

	pause() {
		console.log('pausing');
		this.setInputMode(InputMode.Disabled);
		const children = this.children.list;
		for(let c of children) {
			const obj = c['obj'];
			if (typeof obj !== 'undefined') {
				if (obj instanceof Animated) {
					obj.pauseAnimation();
					const tweens = this.tweens.getTweensOf(obj.getGameObject());
					for (let t of tweens) {
						t.pause();
					}
				}
			}
		}
	}

	resume() {
		console.log('resuming');
		this.setInputMode(InputMode.Walk);
		const children = this.children.list;
		for(let c of children) {
			const obj = c['obj'];
			if (typeof obj !== 'undefined') {
				if (obj instanceof Animated) {
					obj.resumeAnimation();
					const tweens = this.tweens.getTweensOf(obj.getGameObject());
					for (let t of tweens) {
						t.resume();
					}
				}
			}
		}
	}

	async showBadGuyEnterFromDoor(doorSpot: {x : number, y : number}) {
		const me = this.me;
		const door = new Door(this, doorSpot.x, doorSpot.y);
		door.depth(TOP_DEPTH-1);
		await door.dissolve(doorSpot.x, doorSpot.y, { dissolveIn: true});
		// this.showDoorBackground(door);
		const background = new DoorBackground(this);
		background.setDoor(door);
		const badguy = new BadGuy(this, doorSpot.x + 2*OVERSAMPLE_FACTOR, doorSpot.y - 3 * OVERSAMPLE_FACTOR);
		badguy.depth(door.depth()-1);
		// badguy.alpha(0);
		badguy.rest();
		badguy.static(false);
		badguy.sensor(true);
		badguy.invincible = true;
		// badguy.bringToTop();
		me.ignoreGravity(true);
		me.static(true);
		me.sensor(true);

		// await tweenPromise(this, badguy.getGameObject(), {alpha : 1}, 1000);
		await door.open();
		await sleep(1000);
		await badguy.walkTo(badguy.x(), badguy.y() + 10 * OVERSAMPLE_FACTOR, 15 * OVERSAMPLE_FACTOR);
		badguy.depth(TOP_DEPTH);
		door.depth(badguy.depth()-1);
		await door.close();
		background.destroy();
		this.createSmokeCloud(door.x(), door.y());
		door.destroy();
		return badguy;

	}

	makeRedPiece(x: number, y: number, pieceName: string) {
		const p = new RedPiece(this, x, y);
		p.onOverSetIcon(Cursor.handKey);
		p.on('selected', async () => {
			try {
				await this.me.pickUp(p);
				setPickUpRedPiece(this.name,pieceName);
				// p.destroy();
			}
			catch(e) {}
		});
		return p;
	}

	makeSoundWave(x: number, y: number) {
		const numParticles = 30;
		for(let k = 0; k < numParticles; k++) {
			this.cameras.main.shake(1000,0.006);
			sleep(rand(0,1000)).then( async () => {
				const p = makeParticle(this,x + rand(-30,30), y  + rand(-10,10));
				p.setAlpha(0.85);
				p.depth = TOP_DEPTH;
				const pulse = new TouchPulse(this,x,y);
				pulse.alpha(0.5);
				pulse.depth(TOP_DEPTH);
				Promise.all( [pulse.play(x,y, 50),
					tweenPromise(this, pulse.getGameObject(), {y : 0}, 1500)]).then( () => {
						pulse.destroy();
					});
				await tweenPromise(this, p, {y : 0, alpha : 0},1000);
				p.destroy();
			});

		}
	}

	getAllChildrenOfType<T>(type : { new (...args: any[]): T; }) {
		const ret : T[] = [];
		const children = this.children.list;
		for(let c of children) {
			const obj = c['obj'];
			if (typeof obj !== 'undefined') {
				if (obj instanceof type) {
					ret.push(obj);
				}
			}
		}
		return ret;
	}

	update() {
		try {
			const me = this.me;
			me.depth(me.y() + 6 * OVERSAMPLE_FACTOR);
			this.control.x(me.x() - BowControl.width/2);
			this.control.y(me.y() - BowControl.height/2);

			this.bow.x(me.x());
			this.bow.y(me.y());

			this.tmpContainer.x = me.x()-this.areaSize[0]/2;
			this.tmpContainer.y = me.y()-this.areaSize[1]/2;
			// console.log(me.getGameObject().depth);
		}
		catch(e) {
			// console.log(e);
		}
	}

}