// 'use strict';
import { MoveableObject } from './moveable-object';
import { LINE_COLOR, OVERSAMPLE_FACTOR } from '../globals';
import { RopePiece } from './rope-piece';
import { threadId } from 'worker_threads';

export class Rope extends MoveableObject {

	public parts : RopePiece[] = [];
	public joints : any[];
	public ready;
	public lastBall;
	lastJoint: MatterJS.Constraint;
	didCut = false;
	invincible = false;

  constructor(scene) {
		super(scene,0,0,'');
		// this.scene = scene;
		this.joints = [];
		this.ready = false;
		// this.pullVelocity = [7,7];

  }

	static resourceName() {
		return "rope";
	}

	getPhysicsGameObject() {
    return this.lastBall;
	}
	
  async attach(xStart,yStart,otherMatterThing, offset?) {

		const yEnd = otherMatterThing.y;// + otherMatterThing.parentContainer.y;
		const xEnd = otherMatterThing.x;// + otherMatterThing.parentContainer.x;

		for(let k in this.joints) {
			this.joints[k].destroy();
		}
		this.joints = [];

		const joints = this.joints;
		const tint = LINE_COLOR;

		const firstPiece = new RopePiece(this.scene, xStart, yStart);
		// let blockStart = this.scene.matter.add.sprite(xStart, yStart, 'particle', null, { ignoreGravity: true });
		const blockStart = firstPiece.getGameObject();
		blockStart.setIgnoreGravity(true);
		blockStart.setScale(OVERSAMPLE_FACTOR);
		blockStart.setFixedRotation();
    blockStart.setMass(0.02);
		blockStart.setStatic(true);
		blockStart.setSensor(true);
		blockStart.setTint(tint);
		blockStart.depth = 10000;

		let prev = blockStart;
		const dist = Math.sqrt((xStart - xEnd)*(xStart - xEnd) + (yStart - yEnd)*(yStart - yEnd));
    const numJoints = (Math.round(dist)/OVERSAMPLE_FACTOR + 2);
		this.parts.push(firstPiece);
		
		let spacing = OVERSAMPLE_FACTOR;

    for (let i = 0; i < numJoints; i++){

			const piece = new RopePiece(this.scene, xStart + (xEnd - xStart)*i/numJoints, yStart + (yEnd - yStart)*i/numJoints);
			piece.on('cut', (arrow) => {
				if (this.invincible)
					return;
					
				const index = this.parts.indexOf(piece);
				const jointToRemove = this.joints.splice(index,1);
				// const j = rope.joints[Math.round(rope.joints.length/2)];
				try {
					this.scene.matter.world.removeConstraint(jointToRemove[0] as MatterJS.Constraint , false);
				}
				catch(e) {}
				this.emit('cut', piece);
				this.didCut = true;
				// this.parts.splice(index);

			});
			const ball = piece.getGameObject();

			let joint = this.scene.matter.add.joint(prev, ball, spacing, 1.2);
			// ball.data.set('joint', joint);

			prev = ball;			

			this.parts.push(piece);
			this.joints.push(joint);
		}

		const tmp = this.parts[this.parts.length - 1];
		const lastBall = tmp.getGameObject();
		lastBall.setFixedRotation();
    // lastBall.setMass(0.02);
		// lastBall.setStatic(true);
		lastBall.x = xEnd;
		lastBall.y = yEnd;
		// lastBall.depth = 10000;
		// lastBall.obj = this;
		this.lastBall = lastBall;

		const j = this.scene.matter.add.joint(lastBall, otherMatterThing, spacing, 1.2);

		this.lastJoint = j;
		
		if (offset) {
			j['pointB'].x = Math.round( offset.x);
			j['pointB'].y = Math.round( offset.y);
		}


		this.ready = true;
	}

	detach() {
		this.scene.matter.world.removeConstraint(this.lastJoint, false);
	}

	destroy() {
		for (let p of this.parts) {
			p.destroy();
		}

		// for (let j of this.joints) {
		// 	j.destroy();
		// }
		
		super.destroy();
	}

	update() {
		for(let part of this.parts) {
			const j = part.getGameObject();
			j.setDisplayOrigin((j.x/OVERSAMPLE_FACTOR - Math.floor(j.x/OVERSAMPLE_FACTOR)),(j.y/OVERSAMPLE_FACTOR - Math.floor(j.y/OVERSAMPLE_FACTOR)));
		}
	}


}