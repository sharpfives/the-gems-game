'use strict';

import { Animated } from './animated';
import * as Phaser from 'phaser';
import { PhysicsObject } from './physics-object';
import { DEFAULT_BODY_NAME } from '../globals';

export class PolygonPhysicsObject extends PhysicsObject {

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, shapes?, public yOffset?: number) {
		super(scene,x,y,name);

		const sprite = (this.sprite as Phaser.Physics.Matter.Sprite);

		if (shapes) {

			const vertices = [];

			for (let s in shapes) {
				const shape = shapes[s];
				const xp = shape.x; const yp = shape.y;
				const v = [];

				for (let p of shape.polygon) {
					// v.push( { x : (p.x), y : (p.y)});
					v.push( { x : (xp + p.x), y : (yp + p.y)});
				}
				vertices.push(v);
			}

			const config = {
				"type": "fromPhysicsEditor",
				"label": name,
				"isStatic": false,
				"density": 0.1,
				"restitution": 0.1,
				"friction": 0.1,
				"frictionAir": 0.01,
				"frictionStatic": 0.5,
				"collisionFilter": {
					"group": 0,
					"category": 1,
					"mask": 255
				},
				"fixtures": [
					{
						"label": DEFAULT_BODY_NAME,
						"isSensor": true,
						"vertices": vertices
					}
				]
			};

			sprite.setBody(config,{});

			sprite.setIgnoreGravity(true);
			// sprite.setSensor(true);

			this.x(x + sprite.centerOfMass.x);
			this.y(y + sprite.centerOfMass.y - sprite.height);

			this.setupCollisionHandlers();

			const g = [];
			for(let k in vertices[0]) {
				g.push(new Phaser.Geom.Point(vertices[0][k].x,vertices[0][k].y));
			}
			this.setupMouseEvents(new Phaser.Geom.Polygon(g));
			sprite.depth = y + (typeof yOffset !== "undefined" ? yOffset : 0);

		}
	}

	initGameObject(x: number, y: number, name: string) {
		const sprite = this.scene.matter.add.sprite(x,y,name);
		this.sprite = sprite;
  }

	getGameObject() {
		return this.sprite as Phaser.Physics.Matter.Sprite;
	}

	

}