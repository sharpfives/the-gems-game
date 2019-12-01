import { PhysicsObject } from "../physics-object";
import { Timer } from "../overlays/timer";
import { Engageable } from "../items/engageable";
import { tweenPromise, OVERSAMPLE_FACTOR } from "../../globals";


export class Character extends Engageable {

	container: Phaser.GameObjects.Container;
	physicsContainer: Phaser.GameObjects.GameObject;
	isSaved: boolean;
	speechBubbleOffset: {x: number, y:number} = {
		x : 0, y : 0
	};

	constructor(scene : Phaser.Scene, x : number, y : number, name : string) {
		super(scene,x,y,name);
		this.getGameObject().setIgnoreGravity(true);
		this.getGameObject().setStatic(true);
	}

	initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		this.physicsContainer = this.scene.matter.add.gameObject(container, {});
		const sprite = this.scene.add.sprite(0,0,name);
		container.add(sprite);
		this.sprite = sprite;
	}

	async runTo(x: number, y: number) {
		let timer: Phaser.Time.TimerEvent;
		try {
			timer = this.scene.time.addEvent( {
				loop: true,
				delay: 200,
				callbackScope : this,
				callback : async () => {
					const frame = this.getAnimationGameObject().anims.currentFrame;
					const img = this.scene.add.image(this.x(), this.y(), frame.textureKey, frame.textureFrame);
					img.setScale((this.isFacingRight() ? 1 : -1) * OVERSAMPLE_FACTOR / this.getScaleFactor(), OVERSAMPLE_FACTOR / this.getScaleFactor());
					img.setAlpha(0.75);
					await tweenPromise(this.scene, img, {alpha : 0}, 500);
					img.destroy();
				}
			});
			await super.moveTo(x, y, 50 * OVERSAMPLE_FACTOR);
			timer.remove();
		}
		catch(e) {
			if (typeof timer !== 'undefined') {
				timer.remove();
			}
			throw "";
		}

	}

	getAnimationGameObject() {
		return this.sprite;
	}

	getGameObject() {
		return this.physicsContainer as Phaser.Physics.Matter.Sprite;
	}

	
}