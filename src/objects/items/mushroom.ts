import { Item } from "./item";
import { ItemWithHeight } from "./item-with-height";
import { Engageable } from "./engageable";
import { Acorn } from "./acorn";

export class Mushroom extends Engageable {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Mushroom.name);
		this.sensor(true);
		this.updateBody(10,10);
	}

	static loadResources(scene: Phaser.Scene) {
		scene.load.image(Mushroom.name, 'resources/mushroom-small.png');
	}

}