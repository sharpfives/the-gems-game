'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { OVERSAMPLE_FACTOR, InputMode, didKillBird, didPickUpRedPiece, setDidKillBird, tweenPromise, sleep, DEBUG_SCENE, setNumOfItem, ITEM_BOW, STATE_LAST_SCENE, STATE_LAST_EXIT } from '../../globals';
import { Bird } from '../../objects/characters/bird';
import { Arrow } from '../../objects/arrow';
import { Guy } from '../../objects/characters/guy';
import { MainGame } from '../../main-game';
import { stateManager } from '../../utils/game-state-manager';
import { Mushroom } from '../../objects/items/mushroom';

export class BirdPostsScene extends LeftRightExitScene {
	birds: Bird[];
	birdsAttacking = false;
	isGuyDead = false;

	preload() {
		super.preload();
		Bird.loadResources(this);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_BOW,1);
		}
	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		const birds : Bird[] = [];
		this.birds = birds;
		for(let name in this.sceneLoader.exits) {
			const point = this.sceneLoader.exits[name];
			if (point.type !== 'bird')
				continue;

			if (didKillBird(this.name, name)) {
				if (!didPickUpRedPiece(this.name,'bird' + name)) {
					const p = this.makeRedPiece(point.x, 80 * OVERSAMPLE_FACTOR,'bird' + name);
					p.ignoreGravity(true);
					p.sensor(true);
				}
				continue;
			}
			const bird = new Bird(this, point.x, point.y);
			birds.push(bird);
			bird.setContactHandler(Arrow, (arrow) => {
				setDidKillBird(this.name, name);
				arrow.destroy();
				bird.breakIntoParticles();
				bird.destroy();
				birds.splice(birds.indexOf(bird),1);
			});
			bird.setContactHandler(Guy, async (guy) => {
				if (this.isGuyDead) {
					return;
				}
				this.isGuyDead = true;
				this.setInputMode(InputMode.Disabled);
				await guy.die();
				await this.hud.circleTransition.close();
				const lastSceneName = stateManager.get(STATE_LAST_SCENE);
				const lastExitName = stateManager.get(STATE_LAST_EXIT);

				for(let bird of this.birds) {
					bird.destroy();
				}
				(this.game as MainGame).sceneMap.loadScene(lastSceneName,lastExitName,this);
				// (this.game as MainGame).sceneMap.loadScene('Spirit','died',this);
			});
			bird.on('red-piece', (x,y) => {
				this.makeRedPiece(x,y,'bird' + name);
			});
			bird.getGameObject().setFixedRotation();
			bird.static(false);
			bird.ignoreGravity(true);
			bird.sensor(true);
			bird.getGameObject().setMass(0.00001);
		}
		
		const sceneWidth = this.game.config.width as number
		this.matter.add.rectangle(sceneWidth/2, 80 * OVERSAMPLE_FACTOR, sceneWidth, 10, { isStatic: true });

	}

	async attackBirds() {
		for(let bird of this.birds) {
			bird.playAnimation('fly-away');
			bird.ignoreGravity(true);
			await tweenPromise(this, bird.getGameObject(), {y : bird.y() - 5 * OVERSAMPLE_FACTOR}, 200);
			await sleep(400);
			await bird.moveTo(this.me.x(),this.me.y(), 100 * OVERSAMPLE_FACTOR);
		}
	}

	update() {
		try {
			super.update();
			if (this.me.x() < 100 * OVERSAMPLE_FACTOR && !this.birdsAttacking) {
				this.birdsAttacking = true;
				this.attackBirds();
			}
		} catch(e) {}
	}


}