import { PhysicsObject } from "../physics-object";
import { OVERSAMPLE_FACTOR, LINE_COLOR } from "../../globals";


export class Particle extends PhysicsObject {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,'particle');

		this.updateBody(1,1);
		const sprite = this.getGameObject();
		// sprite.setBody({
		// 	type: 'rectangle',
    //   width: 1,
    //   height: 1
		// }, {

		// });
		sprite.setTint(LINE_COLOR);
		sprite.setIgnoreGravity(false);
		sprite.setSensor(false);
		sprite.setScale(OVERSAMPLE_FACTOR);
		sprite.setBounce(0.5);
	}

	loadResources(scene: Phaser.Scene) {
		scene.load.image('particle', 'resources/square-particle-1x1.png')
	}

	getScaleFactor() {
		return 1;
	}
}