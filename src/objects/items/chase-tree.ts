import { PhysicsObject } from '../physics-object';
import { OVERSAMPLE_FACTOR, DEFAULT_BODY_NAME } from '../../globals';
import { Guy } from '../characters/guy'

export class ChaseTree extends PhysicsObject {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,ChaseTree.name);

		const sprite = this.getGameObject();
		sprite.setBody({
			type: 'rectangle',
      width: 15*OVERSAMPLE_FACTOR,
      height: 15*OVERSAMPLE_FACTOR
		}, {});
		sprite.body['label'] = DEFAULT_BODY_NAME;

		sprite.setIgnoreGravity(true);
		// sprite.setStatic(true);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.image(ChaseTree.name,'resources/chase-tree.png');
	}
}