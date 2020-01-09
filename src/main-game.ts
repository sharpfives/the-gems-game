'use strict';

import * as Phaser from 'phaser';
import * as PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { SceneBase } from "./scenes/scene-base";
import { OVERSAMPLE_FACTOR, BG_COLOR, STATE_ITEMS, PRODUCTION_MODE, STATE_NUM_ITEM_MAP } from "./globals";
import { SceneMap } from "./utils/scene-map";
import { PreLoadScreen } from "./scenes/preload-screen";
import { ForestTestScene } from './sandbox/forest-test-scene';
import { CollisionTestScene } from './sandbox/collision-test-scene';
import { collisionManager } from './utils/collision-manager';
import { BirdTestScene } from './sandbox/bird-test-scene';
import { SceneBaseOld } from './sandbox/scene-base-old';
import { HangerTestScene } from './sandbox/hanger-test-scene';
import { stateManager } from './utils/game-state-manager';
import { HudScene } from './scenes/hud-scene';
import { CreditsScene } from './scenes/credits-scene';
import { UnsupportedScene } from './scenes/unsupported-scene';

export class MainGame extends Phaser.Game {

	public sceneMap: SceneMap;

  constructor() {
		super({
      width : 140 * OVERSAMPLE_FACTOR, 
      height : 105 * OVERSAMPLE_FACTOR, 
      type: Phaser.AUTO,
      parent : 'game-window',
      scene : [PreLoadScreen, HudScene, CreditsScene],
			backgroundColor : BG_COLOR,
			render :{
				pixelArt : true
			},
			physics: {
        default: 'matter',
        matter: {
          gravity: { y: 0.5 },
          debug: (PRODUCTION_MODE ? false : false)
        }
      },
      callbacks: {
        postBoot: function (game) {
          game.canvas.style.width = '100%';
          game.canvas.style.height = '100%';
        }
			},
			plugins: {
				scene: [
					{
						plugin: PhaserMatterCollisionPlugin, // The plugin class
						key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
						mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
					}
				]
			}
		});

		const sceneMap = new SceneMap(this);
		this.sceneMap = sceneMap;

    sceneMap.on('loaded-scene', (name, sceneType, sceneData) => {
      const s = this.scene.add(name, sceneType, false) as SceneBase;
      s.sceneData = sceneData;
			s.name = name;
		});

		stateManager.load();

		stateManager.get(STATE_ITEMS, []);
		stateManager.get(STATE_NUM_ITEM_MAP, {});
		
  }
}

window.addEventListener("load", () => {
	const game = new MainGame();
});
  