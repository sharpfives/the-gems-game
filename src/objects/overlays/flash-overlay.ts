import { EventEmitter } from "events";
import { tweenPromise, TOP_DEPTH, OVERSAMPLE_FACTOR, LINE_COLOR } from "../../globals";

export class FlashOverlay extends EventEmitter {
	scene: Phaser.Scene;
	container: Phaser.GameObjects.Container;
	
  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    let s = this.scene.add.container(0,0);
		s.setScrollFactor(0);
		s.depth = TOP_DEPTH - 1;
    this.container = s;

    let graphics = scene.add.graphics();
    graphics.fillStyle(0xFFFFFF,1);
		graphics.fillRect(0,0,scene.game.config.width as number,scene.game.config.height as number);
		graphics.alpha = 1;
		s.add(graphics);

		this.container.alpha = 0;
  }

  async show(time?: number) {
		this.container.alpha = 0.4;
		await tweenPromise(this.scene, this.container, { alpha : 0 }, 1000);
  }

}
