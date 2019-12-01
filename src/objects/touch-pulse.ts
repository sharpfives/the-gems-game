import { MoveableObject } from "./moveable-object";
import { LINE_COLOR, sleep, OVERSAMPLE_FACTOR } from "../globals";

export class TouchPulse extends MoveableObject {

	graphics : Phaser.GameObjects.Graphics;

	constructor(public scene : Phaser.Scene, x : number,y : number) {
		super(scene,x,y,'pulse');

		const g = scene.add.graphics();
		// g.setAlpha(0.5);
		this.graphics = g;
	}

	public getGameObject() {
    return this.graphics;
	}
	
	public async play(x : number, y : number, size? : number) {
		const delay = 1000/15;
		const numIters = 22;
		const startR = 3 * OVERSAMPLE_FACTOR;
		const endR = (!size ? 10 * OVERSAMPLE_FACTOR : size * OVERSAMPLE_FACTOR);
		const g = this.graphics;
		g.x = x;
		g.y = y;
		for(let k = 0; k < numIters; k++) {
			const r = startR + (endR - startR) * k / numIters;
			g.clear();
			g.lineStyle(OVERSAMPLE_FACTOR* (1 - k/ numIters), LINE_COLOR, 1 - k / numIters);
			// g.strokeCircle(0,0,r);
			g.strokeEllipse(0,0,r, r/2);
			await sleep(delay);
		}
		g.clear();

	}
}