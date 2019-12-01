'use strict';

import { EventEmitter } from 'events';
import { GameState } from './game-state';

class GameStateManager extends EventEmitter {
	states: {
		[name: string] : GameState
	};

  constructor() {
    super();
    this.states = {};
  }

  set(stateName: string, stateValue: any) {
    let state = this.states[stateName];
    if (typeof state === 'undefined') {
      state = new GameState(stateName, stateValue);
      this.addState(state);
    }

    if (typeof state.set === 'function') {
      state.set(stateValue);
    }

    this.save();
  }

  get(stateName: string, defaultValue?) {
    let state = this.states[stateName];
    if (typeof state !== 'undefined') {
      if (typeof state.value !== 'undefined') {
        return state.value;
      }
      else {
        this.set(stateName, defaultValue);
        return defaultValue;
      }
    }
    else {
      this.set(stateName, defaultValue);
      return defaultValue;
    }
  }

  addState(gameState: GameState) {
    this.states[gameState.name] = gameState;
    gameState.on('change',() => {
      this.emit(gameState.name,gameState.value);
    });
  }

  reset() {
    this.states = {};
    localStorage.setItem('saveData',"{}");
  }

  save() {
    const savedStr = localStorage.getItem('saveData');
    let states = JSON.parse(savedStr);
    if (states == null) {
      states = {};
    }

    for (let s in this.states) {
			// const val = this.states[s].value;
      states[s] = this.states[s];
    }

    // let str = JSON.stringify(this.states,null,2);
    // console.log("states to be saved:");
    // console.log(str);
    localStorage.setItem('saveData',JSON.stringify(states));
  }

  load() {
    const savedStr = localStorage.getItem('saveData');
    const states = JSON.parse(savedStr);
    for (let name in states) {
      const state = states[name];
      // for (let key in state) {
        // this.set(key,state[key]);
			const gameState = new GameState(name, state.value);
      this.addState(gameState);
      // }
    }
	}
	
	clear() {
		this.states = {};
		localStorage.setItem('saveData',"{}");
	}
}

export const stateManager = new GameStateManager();
