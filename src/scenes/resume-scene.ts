'use strict';

import * as Phaser from 'phaser';
import * as Globals from '../globals';
import { MainGame } from '../main-game';
import { SongBird } from '../objects/characters/song-bird';
import { SceneBase } from './scene-base';
import { CircleTransition } from '../objects/overlays/circle-transition';
import { stateManager } from '../utils/game-state-manager';

export class ResumeScreen extends SceneBase {

  constructor() {
    super();
  }

  preload() {
		super.preload();
    SongBird.loadResources(this);
  }

  create(data) {
		super.create(data);
		this.me.alpha(0);

		const game = this.game as MainGame;

		const sceneWidth = this.game.config.width as number;
		const sceneHeight = this.game.config.height as number;

		const bird = new SongBird(this, sceneWidth/2, sceneHeight/2);
		bird.restLoop();

		const circleTransition = new CircleTransition(this);
		circleTransition.shapeMask.scale = 0.24;
		// circleTransition.shapeMask.scale = 0.25;

		const closeCircle = async () => {
			await Globals.tweenPromise(this, circleTransition.shapeMask, {scaleX : 1.1, scaleY : 1.1}, 200);
			await Globals.tweenPromise(this, circleTransition.shapeMask, {scaleX : 0, scaleY : 0}, 100);
		};
		
		this.setInputMode(Globals.InputMode.Disabled);
		setTimeout( async () => {

			const baseConvo = { 
				text : "what would you like to do?",
				responses : [
					{
						"resume my game" : [
							{ text : "okie doke!" },
							// { text : "right where you left off." },
							// { text : "i didn't touch a thing." },
							// { text : "i swear." },
							// { text : "not a thing." },
							// { text : "..." },
							// { text : "now it's weird." },
							// { text : "ok here's your game" },
							{ key : "continue" }
						]
					},
					{
						"start over" : [
							{
								text : "are you absolutely for sure? all your hard-earned progress will be lost",
								responses : [
									{
										"yep" : [
											{ key : "start-over" }
										],
									},
									{
										"nope" : [
											{ text : "ok then." },
											{ key : "repeat" }
										]
									}
								]
							}
						]
					}
				]
			};

			await this.startConversation(bird, {
				handlers : {
					'start-over' : async (convo) => {
						await closeCircle();
						stateManager.clear();
						game.sceneMap.loadScene('Start','intro',this);
					},
					'repeat' : (convo) => {
						convo.start([baseConvo]);
					},
					'continue' : async (convo) => {
						await closeCircle();

						const currentScene = stateManager.get(Globals.STATE_CURRENT_SCENE);
						const currentExit = stateManager.get(Globals.STATE_CURRENT_EXIT);
						game.sceneMap.loadScene(currentScene, currentExit, this);
					},
				},
				convo : [
					{ text : "welcome back."},
					{ text : "we missed ya."},
					baseConvo
				]
			});


		}, 3000);
	}
	
	setCurrentScene() {
		
	}

  update() {

  }
}
