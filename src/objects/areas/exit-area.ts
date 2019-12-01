import { PolygonArea } from "./polygon-area";
import { SceneBase } from "../../scenes/scene-base";


export class ExitArea extends PolygonArea {
	enabled: boolean = true;
	constructor(scene: SceneBase, x: number, y: number, polygon) {
		super(scene,x,y,polygon);
	}
}