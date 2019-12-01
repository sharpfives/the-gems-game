import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, sleep } from "../../globals";
import { PhysicsObject } from "../physics-object";


export class Timer extends MoveableObject {

	private container: Phaser.GameObjects.Container;
	private graphics: Phaser.GameObjects.Graphics;
	physicsContainer: Phaser.GameObjects.GameObject;
	isStopped: boolean = false;;

	constructor(scene : Phaser.Scene, x : number, y : number, private size: number) {
		super(scene,x,y,Timer.name);
	}

	protected initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;

		// this.physicsContainer = this.scene.matter.add.gameObject(container, {});
		
		const g = this.scene.add.graphics();
		g.fillStyle(LINE_COLOR, 1);
		g.fillCircle(0,0,this.size/2);
		this.graphics = g;

		this.container.add(g);
	}

	async start(time?: number) {
		if (!time) {
			time = 5000;
		}
		this.isStopped = false;

		const updateInterval = 50;
		const numUpdates = Math.floor(time / updateInterval);
		const g = this.graphics;

		for (let k = 0; k < numUpdates; k++) {
			g.clear();
			g.fillStyle(LINE_COLOR, 1);
			g.slice(0,0,this.size/2,3 * Math.PI/2,3*Math.PI/2 + 2*Math.PI * k / numUpdates,true);
			g.fillPath();
			await sleep(updateInterval);
			if (this.isStopped) {
				throw 'stopped';
			}
		}

		g.clear();
		this.emit('done');
	}

	stop() {
		this.isStopped = true;
	}

	getGameObject() {
		return this.container;
	}

}