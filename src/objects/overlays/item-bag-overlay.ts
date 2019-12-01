import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, BG_COLOR, OVERSAMPLE_FACTOR, ITEM_ACORN, ITEM_SHELL, TOP_DEPTH, ITEM_MUSHROOM, ITEM_FEATHER, ITEM_RED_PIECE, ITEM_BOW, STATE_ITEMS, STATE_NUM_ITEM_MAP } from "../../globals";
import { Item } from "../items/item";
import { BagItem } from "../items/bag-item";
import { stateManager } from "../../utils/game-state-manager";
import { BackArrow } from "./back-arrow";

export class ItemBagOverlay extends MoveableObject {
	container: Phaser.GameObjects.Container;
	itemContainer: Phaser.GameObjects.Container;
	items: any[] = [];
	numRows = 2;
	numCols = 3;
	startX = 30 * OVERSAMPLE_FACTOR;
	startY = 30 * OVERSAMPLE_FACTOR;
	itemSpacingX = 20 * OVERSAMPLE_FACTOR;
	itemSpacingY = 30 * OVERSAMPLE_FACTOR;
	width: number;
	height: number;

	constructor(scene : Phaser.Scene) {
		super(scene,0,0,'');
	}

	protected initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		container.setScrollFactor(0);
		container.depth = TOP_DEPTH-1;

		this.container = container;
		
		const gameWidth = this.scene.game.config.width as number;
		const gameHeight = this.scene.game.config.height as number;

		
		const g = this.scene.add.graphics();
		g.setScrollFactor(0);
		g.fillStyle(LINE_COLOR, 1);
		g.fillRect(0,0,gameWidth,gameHeight);
		g.fillStyle(BG_COLOR, 1);

		const inset = 15;
		this.width = gameWidth - inset*2;
		this.height = gameHeight - inset*2;

		g.fillRoundedRect(inset,inset,gameWidth-inset*2,gameHeight-inset*2, 20);
		container.add(g);

		let itemContainer = this.scene.add.container(0,0,[]);
		itemContainer.setScrollFactor(0);
		this.itemContainer = itemContainer;
		this.container.add(itemContainer);
		
		const backarrow = new BackArrow(this.scene, gameWidth - 100, 90);
		backarrow.on('selected', () => {
			this.emit('dismiss');
		});
		backarrow.getGameObject().setScrollFactor(0);
		this.container.add(backarrow.getGameObject());

	}

	updateItems() {
		// const children = this.itemContainer.list;
		// for(let k = children.length-1; k > 0; k--) {
		// 	this.itemContainer.removeAt(k,true);
		// }
		this.itemContainer.removeAll(true);
		
		// this.itemContainer.removeAll();
		this.items = [];

		const itemStr = (stateManager.get(STATE_ITEMS, []) as string[]);

		// const itemStr = [ITEM_BOW, ITEM_ACORN, ITEM_SHELL, ITEM_MUSHROOM, ITEM_FEATHER, ITEM_RED_PIECE];
		// const itemAmounts = [1, 2, 3, 10, 1, 4];
		const itemAmounts = stateManager.get(STATE_NUM_ITEM_MAP, {});

		// across cols first
		let k = 0;
    for(let key of itemStr) {
      const col = Number(k) % this.numCols;
			const row = Math.floor(Number(k) / this.numCols);

			const inset = 30;
			const x = 10 + this.startX + col*(this.width - this.startX)/this.numCols;
			const y = 10 + this.startY + row*(this.height - this.startY)/this.numRows;

			const amount = itemAmounts[key];
			if (amount > 0) {
				let item = new BagItem(this.scene, x, y, key );

				if (amount > 1) {
					const textBox = this.scene.add.bitmapText(item.x() + 9*OVERSAMPLE_FACTOR, item.y() + 8*OVERSAMPLE_FACTOR, 'nokia-font', '', 50);
					textBox.text = "" + amount;
					textBox.tint = LINE_COLOR;
					textBox.setCenterAlign();
					this.itemContainer.add(textBox);
				}

				this.items.push(item);
				this.itemContainer.add(item.getGameObject());
				k++;

			}

		}


	}

	show() {

	}

	hide() {

	}

	showSmall(itemName: string) {

	}
	
	getGameObject() {
		return this.container;
	}

}