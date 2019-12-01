import { MoveableObject } from '../moveable-object'; 
import { OVERSAMPLE_FACTOR, LINE_COLOR, tweenPromise, sleep } from '../../globals';

export class NoteStaff extends MoveableObject {
	
	private container: Phaser.GameObjects.Container;
	private graphics: Phaser.GameObjects.Graphics;
	height: number;
	width: number;
	numLines: number;
	isCancelled: boolean = false;

	constructor(scene: Phaser.Scene, x : number, y: number, numLines: number) {
		super(scene,x,y,NoteStaff.name, { numLines : numLines });
		this.numLines = numLines;
	}

	protected initGameObject(x: number, y : number, name : string, params: any) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		
		const width = 25 * OVERSAMPLE_FACTOR;
		const height = 10 * OVERSAMPLE_FACTOR;
		this.width = width;
		this.height = height;
		
		const g = this.scene.add.graphics();
		g.lineStyle(4, LINE_COLOR, 0.2);
		// g.clear();
		const numLines = params.numLines;
		for (let k = 0; k < numLines; k++) {
			const y1 = k*height/numLines;
			g.lineBetween(0, y1, width, y1);
		}
		this.graphics = g;
		container.add(g);
	}

	getGameObject() {
		return this.container;
	}

	async playNotes(notes: number[]) {
		this.isCancelled = false;
		const noteWidth = 2 * OVERSAMPLE_FACTOR;
		const noteHeight = 1 * OVERSAMPLE_FACTOR;

		const p = [];
		const timeAcross = 4500;

		const noteProms = [];
		for(let n of notes) {

			if (this.isCancelled) {
				return;
			}
			
			const g = this.scene.add.graphics();
			this.container.add(g);
			g.fillStyle(LINE_COLOR, 0.4);
			g.fillCircle(0,0,noteWidth/2);
			// g.fillEllipse(0,0, noteWidth, noteHeight);
			g.y = (this.numLines - n - 1) * this.height  / this.numLines;
			tweenPromise(this.scene, g, {x : this.width/2}, timeAcross/2).then( () => {
				const pulse = this.scene.add.graphics();
				pulse.lineStyle(2, LINE_COLOR, 0.4);
				pulse.strokeCircle(0,0,noteWidth);
				pulse.x = g.x;
				pulse.y = g.y;
				this.container.add(pulse);
				this.emit('note',n);
				tweenPromise(this.scene,pulse,{scaleX:3, scaleY:3,alpha: 0},500).then(( ) => {
					pulse.destroy();
				});
				const prom = tweenPromise(this.scene, g, {x : this.width}, timeAcross/2);
				p.push(prom);
				prom.then( () => {
					g.destroy();
				});
			});
			await sleep(timeAcross/4);
		}
		await Promise.all(p);
	}

	cancel() {
		this.isCancelled = true;
	}


}