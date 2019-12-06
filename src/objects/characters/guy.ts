import { Animated } from "../animated";
import { FrameRateData, OVERSAMPLE_FACTOR, tweenPromise, rand, AUDIO_FOOTSTEPS, AUDIO_FOREST, sleep, ITEM_ACORN, ITEM_RED_PIECE, ITEM_MUSHROOM, STATE_ITEMS, STATE_NUM_ITEM_MAP, ITEM_FEATHER, ITEM_BOW, ITEM_SHELL, InputMode, AUDIO_PICK_UP } from "../../globals";
import { Character } from "./character";
import { ChaseRock } from "../items/chase-rock";
import { MoveableObject } from "../moveable-object";
import { audioManager } from "../../utils/audio-manager";
import { GroundAcorn } from "../items/acorn-ground";
import { Acorn } from "../items/acorn";
import { Mushroom } from "../items/mushroom";
import { RedPiece } from "../items/red-piece";
import { stateManager } from "../../utils/game-state-manager";
import { SceneBase } from "../../scenes/scene-base";

export class Guy extends Character {
	private intents: Promise<any>[] = [];
	thingsPickedUp: Set<MoveableObject> = new Set<MoveableObject>();

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,'guy');
		const sprite = this.getGameObject();
		sprite.setBody({
			type: 'rectangle',
      width: 10*1,
      height: 10*1
		}, {

		});
		// this.setupMouseEvents(new Phaser.Geom.Rectangle(
		// 	-5,-5,10,10
		// ));

		// this.updateBody(10,10,true);
		sprite.setIgnoreGravity(true);
		sprite.setStatic(true);
		sprite.setSensor(true);

		sprite.setScale(OVERSAMPLE_FACTOR);
		this.setRepeat('rest');
		this.setRepeat('walk');
		this.setRepeat('run');
		this.setRepeat('walk-fast');
		// this.setRepeat('walk-backwards');

	}

	async stepBackwards() {
		const time = 5 * 1000/ 15;
		const numSteps = 4;
		for(let k = 0; k < numSteps; k++) {
			this.playAnimation('walk-backwards');
			await tweenPromise(this.scene, this.getGameObject(), {x : this.x() - 3 * OVERSAMPLE_FACTOR}, time);
			await sleep(500);
		}
	}

	incrementItem(label: string) {
		const items = stateManager.get(STATE_ITEMS) as string[];
		if (items.indexOf(label) < 0)
			items.push(label);
		const itemAmounts = stateManager.get(STATE_NUM_ITEM_MAP, {}) as {};
		itemAmounts[label] = (itemAmounts[label] || 0);
		itemAmounts[label]++;
		
		stateManager.save();
	}

	hasBow() {
		const items = stateManager.get(STATE_ITEMS) as string[];
		return items.indexOf(ITEM_BOW) >= 0;
	}

	hasShell() {
		const items = stateManager.get(STATE_ITEMS) as string[];
		return items.indexOf(ITEM_SHELL) >= 0;
	}

	hasFeather() {
		const items = stateManager.get(STATE_ITEMS) as string[];
		return items.indexOf(ITEM_FEATHER) >= 0;
	}

	async shrug() {
		await this.playAnimation('shrug');
		await sleep(400);
		await this.playAnimation('shrug',true);
	}

	async pickUp(thing: MoveableObject) {
		const map = {
			[GroundAcorn.name] : ITEM_ACORN,
			[Acorn.name] : ITEM_ACORN,
			[RedPiece.name] : ITEM_RED_PIECE,
			[Mushroom.name] : ITEM_MUSHROOM
		};
		const label = map[thing.name];
		if (typeof label === 'undefined') {
			console.log('unable to pick object ' + thing.name);
			return;
		}

		if (this.thingsPickedUp.has(thing)){
			return;
		}

		// try {
			await this.walkTo(thing.x()-20, thing.y()-20);
			this.thingsPickedUp.add(thing);
			(this.scene as SceneBase).setInputMode(InputMode.Disabled);
			this.faceRight();
			await this.playAnimation('kneel');
			audioManager.play(AUDIO_PICK_UP);
			await sleep(300);
			this.incrementItem(label);
			this.emit('picked-up', label);
			thing.destroy();
			await this.playAnimation('kneel',true);
			this.playAnimation('rest');
			(this.scene as SceneBase).setInputMode(InputMode.Walk);
		// }
		// catch (e) {}
	}

	async die() {
		audioManager.stop(AUDIO_FOOTSTEPS);
		this.cancelTweens();
		this.getGameObject().setVelocity(0);
		await this.playAnimation('die');
		await this.playAnimation('kneel-fall-down');
	}

	async swing() {
		const sprite = this.getGameObject();
		await this.playAnimation('swing');
		sprite.applyForce(new Phaser.Math.Vector2(0.01,0));
		await sleep(300);
		await this.playAnimation('swing',true);
		this.playAnimation('swing-rest');
	}

	async sing(numTimes?: number, left?: boolean) {
		if (typeof numTimes === 'undefined') {
			numTimes = 1;
		}
		if (typeof left === 'undefined') {
			left = true;
		}
		for(let i = 0; i < numTimes; i++) {
			const note = this.scene.add.image(this.x(), this.y() - 5 * OVERSAMPLE_FACTOR, 'music-note');
			note.setScale(0.6);
			tweenPromise(this.scene, note, {x : note.x + (left ? -1 : 1) * rand(40,70), y: note.y - rand(50,70)}, 1500, "Sine.easeIn");
			sleep(750).then( () => {
				tweenPromise(this.scene, note, {alpha : 0}, 750);
			});
			await sleep(1000);
		}
	}

	async move(x: number, y: number, double: boolean) {
		if (double) {
			await this.runTo(x,y);
		}
		else {
			await this.walkTo(x,y);
		}
	}

	async walkTo(x: number, y: number, speed?: number) {
		this.playAnimation('walk');
		audioManager.play(AUDIO_FOOTSTEPS);
		await super.moveTo(x, y, speed);
		audioManager.stop(AUDIO_FOOTSTEPS,100);
		this.playAnimation('rest');
	}

	async runTo(x: number, y: number) {
		this.playAnimation('walk-fast');
		await super.runTo(x,y);
		this.playAnimation('rest');
	}

	faceLeft() {
    this.getGameObject().setScale(-OVERSAMPLE_FACTOR,OVERSAMPLE_FACTOR);
  }

  faceRight() {
    this.getGameObject().setScale(OVERSAMPLE_FACTOR,OVERSAMPLE_FACTOR);
	}

	isFacingRight() {
    return this.getGameObject().scaleX > 0;
	}

	// cancelIntents() {
	// 	for (let p of this.intents) {
	// 		Promise.c
	// 	}
	// }
	
	protected getFrameRateData() : FrameRateData {
		return {
			walk : 15,
			'run-stop' : 10,
			'walk-fast' : 20
		};
	}

	getScaleFactor() {
		return 1;
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.image('music-note','resources/images/scenes/swing/music-note-single.png');
		scene.load.json('guy','resources/guy.json');
		scene.load.spritesheet('guy','resources/guy.png', { frameWidth : 50 * 1, frameHeight : 50 * 1});
	}
}