'use strict';

import { EventEmitter } from 'events';
import { sceneFactory } from './scene-factory';
import * as Globals from '../globals';
import { SceneBase } from '../scenes/scene-base';

interface Exit {
	exit: string,
	scene: string
};

interface Connection {
	to : Exit,
	from : Exit
};

export class SceneMap extends EventEmitter {

	private currentScene: Phaser.Scene;
	private sceneData: {};
	private scenes: {};
	private connections: Connection[];

  constructor(private game: Phaser.Game) {
    super();
    this.currentScene = undefined;
    this.scenes = {};
  }

  setup(data) {
    for(let d in data) {
      this[d] = data[d];
    }
  }

  async loadScene(name: string, entranceName: string, sceneObj: Phaser.Scene) {

    let scene = this.scenes[name];
    if (typeof scene === 'undefined') {
      console.log(`Loading scene '${name}'`);
      let sceneData = this.sceneData[name];
      if (typeof sceneData === 'undefined') {
        console.log(`no sceneData for name '${name}'`);
        return;
      }
      let sceneConfig = sceneData.config;
      let sceneTypeName = sceneData.type;
      let sceneClass = sceneFactory.makeScene(sceneTypeName);
      if (typeof sceneClass === 'undefined') {
        console.log(`unable to create scene of type ${sceneTypeName}`);
        return;
      }
      // scene.game = this.game;
      // scene.type = sceneType;

      try {
        let data = await Globals.getJSON(sceneConfig);
        // this.game.cache.addJSON(scene.configName(), null, data);

        this.currentScene = sceneConfig;
        this.scenes[name] = data;
        // scene.name = name;
        this.emit('loaded-scene',name,sceneClass, data, entranceName);

        if (typeof entranceName !== 'undefined'){
          sceneObj.scene.start(name, {sceneData : data, exitName : entranceName});
        }
          // this.emit('enter',name,data,entranceName);
      }
      catch(e) {
        console.log(`unable to load scene data for ${name}, ${e}`);
      }

    }
    else {
      scene.didExit = false;
      if (typeof entranceName !== 'undefined') {
        sceneObj.scene.start(name, {sceneData : scene, exitName : entranceName});
      }
    }
  }

  exit(sceneName: string, exitName: string, sceneObj: Phaser.Scene) {
    let connections = this.connections;
    for( let c in connections) {
      let conn = connections[c];
      let from = conn.from;
      if (from.scene === sceneName && from.exit === exitName) {
        let to = conn.to;
        this.loadScene(to.scene, to.exit, sceneObj);
        return;
        // return this.emit('enter',to.scene, to.exit);
      }
    }

    for( let c in connections) {
      let conn = connections[c];
      let to = conn.to;
      if (to.scene === sceneName && to.exit === exitName) {
        let from = conn.from;
        this.loadScene(from.scene, from.exit, sceneObj);
        return;
      }
    }

    console.log(`no where to go from scene '${sceneName}' with exit '${exitName}'`);
  }

}
