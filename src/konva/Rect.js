import Konva from 'konva';


export default class Rect extends Konva.Rect {

  constructor(options = {}) {
    super(options);
    this.label = options.label || 'adfbsfds';
    console.log('this', this);
  }

  _sceneFunc(ctx) {
    console.log('rending', this);
    super._sceneFunc(ctx);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font="16px Arial";
    ctx.fillText(this.label, 0, 0);
  }
}