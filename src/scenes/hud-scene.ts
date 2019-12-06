import { Cursor } from "../objects/overlays/cursor";
import { TOP_DEPTH, tweenPromise, InputMode, sleep, BG_COLOR, OVERSAMPLE_FACTOR } from "../globals";
import { Backpack } from "../objects/overlays/backpack";
import { ItemBagOverlay } from "../objects/overlays/item-bag-overlay";
import { SceneBase } from "./scene-base";
import { WideScreen } from "../objects/overlays/widescreen-overlay";
import { BackArrow } from "../objects/overlays/back-arrow";
import { CircleTransition } from "../objects/overlays/circle-transition";
import { BagItem } from "../objects/items/bag-item";


export class HudScene extends Phaser.Scene {

	cursor: Cursor;
	backpack: Backpack;
	itemBag: ItemBagOverlay;
	base: SceneBase;
	wideScreen: WideScreen;
	circleTransition: CircleTransition;
	isItemBagShowing: boolean = false;;
	constructor() {
		super({
			key : 'hud'
		});
	}

	preload() {
		Cursor.loadResources(this);
	}

	create() {

		this.isItemBagShowing = false;
		this.wideScreen = new WideScreen(this);

		const cursor = new Cursor(this);
		this.cursor = cursor;

		const backpack = new Backpack(this,0,0);
		this.backpack = backpack;
		backpack.y( 70 );
		backpack.x( (this.game.config.width as number) - 70);
		backpack.on('selected', () => {
			if (this.isItemBagShowing)
				return;
			this.isItemBagShowing = true;
			this.showItemBag();
		});
		backpack.on('moved-over', () => {
			this.cursor.setHand();
		});
		backpack.on('moved-out', () => {
			this.cursor.setNormal();
		});

		this.itemBag = new ItemBagOverlay(this);
		this.itemBag.on('dismiss', () => {
			this.isItemBagShowing = false;
			this.hideItemBag();
		});
		this.itemBag.updateItems();
		this.itemBag.x((this.game.config.width as number));

		this.input.on('gameobjectover', function (pointer, gameObject) {
			if (this.isUsingBow) {
				return;
			}
			if (this.base.inputMode === InputMode.Walk && typeof gameObject['obj'] !== 'undefined') {
				pointer.event.stopPropagation();
				const obj = gameObject['obj'];
				obj.emit('moved-over', pointer.worldX, pointer.worldY);
			}
		},this);

		this.input.on('gameobjectout', function (pointer, gameObject) {
			if (this.isUsingBow) {
				return;
			}
			if (this.base.inputMode === InputMode.Walk && typeof gameObject['obj'] !== 'undefined') {
				pointer.event.stopPropagation();
				const obj = gameObject['obj'];
				obj.emit('moved-out', pointer.worldX, pointer.worldY);
			}
		},this);

		this.input.on('gameobjectup', function (pointer, gameObject) {
			// if (!this.inputEnabled)
			// 	return;
			if (this.base.isUsingBow) {
				return;
			}

			if ( gameObject['obj'] instanceof BackArrow || (this.base.inputMode === InputMode.Walk && typeof gameObject['obj'] !== 'undefined')) {
				pointer.event.stopPropagation();
				const obj = gameObject['obj'];
				obj.emit('selected', pointer.worldX, pointer.worldY);
			}
			// console.log(gameObject);
		}, this);

		this.input.on('pointermove', function (pointer) {
			// cursor.x(pointer.worldX/this.cameras.main.zoom);
			// cursor.y(pointer.worldY/this.cameras.main.zoom);

			this.cursor.x(pointer.x); 
			this.cursor.y(pointer.y);
			this.cursor.depth(TOP_DEPTH + 1);
		}, this);

		this.input.on('pointerdown', function (pointer) {
			this.cursor.y(this.cursor.y() + 5);
		}, this);

		this.input.on('pointerdown', function (pointer) {
			this.cursor.y(this.cursor.y() - 5);
		}, this);

		const circle = new CircleTransition(this);
		this.circleTransition = circle;
		
		this.base.initializeHud();
	}

	async showPickup(itemName: string, value?: number, invert?: boolean) {
		let valueString = "+";
		if (typeof value !== 'undefined') {
			if (value < 0) {
				valueString = "" + (value);
			}
			else {
				valueString += ("" + value);
			}
		}
		else {
			valueString += "1";
		}

		this.backpack.depth(TOP_DEPTH+1);

		await this.dismissBag();
		const gameWidth = this.game.config.width as number;
		const item = new BagItem(this, gameWidth,0, itemName);
		item.getGameObject().setScrollFactor(0);
		item.depth(TOP_DEPTH+1);
		item.x( gameWidth + item.sprite.width/2);

		const insetY = 3.8 * OVERSAMPLE_FACTOR;
		const insetX = 4 * OVERSAMPLE_FACTOR;

		item.y(item.sprite.height/2 + insetY);
		item.textBox.text = valueString;
		if (invert) {
			item.textBox.tint = BG_COLOR;
		}
		await tweenPromise(this, item.getGameObject(), {x : gameWidth -  item.sprite.width/2 - insetX}, 300);
		await sleep(1000);
		await tweenPromise(this, item.getGameObject(), {x : gameWidth + item.sprite.width/2}, 100);
		await this.returnBag();
	}

	async dismissBag() {
		const backpack = this.backpack;
		await backpack.playAnimation('open');
		// await sleep(500);
		await tweenPromise(this, backpack.getGameObject(), {x : backpack.x() - 10}, 100);
		await tweenPromise(this, backpack.getGameObject(), {x : (this.game.config.width as number) + backpack.getAnimationGameObject().width/2}, 150);
	}

	async returnBag() {
		const backpack = this.backpack;
		backpack.playAnimation('open',true);
		await tweenPromise(this, backpack.getGameObject(), {x : (this.game.config.width as number) - 70}, 200);
	}

	async hideItemBag() {
		const itemBag = this.itemBag;
		await tweenPromise(this, itemBag.getGameObject(), {x : (this.game.config.width as number)+ 10}, 200);
		await this.returnBag();
		this.base.resume();
	}

	async showItemBag() {
		// this.pause();
		const itemBag = this.itemBag;
		itemBag.updateItems();
		await this.dismissBag();
		await tweenPromise(this, itemBag.getGameObject(), {x : 0}, 200);
	}
	
	update() {
		this.cursor.depth(TOP_DEPTH*2);
	}
}