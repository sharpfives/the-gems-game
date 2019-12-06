'use strict';

import { LeftRightExitScene } from '../left-right-exit-scene';
import { Camper } from '../../objects/characters/camper';
import { CampFire } from '../../objects/items/camp-fire';
import { stateManager } from '../../utils/game-state-manager';
import { STATE_DID_MEET_ACORN_GUY, OVERSAMPLE_FACTOR, numMushrooms, setNumOfItem, ITEM_MUSHROOM, STATE_DID_MEET_DUDE, ITEM_SHELL, DEBUG_SCENE, TOTAL_MUSHROOMS, STATE_ITEMS } from '../../globals';

export class CamperScene extends LeftRightExitScene {

	constructor() {
		super();
	}

	preload() {
		super.preload();
		Camper.loadResources(this);
		CampFire.loadResources(this);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_MUSHROOM,10);
			stateManager.set(STATE_DID_MEET_DUDE, false);
		}

	}

	create(data: any) {

		super.create(data);

		const me = this.me;

		// const fireSpot = this.sceneLoader.exits['fire'];
		// const campFire = new CampFire(this,fireSpot.x, fireSpot.y);

		const camperSpot = this.sceneLoader.exits['camper'];
		const camper = new Camper(this, camperSpot.x, camperSpot.y);
		camper.on('selected', async (x,y,double) => {
			try {
				await me.walkTo(camper.x() - 13*OVERSAMPLE_FACTOR, camper.y());
				me.faceRight();
				const mushroomCount = numMushrooms();

				const question = { 
					text : "hey.. do you have any mushrooms?",
					responses : [
						{
							"not yet" : [
								{ text: "bummer" }
							]
						},
						{
							"yep" : (mushroomCount >= TOTAL_MUSHROOMS) ? [
								{ text: "whoa!" },
								{ text: "thanks!" },
								{ text: "as a sign of utmost gratitude" },
								{ 
									text: "take this weird shell thing",
									key: "shell"
								},
								{ text: "what is it?" },
								{ text: "i mean it is SUPER weird" },
								{ text: "when i hold it" },
								{ text: "i feel like i can talk to animals" },
								{ text: "bro" },
								{ text: "stop laughing" },
								{ text: "i'm serious!" },
								{ text: "next time you see an animal, you can try to talk to it" },
								{ text: "or not" },
								{ text: "you know you're being a total buzz kill, man" },
								{ text: "ANIMALS CAN TALK" },
								{ text: "this is weird now" },
								{ text: "see ya" },
							] : [
								{ text: "oh" },
								{ text: "well i actually need " + TOTAL_MUSHROOMS },
								{ text: "come back when you have that many" }
							]
						}
					]
				};

				if (!stateManager.get(STATE_DID_MEET_DUDE)) {
					await this.startConversation(camper, {
						convo : [
							{ text : "dude."},
							{ text : "duuuude."},
							{ text : "did you know that this place"},
							{ text : "is like"},
							{ text : "magical?"},
							{ text : "these red gems have been floating around"},
							{ text : "and,"},
							{ text : "maybe i'm just wasted,"},
							{ text : "but i think they have powers."},
							{ text : "POOOOWERS, man."},
							{ text : "this one time"},
							{ text : "i came here and saw a deer."},
							{ text : "A VERY MYSTICAL DEER, my friend."},
							{ text : "she spoke to me."},
							{ text : "she whispered:"},
							{ text : "\"to create musical fusion is the ultimate goal...\""},
							{ text : "to which i said:"},
							{ text : "\"righteous, deer friend\", and she ran away."},
							{ text : "infinite wisdom, man."},
							{ text : "anyway"},
							{ text : "some folks were getting their feathers all bent up"},
							{ text : "cuz they heard about some weird gnarly things trying to steal the gems."},
							{ text : "i'm just sittin' here trying to enjoy some mushrooms"},
							question
						],
						handlers: {
							shell: () => {
								this.getShell();
							}
						},
					});
					stateManager.set(STATE_DID_MEET_DUDE, true);

				}
				else {
					if (!me.hasShell()) {
						await this.startConversation(camper, {
							handlers: {
								shell: () => {
									this.getShell();
								}
							},
							convo : [ question ]
						});
					}
					else {
						await this.startConversation(camper, {
							convo : [
								{ text: "so how's that shell workin out, man?" },
								{ text: "feel anything?" },
								{ text: "hear anything?" },
								{ text: "any animals seem like they wanna chit chat?" },
								{ text: "..." },
								{ text: "look man if youre gonna keep laughing at me." },
								{ text: "this is for real!" },
								{ text: "try it." },

							]
						});
					}

				}
				
			}
			catch(e){}
			
		});
	}

	getShell() {
		setNumOfItem(ITEM_MUSHROOM,0);
		this.showPickup(ITEM_SHELL);
		setNumOfItem(ITEM_SHELL,1);

	}

	update() {
		super.update();
	}

}