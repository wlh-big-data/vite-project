import { Rect, FabricText } from 'fabric';

export default class LabeledRect extends Rect {
  constructor(options = {}) {
    super(options);
    this.label = options.label || '';
    this.labelText = new FabricText(this.label, {
      fontSize: 16,
      fill: 'black',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      padding: 5,
      left: 0,
      top: 0,
      originX: 0,
      originY: 0,
      selectable: false,
      evented: false,
      hasBorders: false
    });
  }

  _render(ctx) {
    super._render(ctx);
    ctx.save();
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font="16px Arial";

    this.labelText._render.bind(this.labelText)(ctx);
    // ctx.fillText(this.label, -this.width / 2, -this.height/2 + 16);

    ctx.restore();
    // this.labelText._render.bind(this.labelText)(ctx);
    // Update label text content and position
    
  }

  // set(key, value) {
  //   super.set(key, value);
  //   if (typeof key === 'object') {
  //     if ('width' in key || 'height' in key) {
  //       this.labelText.set({
  //         left: this.width / 2,
  //         top: this.height / 2,
  //       });
  //     }
  //   } else {
  //     if (key === 'width' || key === 'height') {
  //       this.labelText.set({
  //         left: this.width / 2,
  //         top: this.height / 2,
  //       });
  //     }
  //   }
  // }

  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude.concat(['label']));
  }
}