import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, tweenPromise, TOP_DEPTH } from "../../globals";


export class ItemEngageBubble extends MoveableObject {
	container: Phaser.GameObjects.Container;
	graphics: Phaser.GameObjects.Graphics;
	static width = 80;
	imgIcon: Phaser.GameObjects.Image;
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,'');
	}

	protected initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		
		const g = this.scene.add.graphics();
		g.fillStyle(LINE_COLOR, 1);
		const r = ItemEngageBubble.width/2;
		g.fillCircle(0,0,r);
		const angle = Math.PI * 50 / 180;
		const xStart = -r*Math.cos(angle);
		const yStart = r*Math.sin(angle);

		const interiorAngle = Math.PI/2 - angle;
		const yIntercept = r / Math.cos(interiorAngle);

		g.fillTriangle(xStart, yStart, -xStart, yStart, 0, yIntercept)

		this.graphics = g;
		container.add(g);
		
	}

	getGameObject() {
		return this.container;
	}

	setIcon(iconName: string) {
		if (typeof this.imgIcon !== 'undefined')
			this.imgIcon.destroy();

		const img = this.scene.add.image(0, 0, iconName);
		img.setOrigin(0.5);
		img.setScale(0.75);
		this.imgIcon = img;
		this.container.add(img);
	}

	async hide() {
		await tweenPromise(this.scene, this.getGameObject(), {alpha : 0}, 300);
	}

	async show(x: number, y: number) {
		this.depth(TOP_DEPTH);
		this.getGameObject().setScale(0);
		this.x(x); this.y(y);
		await tweenPromise(this.scene, this.container, { scaleX : 1.1, scaleY : 1.1}, 100);
		await Promise.all( [
			tweenPromise(this.scene, this.container, {scaleX : 1, scaleY : 1}, 100)
		]);
	}

}