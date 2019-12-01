import { Item } from "./item";
import { ItemWithHeight } from "./item-with-height";
import { Engageable } from "./engageable";
import { Acorn } from "./acorn";

export class GroundAcorn extends Engageable {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Acorn.name);
		this.updateBody(10,10);
		this.playAnimation('ground');
		// this.iconOffset.y = -75;
	}

	update() {

	}

}