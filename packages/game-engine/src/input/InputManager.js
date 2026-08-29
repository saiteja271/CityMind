/**
 * InputManager - Keyboard, mouse, and touch handling for the game canvas.
 */

import { EventEmitter } from '@citymind/utilities';

export class InputManager extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.keys = new Set();
    this.mouse = {
      x: 0,
      y: 0,
      worldX: 0,
      worldY: 0,
      buttons: new Set(),
      dragging: false,
      dragStart: null
    };
    this._bound = false;
    this._handlers = {};
  }

  bind() {
    if (this._bound || !this.canvas) return;
    this._handlers = {
      keydown: (e) => this._onKeyDown(e),
      keyup: (e) => this._onKeyUp(e),
      mousedown: (e) => this._onMouseDown(e),
      mouseup: (e) => this._onMouseUp(e),
      mousemove: (e) => this._onMouseMove(e),
      wheel: (e) => this._onWheel(e),
      contextmenu: (e) => e.preventDefault(),
      mouseleave: () => this._onMouseLeave()
    };
    window.addEventListener('keydown', this._handlers.keydown);
    window.addEventListener('keyup', this._handlers.keyup);
    this.canvas.addEventListener('mousedown', this._handlers.mousedown);
    this.canvas.addEventListener('mouseup', this._handlers.mouseup);
    this.canvas.addEventListener('mousemove', this._handlers.mousemove);
    this.canvas.addEventListener('wheel', this._handlers.wheel, { passive: false });
    this.canvas.addEventListener('contextmenu', this._handlers.contextmenu);
    this.canvas.addEventListener('mouseleave', this._handlers.mouseleave);
    this._bound = true;
  }

  unbind() {
    if (!this._bound) return;
    window.removeEventListener('keydown', this._handlers.keydown);
    window.removeEventListener('keyup', this._handlers.keyup);
    this.canvas.removeEventListener('mousedown', this._handlers.mousedown);
    this.canvas.removeEventListener('mouseup', this._handlers.mouseup);
    this.canvas.removeEventListener('mousemove', this._handlers.mousemove);
    this.canvas.removeEventListener('wheel', this._handlers.wheel);
    this.canvas.removeEventListener('contextmenu', this._handlers.contextmenu);
    this.canvas.removeEventListener('mouseleave', this._handlers.mouseleave);
    this._bound = false;
  }

  isKeyDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  isMouseDown(button = 0) {
    return this.mouse.buttons.has(button);
  }

  _getCanvasPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  _onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (!this.keys.has(key)) {
      this.keys.add(key);
      this.emit('keydown', { key, original: e });
    }
  }

  _onKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keys.delete(key);
    this.emit('keyup', { key, original: e });
  }

  _onMouseDown(e) {
    const pos = this._getCanvasPos(e);
    this.mouse.x = pos.x;
    this.mouse.y = pos.y;
    this.mouse.buttons.add(e.button);
    this.mouse.dragging = true;
    this.mouse.dragStart = { x: pos.x, y: pos.y };
    this.emit('mousedown', {
      x: pos.x,
      y: pos.y,
      button: e.button,
      original: e
    });
  }

  _onMouseUp(e) {
    const pos = this._getCanvasPos(e);
    this.mouse.x = pos.x;
    this.mouse.y = pos.y;
    this.mouse.buttons.delete(e.button);
    const wasDragging = this.mouse.dragging;
    this.mouse.dragging = false;
    this.emit('mouseup', {
      x: pos.x,
      y: pos.y,
      button: e.button,
      wasDragging,
      original: e
    });
    if (wasDragging && this.mouse.dragStart) {
      const dx = pos.x - this.mouse.dragStart.x;
      const dy = pos.y - this.mouse.dragStart.y;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) {
        this.emit('click', {
          x: pos.x,
          y: pos.y,
          button: e.button,
          original: e
        });
      }
    }
    this.mouse.dragStart = null;
  }

  _onMouseMove(e) {
    const pos = this._getCanvasPos(e);
    const prevX = this.mouse.x;
    const prevY = this.mouse.y;
    this.mouse.x = pos.x;
    this.mouse.y = pos.y;
    this.emit('mousemove', {
      x: pos.x,
      y: pos.y,
      dx: pos.x - prevX,
      dy: pos.y - prevY,
      dragging: this.mouse.dragging,
      original: e
    });
  }

  _onWheel(e) {
    e.preventDefault();
    this.emit('wheel', {
      x: this.mouse.x,
      y: this.mouse.y,
      deltaY: e.deltaY,
      original: e
    });
  }

  _onMouseLeave() {
    this.mouse.buttons.clear();
    this.mouse.dragging = false;
    this.mouse.dragStart = null;
  }
}

export default InputManager;
