import { OVERSAMPLE_FACTOR, makeParticle, tweenPromise, rand, RED_COLOR, sleep } from "../../globals";
import { PhysicsObject } from "../physics-object";


export class Laser extends PhysicsObject {

	graphics: Phaser.GameObjects.Graphics;

	constructor(scene: Phaser.Scene) {
		super(scene, 0, 0, "particle");
		this.updateBody(10/OVERSAMPLE_FACTOR,10,false);
	}

	initGameObject(x: number, y : number, name : string, params?) {
		super.initGameObject(x,y,name);
		const g = this.scene.add.graphics();
		g.fillStyle(RED_COLOR, 1);
		this.container.add(g);
		this.graphics = g;
	}

	async start() {

		const g = this.graphics;
		const width = 10;
		const height = 10 * OVERSAMPLE_FACTOR;
		g.fillRect(-width/2,-height/2,width,height);

		let toScale = 200;
		const timer = this.scene.time.addEvent({
			callback: async () => {

				const newWidth = width * this.getGameObject().scaleX;
				const p = makeParticle(this.scene,this.x() + newWidth*rand(-1,1)/2,this.y() - height/2);
				p.setTint(RED_COLOR);
				p.setAlpha(0.75);
				p.setScale(OVERSAMPLE_FACTOR * rand(1,2));
				await tweenPromise(this.scene, p, {alpha : 0, scale: 0, y : this.y() - 100}, rand(100,500));
				p.destroy();

				// for (let i = 0; i < 20; i++) {
				// 	const particle = makeParticle(this.scene,background.x - doorWidth/2 + rand(-doorWidth/4,doorWidth/4), background.y + rand(-doorHeight/2,doorHeight/2));
				// 	particle.setScale(3);
				// 	particle.setTint(BG_COLOR);
				// 	particle.depth = background.depth + 1;
				// 	tweenPromise(this.scene, particle, { x : particle.x + doorWidth }, 200).then( () => {
				// 		particle.destroy();
				// 	});
				// }
			},
			callbackScope : this,
			loop : true,
			delay : 50
		});

		const originalX = this.x();
		const originalScale = this.getGameObject().scaleX;
		// const time = 50;

		const time = 100;
		this.scene.cameras.main.shake(1500,0.01,true);
		await tweenPromise(this.scene, this.getGameObject(), {x : originalX - originalScale  * width * toScale/2, scaleX : originalScale * toScale, scaleY : 1}, time);
		await sleep(1500);
		await tweenPromise(this.scene, this.getGameObject(), {x : originalX, scaleX : 0, scaleY: 0.5}, 100);
		timer.remove();
	}


	destroy() {
		super.destroy();
	}
}