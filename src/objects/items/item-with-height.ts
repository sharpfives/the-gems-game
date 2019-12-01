
import { Item } from './item'
import { Shadow } from '../shadow';
import { Engageable } from './engageable';
import { OVERSAMPLE_FACTOR } from '../../globals';

export class ItemWithHeight extends Engageable {
	public shadow : Shadow;
	public groundBlock: MatterJS.Body;
	private originalHeight: number;

	constructor(scene : Phaser.Scene, x : number, y : number, name : string, public height : number, shadowOffset?) {
		super(scene,x,y,name);

		const sprite = this.getGameObject();
		const sceneWidth = scene.game.config.width as number;
		this.groundBlock = scene.matter.add.rectangle(sceneWidth/2, this.y() + height, sceneWidth, 10, { isStatic: true });

		this.shadow = new Shadow(scene, this, shadowOffset);
		this.originalHeight = height + y;
		this.update();
	}

	update() {
		try {
			// this.height = this.originalHeight - this.y();
			this.shadow.update();
		}
		catch (e) {}
	}

	destroy() {
		super.destroy();
		this.shadow.destroy();
	}
}