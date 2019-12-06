'use strict';

import { EventEmitter } from "events";
import { Howl } from 'howler';
import { AudioData } from "../globals";

class AudioManager extends EventEmitter {
	soundMap: {
		[name : string] : Howl;
	};

  constructor() {
    super();
    this.soundMap = {};
  }

	preload(audioData: AudioData, key?: string) {
    const volume = (typeof audioData.volume === 'undefined' ? 1 : audioData.volume);
    const repeat = (typeof audioData.repeat === 'undefined' ? false : audioData.repeat);
    const soundKey = (typeof key === 'undefined' ? audioData.path : key);

		let sound = this.soundMap[soundKey];

		if (typeof sound === 'undefined') {
			sound = new Howl({
				src: [audioData.path],
				autoplay : false,
				preload : true,
				volume : volume,
				loop: repeat
			});
			sound.once('load', () => {
				console.log('loaded ' + audioData.path);
			})
			this.soundMap[soundKey] = sound;
		}

		return sound;
	}

  play(audioData: AudioData, key?: string) {
    const volume = (typeof audioData.volume === 'undefined' ? 1 : audioData.volume);

    return new Promise( (resolve, reject) => {

      let sound = this.preload(audioData, key);
			if (!sound.loop() || !sound.playing()) {
				sound.volume(volume);
				sound.play();
			}
      
      sound.on('end', () => {
				if (audioData.loopPoint) {
					sound.seek(audioData.loopPoint);
					// sound.play();
				}
        return resolve();
      });

    });
  }

  playNext(audioData: AudioData) {
    return new Promise( (resolve, reject) => {
      let promises = [];
      for(let s in this.soundMap) {
        let sound = this.soundMap[s];
        if (sound.playing()) {
          let p = new Promise( (resolve1, reject1) => {
            sound.once('end', () => {
              if (sound.loop()) {
                sound.stop();
              }
              resolve1();
            });
          });
          promises.push(p);
        }
      }
      Promise.all(promises).then( async () => {
        await this.play(audioData);
        return resolve();
      })
    });


	}
	
	async stopAllWithPath(kind: AudioData) {
		const p = [];
    for(let s in this.soundMap) {
			const sound = this.soundMap[s] as Howl;
			if (sound._src === kind.path)
      	p.push(this.stop(s));
		}
		await Promise.all(p);
  }


  async stopAll(time?: number) {
    for(let s in this.soundMap) {
      await this.stop(s, time);
    }
  }

  setVolume(path,vol) {
    let sound = this.soundMap[path];
    if (typeof sound !== 'undefined') {
      sound.volume(vol);
    }
  }

  stop(audioData: AudioData | string, fadeTime?: number) {
    fadeTime = (typeof fadeTime === 'undefined' ? 900 : fadeTime);
    return new Promise( (resolve, reject) => {
      let sound = this.soundMap[typeof audioData === 'string' ? audioData : audioData.path];

      if (typeof sound !== 'undefined') {
        let vol = sound.volume();
        sound.fade(vol,0,fadeTime);
        sound.once('fade', () => {
          sound.stop();
          sound.volume(vol);
          return resolve();
        });
      }
      else {
        // console.error(`no sound with key ${path}`);
        return resolve();
      }
    });
  }

  pause() {
    for(let k in this.soundMap) {
      let sound = this.soundMap[k];
      if (sound.playing()) {
        sound.resumeLater = true;
        sound.pause();
      }
    }
  }

  resume() {
    for(let k in this.soundMap) {
      let sound = this.soundMap[k];
      if (sound.resumeLater) {
        sound.play();
      }
      sound.resumeLater = false;
    }
  }
}

export const audioManager = new AudioManager();
