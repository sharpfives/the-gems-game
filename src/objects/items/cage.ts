import { PhysicsObject } from '../physics-object';
import { OVERSAMPLE_FACTOR, DEFAULT_BODY_NAME } from '../../globals';
import { Guy } from '../characters/guy'
import { RedPiece } from './red-piece';

export class Cage extends PhysicsObject {
	container: Phaser.GameObjects.Container;
	physicsContainer: Phaser.GameObjects.GameObject;
	redPiece: RedPiece;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,Cage.name);

		this.updateBody(this.sprite.width/OVERSAMPLE_FACTOR,this.sprite.height/OVERSAMPLE_FACTOR);
		this.ignoreGravity(false);
		this.getGameObject().setMass(1);
		// this.sensor(true);
		// this.getGameObject().setFixedRotation();
		// this.sens
		// this.getGameObject().setMass(3);
		const redPiece = new RedPiece(scene,0,this.sprite.height/2 - 10);
		redPiece.ignoreGravity(true);
		redPiece.sensor(true);
		redPiece.getGameObject().setFixedRotation();
		this.attach(redPiece,{x:0,y:-30});
		this.redPiece = redPiece;
		// this.container.add(redPiece.getGameObject());
		// this.getGameObject().setVelocityX(1);
	}

	protected initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		this.physicsContainer = this.scene.matter.add.gameObject(container, {});
		const sprite = this.scene.add.sprite(0,0,name);
		container.add(sprite);
		this.sprite = sprite;
	}
	
	static loadResources(scene : Phaser.Scene) {
		scene.load.image(Cage.name,'resources/cage.png');
	}

	getAnimationGameObject() {
		return this.sprite;
	}

	getGameObject() {
		return this.physicsContainer as Phaser.Physics.Matter.Sprite;
	}
}