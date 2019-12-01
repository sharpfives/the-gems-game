import { MoveableObject } from "./moveable-object";
import { CloudParticle } from "./cloud-particle";
import { rand, OVERSAMPLE_FACTOR } from "../globals";


export class SmokeVent extends MoveableObject {

	container : Phaser.GameObjects.Container;

  constructor(public scene : Phaser.Scene, x : number, y : number) {
		super(scene, x, y, '');
	}

	initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		container.setScale(OVERSAMPLE_FACTOR);
		this.container = container;
	}

	getGameObject() {
		return this.container;
	}

	start() {
		const delay = 400;
		setInterval( async () => {
			const c = new CloudParticle(this.scene, rand(-1,1), rand(-1,1), rand(4,10));
			this.container.add(c.getGameObject());
			await c.start();
			delete c.graphics;
		}, delay);
	}
}