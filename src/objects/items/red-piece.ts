import { PhysicsObject } from "../physics-object";
import { OVERSAMPLE_FACTOR, makeParticle, tweenPromise, rand, RED_COLOR, sleep, AUDIO_GEM_SHINE } from "../../globals";
import { Engageable } from "./engageable";
import { Cursor } from "../overlays/cursor";
import { audioManager } from "../../utils/audio-manager";


export class RedPiece extends Engageable {
	gameObj: Phaser.GameObjects.GameObject;
	static size = 1.5;	
	particleTimer: Phaser.Time.TimerEvent;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene,x,y,RedPiece.name);
		this.updateBody(RedPiece.size,RedPiece.size, false);
		this.static(false);
		this.ignoreGravity(false);
		// const s = this.getGameObject();
		// s.setSensor(true);

		const mouseInputSize = 10 * OVERSAMPLE_FACTOR;
	  this.setupMouseEvents(new Phaser.Geom.Polygon([
			new Phaser.Geom.Point(-mouseInputSize/2,-mouseInputSize/2),
			new Phaser.Geom.Point(mouseInputSize/2,-mouseInputSize/2),
			new Phaser.Geom.Point(mouseInputSize/2,mouseInputSize/2),
			new Phaser.Geom.Point(-mouseInputSize/2,mouseInputSize/2),
		]));

		this.particleTimer = this.scene.time.addEvent({
			delay: 250,                // ms
			callback:  async () => {
				const p = makeParticle(scene,this.x(),this.y());
				p.setTint(RED_COLOR);
				p.setAlpha(0.75);
				await tweenPromise(scene, p, {alpha : 0, scale: 0, y : this.y() - 100}, rand(500,1000));
				p.destroy();
			},
			callbackScope: this,
			loop: true
		});
		// this.onOverSetIcon(Cursor.handKey);
		this.iconOffset.y = -100;

		audioManager.play(AUDIO_GEM_SHINE);
	}

	initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		const graphics = this.scene.add.graphics();
		graphics.fillStyle(RED_COLOR);
		const size = RedPiece.size * OVERSAMPLE_FACTOR;
		graphics.fillRect(-size/2, -size/2, size,size);
		container.add(graphics);
		this.gameObj = this.scene.matter.add.gameObject(container, {});
		(this.gameObj as Phaser.Physics.Matter.Sprite).setMass(100000);
	}
	
	getGameObject() {
		return this.gameObj as Phaser.Physics.Matter.Sprite;
	}

	destroy() {
		audioManager.stop(AUDIO_GEM_SHINE);
		this.particleTimer.destroy();
		super.destroy();
	}


}