
import { PhysicsObject } from '../physics-object'

export class GroundArea extends PhysicsObject {
	groundBlock: MatterJS.Body;
	physicsContainer: Phaser.GameObjects.GameObject;
	constructor(scene: Phaser.Scene, y: number) {
		super(scene,0,y,'');
	}

	protected initGameObject(x: number, y : number, name : string) {
		const sceneWidth = this.scene.game.config.width as number;
		this.groundBlock = this.scene.matter.add.rectangle(sceneWidth/2, y, sceneWidth, 10, { isStatic: true });
		const container = this.scene.add.container(x,y);
		this.physicsContainer = this.scene.matter.add.gameObject(container, this.groundBlock);

	}

	getGameObject() {
		return this.physicsContainer as Phaser.Physics.Matter.Sprite;
	}

}