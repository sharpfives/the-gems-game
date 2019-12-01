'use strict';

import { EventEmitter } from 'events';

export class GameState extends EventEmitter {
	name: string;
	value: any;
  constructor(_name: string, _value: any) {
    super();
    this.name = _name;
    this.value = _value;
  }

  set(val: any) {
    this.value = val;
    this.emit('change');
  }
}
