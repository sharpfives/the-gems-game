import { PolygonArea } from "./polygon-area";
import { SceneBase } from "../../scenes/scene-base";


export class RightExitArea extends PolygonArea {
	constructor(scene: SceneBase, x: number, y: number, polygon) {
		super(scene,x,y,polygon);
		super.on('moved-over', () => {
			scene.hud.cursor.setRightArrow();
		});
		super.on('moved-out', () => {
			scene.hud.cursor.setNormal();
		});
	}
}