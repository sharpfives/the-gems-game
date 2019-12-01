import { MoveableObject } from "../moveable-object";
import { Door } from "../items/door";
import { LINE_COLOR, OVERSAMPLE_FACTOR, makeParticle, BG_COLOR, tweenPromise, rand, RED_COLOR } from "../../globals";


export class DoorBackground extends MoveableObject {

	graphics: Phaser.GameObjects.Graphics;
	timer: Phaser.Time.TimerEvent;

	constructor(scene: Phaser.Scene) {
		super(scene, 0, 0, DoorBackground.name);
	}

	protected initGameObject(x: number, y : number, name : string) {
		const g = this.scene.add.graphics();
		g.fillStyle(LINE_COLOR, 1);
		this.graphics = g;
	}

	setDoor(door: Door) {
		const background = this.graphics;
		const doorWidth = 14*OVERSAMPLE_FACTOR; const doorHeight = 24*OVERSAMPLE_FACTOR;
		background.fillRect(-doorWidth/2,-doorHeight/2,doorWidth,doorHeight);
		background.depth = door.depth() - 3;
		background.x = door.x() ;
		background.y = door.y() - 5 * OVERSAMPLE_FACTOR;

		const timer = this.scene.time.addEvent({
			callback: async () => {
				for (let i = 0; i < 20; i++) {
					const particle = makeParticle(this.scene,background.x - doorWidth/2 + rand(-doorWidth/4,doorWidth/4), background.y + rand(-doorHeight/2,doorHeight/2));
					particle.setScale(3);
					particle.setTint(BG_COLOR);
					particle.depth = background.depth + 1;
					tweenPromise(this.scene, particle, { x : particle.x + doorWidth }, 200).then( () => {
						particle.destroy();
					});
				}
			},
			callbackScope : this,
			loop : true,
			delay : 100
		});
		this.timer = timer;
	}

	getGameObject() {
		return this.graphics;
	}

	destroy() {
		if (typeof this.timer !== 'undefined') {
			this.timer.remove();
		}
		super.destroy();
	}
}