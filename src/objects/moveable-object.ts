'use strict';

import { tweenPromise, OVERSAMPLE_FACTOR, makeParticle, rand, BG_COLOR, sleep, LINE_COLOR, RED_COLOR, TOP_DEPTH } from "../globals";
import { EventEmitter } from 'eventemitter3';
import { RedPiece } from "./items/red-piece";

export class MoveableObject extends EventEmitter {
	public sprite : Phaser.GameObjects.Sprite;
	public selectable: boolean = true;
	particles: Phaser.Physics.Matter.Sprite[] = [];
	public scaleFactor: number = OVERSAMPLE_FACTOR;
	properties: {} = {};

  constructor(public scene : Phaser.Scene, x : number, y : number, public name : string, params? : {}) {
		super();
		this.initGameObject(x,y,name,params);
  }

  protected initGameObject(x: number, y : number, name : string, params? : {}) {}

	bringToTop() {
		this.depth(TOP_DEPTH);
	}

	depth(d?: number) {
		if (typeof d !== 'undefined')
			this.getGameObject().depth = d;
		else
			return this.getGameObject().depth;
	}

	alpha(a: number) {
		this.getGameObject().setAlpha(a);
	}

	preallocateParticles() {
		this.particles = [];
		for( let k = 0; k < 100; k++) {
			const particle = this.scene.matter.add.sprite(0, 0, 'particle');
			particle.setFixedRotation();
			particle.setIgnoreGravity(true);
			particle.setAngle(0);
			particle.setBounce(0.8);
			// particle.setSensor(true);
			particle.setScale(OVERSAMPLE_FACTOR);
			particle.setTint(LINE_COLOR);
			particle.alpha = 0;
			this.particles.push(particle);
		}
	}

  public getGameObject() :  Phaser.GameObjects.Image | Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | Phaser.GameObjects.Graphics{
    return this.sprite;
  }

  public static resourceName() {
    return "un-named";
  }

  static loadResources(scene: Phaser.Scene) {
    //load json config
		//load spritesheet
  }

  x(x? : number ) {
    if (typeof x !== 'undefined') {
      this.getGameObject().x = x;
    }
    return this.getGameObject().x;
  }

  y(y? : number) {
    if (typeof y !== 'undefined') {
      this.getGameObject().y = y;
    }
    return this.getGameObject().y;
	}
	
	// async bounceLeft() {
	// 	await this.bounce('left');
	// }

	// async bounceRight() {
	// 	await this.bounce('right');
	// }

	// async bounce(direction) {
	// 	const distX = 20 * (direction === 'left' ? -1 : 1);
	// 	const numBounces = 2;
	// 	const startY = this.y();
	// 	const distY = 5;
	// 	const totalTime = 800;

	// 	tweenPromise(this.scene, this.getGameObject(), {x : this.x() + distX}, totalTime + 5*totalTime / (numBounces * 2), Phaser.Math.Easing.Quadratic.Out)

	// 	for(let i = 0; i < numBounces; i++) {
	// 		await tweenPromise(this.scene, this.getGameObject(), {y : startY + distY }, totalTime / (2 * numBounces), Phaser.Math.Easing.Quadratic.In)
	// 		await tweenPromise(this.scene, this.getGameObject(), {y : startY + distY*i/numBounces} , totalTime / (2 * numBounces), Phaser.Math.Easing.Quadratic.Out)
	// 	}

	// 	await tweenPromise(this.scene, this.getGameObject(), {y : startY + distY }, totalTime / (2 * numBounces), Phaser.Math.Easing.Quadratic.In)

	// }

	cancelTweens() {
		try {
			const tweens = this.scene.tweens.getTweensOf(this.getGameObject());
			for (let t of tweens) {
				t.stop();
				t.complete();
			}
		}	
		catch(e){}
	}

  async moveTo(x : number,y : number, speed? : number) {
		this.cancelTweens();

    let angle = Math.atan2(y - this.y(), x - this.x());
    angle = (angle < 0 ? angle + 2*Math.PI : angle);
    if (angle > 3*Math.PI/2 || angle < Math.PI/2) {
      this.faceRight();
    }
    else if (angle !== 3*Math.PI/2 && angle !== Math.PI/2){
      this.faceLeft();
    }
    speed = (typeof speed === 'undefined' ? 24*OVERSAMPLE_FACTOR : speed);
    let dist = Math.sqrt((this.x() - x)*(this.x() - x) + (this.y() - y)*(this.y() - y));
    let time = 1000 * dist / speed;
    await tweenPromise(this.scene, this.getGameObject(), {x : x, y : y}, time);
  }

  faceLeft() {
    this.getGameObject().setScale(OVERSAMPLE_FACTOR/this.getScaleFactor(),OVERSAMPLE_FACTOR/this.getScaleFactor());
  }

  faceRight() {
    this.getGameObject().setScale(-OVERSAMPLE_FACTOR/this.getScaleFactor(),OVERSAMPLE_FACTOR/this.getScaleFactor());
	}

	isFacingRight() {
    return this.getGameObject().scaleX < 0;
	}

	above(other : MoveableObject) {
		this.getGameObject().depth = other.getGameObject().depth + 1;
	}

	async dissolve(fromX: number, fromY: number, params? : {
		dissolveIn?: boolean, 
		colorToSelect?: number,
		hover?: boolean,
		endX?: number,
		endY?: number
	}) {
		let dissolveIn = params.dissolveIn;
		const hover = params.hover;
		const colorToSelect = params.colorToSelect;

		if (typeof dissolveIn === 'undefined') {
			dissolveIn = true;
		}

		this.alpha(0);

		const name = this.name;
		let key = 0;
		const obj = this.getAnimationGameObject();
		if (obj instanceof Phaser.GameObjects.Sprite) {
			if (obj.anims.currentAnim == null){
				console.warn('current anim is null');
			}
			else {
				key = obj.anims.currentFrame.textureFrame as number;
			}
		}
		const frame0 = this.scene.textures.getFrame(name,key);
		const width = frame0.width;
		const height = frame0.height;

		const variance = 1*OVERSAMPLE_FACTOR;

		const numParticlesPerPixel = 1;

		const particles = [];

		const oversampleFactor = this.getScaleFactor();

		const facingLeft = !this.isFacingRight();

		for(let i = 0; i < width/oversampleFactor; i++) {
			for(let j = 0; j < height/oversampleFactor; j++) {
				const color = this.scene.textures.getPixel(i*oversampleFactor,j*oversampleFactor,name,key);
				const hex = ((color.red << 16) & 0xFF0000) | ((color.green << 8) & 0xFF00) | (color.blue & 0xFF);

				if ((typeof colorToSelect === 'undefined' && color.alpha != 0 && hex !== BG_COLOR) || (typeof colorToSelect !== 'undefined' && hex === colorToSelect)) {
					for(let k = 0; k < numParticlesPerPixel; k++) {

						const toX = this.x() + (facingLeft ? width*OVERSAMPLE_FACTOR - (i)*OVERSAMPLE_FACTOR : (i + 1)*OVERSAMPLE_FACTOR) - (OVERSAMPLE_FACTOR/2) - width*OVERSAMPLE_FACTOR/(2*oversampleFactor);
						const toY = this.y() + (j + 1)*OVERSAMPLE_FACTOR - (OVERSAMPLE_FACTOR/2) - height*OVERSAMPLE_FACTOR/(2*oversampleFactor);
						const startX = (dissolveIn ? fromX + rand(-variance,variance) : toX);
						const startY = (dissolveIn ? fromY + rand(-variance,variance) : toY);
						const p = makeParticle(this.scene, startX, startY);
						p.setTint(hex);
						const a = color.alpha/255;
						p.setAlpha(dissolveIn ? 0 : a);
						const data = {
							particle : p,
							x : (dissolveIn ? toX : fromX),
							y : (dissolveIn ? toY : fromY),
							alpha : (hover? a/2 : a)
						}
						particles.push(data);
					}
				}
			}
		}



		if (!hover) {

			const promises = [];
			for(let p of particles) {
				promises.push(tweenPromise(this.scene, p.particle, {alpha : (dissolveIn ? p.alpha : 0), x : p.x, y : p.y}, 2000, 'Sine.easeIn', rand(500,1500)));
			}
	
			await Promise.all(promises);

			for(let p of particles) {
				p.particle.destroy();
			}
	
			this.alpha(dissolveIn ? 1 : 0);
		}
		else {

			const hoverPromises = [];
			const mag = 2;
			const numTimes = 5;
			for(let p of particles) {


				hoverPromises.push( new Promise( async (resolve, reject) => {
					let i = 0;
					const originalX = p.x;
					const originalY = p.y;
					await tweenPromise(this.scene, p.particle, {alpha : (dissolveIn ? p.alpha : 0), x : p.x, y : p.y}, 2000, 'Sine.easeIn', rand(500,1500));

					for(let i = 0; i < numTimes; i++) {
						await tweenPromise(this.scene, p.particle, {x : originalX + rand(-1,1)*mag, y : originalY + rand(-1,1)*mag}, 750);
					}
					if (typeof params.endX !== 'undefined' && typeof params.endY !== 'undefined')
						await tweenPromise(this.scene, p.particle, {x : params.endX, y: params.endY, alpha : 0}, 1000);
					return resolve();
				}));

			}

			await Promise.all(hoverPromises);
			for(let p of particles) {
				p.particle.destroy();
			}
		}


	}

	getScaleFactor() {
		return this.scaleFactor;
	}

	async breakIntoParticles(params?: {
		explode?: boolean,
		limit?: number
	}) {


		let explode = false;
		let limit;
		if (params) {
			if (typeof params.explode !== 'undefined') {
				params.explode = explode;
			}
			limit = params.limit;
		}

		const name = this.name;

		let key = 0;
		const obj = this.getAnimationGameObject();
		if (obj instanceof Phaser.GameObjects.Sprite) {
			if (obj.anims.currentAnim == null){
				console.warn('current anim is null');
			}
			else {
				key = obj.anims.currentFrame.textureFrame as number;
			}
		}

		const frame0 = this.scene.textures.getFrame(name,key);
		const width = frame0.width;
		const height = frame0.height;

		const particles = [];

		const scaleFactor = this.getScaleFactor();

		let totalForegroundPixels = 0;
		for(let i = 0; i < width/scaleFactor; i++) {
			for(let j = 0; j < height/scaleFactor; j++) {
				const color = this.scene.textures.getPixel(i*scaleFactor,j*scaleFactor,name,key);
				const hex = ((color.red << 16) & 0xff0000) | ((color.green << 8) & 0xFF00) | (color.blue & 0xFF);

				if (color.alpha == 255 && hex == LINE_COLOR) {
					totalForegroundPixels++;
				}
			}
		}

		let cachedParticleCount = 0;

		let skipPixelInterval = (totalForegroundPixels < limit ? 0 : Math.floor(totalForegroundPixels/limit));
		let usedPixelCount = 0;
		for(let i = 0; i < width/scaleFactor; i++) {
			for(let j = 0; j < height/scaleFactor; j++) {
				const color = this.scene.textures.getPixel(i*scaleFactor,j*scaleFactor,name,key);
				const hex = ((color.red << 16) & 0xff0000) | ((color.green << 8) & 0xFF00) | (color.blue & 0xFF);

				const xCoord = this.x() + (i + 1)*OVERSAMPLE_FACTOR -width*OVERSAMPLE_FACTOR/(2*scaleFactor);
				const yCoord = this.y() + (j + 1)*OVERSAMPLE_FACTOR - height*OVERSAMPLE_FACTOR/(2*scaleFactor);

				if (color.alpha == 255 && hex == LINE_COLOR) {

					if (typeof limit !== 'undefined') {
						if (usedPixelCount++ != skipPixelInterval) {
							continue;
						}
					}
					usedPixelCount = 0;


					let particle : Phaser.Physics.Matter.Sprite;
					if (this.particles.length > 0) {
						if (cachedParticleCount < this.particles.length) {
							particle = this.particles[cachedParticleCount++];
							particle.x = xCoord; particle.y = yCoord;
							particle.alpha = 1;
							// particle.setSensor(false);
							particle.setIgnoreGravity(false);
							// particle.setVelocityX(0);
							// particle.setVelocityY(0);

						}
						else {
							break;
						}
					}
					else {
						particle = this.scene.matter.add.sprite(xCoord, yCoord, 'particle');
					
						particle.setFixedRotation();
						particle.setAngle(0);
						particle.setBounce(1);
						particle.depth = this.depth();
						particle.setScale(OVERSAMPLE_FACTOR);
						particle.setTint(hex);
					}

					const t = (j / (height/OVERSAMPLE_FACTOR));

					if (explode) {
						particle.setVelocityX(rand(-2,2));
						particle.setVelocityY(rand(-3,-5));
					}
					else if ( t > 0.4 && t < 0.6) {
						particle.setVelocityX(rand(3,5));
					}
					
					particles.push(particle);
				}
				else if ( hex == RED_COLOR) {
					this.emit('red-piece',xCoord, yCoord);
				}
			}

			if (cachedParticleCount >= this.particles.length && this.particles.length > 0) {
				break;
			}
		}

		this.alpha(0);

		await sleep(2000);

		const promises = [];
		for(let p of particles) {
			promises.push(tweenPromise(this.scene, p, {alpha : 0}, 2000, 'Sine.easeIn', rand(0,1000)));
		}

		await Promise.all(promises);

		// if (cachedParticleCount > 0) {
		for(let p of particles) {
			p.destroy();
		}
		// }


	}

	async floatParticlesIn() {
		const name = this.name;
		const key = 19;
		const frame0 = this.scene.textures.getFrame(name,key);
		const width = frame0.width;
		const height = frame0.height;

		const variance = 40*OVERSAMPLE_FACTOR;

		const particles = [];

		for(let i = 0; i < width/OVERSAMPLE_FACTOR; i++) {
			for(let j = 0; j < height/OVERSAMPLE_FACTOR; j++) {
				const color = this.scene.textures.getPixel(i*OVERSAMPLE_FACTOR,j*OVERSAMPLE_FACTOR,name,key);
				const hex = ((color.red << 16) & 0xff0000) | ((color.green << 8) & 0xFF00) | (color.blue & 0xFF);

				if (color.alpha == 255 && hex != BG_COLOR) {
					const startX = this.x() + rand(-variance,variance);
					const startY = this.y() + rand(-variance,variance);
					const p = makeParticle(this.scene, startX, startY);
					p.setTint(hex);
					const data = {
						particle : p,
						x : (i + 1)*OVERSAMPLE_FACTOR,
						y : (j + 1)*OVERSAMPLE_FACTOR
					}
					particles.push(data);
				}
			}
		}

		const promises = [];
		for(let p of particles) {
			promises.push(tweenPromise(this.scene, p.particle, {x : this.x() + p.x - width/2, y : this.y() + p.y -height/2}, 2000, 'Sine.easeIn'));
		}

		await Promise.all(promises);

	}

	generateHighlight() {
		const name = this.name;
		const frame0 = this.scene.textures.getFrame(name,0);
		const width = frame0.width;
		const height = frame0.height;

		const graphics = this.scene.make.graphics({});
		graphics.fillStyle(0xffffff);

		for(let i = 1; i < width - 1; i++) {
			for(let j = 1; j < height - 1; j++) {

				const up = this.scene.textures.getPixelAlpha(i, j-1, name, 0);
				const middle = this.scene.textures.getPixelAlpha(i, j, name, 0);
				const right = this.scene.textures.getPixelAlpha(i+1, j, name, 0);
				const left = this.scene.textures.getPixelAlpha(i-1, j, name, 0);
				const down = this.scene.textures.getPixelAlpha(i, j+1, name, 0);

				if (middle == 255) {
					if (up != 255) {
						graphics.fillRect(i,j-1,1,1);
					}
					if (down != 255) {
						graphics.fillRect(i,j+1,1,1);
					}
					if (right != 255) {
						graphics.fillRect(i+1,j,1,1);
					}
					if (left != 255) {
						graphics.fillRect(i-1,j,1,1);
					}
				}
				
			}
		}

		const obj = this.getGameObject();
		if (obj instanceof Phaser.GameObjects.Container)
			obj.add(graphics);
		graphics.x = Math.floor(this.sprite.getCenter().x - width/2);
		graphics.y = Math.floor(this.sprite.getCenter().y - height/2);
		graphics.alpha = 0;

		// this.highlightSprite = graphics;
	}

	// async toggleHighlight(on) {

	// 	if (typeof this.highlightSprite === 'undefined') {
	// 		console.log(`warning, no highlight sprite created, making now`);
	// 		this.generateHighlight();
	// 	}

	// 	if (this.disableHighlight) {
	// 		this.highlightSprite.alpha = 0;
	// 	}
	// 	else {
	// 		await tweenPromise(this.scene, this.highlightSprite, {alpha : (on ? 0.5 : 0)}, 400);
	// 	}

	// }

	getAnimationGameObject() {
		return this.getGameObject();
	}

	destroy() {

		const self = this;
		const killTweens = (obj) => {
			if (typeof obj !== 'undefined') {
				this.scene.input.removeDebug(obj);
				obj.disableInteractive();
				self.scene.tweens.killTweensOf(obj);
				obj.destroy();
			}
		};

		this.cancelTweens();
		killTweens(this.getGameObject());
	}


}
