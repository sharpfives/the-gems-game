import { Item } from "./item";
import { ItemWithHeight } from "./item-with-height";
import { OVERSAMPLE_FACTOR } from "../../globals";

export class Acorn extends ItemWithHeight {
	constructor(scene : Phaser.Scene, x : number, y : number, height : number) {
		super(scene,x,y,Acorn.name, height);
		this.updateBody(10,10);
		this.iconOffset.y = -75;
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.spritesheet(Acorn.name,'resources/acorn-small.png',  {frameWidth: 9 * OVERSAMPLE_FACTOR, frameHeight: 9 * OVERSAMPLE_FACTOR});
		scene.load.json(Acorn.name,'resources/acorn-small.json');
	}
}