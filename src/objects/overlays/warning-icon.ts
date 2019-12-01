import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, OVERSAMPLE_FACTOR, sleep } from "../../globals";


export class WarningIcon extends MoveableObject {
	container: Phaser.GameObjects.Container;

	constructor(scene: Phaser.Scene, x: number, y : number) {
		super(scene,x,y,'');
	}

	initGameObject(x: number, y : number, name: string) {
		const container = this.scene.add.container(x,y);
		// container.setScale(OVERSAMPLE_FACTOR);
		this.container = container;

		const triangleWidth = 20 * OVERSAMPLE_FACTOR;
		const triangleHeight = 15 * OVERSAMPLE_FACTOR;
		
		const g = this.scene.add.graphics();
		g.lineStyle(OVERSAMPLE_FACTOR, LINE_COLOR);
		g.strokeTriangle(-triangleWidth/2, triangleHeight/2, triangleWidth/2, triangleHeight/2, 0, -triangleHeight/2);

		const text = this.scene.add.bitmapText(2,10,'nokia-font','!',60);
		text.setOrigin(0.5);

		text.setTint(LINE_COLOR);
		text.setCenterAlign();

		container.add(g);
		container.add(text);
	}

	async flash(duration?: number) {
		if (!duration) {
			duration = 3000;
		}
		
		const interval = 300;
		const numFlashes = duration / interval;
		for(let k = 0; k < numFlashes; k++) {
			await sleep(interval/2);
			this.alpha(1);
			await sleep(interval/2);
			this.alpha(0);
		}

	}

	hide() {
		this.alpha(0);
	}

	getGameObject() {
		return this.container;
	}
}