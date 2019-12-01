'use strict';

export class InputHandler {

	private onTap;
	// private onDoubleTap;

  constructor() {
    this.onTap = (x,y)=>{};
    // this.onDoubleTap = (x,y)=>{};
  }

	setOnTap(context,cb) {
		this.onTap = (x,y,double) => {
      cb.call(context,x,y,double);
    };
	}

  tap(x: number, y: number, isDouble?: boolean) {
    this.onTap(x,y,isDouble);
  }

  // doubleTap(x,y) {
  //   this.onDoubleTap(x,y);
  // }

}
