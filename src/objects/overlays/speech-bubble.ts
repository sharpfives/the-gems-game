import { MoveableObject } from "../moveable-object";
import { LINE_COLOR, BG_COLOR, tweenPromise, sleep, OVERSAMPLE_FACTOR, SHADOW_COLOR, AUDIO_SPEECHBUBBLE_NEXT, AUDIO_SPEECHBUBBLE_CLOSE } from "../../globals";
import { audioManager } from "../../utils/audio-manager";

export class SpeechBubble extends MoveableObject {

	private container: Phaser.GameObjects.Container;
	public textBox: Phaser.GameObjects.BitmapText;
	private responseTextBoxes: Phaser.GameObjects.BitmapText[] = [];
	private graphics: Phaser.GameObjects.Graphics;
	private responseCursor: Phaser.GameObjects.Graphics;
	private inset = 10;
	private maxWidth = 0;
	private responseCount = 0;
	private selectedResponseIndex = 0;
	private cursorWidth = 15;
	private cursorHeight = 15;
	boxWidth: number;
	boxHeight: number;
	cancelled: boolean = false;
	isReady = true;

	constructor(scene : Phaser.Scene, x : number, y : number) {
		super(scene,x,y,'');
		this.maxWidth = (scene.game.config.width as number)*2/3;
	}

	protected initGameObject(x: number, y : number, name : string) {
		const container = this.scene.add.container(x,y);
		this.container = container;
		
		const g = this.scene.add.graphics();
		g.fillStyle(LINE_COLOR, 1);
		this.graphics = g;
		container.add(g);

		this.textBox = this.scene.add.bitmapText(this.inset, this.inset, 'nokia-font');
    this.textBox.tint = BG_COLOR;
    this.textBox.setLeftAlign();
		
		container.add(this.textBox);
    // this.charWidth = 20;
	}

	async hide() {
		this.cancelTweens();
		audioManager.play(AUDIO_SPEECHBUBBLE_CLOSE);
		await tweenPromise(this.scene, this.container, {scaleX : 1.1, scaleY : 1.1}, 100);
		await tweenPromise(this.scene, this.container, {x : this.container.width/2, scaleX : 0, scaleY : 0}, 100);
	}

	public async show(x: number, y: number, text: string, responses? : string[]) {
		this.cancelTweens();

		while(!this.isReady) {
			await sleep(100);
		}

		this.isReady = false;
		this.cancelled = false;

		text = this.wrapText(text);

		this.textBox.setText(text);
		this.textBox.x = this.inset;
		this.textBox.y = this.inset;
		
		this.graphics.clear();
		this.graphics.fillStyle(LINE_COLOR,1);
		let boxWidth = this.textBox.width + this.inset*2;
		let boxHeight = this.textBox.height + this.inset*2;


		if (typeof this.responseCursor === 'undefined') {
      this.responseCursor = this.scene.add.graphics();
			this.responseCursor.fillStyle(BG_COLOR, 1);
      const poly = new Phaser.Geom.Polygon([ new Phaser.Geom.Point(0, 0), new Phaser.Geom.Point(this.cursorWidth, this.cursorHeight/2), new Phaser.Geom.Point(0, this.cursorHeight) ]);
			this.responseCursor.fillPoints(poly.points);
			this.container.add(this.responseCursor);
    }

		this.responseCursor.alpha = 0;

		if (responses) {

			const responseInsetX = 25;
			let startY = this.textBox.y + this.textBox.height + 10;
			let startX = this.textBox.x;
			let totalResponsesHeight = 0;
	
			this.responseCount = responses.length;
	
			for (let r in responses) {
				console.log(`Response: ${r}, ${responses[r]}`);
				if (typeof this.responseTextBoxes[r] === 'undefined') {
					const box = this.scene.add.bitmapText(10, 10, 'nokia-font');
					box.tint = SHADOW_COLOR;
					this.container.add(box);
					this.responseTextBoxes[r] = box;
				}
				const responseBox = this.responseTextBoxes[r];
				responseBox.alpha = 0;
				responseBox.x = startX + responseInsetX;
				responseBox.y = startY + totalResponsesHeight;
				responseBox.text = this.wrapText(responses[r]);

				// responseBox.removeInteractive();
				responseBox.setInteractive(new Phaser.Geom.Rectangle(10,10,responseBox.width,responseBox.height), Phaser.Geom.Rectangle.Contains);
				responseBox.on('pointerover', (pointer, localX, localY, event) => {
					event.stopPropagation();
					responseBox.tint = BG_COLOR;
					this.responseCursor.x = responseBox.x - this.cursorWidth - 10;
					this.responseCursor.y = responseBox.y + this.cursorHeight/2;
					this.responseCursor.alpha = 1;
				},this);
				responseBox.on('pointerout', (pointer, localX, localY, event) => {
					responseBox.tint = SHADOW_COLOR;
					this.responseCursor.alpha = 0;
				},this);
				responseBox.once('pointerup', (pointer, localX, localY, event) => {
					event.stopPropagation();
					this.emit('selected', r, responses[r]);
				},this);
				// this.scene.input.enableDebug(responseBox);
		
				// responseBox.maxWidth = this.textBox.width - responseInsetX - this.inset;
	
				totalResponsesHeight += (responseBox.height + 10);
				boxWidth = Math.max(boxWidth, responseBox.x + responseBox.width + this.inset);
			}
	
			this.selectedResponseIndex = 0;
			this.responseCursor.x = this.responseTextBoxes[0].x - this.cursorWidth - 10;
			this.responseCursor.y = this.responseTextBoxes[0].y + this.cursorHeight/2;
	
			// let width = this.textBox.maxWidth + this.textInsetX*2;
			boxHeight += (totalResponsesHeight + 8);
		}
		else {
			for (let r in this.responseTextBoxes) {
				this.responseTextBoxes[r].alpha = 0;
			}
		}
    
		this.graphics.fillRoundedRect(0,0,boxWidth,boxHeight,10);
		const triangleWidth = 5 * OVERSAMPLE_FACTOR;
		const triangleHeight = 20 * OVERSAMPLE_FACTOR / 6;
		this.graphics.fillTriangle(boxWidth/2 - triangleWidth/2, boxHeight, boxWidth/2 + triangleWidth/2, boxHeight, boxWidth/2, boxHeight + triangleHeight);
		this.container.setScale(0);
		this.x(x - boxWidth/2);
		this.y(y - boxHeight);
		this.textBox.setText("");

		this.boxWidth = boxWidth;
		this.boxHeight = boxHeight;

		audioManager.play(AUDIO_SPEECHBUBBLE_NEXT);
		try {
			await tweenPromise(this.scene, this.container, {x : x - boxWidth/2, y : y - boxHeight, scaleX : 1.1, scaleY : 1.1}, 100);

			await Promise.all( [
				this.animateText(text),
				tweenPromise(this.scene, this.container, {scaleX : 1, scaleY : 1}, 100)
			]);
			if (responses.length > 0) {
				this.setText(text);
			}
		}
		catch (e) {
			this.setText(text);
			this.container.setScale(1);
		}

		for (let r in responses) {
			this.responseTextBoxes[r].alpha = 1;
		}

		this.isReady = true;
	}

	wrapText(text: string) {
		const chars = text.length;
		let allText = '';
		const maxCharsPerLine = 30;
    let charsInLine = 0;
    for(let i = 0; i < chars; i++) {
			if (charsInLine++ > maxCharsPerLine && text[i] === ' ') {
        allText += '\n';
        charsInLine = 0;
			}
			else {
				allText += text[i];
			}
		}
		return allText;
	}

	async animateText(text: string) {
    let chars = text.length;
    this.setText('');
    let allText = '';
    let charsInLine = 0;
    for(let i = 0; i < chars; i++) {
      allText += text[i];
      this.setText(allText);
      if(text[i] === '\n')
        charsInLine = 0;
      // if (charsInLine++ > this.charWidth && text[i] === ' ') {
      //   allText += '\n';
      //   charsInLine = 0;
      // }
      // let size = this.textBox.getTextBounds(true);
      // this.textBox.x = -size.global.width/2;
			await sleep(10);
			if (this.cancelled) {
				throw 'cancelled';
			}
    };
	}

  setText(text: string) {
    this.textBox.setText(text);
  }

	getGameObject() {
		return this.container;
	}
}