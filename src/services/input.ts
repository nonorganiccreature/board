import type { InputEventCallback } from "../types";

export class InputService {
  mouseDownCallbacks: InputEventCallback[] = [];
  mouseUpCallbacks: InputEventCallback[] = [];
  mouseMoveCallbacks: InputEventCallback[] = [];

  constructor() {}

  initialize() {}

  addMouseDownCallback(cb: InputEventCallback) {
    this.mouseDownCallbacks.push(cb);
    document.addEventListener('mousedown', cb)
  }

  addMouseMoveCallback(cb: InputEventCallback) {
    this.mouseDownCallbacks.push(cb);
    document.addEventListener('mousemove', cb)
  }

  addMouseUpCallback(cb: InputEventCallback) {
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
