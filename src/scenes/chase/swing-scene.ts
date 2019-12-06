import { SceneBase } from "../scene-base";
import { Rope } from "../../objects/rope";
import { sleep, tweenPromise, rand, OVERSAMPLE_FACTOR, TOP_DEPTH, LINE_COLOR, DEBUG_SCENE, STATE_DID_CHASE_SCENE, InputMode, AUDIO_CHASE_LOOP, AUDIO_CHASE_START, AUDIO_FOREST, AUDIO_SWING_END, setNumOfItem, ITEM_FEATHER, AUDIO_FOREST_BACKGROUND, AUDIO_SWING_CREAK, AUDIO_FOOTSTEPS } from "../../globals";
import { PolygonArea } from "../../objects/areas/polygon-area";
import { ExitArea } from "../../objects/areas/exit-area";
import { BadGuy } from "../../objects/characters/bad-guy";
import { Particle } from "../../objects/items/particle";
import { collisionManager } from "../../utils/collision-manager";
import { LeftRightExitScene } from "../left-right-exit-scene";
import { ItemEngageBubble } from "../../objects/overlays/item-engage-bubble";
import { Cursor } from "../../objects/overlays/cursor";
import { LeftRightTransition } from "../../objects/overlays/left-right-transition";
import { Door } from "../../objects/items/door";
import { DoorBackground } from "../../objects/overlays/door-background";
import { stateManager } from "../../utils/game-state-manager";
import { audioManager } from "../../utils/audio-manager";

export class SwingScene extends LeftRightExitScene {

	private rope1;
	private rope2;
	private base;
	numTaps: number = 0;
	swingJoint: MatterJS.Constraint;
	isSittingOnSwing: boolean = false;

	constructor() {
		super();
	}

	preload() {
		super.preload();
		this.load.image('swing','resources/swing-base.png');
		BadGuy.loadResources(this);
		Door.loadResources(this);

		audioManager.preload(AUDIO_CHASE_LOOP);
		audioManager.preload(AUDIO_CHASE_START);

		if (DEBUG_SCENE) {
			setNumOfItem(ITEM_FEATHER,1);
			stateManager.set(STATE_DID_CHASE_SCENE, false);
		}
	}

	create(data) {

		super.create(data);

		this.isSittingOnSwing = false;
		this.minYForWalk = 61 * OVERSAMPLE_FACTOR;
		// this.removeRightExit();

		const me = this.me;

		const exits = this.sceneLoader.exits;
		const swingPoint = exits['swing'];

		const ropeY = swingPoint.y;
		const startX = swingPoint.x;
		const swingHeight = 130;
		const base = this.matter.add.image(startX, ropeY + swingHeight, 'swing');
		base.setSensor(true);
		base.setFixedRotation();
		base.setMass(1);
		this.base = base;

		const areas = this.sceneLoader.areas;
		const swingArea = areas['swing'] as PolygonArea;
		swingArea.on('selected', async (x,y,double) => {
			icon.hide();
			if (this.isSittingOnSwing) {
				await this.doSwing();
				return;
			}
			try {
				await me.move(base.x, base.y + 20,double);
				// this.setInputMode(InputMode.Disabled);
				// await sleep(300);
				this.sitOnSwing();
				this.setSwingMode();
			}
			catch(e) {}

		});
		const icon = new ItemEngageBubble(this,0,0);
		icon.alpha(0);

		swingArea.on('moved-out', () => {
			icon.hide();
		});
		swingArea.on('moved-over', () => {
			let offset = 0;
			if (this.isSittingOnSwing) {
				offset = -50;
				// return;
			}
			icon.setIcon(Cursor.handKey);
			icon.alpha(1);
			icon.show(swingArea.x(), swingArea.y() + offset);
		});

		const rope2 = new Rope(this);
		rope2.invincible = true;
		rope2.attach(startX,ropeY,base, {x : -base.width/2, y : -6});
		this.rope2 = rope2;

		const rope = new Rope(this);
		rope.invincible = true;
		rope.attach(startX + base.width,ropeY,base, {x : base.width/2, y : -6});
		this.rope1 = rope;

		// audioManager.play(AUDIO_FOREST);

		// setTimeout( async () => {
		// 	this.sitOnSwing();
		// 	await sleep(1000);
		// 	this.doBadGuyOutro();
		// }, 1000);
	}

	sitOnSwing() {
		this.isSittingOnSwing = true;

		audioManager.stop(AUDIO_FOOTSTEPS);
		const me = this.me;
		const obj = me.getGameObject();
		me.faceRight();
		obj.setIgnoreGravity(false);
		obj.setStatic(false);
		obj.setSensor(true);
		obj.setAngle(0);
		obj.setFixedRotation();

		me.playAnimation('swing-rest');

		const j = this.matter.add.joint(me.getGameObject(), this.base, 1, 1.2);
		j['pointB'].y = -20;
		this.swingJoint = j;

	}

	getOffSwing() {
		const me = this.me;
		this.matter.world.removeConstraint(this.swingJoint as MatterJS.Constraint, true);
		this.me.playAnimation('rest');
		me.getGameObject().setIgnoreGravity(true);
		me.getGameObject().setStatic(true);
		me.getGameObject().setSensor(true);
		me.getGameObject().setAngle(0);
		me.getGameObject().setFixedRotation();
		me.getGameObject().setVelocity(0,0);
		this.me.faceRight();
		this.isSittingOnSwing = false;
	}

	async doSwing() {
		const dude = this.me;
		sleep(700).then( () => {
			audioManager.play(AUDIO_SWING_CREAK);
		});
		await dude.swing();
		dude.sing(2,false);
		if (!stateManager.get(STATE_DID_CHASE_SCENE)) {
			if (this.numTaps++ === 2) {
				this.inputHandler.setOnTap(this, async (x: number, y: number) => {});
				this.doBadGuyOutro();
			}
		}

	}

	setSwingMode() {
		const self = this;
		this.inputHandler.setOnTap(this, async (x: number, y: number) => {

			if (!stateManager.get(STATE_DID_CHASE_SCENE)) {
				await this.doSwing();
			}
			else {
				this.getOffSwing();
				this.setWalkMode();
			}
		});

	}

	async doBadGuyOutro() {
		audioManager.stop(AUDIO_FOREST, 1000);
		this.setInputMode(InputMode.Disabled);
		this.hud.wideScreen.show();
		const me = this.me;
		const doorSpot = this.sceneLoader.exits['door'];
		const door = new Door(this, doorSpot.x, doorSpot.y);
		door.removeOverSetIcon();
		door.depth(TOP_DEPTH-1);
		await door.dissolve(doorSpot.x, doorSpot.y, { dissolveIn: true });

		// this.showDoorBackground(door);
		const background = new DoorBackground(this);
		background.setDoor(door);
		const badguy = new BadGuy(this, doorSpot.x + 2*OVERSAMPLE_FACTOR, doorSpot.y - 3 * OVERSAMPLE_FACTOR);
		badguy.depth(door.depth()-1);
		// badguy.alpha(0);
		badguy.rest();
		badguy.static(false);
		badguy.sensor(true);
		// badguy.bringToTop();
		me.ignoreGravity(true);
		me.static(true);
		me.sensor(true);
		sleep(2000);
		this.getOffSwing();
		await sleep(100);

		// me.y(badguy.y());
		// me.x(badguy.x() - 200);
		await me.walkTo(me.x(), door.y() + 10 * OVERSAMPLE_FACTOR, 15 * OVERSAMPLE_FACTOR);
		// await tweenPromise(this, badguy.getGameObject(), {alpha : 1}, 1000);
		await door.open();
		await sleep(2000);

		audioManager.stop(AUDIO_FOREST_BACKGROUND);
		audioManager.play(AUDIO_CHASE_START).then( () => {
			audioManager.play(AUDIO_CHASE_LOOP);
		});

		await badguy.walkTo(badguy.x(), badguy.y() + 10 * OVERSAMPLE_FACTOR, 15 * OVERSAMPLE_FACTOR);
		badguy.depth(TOP_DEPTH);
		door.depth(badguy.depth()-1);
		await door.close();
		background.destroy();
		await sleep(1500);
		me.stepBackwards();

		await badguy.scream();
		await sleep(2000);
		await badguy.playAnimation('run-start');
		badguy.playAnimation('run');
		me.playAnimation('run');
		me.faceLeft();
		const speed = 52 * OVERSAMPLE_FACTOR;
		badguy.faceLeft();
		me.moveTo(-15 * OVERSAMPLE_FACTOR, me.y(), speed);
		await badguy.moveTo(0, badguy.y(), speed);

		badguy.destroy();

		const transition = new LeftRightTransition(this);
		await transition.show();

		this.exitScene('exit');

	}

	update() {
		super.update();
		try {
			this.rope1.update();
			this.rope2.update();
		}
		catch(e) {}

	}
}