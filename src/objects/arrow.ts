import { MoveableObject } from "./moveable-object";
import { PhysicsObject } from "./physics-object";
import { tweenPromise, OVERSAMPLE_FACTOR, LINE_COLOR, rand, makeParticle } from "../globals";
import { Rope } from "./rope";


export class Arrow extends PhysicsObject {
	particleTimer: Phaser.Time.TimerEvent;

	constructor(public scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Arrow.name);

		this.x(x); this.y(y);
		this.updateBody(8,1);
		this.sensor(true);
		this.static(false);
		this.ignoreGravity(true);

	}

	async shoot(angle: number) {
		const mag = 350*OVERSAMPLE_FACTOR;
		this.getGameObject().rotation = angle;

		this.particleTimer = this.scene.time.addEvent({
			callbackScope : this,
			callback: () => {
				const startX = this.x();
				const startY = this.y();
				const variance = 7 * OVERSAMPLE_FACTOR;
				const particle = makeParticle(this.scene, startX, startY);
				particle.setAlpha(0.7);
				tweenPromise(this.scene, particle, {scaleX : 0, scaleY : 0, x : startX + rand(-variance,variance), y : startY + rand(-variance,variance), alpha : 0}, 1000).then( () => {
					particle.destroy();
				});
			},
			loop: true,
			startAt:0,
			delay: 10
		});

		const time = 1.75 * mag / OVERSAMPLE_FACTOR;
		await tweenPromise(this.scene, this.getGameObject(), {x : this.x() + mag*Math.cos(angle), y : this.y() + mag*Math.sin(angle)}, time);
		this.particleTimer.remove();
	}


	static resourceName() {
		return 'arrow';
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.image(Arrow.name, 'resources/arrow.png');
	}
	
	destroy() {
		this.particleTimer.remove();
		super.destroy();
	}
}