import { sleep } from "../globals";
import { threadId } from "worker_threads";
import { EventEmitter } from "events";


export class DrumSequence extends EventEmitter{

	private input: number[] = [];
	private indexOffset = 0;
	private lastBarNumber = -1;

	constructor(private bpm: number, private notes: number[]) {
		super();
	}

	addNote(barNumber: number) {
		if (this.input.length == 0) {
			this.indexOffset = barNumber;
		}
		else if (this.lastBarNumber === barNumber) {
			return;
		}

		this.lastBarNumber = barNumber;


		this.input[barNumber - this.indexOffset] = 1;

		if (this.input.length < this.notes.length) {
			return;
		}

		// console.log(`notes to hit ` + JSON.stringify(this.notes));
		const lastNotes = [];
		for(let n = 0; n < this.notes.length; n++) {
			lastNotes[n] = this.input[this.input.length - this.notes.length + n];
			lastNotes[n] = (lastNotes[n] == null ? 0 : lastNotes[n]);
		}

		// console.log(`note buffer ` + JSON.stringify(lastNotes));

		// if (lastNotes.length == this.notes.length) {
		// 	console.log('here');
		// }

		let correct = true;
		for(let n = 0; n < this.notes.length; n++) {
			const compareNote = lastNotes[n]
			if (compareNote != this.notes[n]) {
				correct = false;
				break;
			}
		}


		if (correct) {
			this.emit('correct');
		}
	}


	async play() {
		const timePerBeat = 1000 * 60 / this.bpm;

		for(let n of this.notes) {
			if (n != 0) {
				this.emit('note', () => {

				});
			}
			await sleep(timePerBeat);
		}
	}
}