import { PolygonPhysicsObject } from "../polygon-physics-object";
import { PhysicsObject } from "../physics-object";
import { OVERSAMPLE_FACTOR, rand, DEFAULT_BODY_NAME, FrameRateData, AUDIO_BALLOON_POP } from "../../globals";
import { Arrow } from "../arrow";
import { audioManager } from "../../utils/audio-manager";


export class Balloon extends PhysicsObject {
	floatTimer: Phaser.Time.TimerEvent;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, Balloon.name);

		const balloonSprite = this.getGameObject();
		this.updateBody(6,10);
		balloonSprite.setSensor(true);
		balloonSprite.setMass(0.1);
		this.setContactHandler(Arrow, async (arrow: Arrow) => {
			audioManager.play(AUDIO_BALLOON_POP);
			this.playAnimation('pop').then( ()=>{
				this.destroy();
			});
			this.emit('popped');
		});

		this.playAnimation("rest");
		this.float();
	}

	protected getFrameRateData() : FrameRateData {
		return {
			pop : 20	
		};
	}

	float() {
		let i = 0;
		const sprite = this.getGameObject();
		this.floatTimer = this.scene.time.addEvent({
			callback : () => {
				sprite.setVelocityY(-5);
				if (i++ % 40 == 0) {
					i = 0;
					sprite.setVelocityX(rand(-1,1));
				}
			},
			loop: true,
			delay : 100,
			callbackScope : this
		});
	}

	destroy() {
		this.floatTimer.destroy();
		super.destroy();
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.spritesheet(Balloon.name,'resources/balloon.png',  {frameWidth: 25 * OVERSAMPLE_FACTOR, frameHeight: 25 * OVERSAMPLE_FACTOR});
		scene.load.json(Balloon.name,'resources/balloon.json');
	}
}