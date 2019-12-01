import { BG_COLOR } from "../globals";


export class CreditsScene extends Phaser.Scene {
	constructor() {
		super({
			key : "credits"
		});
	}

	preload() {

	}

	create() {
		const sceneWidth = this.game.config.width as number;
		const sceneHeight = this.game.config.height as number;

		const textBox = this.add.bitmapText(sceneWidth/2, sceneHeight/2, 'nokia-font');
		textBox.setOrigin(0.5);
    textBox.tint = BG_COLOR;
		textBox.setCenterAlign();
		textBox.text = "the end\n\n#githubgameoff 2019\n\music, software, and art by\n@sharpfives\n\nsound effects from freesound.org";
	}
}