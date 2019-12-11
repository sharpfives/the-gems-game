import { EnterFromDoorScene } from "./enter-from-door-scene";
import { RecordPlayer } from "../objects/items/record-player";
import { sleep, OVERSAMPLE_FACTOR, tweenPromise, InputMode, AUDIO_ARROW, STATE_DID_FINISH_GAME, AUDIO_RECORD_PLAYER, AUDIO_SPIRIT, AUDIO_BOW_PULL, AUDIO_BADGUY_BREAK } from "../globals";
import { Spirit } from "../objects/characters/spirit";
import { SceneBase } from "./scene-base";
import { Arrow } from "../objects/arrow";
import { audioManager } from "../utils/audio-manager";
import { Door } from "../objects/items/door";
import { CircleTransition } from "../objects/overlays/circle-transition";
import { stateManager } from "../utils/game-state-manager";

export class EndingScene extends EnterFromDoorScene {
	spirit: Spirit;
	recordPlayer: RecordPlayer;
	originalX: number;
	originalY: number;
	constructor() {
		super();
	}

	preload() {
		super.preload();
		RecordPlayer.loadResources(this);
		Spirit.loadResources(this);
	}

	create(data) {
		super.create(data);
		const me = this.me;
		me.on('entered', async (door: Door) => {
			this.setInputMode(InputMode.Disabled);
			this.originalX = this.me.x();
			this.originalY = this.me.y();

			me.faceRight();
			this.createSmokeCloud(door.x(), door.y());
			door.destroy();
			await sleep(2000);
			this.doConvo();
		});
		const p = this.sceneLoader.exits['record-player'];
		const recordPlayer = new RecordPlayer(this, p.x, p.y);
		this.recordPlayer = recordPlayer;
		recordPlayer.sensor(true);

		const sceneWidth = this.game.config.width as number;
		this.matter.add.rectangle(sceneWidth/2, 79 *OVERSAMPLE_FACTOR, sceneWidth, 10, { isStatic: true });

		const spirit = new Spirit(this,recordPlayer.x() + 26 * OVERSAMPLE_FACTOR,recordPlayer.y() + 50);
		// spirit.alpha(0);
		spirit.hover();
		this.spirit = spirit;

		recordPlayer.setContactHandler(Arrow, (arrow) => {
			arrow.destroy();
			audioManager.play(AUDIO_BADGUY_BREAK);
			audioManager.stop(AUDIO_RECORD_PLAYER,100);
			this.cameras.main.shake(50, 0.01);
			recordPlayer.breakIntoParticles({
				limit: 100,
				explode: true
			});
		});

		this.setInputMode(InputMode.Disabled);

	}

	async doConvo() {
		const spirit = this.spirit;
		const me = this.me;

		me.x(this.originalX);
		me.y(this.originalY);

		me.faceRight();
		await this.startConversation(spirit, {
			convo : [
				{ text: "::ahem::" }
			]
		});
		this.setInputMode(InputMode.Disabled);
		await this.doRecordPlayerFix();
		await this.startConversation(spirit, {
			convo : [
				{ text: "that's better" }
			]
		});
		this.setInputMode(InputMode.Disabled);
		await sleep(2000);
		await this.startConversation(spirit, {
			convo : [
				{ text: "ahhh..." },
				{ text: "that's the stuff" }
			]
		});
		this.setInputMode(InputMode.Disabled);
		await sleep(1500);
		await this.startConversation(spirit, {
			convo : [
				{ text: "my jams." },
				{ text: "are you hearing this?" },
				{ text: "i mean wow." },
				{ text: "these guys can really rip." },
			]
		});
		this.setInputMode(InputMode.Disabled);
		await sleep(1500);
		await this.startConversation(spirit, {
			convo : [
				{ text: "thanks again for your help." },
				{ text: "you really saved the day." },
				{ text: "i owe ya." }
			]
		});
		this.setInputMode(InputMode.Disabled);
		await sleep(1500);
		await this.startConversation(spirit, {
			convo : [
				{ text: "what?" }, 
				{ text: "don't feel bad" }, 
				{ text: "you completed a very important mission" }, 
				{ text: "music has been saved for all of humankind" }, 
				{ text: "and now you can sit back" }, 
				{ text: "relax" }, 
				{ text: "and enjoy some spectacular tunes" }, 
			]
		});

		this.setInputMode(InputMode.Disabled);
		await sleep(4000);
		await this.shootArrow();
		await sleep(4000);
		await this.startConversation(spirit, {
			convo : [
				{ text: "point taken." }
			]
		});
		this.setInputMode(InputMode.Disabled);

		const c = new CircleTransition(this);
		c.shapeMask.scale = 3;
		// this.hud.wideScreen.show();
		await tweenPromise(this, c.shapeMask, {scaleX : 0, scaleY : 0}, 1000);

		audioManager.play(AUDIO_RECORD_PLAYER);
		stateManager.set(STATE_DID_FINISH_GAME,true);
		this.scene.launch('credits');
		this.scene.bringToTop('credits');


	}

	async doRecordPlayerFix() {
		const spirit = this.spirit;
		await spirit.playAnimation('pull-out-jewel');
		await sleep(1700);
		spirit.playAnimation('face-record');
		const originalX = spirit.x();
		const originalY = spirit.y();
		await tweenPromise(this, spirit.getGameObject(), {x : this.recordPlayer.x(), y : originalY + 3 * OVERSAMPLE_FACTOR}, 1000);
		audioManager.stop(AUDIO_SPIRIT,2000);
		spirit.playAnimation('fix');
		await sleep(1000);
		spirit.playAnimation('turn around');
		await this.recordPlayer.playAnimation('fixed');
		await tweenPromise(this, spirit.getGameObject(), {x :originalX, y : originalY}, 1000);
		audioManager.play(AUDIO_RECORD_PLAYER);
		await this.recordPlayer.playAnimation('start-play');
		this.recordPlayer.playAnimation('play');
	}

	async shootArrow() {
		this.bow.setAlpha(1);
		audioManager.play(AUDIO_BOW_PULL);
		await this.bow.playAnimation('pull');
		await sleep(1000);
		const arrow = new Arrow(this,this.me.x(), this.me.y()-1);
		arrow.shoot(0);
		audioManager.play(AUDIO_ARROW);
		await this.bow.playAnimation('release');
	}

	update() {
		super.update();
		if (this.inputMode !== InputMode.Convo) {
			this.setInputMode(InputMode.Disabled);
		}
	}

}