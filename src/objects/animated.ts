'use strict';

import { MoveableObject } from './moveable-object';
import { loadAnimation, OVERSAMPLE_FACTOR, FrameRateData } from '../globals';

export class Animated extends MoveableObject {
  constructor(scene : Phaser.Scene, x : number, y : number, name : string) {
    super(scene,x,y,name);
    loadAnimation(scene, name, this.getFrameRateData());
	}
	
  protected initGameObject(x : number, y : number, name : string) {
    const sprite = this.scene.add.sprite(x,y,name);
    // sprite.setScale(OVERSAMPLE_FACTOR);
    this.sprite = sprite;
	}

	setAlpha(alpha: number) {
		this.getGameObject().setAlpha(alpha);
	}

	protected getFrameRateData() : FrameRateData {
		return {};
	}

	setRepeat(animationName : string) {
		this.getAnimation(animationName).repeat = -1;
	}

  getAnimationForKey(key : string) {
    return this.name + '-' + key;
  }

  isPlayingAnimation(name : string) {
		const obj = this.getAnimationGameObject();

		if (obj instanceof Phaser.GameObjects.Sprite) {
			const animName = this.getAnimationForKey(name);
			if (obj.anims.currentAnim == null)
				return false;
	
			if (obj.anims.currentAnim.key !== animName)
				return false;
	
			return obj.anims.isPlaying;
		}
	}
	
	pauseAnimation() {
		const obj = this.getAnimationGameObject();
		if (obj instanceof Phaser.GameObjects.Sprite) {
			if (obj.anims.currentAnim == null)
				return;

			obj.anims.currentAnim.pause();
		}
	}

	resumeAnimation() {
		const obj = this.getAnimationGameObject();
		if (obj instanceof Phaser.GameObjects.Sprite) {
			if (obj.anims.currentAnim == null)
				return;

			obj.anims.currentAnim.resume();
		}
	}

  getAnimation(name : string) {
    let animName = this.getAnimationForKey(name);
    return this.scene.anims.get(animName);
	}

  playAnimation(name : string, reverse? : boolean) {
		if (typeof reverse === 'undefined'){
			reverse = false;
		}

		const obj = this.getAnimationGameObject();

    let animName = this.getAnimationForKey(name);

		if (obj instanceof Phaser.GameObjects.Sprite) {

			return new Promise( (resolve, reject) => {
				if (typeof obj.anims === 'undefined')
					return;
				obj.anims.stop();
				
				let cb = (anim, frame) => {
					if (anim.key === animName) {
						obj.removeListener('animationcomplete',cb);
						return resolve();
					}
				};
				obj.on('animationcomplete', cb, this);
				if (!reverse) {
					obj.anims.play(animName);
				}
				else {
					obj.anims.playReverse(animName);
				}
			});
		}
  }
}
