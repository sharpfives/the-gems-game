import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, sleep, OVERSAMPLE_FACTOR, tweenPromise } from "../../globals";

export class MoveMarker extends MoveableObject {

	graphics : Phaser.GameObjects.Graphics;

	constructor(public scene : Phaser.Scene, x : number,y : number) {
		super(scene,x,y,'move-marker');

		const g = scene.add.graphics();
		g.fillStyle(LINE_COLOR,1);
		g.fillCircle(0,0,2*OVERSAMPLE_FACTOR);
		g.scaleY = 0.5;
		// g.fillEllipse(0,0,3 * OVERSAMPLE_FACTOR,1.5 * OVERSAMPLE_FACTOR);
		g.alpha = 0;
		this.graphics = g;
	}

	public getGameObject() {
    return this.graphics;
	}
	
	public async show(x : number, y : number) {
		this.x(x);
		this.y(y);
		this.alpha(1);
		await tweenPromise(this.scene, this.getGameObject(), {alpha : 0}, 2500);
	}
}