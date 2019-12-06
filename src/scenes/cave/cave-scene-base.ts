'use strict';

import * as Phaser from 'phaser';
import { LINE_COLOR, tweenPromise, OVERSAMPLE_FACTOR, sleep, TOP_DEPTH, BG_COLOR, InputMode, didPickUpRedPiece, AUDIO_CAVE, rand, AUDIO_BADGUY_SNORE, AUDIO_BADGUY_SCREAM } from '../../globals';
import { Acorn } from '../../objects/items/acorn';
import { Cursor } from '../../objects/overlays/cursor';
import { LeftRightExitScene } from '../left-right-exit-scene';
import { BadGuy } from '../../objects/characters/bad-guy';
import { Guy } from '../../objects/characters/guy';
import { Torch } from '../../objects/items/torch';
import { audioManager } from '../../utils/audio-manager';

export class CaveSceneBase extends LeftRightExitScene {
	light: Phaser.GameObjects.Graphics;
	darkness: Phaser.GameObjects.Graphics;
	maskContainer: Phaser.GameObjects.Container;
	swellTimer: Phaser.Time.TimerEvent;
	
	constructor() {
		super();
	}

	preload() {
		super.preload();
		Acorn.loadResources(this);
		BadGuy.loadResources(this);
		Torch.loadResources(this);
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		const darkness = this.add.graphics();
		darkness.fillStyle(LINE_COLOR, 1);
		darkness.fillRect(0,0,this.game.config.width as number, this.game.config.height as number);
		darkness.setDepth(TOP_DEPTH-1);
		
		const light = this.make.graphics({}, false);
		light.fillStyle(BG_COLOR, 0.5);
		light.fillCircle(0,0,65);
		light.fillStyle(BG_COLOR, 1);
		light.fillCircle(0,0,50);
		light.x = 100; light.y = 100;
		this.light = light;
		
		let goIn = false;
		const time = 750;
		this.swellTimer = this.time.addEvent({
			callback : () => {
				tweenPromise(this, light, {scale : goIn ? 1 : 1.2}, time);
				goIn = !goIn;
			},
			callbackScope : this,
			loop: true,
			delay : time
		});

		let maskContainer = this.make.container({x : 0, y : 0, add: false});
		this.maskContainer = maskContainer;
		
		let mask = new Phaser.Display.Masks.BitmapMask(this, maskContainer);
		mask.invertAlpha = true;
		
		darkness.setMask(mask);

		maskContainer.add(light);
		this.darkness = darkness;
		
		for (let p in this.sceneLoader.exits) {
			const point = this.sceneLoader.exits[p];
			if (point.type === 'bad-guy' && !didPickUpRedPiece(this.name,p)) {
				this.makeBadGuy(point,p);
			}
		}

		const sceneWidth = this.game.config.width as number;

		const lightTorch = async (torch: Torch) => {
			if (torch.isLit)
				return;
			
			try {
				await me.walkTo(torch.x(), torch.y());
				torch.isLit = true;
				torch.playAnimation('play');
				torch.emit('lit');
				torch.removeOverSetIcon();
				const lightWidth = sceneWidth*2;
				const light = this.make.graphics({}, false);
				light.fillStyle(0xff0000, 0.5);
				light.fillRect(-lightWidth/2,0,lightWidth,this.game.config.height as number);
				light.x = torch.x(); light.y = 0;
				this.maskContainer.add(light);
			}
			catch(e) {}
		};

		const torches = this.getAllChildrenOfType(Torch);
		for(let t of torches) {
			t.on('selected', () => {
				lightTorch(t);
			});
		}

	}

	makeBadGuy(point, name: string) {
		const badguy = new BadGuy(this, point.x, point.y);
		badguy.invincible = true;
		sleep(rand(0,1000)).then( () => {
			badguy.sleep();
		});
		badguy.static(true);
		badguy.onOverSetIcon(Cursor.questionKey);
		badguy.on('selected', (x,y,double) => {
			try {
				this.me.move(x,y,double);
			} catch(e) {}
		});
		badguy.on('red-piece', (x,y) => {
			const redPiece = this.makeRedPiece(x,y,name);
			redPiece.getGameObject().setVelocityY(-7);
		});
		badguy.updateBody(15*OVERSAMPLE_FACTOR,3*OVERSAMPLE_FACTOR,false);
		const body = badguy.getGameObject().body as any;
		body.position.y -= 30;

		// this.time.addEvent({
		// 	callback: () => {
				badguy.static(false);
				badguy.getGameObject().setVelocity(0);
		// 	},
		// 	callbackScope : this,
		// 	loop : false,
		// 	delay : 1000
		// });
		// setTimeout( () => {
		// }, 1000);

		badguy.setContactHandler(Guy, async (guy: Guy) => {
			console.log('HIT HEEEEEM');
			guy.cancelTweens();
			this.setInputMode(InputMode.Disabled);

			if (guy.x() > badguy.x()) {
				guy.faceRight();
			}
			guy.x(badguy.x() + (guy.x() > badguy.x() ? 1 : -1) * 20 * OVERSAMPLE_FACTOR);
			guy.y(badguy.y() + 1 * OVERSAMPLE_FACTOR);
			guy.playAnimation('rest');
			guy.getGameObject().setVelocity(0);
			await this.wakeBadGuy(badguy);
			await tweenPromise(this, this.light, {scaleX : 0, scaleY : 0}, 500);
			this.exitScene('exit');
		});
		return badguy;
	}

	async showPickup(itemName: string, value?: number) {
		await this.hud.showPickup(itemName, value, true);
	}

	async expandLight(to:number) {
		this.swellTimer.remove();
		const tweens = this.tweens.getTweensOf(this.light);
		for (let t of tweens) {
			t.stop();
		}
		await tweenPromise(this, this.light, {scaleX : to, scaleY : to}, 200);
	}

	async wakeBadGuy(badguy: BadGuy) {
		this.expandLight(6);
		audioManager.stop(badguy.snoreSoundKey,100);
		await badguy.playAnimation('wake');
		badguy.rest();
		await sleep(300);
		badguy.faceRight();
		audioManager.play(AUDIO_BADGUY_SCREAM);
		await badguy.playAnimation('cry-start');
		badguy.playAnimation('cry');
		await sleep(700);
		this.cameras.main.shake(1000,0.01, true);
		badguy.invincible = false;
	}

	async exitScene(name) {
		if (name === 'exit')
			audioManager.stop(AUDIO_CAVE);
		await super.exitScene(name);
	}

	update() {
		super.update();
		try {
			this.light.x = this.me.x() + 4 * OVERSAMPLE_FACTOR * (this.me.getGameObject().scaleX > 0 ? 1 : -1);
			this.light.y = this.me.y() - 5 * OVERSAMPLE_FACTOR;
		}
		catch(e) {}
	}

}