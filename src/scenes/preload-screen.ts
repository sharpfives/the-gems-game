'use strict';

import * as Phaser from 'phaser';
import * as Globals from '../globals';
import { MainGame } from '../main-game';
import { stateManager } from '../utils/game-state-manager';

export class PreLoadScreen extends Phaser.Scene {

	private isLoading = false;

  constructor() {
    super("");
  }

  preload() {
    // this.load.image('loading-screen', 'resources/images/scenes/loading screen.png');
		this.load.json('master-map', 'resources/config/master-map.json');
  }

  create() {

    const game = this.game as MainGame;
    const mapData = this.cache.json.get('master-map');
    // console.log(JSON.stringify(mapData));
		game.sceneMap.setup(mapData);
		
  }

  update() {

		const game = this.game as MainGame;

    if (!this.isLoading) {
			this.isLoading = true;
			if (Globals.PRODUCTION_MODE) {
				const currentScene = stateManager.get(Globals.STATE_CURRENT_SCENE);
				const currentExit = stateManager.get(Globals.STATE_CURRENT_EXIT);

				if (!this.sys.game.device.browser.chrome) {
					game.sceneMap.loadScene('Unsupported','start',this);
				}
				else if (stateManager.get(Globals.STATE_DID_START_GAME) && 
					(Globals.SHOW_RESUME )) {
					game.sceneMap.loadScene('Resume','start',this);
				}
				else {
					game.sceneMap.loadScene('Start','intro',this);
				}

			}
			else {

				// game.sceneMap.loadScene('Resume','start',this);

				// game.sceneMap.loadScene('Jumpy','start',this);
				// game.sceneMap.loadScene('HangerDrag','left',this);

				// game.sceneMap.loadScene('SingleHostage','left',this);
				// game.sceneMap.loadScene('Hanger','left',this);
				// game.sceneMap.loadScene('Hostage','left',this);

				// game.sceneMap.loadScene('Stream','left',this);
				// game.sceneMap.loadScene('Start','left',this);
				// game.sceneMap.loadScene('AcornTree','left',this);
				// game.sceneMap.loadScene('Swing','left',this);
				// game.sceneMap.loadScene('Squirrel','left',this);

				// game.sceneMap.loadScene('Ending','start',this);

				// game.sceneMap.loadScene('Camper','left',this);
				// game.sceneMap.loadScene('ProtectStart','start',this);
				// game.sceneMap.loadScene('Protect1','left',this);

				// game.sceneMap.loadScene('Chase','start',this);

				// game.sceneMap.loadScene('Cave','start',this);
				// game.sceneMap.loadScene('Cave2','right',this);
				// game.sceneMap.loadScene('Cave3','right',this);
				// game.sceneMap.loadScene('CaveFront','right',this);

				// game.sceneMap.loadScene('Spirit','start',this);
				// game.sceneMap.loadScene('Training','start',this);


				// game.sceneMap.loadScene('BirdPowerline','right',this);
				// game.sceneMap.loadScene('SwampMushroom','right',this);
				// game.sceneMap.loadScene('SimpleLine','right',this);
				game.sceneMap.loadScene('Boss','left',this);
				// game.sceneMap.loadScene('BirdPosts','right',this);

				// game.sceneMap.loadScene('Witch','right',this);


			}

    }
    else {

    }
  }
}
