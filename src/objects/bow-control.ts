import { MoveableObject } from "./moveable-object";
import { LINE_COLOR, BG_COLOR, OVERSAMPLE_FACTOR } from "../globals";

export class BowControl extends MoveableObject {
	container: Phaser.GameObjects.Container;
	button: Phaser.GameObjects.Graphics;
	static width: number = 200 * OVERSAMPLE_FACTOR;
	static height: number = 200 * OVERSAMPLE_FACTOR;
	static angleMax: number = 60 * Math.PI / 180;
	xStart: number;
	yStart: number;
	constructor(public scene : Phaser.Scene, x : number,y : number) {
		super(scene,x,y,'');

		const height = BowControl.height;
		const width = BowControl.width;

		const container = scene.add.container(x,y);
		// container.setScale(OVERSAMPLE_FACTOR);
		this.container = container;

		// const g = scene.add.graphics();
		// g.lineStyle(1, LINE_COLOR);
		// g.fillStyle(0xff0000, 0.2);
		// g.fillRect(0,0,width,height);
		// container.add(g);

		let isDown = false;

		const modAngle = (angle : number) => {
			if (angle < 0) {
				angle += 2*Math.PI;
			}
			if (angle < Math.PI / 2) { // left
				angle = Math.min(angle, BowControl.angleMax);
			} else if (angle > 3*Math.PI/2) { // left
				angle = Math.max(angle, 2*Math.PI - BowControl.angleMax);
			}
			else { // right
				// console.log('RIGHT');
				angle = Math.min(Math.max(angle, Math.PI - BowControl.angleMax),Math.PI + BowControl.angleMax);
			}
			return angle;
		};
		container.setInteractive( new Phaser.Geom.Rectangle(0,0,100000, 100000), Phaser.Geom.Rectangle.Contains)
				.on('pointerdown', (pointer, localX, localY, event) => {
				isDown = true;
				// xStart = localX;
				// yStart = localY;
				// console.log(`BOW START ${xStart} ${yStart}`);
				// pointer.event.stopPropagation();
				// this.emit('start');
			}).on('pointerup', (pointer, localX, localY, event) => {
				isDown = false;
				const xDiff = pointer.x - this.xStart;
				const yDiff = pointer.y - this.yStart;
				let angle = Math.atan2(yDiff, xDiff);
				angle = modAngle(angle);
				pointer.event.stopPropagation();

				this.emit('release', angle - Math.PI);
				container.disableInteractive();
				// container.setInteractive( new Phaser.Geom.Rectangle(0,0,width, height), Phaser.Geom.Rectangle.Contains);
			}).on('pointermove', (pointer, localX, localY, event) => {
				// if (isDown) {
					pointer.event.stopPropagation();

					const xDiff = pointer.x - this.xStart;
					const yDiff = pointer.y - this.yStart;
					const magnitude = Math.sqrt(xDiff*xDiff + yDiff+yDiff);
					let angle = Math.atan2(yDiff, xDiff);
					angle = modAngle(angle);

					// console.log(`xdiff = ${xDiff}, ydiff = ${yDiff}`);
					console.log(`BOW ANGLE ${angle * 180 / Math.PI}`);

					const maxMag = 20 * OVERSAMPLE_FACTOR;
					this.emit('change', angle - Math.PI, Math.min(1, magnitude / maxMag));
				// }
			});

			container.disableInteractive();
	}

	start(x : number,y : number) {
		this.xStart = x;
		this.yStart = y;
		this.emit('start');
		this.container.setInteractive(new Phaser.Geom.Rectangle(0,0,100000, 100000), Phaser.Geom.Rectangle.Contains);
	}

	getGameObject() {
		return this.container;
	}
}