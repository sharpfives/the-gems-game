'use strict';

import { EventEmitter } from "events";

export interface ConversationConfig {
	handlers? : {
		[name : string] : (convo: Conversation) => void
	},
	convo : string | any[],
	zoom? : boolean
}

export class Conversation extends EventEmitter {

	private data = [];
	private nextData = [];
	private index: number = 0;
	private responses = [];

  constructor(private scene : Phaser.Scene) {
    super();
  }

  load(convoJsonKey : string) {
		this.data = this.scene.cache.json.get(convoJsonKey);
  }

  start(convo? : string | any[]) {
		if (typeof convo === 'string') {
			this.load(convo);
		}
		else if (typeof convo === 'object') {
			this.data = convo;
		}

		// const data1 = this.findDataWithKey('start');
		// const data2 = this.findDataWithKey('middle');

		if (this.index == 0) {
			this.emit('start');
		}

		this.index = 0;
    this.nextData = this.data;
    this.next();
  }

  onEnd(value?) {
    this.index = 0;
    this.emit('end', value);
  }

  selectResponse(selectionIndex: number) {
    // prompt.get(['selection'],  (err, result) => {
      // if (err) { console.log(err); return 1; }
      // console.log('  selection: ' + result.selection);
      let response = this.responses[selectionIndex];
      let responseText = Object.keys(response)[0];
      let responseNextData = response[responseText];
      // console.log(`  response: ${responseText}`);
      // console.log(`  responseNextData: ${JSON.stringify(responseNextData)}`);

      if (typeof responseNextData === 'object') {
        this.index = 0;
        this.nextData = responseNextData;
        this.next();
      }
      else if (typeof responseNextData === 'number'){
        this.next();
      }
    // });
  }

  next() {

		if (this.index >= this.nextData.length) {
			this.onEnd();
			return;
		}

    // console.log(`stackIndex : ${JSON.stringify(index)}`);
    const bit = this.nextData[this.index];

    // console.log(`bit: ${JSON.stringify(bit)}`);
    const text = bit.text;
		const key = bit.key;
    console.log(`- ${text}`);
    const responses = bit.responses;

    const end = bit.end;
    if (typeof end !== 'undefined') {
      this.onEnd(end);
      return;
    }
    else if (typeof responses !== 'undefined') {
      this.responses = responses;
      let responseTextArray = [];
      for (let r in responses) {
        let choice = Object.keys(responses[r])[0];
        console.log(`-- (${r}) ${choice}`);
        responseTextArray.push(choice);
      }
      this.emit('text',text,key,responseTextArray);
    }
    else {

      this.index++;

      if (typeof key === 'undefined' && typeof text === 'undefined' && this.index >= this.nextData.length) {
        this.onEnd(end);
      }
      else {
        this.emit('text',text,key);
      }

    }
	}
	
	findDataWithKey(key: string, search?) {
		if (!search) {
			search = this.data;
		}
		for (let k in search) {
			const data = search[k];
			if (typeof data === 'object') {
				const ret = this.findDataWithKey(key, data);
				if (typeof ret !== 'undefined') {
					return ret;
				}
			}
			else if (k === 'key' && data === key) {
				return search;
			}
		}
	}
}
