'use strict';

import { SceneBase } from "../scenes/scene-base";
import { SwingScene } from "../scenes/chase/swing-scene";
import { ChaseScene } from "../scenes/chase/chase-scene";
import { SpiritScene } from "../scenes/spirit-scene";
import { JumpyGuyScene } from "../scenes/save/jumpy-guy-scene";
import { TrainingScene } from "../scenes/training-scene";
import { CaveScene } from "../scenes/cave/cave-scene";
import { CaveScene3 } from "../scenes/cave/cave-scene3";
import { HostageScene } from "../scenes/save/hostage-scene";
import { HangerScene } from "../scenes/save/hanger-scene";
import { LeftRightExitScene } from "../scenes/left-right-exit-scene";
import { StreamScene } from "../scenes/chase/stream-scene";
import { StartScene } from "../scenes/chase/start-scene";
import { CaveFrontScene } from "../scenes/cave/cave-front-scene";
import { AcornTreeScene } from "../scenes/chase/acorn-tree-scene";
import { CamperScene } from "../scenes/chase/camper-scene";
import { ProtectStartScene } from "../scenes/cave/protect-start-scene";
import { Protect1Scene } from "../scenes/cave/protect1-scene";
import { EndingScene } from "../scenes/ending-scene";
import { CaveScene2 } from "../scenes/cave/cave-scene2";
import { ResumeScreen } from "../scenes/resume-scene";
import { SingleHostageScene } from "../scenes/save/single-hostage-scene";
import { BirdPowerlineScene } from "../scenes/witch/bird-powerline-scene";
import { SwampMushroomsScene } from "../scenes/witch/swamp-mushrooms-scene";
import { BossScene } from "../scenes/witch/boss-scene";
import { HangerDraggingScene } from "../scenes/save/hanger-dragging-scene";
import { SimpleLineScene } from "../scenes/witch/simple-line-scene";
import { WitchScene } from "../scenes/witch/witch-scene";
import { BirdPostsScene } from "../scenes/witch/bird-posts-scene";
import { SquirrelScene } from "../scenes/chase/squirrel-scene";
import { UnsupportedScene } from "../scenes/unsupported-scene";

class SceneFactory {
	private scenes: {};

  constructor() {
    // map of scene and corresponding state/gui
    this.scenes = {
			"base" : SceneBase,
			"leftRight" : LeftRightExitScene,
			"swing" : SwingScene,
			"chase" : ChaseScene,
			"spirit" : SpiritScene,
			"jumpy" : JumpyGuyScene,
			"training" : TrainingScene,
			"cave" : CaveScene,
			"cave2" : CaveScene2,
			"cave3" : CaveScene3,
			"caveFront" : CaveFrontScene,
			"hostage" : HostageScene,
			"hanger" : HangerScene,
			"stream" : StreamScene,
			"start" : StartScene,
			"acornTree" : AcornTreeScene,
			"camper" : CamperScene,
			"protectStart" : ProtectStartScene,
			"protect1" : Protect1Scene,
			"ending" : EndingScene,
			"resume" : ResumeScreen,
			"singleHostage" : SingleHostageScene,
			"birdPowerline" : BirdPowerlineScene,
			"swampMushroom" : SwampMushroomsScene,
			"boss" : BossScene,
			"hangerDrag" : HangerDraggingScene,
			"simpleLine" : SimpleLineScene,
			"witch" : WitchScene,
			"birdPosts" : BirdPostsScene,
			"squirrel" : SquirrelScene,
			"unsupported" : UnsupportedScene
    }
  }

  makeScene(str: string) {
    if (typeof this.scenes[str] !== 'undefined') {
      let ObjType = this.scenes[str];
      return ObjType;
    }
    else {
      console.log(`no scene with type ${str} in scene factory`);
    }
  }
}

export const sceneFactory = new SceneFactory();
