import { PolygonPhysicsObject } from "../polygon-physics-object";
import { PhysicsObject } from "../physics-object";
import { OVERSAMPLE_FACTOR, rand, DEFAULT_BODY_NAME, FrameRateData } from "../../globals";
import { Arrow } from "../arrow";
import { ItemEngageBubble } from "../overlays/item-engage-bubble";


export class Engageable extends PolygonPhysicsObject {

	icon: ItemEngageBubble;
	public iconOffset: {x: number, y: number} = {x : 0, y : -100};
	engageable: boolean = true;
	movedOverFunc: () => void;

	constructor(scene: Phaser.Scene, x: number, y: number, name: string, shapes?, yOffset?) {
		super(scene, x, y, name, shapes, yOffset);

		this.icon = new ItemEngageBubble(scene,0,0);
		this.icon.alpha(0);

		this.on('moved-out', () => {
			this.icon.hide();
		});
		this.on('selected', () => {
			this.icon.hide();
		});
	}

	removeOverSetIcon() {
		if (typeof this.movedOverFunc !== 'undefined') {
			this.removeListener('moved-over', this.movedOverFunc);
		}
	}
	
	onOverSetIcon(iconName: string) {

		this.removeOverSetIcon();

		this.movedOverFunc = () => {
			if (this.engageable) {
				this.icon.setIcon(iconName);
				this.icon.alpha(1);
				this.icon.show(this.x() + this.iconOffset.x, this.y() + this.iconOffset.y);
			}
		};
		
		this.on('moved-over', this.movedOverFunc);
	}
}