import { MoveableObject } from "./moveable-object";
import { LINE_COLOR, tweenPromise, OVERSAMPLE_FACTOR } from "../globals";


export class CloudParticle extends MoveableObject {

	graphics : Phaser.GameObjects.Graphics;

  constructor(public scene : Phaser.Scene, x : number, y : number, width : number) {
		super(scene,x,y,'');

		const g = scene.add.graphics();
		g.x = x;
		g.y = y;
		g.fillStyle(LINE_COLOR);
		g.fillCircle(0, 0, width/2);
		// g.scaleCanvas(OVERSAMPLE_FACTOR,OVERSAMPLE_FACTOR);
		this.graphics = g;
	}
	
	getGameObject() {
		return this.graphics;
	}

	async start() {
		this.graphics.setScale(0);

		const totalTime = 2000;
		const expandTime = 200;
		const swell = async () => {
			await tweenPromise(this.scene,this.graphics,{scaleX : 1, scaleY : 1},expandTime);
			await tweenPromise(this.scene,this.graphics,{scaleX : 0, scaleY : 0},totalTime - expandTime);
		};

		await Promise.all( [
			swell(),
			tweenPromise(this.scene,this.graphics,{y : this.y() - 20},totalTime)
		]);

		this.graphics.destroy();
	}
}