import * as Phaser from 'phaser';
import { SceneBase } from './scenes/scene-base';
import { stateManager } from './utils/game-state-manager';

/**
 * constants
 */
export const OVERSAMPLE_FACTOR = 6;
export const LINE_COLOR = 0x545476;
export const BG_COLOR = 0xb6b3a2;
export const RED_COLOR = 0xee2121;
export const SHADOW_COLOR = 0xa3a192;
export const TOTAL_RED_PIECES = 23;
export const TOTAL_MUSHROOMS = 5;
export const TOTAL_ACORNS = 4;
export const DEFAULT_BODY_NAME = 'defaultBody';
export const PRODUCTION_MODE = true;
export const DEBUG_SCENE = (PRODUCTION_MODE ? false : true);
export const SHOW_RESUME = (PRODUCTION_MODE ? true : false);
export const TOP_DEPTH = 9999999999;

/**
 * states
 */
export const STATE_DID_START_GAME = 'did-start-game';
export const STATE_DID_FINISH_GAME = 'did-finish-game';
export const STATE_DID_MEET_SPIRIT = 'did-meet-spirit';
export const STATE_DID_CHASE_SCENE = 'did-chase-scene';
export const STATE_DID_MEET_ACORN_GUY = 'did-meet-acorn-guy';
export const STATE_DID_GIVE_ACORNS = 'did-give-acorns';
export const STATE_DID_MEET_DUDE = 'did-meet-dude';
export const STATE_DID_STREAM_SCENE = 'did-stream-scene';
export const STATE_DID_MEET_WITCH = 'did-meet-witch';
export const STATE_DID_WITCH_APPEAR = 'did-witch-appear';
export const STATE_DID_COMPLETE_TRAINING = 'did-complete-training';
export const STATE_ITEMS = 'items';
export const STATE_NUM_ITEM_MAP = 'num-items';
export const STATE_CAVE_OPEN = 'cave-open';
export const STATE_DID_GET_ACORNS_FROM_SQUIRREL = 'got-acorns-from-squirrel';
export const STATE_LAST_SCENE = 'last-scene';
export const STATE_LAST_EXIT = 'last-exit';
export const STATE_CURRENT_SCENE = 'current-scene';
export const STATE_CURRENT_EXIT = 'current-exit';
export const STATE_SAVED_ALL_HOSTAGES = 'saved-all-hostages';
export const STATE_HOSTAGE_SAVES = 'hostage-saves';
export const STATE_DID_BEAT_BOSS = 'beat-boss';
export const STATE_DID_PROTECT_SCENE = 'did-protect-scene';
export const STATE_DID_MUSHROOM_SCENE = 'did-mushroom-scene';
export const STATE_NUM_HOSTAGE_RED_PIECES = 'num-hostage-red-pieces';
export const STATE_DID_FIRST_STREAM_SONG = 'did-first-deer-song';
export const STATE_DID_FIRST_CAVE_SONG = 'did-first-stream-song';

// State prefixes
export const STATE_PREFIX_DID_GET_ACORN = 'got-acorn-';
export const STATE_PREFIX_DID_GET_MUSHROOM = 'got-mushroom-';
export const STATE_PREFIX_DID_SAVE_HOSTAGE = 'saved-hostage';
export const STATE_PREFIX_PICKED_UP_RED_PIECE = 'picked-up-red-piece';
export const STATE_PREFIX_DID_KILL_BAD_GUY = 'did-kill-bad-guy';
export const STATE_PREFIX_DID_KILL_BIRD = 'did-kill-bird';

// Items
export const ITEM_ACORN = 'acorn-big';
export const ITEM_SHELL = 'shell-big';
export const ITEM_RED_PIECE = 'red-piece';
export const ITEM_MUSHROOM = 'mushroom';
export const ITEM_FEATHER = 'feather';
export const ITEM_BOW = 'bow-andarrow';

// Input mode for click events
export class InputMode {
	static Convo = "CONVO";
	static ConvoResponse = "CONVO-RESPONSE";
	static Walk = "WALK";
	static Bow = "BOW";
	static Disabled = "DISABLED";
	static Notes = "NOTES";
};

export enum HostageState {
	ALIVE,
	SAVED,
	DEAD
};

/**
 * Container for audio data
 */
export interface AudioData {
	path : string,
	volume? : number,
	repeat? : boolean,
	// in seconds
	loopPoint? : number
}

export const AUDIO_SPIRIT : AudioData = {
	path : 'resources/sounds/music/spirit.ogg',
	volume : 0.9,
	repeat: true
}

export const AUDIO_HELP : AudioData = {
	path : 'resources/sounds/effects/help.ogg',
	volume : 0.4,
	repeat: false
}

export const AUDIO_SWING_CREAK : AudioData = {
	path : 'resources/sounds/effects/swing.ogg',
	volume : 0.4,
	repeat: false
}

export const AUDIO_BADGUY_SNORE : AudioData = {
	path : 'resources/sounds/effects/snore.ogg',
	volume : 0.2,
	repeat: true
}

export const AUDIO_BADGUY_BACKGROUND : AudioData = {
	path : 'resources/sounds/effects/badguy-background.ogg',
	volume : 1.5,
	repeat: true
}

export const AUDIO_NOTE_PAD : AudioData = {
	path : 'resources/sounds/effects/note-pad.ogg',
	volume : 0.7,
	repeat: true
}

export const AUDIO_GEM_SHINE : AudioData = {
	path : 'resources/sounds/effects/shine.ogg',
	volume : 0.1,
	repeat: true
}

export const AUDIO_BOSS_HURT : AudioData = {
	path : 'resources/sounds/effects/boss-hurt.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_CAVE_OPEN : AudioData = {
	path : 'resources/sounds/effects/cave-open.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_BOSS_JUMP : AudioData = {
	path : 'resources/sounds/effects/boss-jump.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_BOSS_ENTER : AudioData = {
	path : 'resources/sounds/effects/boss-enter.ogg',
	volume : 0.75,
	repeat: false
}

export const AUDIO_DOOR_EXPLODE : AudioData = {
	path : 'resources/sounds/effects/explode.ogg',
	volume : 0.25,
	repeat: false
}

export const AUDIO_GROUND_STOMP : AudioData = {
	path : 'resources/sounds/effects/ground-pound.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_LASER_CHARGE : AudioData = {
	path : 'resources/sounds/effects/laser-charge.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_LASER_SHOOT : AudioData = {
	path : 'resources/sounds/effects/laser.ogg',
	volume : 0.8,
	repeat: false
}

export const AUDIO_SPIRIT_LAUGH : AudioData = {
	path : 'resources/sounds/effects/laugh2.ogg',
	volume : 0.1,
	repeat: false
}

export const AUDIO_BIRD_FLY : AudioData = {
	path : 'resources/sounds/effects/bird-wings.ogg',
	volume : 0.2,
	repeat: true
}

export const AUDIO_DOOR_FADE_IN : AudioData = {
	path : 'resources/sounds/effects/door-in.ogg',
	volume : 0.5,
	repeat: false
}

export const AUDIO_BALLOON_POP : AudioData = {
	path : 'resources/sounds/effects/balloon-pop.ogg',
	volume : 0.05,
	repeat: false
}

export const AUDIO_SMOKE_CLOUD : AudioData = {
	path : 'resources/sounds/effects/smoke-cloud.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_DOOR_OPEN : AudioData = {
	path : 'resources/sounds/effects/door-open.ogg',
	volume : 0.1,
	repeat: false
}

export const AUDIO_DOOR_CLOSE : AudioData = {
	path : 'resources/sounds/effects/door-close.ogg',
	volume : 0.1,
	repeat: false
}

export const AUDIO_DOOR_FADE_OUT : AudioData = {
	path : 'resources/sounds/effects/door-out.ogg',
	volume : 0.5,
	repeat: false
}

export const AUDIO_NIGHT_BACKGROUND : AudioData = {
	path : 'resources/sounds/music/night.ogg',
	volume : 0.35,
	repeat: true
}


export const AUDIO_FOREST_BACKGROUND : AudioData = {
	path : 'resources/sounds/music/birds.ogg',
	volume : 0.1,
	repeat: true
}

export const AUDIO_CAVE : AudioData = {
	path : 'resources/sounds/music/cave.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_STREAM : AudioData = {
	path : 'resources/sounds/effects/stream.ogg',
	volume : 0.9,
	repeat: true
}

export const AUDIO_BADGUY_STEP : AudioData = {
	path : 'resources/sounds/effects/badguy-step.ogg',
	volume : 0.9,
	repeat: true
}

export const AUDIO_BADGUY_BREATH : AudioData = {
	path : 'resources/sounds/effects/badguy-breath.ogg',
	volume : 0.9,
	repeat: true
}

export const AUDIO_BADGUY_SCREAM : AudioData = {
	path : 'resources/sounds/effects/monster-scream.ogg',
	volume : 0.6,
	repeat: false
}

export const AUDIO_BADGUY_DIE : AudioData = {
	path : 'resources/sounds/effects/monster-die.ogg',
	volume : 0.25,
	repeat: false
}

export const AUDIO_CAMPFIRE : AudioData = {
	path : 'resources/sounds/effects/campfire.ogg',
	volume : 0.1,
	repeat: true
}

export const AUDIO_BADGUY_BREAK : AudioData = {
	path : 'resources/sounds/effects/glass-break.ogg',
	volume : 0.05,
	repeat: false
}

export const AUDIO_PICK_UP : AudioData = {
	path : 'resources/sounds/effects/pick-up-bag.ogg',
	volume : 0.6,
	repeat: false
}

export const AUDIO_SQUIRREL : AudioData = {
	path : 'resources/sounds/effects/squirrel.ogg',
	volume : 0.1,
	repeat: false
}

export const AUDIO_SPEECHBUBBLE_NEXT : AudioData = {
	path : 'resources/sounds/effects/speech-bubble.ogg',
	volume : 0.2,
	repeat: false
}

export const AUDIO_SPEECHBUBBLE_CLOSE : AudioData = {
	path : 'resources/sounds/effects/speech-bubble-close.ogg',
	volume : 0.2,
	repeat: false
}

export const AUDIO_ARROW_HIT : AudioData = {
	path : 'resources/sounds/effects/arrow-hit.ogg',
	volume : 0.9,
	repeat: false
}

const noteVolume = 1;
export const AUDIO_NOTE_1 : AudioData = {
	path : 'resources/sounds/effects/note1.ogg',
	volume : noteVolume,
	repeat: false
}

export const AUDIO_NOTE_RUMBLE : AudioData = {
	path : 'resources/sounds/effects/note-rumble.ogg',
	volume : 1,
	repeat: false
}

const deerVolume = 0.5;
export const AUDIO_DEER_NOTE_1 : AudioData = {
	path : 'resources/sounds/effects/deer-note1.ogg',
	volume : deerVolume,
	repeat: false
}

export const AUDIO_DEER_NOTE_2 : AudioData = {
	path : 'resources/sounds/effects/deer-note2.ogg',
	volume : deerVolume,
	repeat: false
}

export const AUDIO_DEER_NOTE_3 : AudioData = {
	path : 'resources/sounds/effects/deer-note3.ogg',
	volume : deerVolume,
	repeat: false
}

const birdVolume = 1.5;
export const AUDIO_BIRD_NOTE_1 : AudioData = {
	path : 'resources/sounds/effects/bird-note1.ogg',
	volume : birdVolume,
	repeat: false
}

export const AUDIO_BIRD_NOTE_2 : AudioData = {
	path : 'resources/sounds/effects/bird-note2.ogg',
	volume : birdVolume,
	repeat: false
}

export const AUDIO_BIRD_NOTE_3 : AudioData = {
	path : 'resources/sounds/effects/bird-note3.ogg',
	volume : birdVolume,
	repeat: false
}

export const AUDIO_BIRD_NOTE_4 : AudioData = {
	path : 'resources/sounds/effects/bird-note4.ogg',
	volume : birdVolume,
	repeat: false
}

export const AUDIO_FOREST : AudioData = {
	path : 'resources/sounds/music/chill-short.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_SWING_END : AudioData = {
	path : 'resources/sounds/music/swing-end.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_FOOTSTEPS : AudioData = {
	path : 'resources/sounds/effects/foot-steps.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_BOW_PULL : AudioData = {
	path : 'resources/sounds/effects/bow-and-arrow.ogg',
	volume : 0.25,
	repeat: false
}

export const AUDIO_ARROW : AudioData = {
	path : 'resources/sounds/effects/arrow.ogg',
	volume : 0.05,
	repeat: false
}

export const AUDIO_CHASE_START : AudioData = {
	path : 'resources/sounds/music/run-intro.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_CHASE_LOOP : AudioData = {
	path : 'resources/sounds/music/run-loop.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_RUN_END : AudioData = {
	path : 'resources/sounds/music/run-end.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_BOSS_START : AudioData = {
	path : 'resources/sounds/music/boss-intro.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_HOSTAGE : AudioData = {
	path : 'resources/sounds/music/hostage.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_BOSS_LOOP : AudioData = {
	path : 'resources/sounds/music/boss-loop.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_PROTECT_START : AudioData = {
	path : 'resources/sounds/music/boss-run-intro.ogg',
	volume : 1,
	repeat: false
}

export const AUDIO_PROTECT_LOOP : AudioData = {
	path : 'resources/sounds/music/boss-run-loop.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_WITCH : AudioData = {
	path : 'resources/sounds/music/witch.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_TRAINING : AudioData = {
	path : 'resources/sounds/music/training.ogg',
	volume : 1,
	repeat: true
}

export const AUDIO_RECORD_PLAYER : AudioData = {
	path : 'resources/sounds/music/ending-record-player.ogg',
	volume : 1,
	repeat: true
}

export interface FrameRateData {
	[frameRate : string] : number,
};

// --------------------------------------------------------
// Helper functions
// --------------------------------------------------------
export const sleep = async (time : number) => {
  await new Promise( (resolve, reject) => {
    setTimeout( () => {
      return resolve();
    },time);
  });
};

export const makeParticle = (scene: Phaser.Scene, x: number, y: number) => {
	const particle = scene.add.image(x, y, 'particle');
	particle.setScale(OVERSAMPLE_FACTOR);
	particle.setTint(LINE_COLOR);
	return particle;
}

export const loadAnimation = (scene : Phaser.Scene, jsonKey: string, frameRateData : FrameRateData) => {
  const spriteData = scene.cache.json.get(jsonKey);
  if (typeof spriteData !== 'undefined') {
		const animData = spriteData.meta.frameTags;
    animData.forEach( (anim) => {
			const frameRate = frameRateData[anim.name];
      scene.anims.create({
        key: (jsonKey + '-' + anim.name),
        frames: scene.anims.generateFrameNames(jsonKey, {start:anim.from, end:anim.to}),
        frameRate: (typeof frameRate !== 'undefined' ? frameRate : 15)
      });
    });
	}
	else {
		console.log(`no animation data for key ${jsonKey}`);
	}
};

export const tweenPromise = async (scene : Phaser.Scene ,obj : Phaser.GameObjects.Image | Phaser.GameObjects.Container | Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics | Phaser.Cameras.Scene2D.Camera, props : any, duration : number, easingType? : string, delay?: number) => {
	
	easingType = (typeof easingType !== 'undefined' ? easingType : 'Linear');
	if (delay) {
		await sleep(delay);
	}
  await new Promise( (resolve, reject) => {
    let options = {
      targets: obj,
      ease: easingType,
      duration: duration,
      yoyo: false,
      repeat: 0,
      onStart: function () {},
      onComplete: function (a: Phaser.Tweens.Tween) {
				if (a.progress < 1) {
					return reject();
				}
        return resolve();
			}
    };
    for(let k in props)
      options[k] = props[k];
    scene.tweens.add(options);
  });
};

/**
 * random number between min and max
 * @param min 
 * @param max 
 */
export const rand = (min : number, max : number) => {
  return min + Math.random() * (max - min);
};

export const getFile = (url: string) => {
  return new Promise(function(resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      let status = xhr.status;
      if (status == 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    try {
      xhr.send();
    }
    catch(e) {
      reject(e);
    }
  });
};

export const getJSON = async (url: string, numRetries?: number) => {
  numRetries = (typeof numRetries === 'undefined' ? 5 : numRetries);
  let retryIndex = 0;
  while (retryIndex++ < numRetries) {
    try {
      return await getFile(url);
    }
    catch(e) {
      console.log(`couldn't load ${url}, retrying`);
      await sleep(1000);
    }
  }
};

export const setPickUpAcorn = (scene: SceneBase, which: number) => {
	return stateManager.set(STATE_PREFIX_DID_GET_ACORN + scene.name + which, true);
};

export const didPickUpAcorn = (scene: SceneBase, which: number) => {
	return stateManager.get(STATE_PREFIX_DID_GET_ACORN + scene.name + which);
};

export const setPickUpMushroom = (scene: SceneBase, which: number) => {
	return stateManager.set(STATE_PREFIX_DID_GET_MUSHROOM + scene.name + which, true);
};

export const didPickUpMushroom = (scene: SceneBase, which: number) => {
	return stateManager.get(STATE_PREFIX_DID_GET_MUSHROOM + scene.name + which);
};

export const didSaveHostage = (which: string) => {
	const states = stateManager.get(STATE_HOSTAGE_SAVES,{});
	if (typeof states[which] !== 'undefined') {
		return states[which] === HostageState.SAVED;
	}
	return false;
};

export const isHostageDead = (which: string) => {
	const states = stateManager.get(STATE_HOSTAGE_SAVES,{});
	if (typeof states[which] !== 'undefined') {
		return states[which] === HostageState.DEAD;
	}
	return false;
};

export const setSavedHostage = (which: string, state : HostageState) => {
	const states = stateManager.get(STATE_HOSTAGE_SAVES,{});
	states[which] = state;
};

export const didCompleteHostage = (which: string) => {
	const states = stateManager.get(STATE_HOSTAGE_SAVES,{});
	return states[which] === HostageState.SAVED;
};

export const didKillBadguy = (which: string) => {
	return stateManager.get(STATE_PREFIX_DID_KILL_BAD_GUY + "-" + which);
};

export const didKillBird = (scene: string, which: string) => {
	return stateManager.get(STATE_PREFIX_DID_KILL_BIRD + scene + which);
};

export const setDidKillBird = (scene: string, which: string, value?:boolean) => {
	value = (typeof value === 'undefined' ? true : false);
	stateManager.set(STATE_PREFIX_DID_KILL_BIRD + scene + which, value);
};

export const setDidKillBadguy = (which: string) => {
	return stateManager.set(STATE_PREFIX_DID_KILL_BAD_GUY + "-" + which, true);
};

export const setPickUpRedPiece = (scene: string, which: string) => {
	return stateManager.set(STATE_PREFIX_PICKED_UP_RED_PIECE + scene + which, true);
};

export const didPickUpRedPiece = (scene: string, which: string) => {
	return stateManager.get(STATE_PREFIX_PICKED_UP_RED_PIECE + scene + which, false);
};

export const numOfItem = (itemName: string) => {
	const numItemMap = stateManager.get(STATE_NUM_ITEM_MAP,{});
	const r = numItemMap[itemName];
	if (typeof r === 'undefined')
		return 0;
	else
		return r;
};

export const numRedPieces = () => {
	return numOfItem(ITEM_RED_PIECE);
};

export const numMushrooms = () => {
	return numOfItem(ITEM_MUSHROOM);
};

export const numAcorns = () => {
	return numOfItem(ITEM_ACORN);
};

export const setNumOfItem = (itemName: string, howMany: number) => {
	const items = stateManager.get(STATE_ITEMS) as string[];
	const ind = items.indexOf(itemName);
	if (howMany == 0) {
		if (ind >= 0)
			items.splice(ind,1);
	}
	else {
		if (ind < 0)
			items.push(itemName);
	}
	const numItemMap = stateManager.get(STATE_NUM_ITEM_MAP,{});
	numItemMap[itemName] = howMany;

	stateManager.save();
}