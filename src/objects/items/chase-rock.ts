import { PhysicsObject } from '../physics-object';
import { OVERSAMPLE_FACTOR, DEFAULT_BODY_NAME } from '../../globals';
import { Guy } from '../characters/guy'

export class ChaseRock extends PhysicsObject {
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,ChaseRock.name);

		const sprite = this.getGameObject();
		sprite.setBody({
			type: 'rectangle',
      width: 25*OVERSAMPLE_FACTOR,
      height: 15*OVERSAMPLE_FACTOR
		}, {});
		sprite.body['label'] = DEFAULT_BODY_NAME;

		sprite.setIgnoreGravity(true);
		// sprite.setStatic(true);
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.image(ChaseRock.name,'resources/images/scenes/chase/rock.png');
	}
}