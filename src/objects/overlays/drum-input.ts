import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, OVERSAMPLE_FACTOR, tweenPromise, sleep } from "../../globals";


export class DrumInput extends MoveableObject {

	private container: Phaser.GameObjects.Container;
	private graphics: Phaser.GameObjects.Graphics;

	constructor(scene:Phaser.Scene, x : number, y: number, private width: number, private height: number) {
		super(scene,x,y,name);
		const container = this.scene.add.container(x,y);
		// container.alphaBottomRight = 0;

		this.container = container;
		
		const g = this.scene.add.graphics();
		g.fillStyle(LINE_COLOR, 0.2);
		g.fillRect(0,0,this.width,this.height);
		this.graphics = g;
		container.add(g);
	}

	protected initGameObject(x: number, y : number, name : string) {

	}

	async startBars() {
		const numBarsOnScreen = 9;
		const timeAcross = 4000;

		const areaWidth = 0.8 * (this.width / numBarsOnScreen);

		const timeToMiddle = timeAcross/2 - (timeAcross/2) * (areaWidth/(2*this.width));

		this.graphics.clear();
		this.graphics.fillStyle(LINE_COLOR, 0.2);
		this.graphics.fillRect(this.width/2 - areaWidth/2,0,areaWidth,this.height);

		setInterval( () => {
			this.addBar(timeAcross, timeToMiddle);
		}, timeAcross/ numBarsOnScreen);
	}

	async addBar(timeAcross: number, timeToMiddle: number) {
		const width = this.scene.game.config.width as number;

		const g = this.scene.add.graphics();
		g.fillStyle(LINE_COLOR, 0.5);
		g.fillRect(0,0,OVERSAMPLE_FACTOR,this.height);
		g.x = width;
		this.container.add(g);

		const promises = [];
		promises.push(tweenPromise(this.scene, g, {x : 0},timeAcross));

		sleep(timeToMiddle).then( () => {
			this.emit('bar-in-middle');
		});
		await sleep(timeAcross - timeToMiddle);
		promises.push(tweenPromise(this.scene, g, {alpha : 0}, timeToMiddle));
		await Promise.all(promises);
		g.destroy();
	}

}