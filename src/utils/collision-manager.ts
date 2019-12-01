
import * as Phaser from 'phaser';
import { PhysicsObject } from '../objects/physics-object';

class CollisionManager {
	public scene: Phaser.Scene;
	defaultCollisionCategory: number;
	public categories: {
		[source : number]: number[]
	} = {};

	constructor() {}

	addObject<T extends PhysicsObject>(obj: T) {
		for (let k in this.categories) {
			const array = this.categories[k];
			array.push(obj.collisionCategory);
		}
		this.categories[obj.collisionCategory] = Object.keys(this.categories).map( (a: string) => { 
			return Number(a) as number;
		});
		obj.getGameObject().setCollidesWith(this.categories[obj.collisionCategory]);
	}

	public setScene(scene: Phaser.Scene) {
		this.scene = scene;
		this.defaultCollisionCategory = scene.matter.world.nextCategory();
	}

	setCollidesWith<T extends PhysicsObject,E extends PhysicsObject>(obj: E, other : T) {

	}

	removeCollidesWith<T extends PhysicsObject,E extends PhysicsObject>(obj: E, other : T) {
		const collisionArray = this.categories[obj.collisionCategory];
		if (typeof collisionArray !== 'undefined') {
			const index = collisionArray.indexOf(other.collisionCategory);
			if (index >= 0) {
				collisionArray.splice(index);
				obj.getGameObject().setCollidesWith(collisionArray);
			}
			else {
				console.error(`couldn't find collision category`);
			}
		}
		
	}

	removeCollidesWithAll<T extends PhysicsObject>(obj: PhysicsObject, objType : { new (...args: any[]): T; }) {
		for (let c in this.scene.children.list) {
			if ((c['obj'] as any) instanceof objType) {
				const thing = c['obj'] as T;
				this.removeCollidesWith(obj, thing);
			}
		}
	}

	setCollidesWithAll<T extends PhysicsObject>(obj: PhysicsObject, objType : { new (...args: any[]): T; }) {
		for (let c in this.scene.children.list) {
			if ((c['obj'] as any) instanceof objType) {
				
			}
		}
	}




}

export const collisionManager = new CollisionManager();