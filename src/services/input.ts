import type { Callback } from "../types";

export class InputService {
  mouseDownCallbacks: Callback[] = [];
  mouseUpCallbacks: Callback[] = [];
  mouseMoveCallbacks: Callback[] = [];

  constructor() {}

  initialize() {}

  addMouseDownCallback(cb: Callback) {
    this.mouseDownCallbacks.push(cb);
    document.addEventListener('mousedown', cb)
  }

  addMouseMoveCallback(cb: Callback) {
    this.mouseDownCallbacks.push(cb);
    document.addEventListener('mousemove', cb)
  }

  addMouseUpCallback(cb: Callback) {
    this.mouseDownCallbacks.push(cb);
    document.addEventListener('mouseup', cb)
  }

  clearCallbacks() {
    for (const cb of this.mouseDownCallbacks) {
        document.removeEventListener('mousedown', cb)
    }

    for (const cb of this.mouseUpCallbacks) {
        document.removeEventListener('mouseup', cb)
    }

    for (const cb of this.mouseMoveCallbacks) {
        document.removeEventListener('mousemove', cb)
    }
  }
}
