
import { Animated } from './animated';
import { MatterCollisionPlugin } from 'phaser-matter-collision-plugin'
import { DEFAULT_BODY_NAME, OVERSAMPLE_FACTOR } from '../globals';
import { collisionManager } from '../utils/collision-manager';
import { Timer } from './overlays/timer';

export class PhysicsObject extends Animated {

	onContactHandlers = {};
	contactObjectsByBody = {};
	attachedObjects = [];
	collisionCategory: number;
	collidesWithCategories: number[];
	container: Phaser.GameObjects.Container;
	physicsContainer: Phaser.GameObjects.GameObject;
	timer: Timer;

	constructor(scene : Phaser.Scene, x : number, y : number, name : string, shapes?) {
		super(scene,x,y,name);
		
		this.setupCollisionHandlers();
		this.setupMouseEvents();
	}

	sensor(isSensor: boolean) {
		this.getGameObject().setSensor(isSensor);
	}

	static(isStatic: boolean) {
		this.getGameObject().setStatic(isStatic);
	}

	ignoreGravity(ignore: boolean) {
		this.getGameObject().setIgnoreGravity(ignore);
	}

	protected initGameObject(x : number, y : number, name : string) {
    // const sprite = this.scene.matter.add.sprite(x,y,name);
		// this.sprite = sprite;

		const container = this.scene.add.container(x,y);
		this.container = container;
		this.physicsContainer = this.scene.matter.add.gameObject(container, {});
		const sprite = this.scene.add.sprite(0,0,name);
		container.add(sprite);
		this.sprite = sprite;
	}

	async showTimer(duration?: number, offset? : {x: number, y: number} ) {
		if (!duration) {
			duration = 5000;
		}

		if (!offset) {
			offset = {
				x : 0,
				y : -100
			}
		}

		if (typeof this.timer === 'undefined') {
			const timer = new Timer(this.scene, 0, 0, 40 * this.getScaleFactor() / OVERSAMPLE_FACTOR);
			// timer.getGameObject().setScale(this.getScaleFactor());
			this.timer = timer;
			this.container.add(timer.getGameObject());
		}

		this.timer.alpha(1);
		this.timer.x(offset.x * this.getScaleFactor() / OVERSAMPLE_FACTOR);
		this.timer.y(offset.y * this.getScaleFactor() / OVERSAMPLE_FACTOR);

		await this.timer.start(duration);
	}

	stopTimer() {
		if (typeof this.timer !== 'undefined') {
			this.timer.stop();
			this.timer.alpha(0);
		}
	}

	detach(other: PhysicsObject) {
		const joint = this.attachedObjects[other.name];
		this.scene.matter.world.removeConstraint(joint as MatterJS.Constraint , false);
	}

	attach(other: PhysicsObject, offset? : {x : number, y: number}) {
		const j = this.scene.matter.add.joint(this.getGameObject(), other.getGameObject(), 1, 1.2);		
		if (offset) {
			j['pointB'].x = offset.x;
			j['pointB'].y = offset.y;
		}
		this.attachedObjects[other.name] = j;
	}

	protected setupCollisionHandlers() {
		const s = this.getGameObject();
		s['obj'] = this;
		s.body['label'] = DEFAULT_BODY_NAME;

		const matterCollision = this.scene.sys['matterCollision'] as MatterCollisionPlugin;
		matterCollision.addOnCollideStart({
			objectA: s,
			callback: eventData => {
				const { bodyB, gameObjectB } = eventData;
				
				if (gameObjectB != null && typeof gameObjectB !== 'undefined') {
          if (typeof gameObjectB.obj !== 'undefined') {
						let obj = gameObjectB.obj as PhysicsObject;
						// console.log(obj.constructor.resourceName() + " ");

            this.handleContact(obj, eventData.bodyB.label, eventData.bodyA.label, true);
          }
        }
			}
		});

		this.collisionCategory = this.scene.matter.world.nextCategory();
		s.setCollisionCategory(this.collisionCategory);
		collisionManager.addObject(this);

	}

	public setupMouseEvents(shape? : Phaser.Geom.Rectangle | Phaser.Geom.Polygon) {
		const sprite = this.getGameObject();
		const body = sprite.body as Phaser.Physics.Impact.Body;

		body.gameObject.removeInteractive();
		body.gameObject.disableInteractive();
		// body.gameObject.removeAllListeners('pointerover');
		// body.gameObject.removeAllListeners('pointerout');
		// body.gameObject.removeAllListeners('pointerup');

		if (shape instanceof Phaser.Geom.Rectangle) {
			body.gameObject.setInteractive(shape, Phaser.Geom.Rectangle.Contains);
		}
		else if (shape instanceof Phaser.Geom.Polygon) {
			body.gameObject.setInteractive(shape, Phaser.Geom.Polygon.Contains);
			// this.scene.add.polygon(0, 0, shape);
		}
		else {
			return;
		}
 
		if (this.scene.game.config.physics.matter.debug)
			this.scene.input.enableDebug(sprite);



		// body.gameObject.on('pointerover', () => {
		// 	if (!this.engageable){
		// 		return;
		// 	}
		// 	console.log('OVER OBJECT!!!!!');
		// 	this.emit('moved-over');
		// });
		// body.gameObject.on('pointerout', () => {
		// 	if (!this.engageable){
		// 		return;
		// 	}
		// 	console.log('OUT OBJECT!!!!!');
		// 	this.emit('moved-out');
		// });
		// body.gameObject.on('pointerup', (pointer) => {
		// 	if (!this.engageable){
		// 		return;
		// 	}
		// 	pointer.event.stopPropagation();
		// 	console.log('OUT OBJECT!!!!!');
		// 	this.emit('selected');
		// });

		// // body.gameObject.on('pointerover', () => {
		// // 	console.log('OVER2!!!!!');
		// // });
	}

	updateBody(width: number, height: number, updateMouseArea? : boolean) {
		if (typeof updateMouseArea === 'undefined') {
			updateMouseArea = true;
		}
		const sprite = this.getGameObject();
		const isSensor = sprite.isSensor();
		const isStatic = sprite.isStatic();

		sprite.setBody({
			type: 'rectangle',
      width: width*this.getScaleFactor(),
      height: height*this.getScaleFactor()
		}, {

		});
		sprite.body['label'] = DEFAULT_BODY_NAME;
		sprite.setIgnoreGravity(true);
		sprite.setStatic(isStatic);
		sprite.setSensor(isSensor);

		if (updateMouseArea) {
			const boxWidth = width*this.getScaleFactor();
			const boxHeight = height*this.getScaleFactor();
			const boxX = sprite.centerOfMass.x - boxWidth/2;
			const boxY = sprite.centerOfMass.y - boxHeight/2;
			this.setupMouseEvents(new Phaser.Geom.Polygon([ 
				new Phaser.Geom.Point(boxX,boxY),
				new Phaser.Geom.Point(boxX + boxWidth,boxY),
				new Phaser.Geom.Point(boxX + boxWidth,boxY + boxHeight),
				new Phaser.Geom.Point(boxX,boxY + boxHeight),
			]));
		}

		// this.setupMouseEvents(new Phaser.Geom.Rectangle(50,0,boxWidth,height*this.getScaleFactor()));
	}

	getGameObject() : Phaser.Physics.Matter.Sprite {
		// return this.sprite as Phaser.Physics.Matter.Sprite;
		return this.physicsContainer as Phaser.Physics.Matter.Sprite;
	}

	getAnimationGameObject() {
		return this.sprite
	}

	setContactHandler<T extends PhysicsObject>(objType : { new (...args: any[]): T; }, beginFunc : Action<T>, endFunc?: Action<T>, myBodyName?: string) {
		
		if (!endFunc) {
			endFunc = () => {};
		}
		
		if (!myBodyName) {
			myBodyName = DEFAULT_BODY_NAME;
		}

		if (typeof this.onContactHandlers[DEFAULT_BODY_NAME] === 'undefined') {
			this.onContactHandlers[DEFAULT_BODY_NAME] = {};
		}

		this.onContactHandlers[DEFAULT_BODY_NAME][objType.name] = {
			begin : beginFunc,
			end : endFunc
		};
	}

	async handleContact<T extends PhysicsObject>(obj : T, bodyName : string, myBodyName : string, isBegin : boolean) {

		if (typeof this.contactObjectsByBody[bodyName] === 'undefined')  {
			this.contactObjectsByBody[bodyName] = new Set();
		}

		const bodyContactSet = this.contactObjectsByBody[bodyName];

		const lookup = obj.constructor.name;
		const handlersForBody = this.onContactHandlers[myBodyName];
		if (typeof handlersForBody === 'undefined')
			return;

		const handlers = handlersForBody[lookup];

		if (isBegin) {
			if (!bodyContactSet.has(obj)) {
				bodyContactSet.add(obj);
			}
			if (typeof handlers === 'undefined') {
				return false;
			}
			if (typeof handlers.begin === 'function') {
				let func = handlers.begin;
				await func(obj,bodyName);
				return true;
			}
		}
		else {
			bodyContactSet.delete(obj);
			if (typeof handlers === 'undefined') {
				return false;
			}
			if (typeof handlers.end === 'function') {
				let func = handlers.end;
				await func(obj,bodyName);
				return true;
			}
		}

		return false;

  }
}


export interface Action<T extends PhysicsObject> {
	(obj: T, objLabel: string): void;
}