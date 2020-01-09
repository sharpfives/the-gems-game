import { BG_COLOR, LINE_COLOR, InputMode } from "../globals";
import { SceneBase } from "./scene-base";


export class UnsupportedScene extends SceneBase {
	constructor() {
		super();
	}

	preload() {
		super.preload();
	}

	create(data) {
		super.create(data);

		this.setInputMode(InputMode.Disabled);
		this.me.alpha(0);
		const sceneWidth = this.game.config.width as number;
		const sceneHeight = this.game.config.height as number;

		const textBox = this.add.bitmapText(sceneWidth/2, sceneHeight/2, 'nokia-font');
		textBox.setOrigin(0.5);
    textBox.tint = LINE_COLOR;
		textBox.setCenterAlign();
		textBox.text = "hi there!\n\nchrome is the only\nsupported browser at the moment.\n\ncheck out one of the download\nlinks below for a native build.\nthanks!";
	}
}