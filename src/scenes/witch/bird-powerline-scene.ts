'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { tweenPromise, sleep, OVERSAMPLE_FACTOR, LINE_COLOR, InputMode, didKillBird, setDidKillBird, didPickUpRedPiece, DEBUG_SCENE, STATE_LAST_SCENE, STATE_LAST_EXIT, AUDIO_BIRD_FLY } from '../../globals';
import { Rope } from '../../objects/rope';
import { RopePiece } from '../../objects/rope-piece';
import { Bird } from '../../objects/characters/bird';
import { Arrow } from '../../objects/arrow';
import { Guy } from '../../objects/characters/guy';
import { MainGame } from '../../main-game';
import { stateManager } from '../../utils/game-state-manager';
import { audioManager } from '../../utils/audio-manager';

export class BirdPowerlineScene extends LeftRightExitScene {
	rope1: Rope;
	rope2: Rope;

	preload() {
		super.preload();
		Bird.loadResources(this);
		Rope.loadResources(this);
		RopePiece.loadResources(this);

		if (DEBUG_SCENE) {
			setDidKillBird(this.name, 'bird',false);
		}
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		const p1 = this.sceneLoader.exits['rope1'];
		const p2 = this.sceneLoader.exits['rope2'];
		const p3 = this.sceneLoader.exits['rope3'];
		const p4 = this.sceneLoader.exits['rope4'];

		{
			const rope = new Rope(this);
			const endPt = this.matter.add.image(p1.x,p1.y,'particle');
			endPt.setIgnoreGravity(true);
			endPt.setStatic(true);
			endPt.setTint(LINE_COLOR);
			rope.attach(p4.x,p4.y,endPt);
			this.rope1 = rope;
		}

		{
			const rope = new Rope(this);
			rope.on('cut', async () => {
				if (didKillBird(this.name, birdName))
					return;
				try {
					bird.playAnimation('fly-away');
					bird.detach(pieceToAttach);
					bird.ignoreGravity(true);
					await tweenPromise(this, bird.getGameObject(), {y : bird.y() - 10 * OVERSAMPLE_FACTOR}, 2000);
					await sleep(500);
					bird.playAnimation('fly-in');
					await bird.moveTo(me.x(), me.y(),70 * OVERSAMPLE_FACTOR);
				}
				catch(e) {}
			});
			const endPt = this.matter.add.image(p2.x,p2.y,'particle');
			endPt.setIgnoreGravity(true);
			endPt.setStatic(true);
			endPt.setTint(LINE_COLOR);
			rope.attach(p3.x,p3.y,endPt);
			this.rope2 = rope;

			let bird: Bird;
			const birdName = 'bird';
			const pieceToAttach = rope.parts[Math.round(rope.parts.length/4)];

			if (didKillBird(this.name, birdName)) {
				if (!didPickUpRedPiece(this.name,birdName)) {
					const p = this.makeRedPiece(pieceToAttach.x(), 80* OVERSAMPLE_FACTOR, birdName);
					p.ignoreGravity(true);
					p.sensor(true);
				}
			}
			else {
				bird = new Bird(this, pieceToAttach.x(),pieceToAttach.y());
				bird.setContactHandler(Arrow, async (arrow) => {
					bird.isDead = true;
					setDidKillBird(this.name,birdName);
					arrow.destroy();
					bird.breakIntoParticles();
					await sleep(100);
					bird.destroy();
				});
				bird.setContactHandler(Guy, async (guy) => {
					if (bird.isDead)
						return;
					this.setInputMode(InputMode.Disabled);
					await guy.die();
					bird.destroy();
					await this.me.dissolve(this.me.x(), -10, { dissolveIn: false});
					const lastSceneName = stateManager.get(STATE_LAST_SCENE);
					const lastExitName = stateManager.get(STATE_LAST_EXIT);
					(this.game as MainGame).sceneMap.loadScene(lastSceneName,lastExitName,this);
				});
				bird.on('red-piece', (x,y) => {
					this.makeRedPiece(x,y,birdName);
				});
				bird.getGameObject().setFixedRotation();
				bird.static(false);
				bird.ignoreGravity(false);
				bird.sensor(true);
				bird.getGameObject().setMass(0.00001);
				bird.attach(pieceToAttach, {x : 0, y : -20});
			}
		}

		const sceneWidth = this.game.config.width as number
		this.matter.add.rectangle(sceneWidth/2, 80 * OVERSAMPLE_FACTOR, sceneWidth, 10, { isStatic: true });

	}

	async exitScene(name) {
		audioManager.stopAllWithPath(AUDIO_BIRD_FLY);
		await super.exitScene(name);
	}

	update() {
		try {
			super.update();
			this.rope1.update();
			this.rope2.update();
		} catch(e) {}
	}


}