import { PolygonArea } from "./polygon-area";
import { SceneBase } from "../../scenes/scene-base";


export class NoClickArea extends PolygonArea {
	constructor(scene: SceneBase, x: number, y: number, polygon) {
		super(scene,x,y,polygon);
		// this.getGameObject().setSensor(true);
	}
}