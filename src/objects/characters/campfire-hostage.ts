import { Character } from "./character";
import { OVERSAMPLE_FACTOR, rand, sleep, tweenPromise } from "../../globals";


export class CampfireHostage extends Character {
	singTimer: Phaser.Time.TimerEvent;
	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,CampfireHostage.name);
		this.scaleFactor = 1;
	}

	async sing() {

		const left = this.getGameObject().scaleX > 0;
		const timer = this.scene.time.addEvent({
			callbackScope: this,
			callback: async () => {
				try {
					await sleep(rand(0,800));
					const note = this.scene.add.image(this.x() + (left ? -1 : 1)*OVERSAMPLE_FACTOR, this.y() - 5 * OVERSAMPLE_FACTOR, 'music-note');
					note.setScale(0.6);
					tweenPromise(this.scene, note, {x : note.x + (left ? -1 : 1) * rand(40,70), y: note.y - rand(50,70)}, 1500, "Sine.easeIn");
					sleep(750).then( () => {
						tweenPromise(this.scene, note, {alpha : 0}, 750);
					});
				}
				catch(e) {}
			},
			loop: true,
			delay: 1000
		});
		this.singTimer = timer;
		
	}
	
	setFront(missing: boolean) {
		this.playAnimation((missing ? 'missing-' : 'there-') + 'front');
	}

	setBack(missing: boolean) {
		this.playAnimation((missing ? 'missing-' : 'there-') + 'back');
	}

	setAngleFront(missing: boolean) {
		this.playAnimation((missing ? 'missing-' : 'there-') + 'angle');
	}

	setAngleBack(missing: boolean) {
		this.playAnimation((missing ? 'missing-' : 'there-') + 'angle-back');
	}

	static loadResources(scene : Phaser.Scene) {
		scene.load.json(CampfireHostage.name,'resources/hostage-campfire.json');
		scene.load.spritesheet(CampfireHostage.name,'resources/hostage-campfire.png', { frameWidth : 20, frameHeight : 20});
	}	

	destroy() {
		if(typeof this.singTimer !== 'undefined') {
			this.singTimer.remove();
		}
		super.destroy();
	}
}