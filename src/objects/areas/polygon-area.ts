'use strict';

import { MoveableObject } from "../moveable-object";
import { PolygonPhysicsObject } from "../polygon-physics-object";

export class PolygonArea extends PolygonPhysicsObject {
	public properties = {};
	public xCoord = 0;
	public yCoord = 0;
	public physicsContainer: Phaser.GameObjects.GameObject;
	protected polygonShape: Phaser.GameObjects.Polygon;

	constructor(scene: Phaser.Scene, x: number, y: number, shape) {
		super(scene, x, y, "particle", [
			{
				x: 0,
				y: 0,
				polygon: shape
			}
		]);
		this.properties = {};

		// const points = [];
		// let minX = 99999;
		// let maxX = -9999;
		// let minY = 99999;
		// let maxY = -9999;
		// for(let p in polygon) {
		// 	const pt = polygon[p];
		// 	points.push(pt.x);
		// 	points.push(pt.y);
		// 	minX = Math.min(minX, pt.x);
		// 	minY = Math.min(minY, pt.y);
		// 	maxX = Math.max(maxX, pt.x);
		// 	maxY = Math.max(maxY, pt.y);
		// }

		// for(let i = 0; i < points.length; i+=2) {
		// 	points[i] -= minX;
		// 	points[i+1] -= minY;
		// }
		// const width = Math.abs(maxX - minX);
		// const height = Math.abs(maxY - minY);

		// const ptsStr = points.toString().replace(/,/g,' ');
		// const poly = scene.add.polygon(Math.round(x + minX + width/2), Math.round(y + minY + height/2), ptsStr, 0x0000ff, 0.0);
		// // poly.setScale(OVERSAMPLE_FACTOR);
		
		// this.physicsContainer = scene.matter.add.gameObject(poly, { shape: { type: 'fromVerts', verts: ptsStr, flagInternal: false } });
		// this.physicsContainer['obj'] = this;
		// const p = this.physicsContainer as Phaser.Physics.Matter.Sprite;
		// p.setStatic(true);
		// p.setIgnoreGravity(true);
		// p.setSensor(true);

		// const g = [];
		// for(let k in polygon) {
		// 	g.push(new Phaser.Geom.Point(polygon[k].x,polygon[k].y));
		// }

		// p.setInteractive(new Phaser.Geom.Polygon(g), Phaser.Geom.Polygon.Contains);
		// if (this.scene.game.config.physics.matter.debug)
		// 	this.scene.input.enableDebug(p);

		// this.polygonShape = poly;

	}

	static resourceName() {
		return "polygon-area";
	}

	// x() {
	// 	return this.xCoord;
	// }

	// y() {
	// 	return this.yCoord;
	// }

	// getGameObject() {
	// 	return this.physicsContainer as Phaser.Physics.Matter.Sprite;
	// }
}