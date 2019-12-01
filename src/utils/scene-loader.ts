import { Tree } from "../objects/items/tree";
import { PolygonArea } from "../objects/areas/polygon-area";
import { PhysicsObject } from "../objects/physics-object";
import { Animated } from "../objects/animated";
import { PolygonPhysicsObject } from "../objects/polygon-physics-object";
import { ExitArea } from "../objects/areas/exit-area";
import { LeftExitArea } from "../objects/areas/left-exit-area";
import { RightExitArea } from "../objects/areas/right-exit-area";
import { SpiritPool } from "../objects/items/spirit-pool";
import { Stream } from "../objects/items/stream";
import { CaveFront } from "../objects/areas/cave-front";
import { Torch } from "../objects/items/torch";
import { Camper } from "../objects/characters/camper";
import { Acorn } from "../objects/items/acorn";
import { GroundAcorn } from "../objects/items/acorn-ground";
import { NoClickArea } from "../objects/areas/no-click-area";

interface Areas {
	[key: string] : PolygonArea;
};

export class SceneLoader {

	public exits = {}
	public objects = {};
	public areas: Areas = {};

	constructor() {

	}

	load(scene: Phaser.Scene, config: any) {
		const objectClassLookup = {
			"Tree" : Tree,
			"ExitArea" : ExitArea,
			"NoClickArea" : NoClickArea,
			"LeftExitArea" : LeftExitArea,
			"RightExitArea" : RightExitArea,
			"SpiritPool" : SpiritPool,
			"Stream" : Stream,
			"CaveFront" : CaveFront,
			"Torch" : Torch,
			"Camper" : Camper,
			"Acorn" : Acorn,
			"GroundAcorn": GroundAcorn
		};

    const self = this;

		this.exits = {};
		this.objects = {};
		this.areas = {};

		// const width = config.width * config.tilewidth;
		// const height = config.height * config.tilewidth;

		const tilesetImageKeyLookup = {};
		for(let k in config.tilesets) {
			const tileset = config.tilesets[k];
			const tiles = tileset.tiles;

			const tileproperties = tileset.tileproperties;

			for(let t in tiles) {
				const tile = tiles[t];
				const objIndex = tileset.firstgid + tile.id; //Number(t);
				const objInfo = {
					key : undefined,
					type : undefined,
					shapes : undefined
				};
				if (typeof tileproperties !== 'undefined') {
					if (typeof tileproperties[t] === 'undefined') {
						console.log('no tileproperties for tileset ' + tileset.name + ' with index ' + t);
					}
					else {
						objInfo.key = tileproperties[t].key;
					}
				}
				else if(tile.properties !== 'undefined') {
					const props = tile.properties;
					for(let p in props) {
						const prop = props[p];
						objInfo[prop.name] = prop.value;
					}
				}

				objInfo.type = tile.type;

				if (typeof objInfo.key === 'undefined') {
					console.log('warning, no key property found for tile  ' + tile.image);
				}

				if (typeof tile.objectgroup !== 'undefined') {
					const objects = tile.objectgroup.objects;
					objInfo.shapes = objects;
				}

				tilesetImageKeyLookup[objIndex] = objInfo;

			}
		}

		// load layers
		for(let k in config.layers) {
			const layer = config.layers[k];
			if (layer.type === 'imagelayer') {

				const img = scene.add.image(layer.x,layer.y,layer.name).setOrigin(0);

				if (typeof layer.properties !== 'undefined') {
					const props = layer.properties;
					for(let p in props) {
						const prop = props[p];
						if (prop.name === 'depth') {
							img.depth = prop.value;
						}
					}
					
				}

				this.objects[layer.name] = img;
				if (Number(k) == 0) {
					// cameraController.sceneHeight = img.height;
					// cameraController.sceneWidth = img.width;
				}
			}
			else if(layer.type === 'objectgroup') {
				let layerOffsetX = (typeof layer.offsetx !== 'undefined' ? layer.offsetx : 0);
				let layerOffsetY = (typeof layer.offsety !== 'undefined' ? layer.offsety : 0);

				// let layerContainer = this.add.container(layerOffsetX,layerOffsetY);

				const objects = layer.objects;
				for(let o in objects) { 
					const object = objects[o];
					const gid = object.gid;
					const point = object.point;
					if (point === true) { // if it's a marker point
						this.exits[object.name] = {
							x: object.x,
							y: object.y,
							type: object.type
						}
						continue;
					}
					else if (typeof gid === 'undefined') { // if it's a random shape
						let areaToAdd;
						if (typeof object.type !== 'undefined' && typeof objectClassLookup[object.type] !== 'undefined') {
							const TypeOfObj = objectClassLookup[object.type];
							areaToAdd = new TypeOfObj(scene, object.x, object.y, object.polygon);
						}
						else {
							areaToAdd = new PolygonArea(scene, object.x, object.y, object.polygon);
						}
						const thisObjProps = object.properties;
						let areaKey;
						for(let p in thisObjProps) {
							const prop = thisObjProps[p];
							areaToAdd.properties[prop.name] = prop.value;
							if (prop.name === 'uniqueKey') {
								areaKey = prop.value;
							}
						}
						if (typeof areaKey === 'undefined') {
							if (typeof object.name !== 'undefined') {
								this.areas[object.name] = areaToAdd;
							}
						}
						else {
							this.areas[areaKey] = areaToAdd;
						}
						continue;
					}
					const objInfo = tilesetImageKeyLookup[gid];
					if (typeof objInfo === "undefined") {
						continue;
					}

					if (typeof objInfo.shapes !== 'undefined') {

						let objToAdd;

						if (typeof objInfo.type !== 'undefined' && objInfo.type !== '') {
							const TypeOfObj = objectClassLookup[objInfo.type];
							objToAdd = new TypeOfObj(scene,object.x + layerOffsetX, object.y + layerOffsetY,  objInfo.key, objInfo.shapes, objInfo.yOffset);	

						}
						else {
							objToAdd = new PolygonPhysicsObject(scene,object.x + layerOffsetX, object.y + layerOffsetY,  objInfo.key, objInfo.shapes, objInfo.yOffset);
							// layerContainer.add(p.getPhysicsGameObject());
						}
						let objectKey = objInfo.key;
						const thisObjProps = object.properties;
						for(let p in thisObjProps) {
							const prop = thisObjProps[p];
							objToAdd.properties[prop.name] = prop.value;
							if (prop.name === 'uniqueKey') {
								objectKey = prop.value;
							}
						}
						this.objects[objectKey] = objToAdd;
						
					}
					else {
						let objToAdd : Animated;
						if (typeof objInfo.type !== 'undefined' && objInfo.type !== '') {
							const TypeOfObj = objectClassLookup[objInfo.type];
							objToAdd = new TypeOfObj(scene, object.x, object.y,  objInfo.key);	
						}
						else {
							objToAdd = new Animated(scene, object.x, object.y,  objInfo.key);	
						}
						const img = objToAdd.sprite;
						img.setOrigin(0,1);	
						// img.setScrollFactor(0.5 + 0.5 * (object.y / (scene.game.config.height as number)));
						img.depth = img.y + (typeof objInfo.yOffset !== 'undefined' ? objInfo.yOffset - img.height : 0);
						let objectKey = objInfo.key;
						const thisObjProps = object.properties;
						// for(let p in thisObjProps) {
						// 	const prop = thisObjProps[p];
						// 	objToAdd.properties[prop.name] = prop.value;
						// 	if (prop.name === 'uniqueKey') {
						// 		objectKey = prop.value;
						// 	}
						// }
						this.objects[objectKey] = objToAdd;
					}

				}
			}
		}
	}
}