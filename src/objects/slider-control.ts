import { MoveableObject } from "./moveable-object";
import { LINE_COLOR, BG_COLOR, OVERSAMPLE_FACTOR } from "../globals";

export class BowControl extends MoveableObject {
	container: Phaser.GameObjects.Container;
	button: Phaser.GameObjects.Graphics;
	static width: number = 40;

	constructor(public scene : Phaser.Scene, x : number,y : number) {
		super(scene,x,y,'');

		const height = 15;
		const container = scene.add.container(x,y);
		container.setScale(OVERSAMPLE_FACTOR);
		this.container = container;

		const background = scene.add.graphics();
		background.fillStyle(BG_COLOR);
		background.lineStyle(1,LINE_COLOR,1);
		const extra = 10;
		background.fillRect(-extra/2,0,BowControl.width + extra,height);
		background.strokeRect(-extra/2,0,BowControl.width + extra,height);

		container.add(background);

		const line = scene.add.graphics();
		line.lineStyle(1, LINE_COLOR, 1);
		line.lineBetween(0,height/2,BowControl.width,height/2);
		container.add(line);

		const button = scene.add.graphics();
		button.fillStyle(BG_COLOR);
		const buttonSize = 10;
		button.lineStyle(1,LINE_COLOR,1);
		button.fillCircle(0, 0, buttonSize/2);
		button.strokeCircle(0,0,buttonSize/2);
		button.x = BowControl.width;
		button.y = height/2;
		
		let isDown = false;
		let xStart = 0
		let yStart = 0;
		button.setInteractive( new Phaser.Geom.Rectangle(-buttonSize/2,-buttonSize/2,buttonSize,buttonSize), Phaser.Geom.Rectangle.Contains)
				.on('pointerdown', (pointer, localX, localY, event) => {
				isDown = true;
				xStart = localX;
				yStart = localY;
				event.stopPropagation();
				this.emit('start');
			}).on('pointerup', (pointer, localX, localY, event) => {
				isDown = false;
				this.emit('release');
				button.x = BowControl.width;
			}).on('pointermove', (pointer, localX, localY, event) => {
				if (isDown) {
					// console.log('dragging');
					let xVal = pointer.x - this.x()*OVERSAMPLE_FACTOR - xStart;
					xVal = Math.min(BowControl.width*OVERSAMPLE_FACTOR, Math.max(0,xVal));

					// let yVal = pointer.y - this.y() - yStart;
					// const angle = Math.atan2(yVal, xVal);
					// this.container.rotation = angle;
					// yVal = Math.min(BowControl.width, Math.max(0,yVal));

					button.x = xVal/OVERSAMPLE_FACTOR;
					// button.y = yVal;
					this.emit('change', 1-(xVal/OVERSAMPLE_FACTOR)/BowControl.width);
				}
			});

		this.button = button;

		container.add(button);
	}

	getGameObject() {
		return this.container;
	}
}