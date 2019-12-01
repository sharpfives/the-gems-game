import { PhysicsObject } from '../physics-object';
import { Arrow } from '../arrow';
import { OVERSAMPLE_FACTOR, AUDIO_ARROW_HIT } from '../../globals';
import { audioManager } from '../../utils/audio-manager';

export class Target extends PhysicsObject {

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, Target.name);

		const balloonSprite = this.getGameObject();
		this.updateBody(9,10);
		balloonSprite.setSensor(true);
		balloonSprite.setStatic(true);
		this.setContactHandler(Arrow, async (arrow: Arrow) => {
			audioManager.play(AUDIO_ARROW_HIT);
			arrow.destroy();
			this.scene.cameras.main.shake(20,0.01);
			this.playAnimation('hit');
			this.emit('hit');
		});

		this.playAnimation("rest");
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.spritesheet(Target.name,'resources/target.png',  {frameWidth: 17 * OVERSAMPLE_FACTOR, frameHeight: 23 * OVERSAMPLE_FACTOR});
		scene.load.json(Target.name,'resources/target.json');
	}
}