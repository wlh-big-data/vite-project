import { Ellipse } from 'fabric';
// import { Path, Point, Size, Matrix } from 'paper';
import { STYLE } from './constants';

export default class LabeledEllipse extends Ellipse {
  constructor(options = {}) {
    super(options);
    this.label = options.label || 'ellipse'; 
    this.fill = options.fill || STYLE.fillColor; // 填充颜色
    this.stroke = options.stroke || STYLE.strokeColor; // 边框颜色
  }

  _render(ctx) {
    super._render(ctx);
    if(this.isCreating) {
      return;
    }
    // ctx.fillStyle = 'rgb(0,0,0)';
    // ctx.font = "16px Arial";
    // ctx.fillText(this.label, -this.width / 2 + 4, -this.height / 2 + 16);
  }

  // toPaperObject() {
  //   const paper = new Path.Ellipse({
  //     center: new Point(0, 0),
  //     radius: new Size(this.width / 2, this.height / 2),
  //     fillColor: this.fill,
  //     strokeColor: this.stroke,
  //     strokeWidth: this.strokeWidth,
  //   });
  //   const matrix = this.calcTransformMatrix();
  //   const paperMatrix = new Matrix(
  //     matrix[0], matrix[1],
  //     matrix[2], matrix[3],
  //     matrix[4],
  //     matrix[5]
  //   );
  //   paper.transform(paperMatrix);
  //   return paper;
  // }

  expand(expand = 10) {
    console.log('expand', expand);
    this.set({
      rx: this.rx + expand,
      ry: this.ry + expand,
    });
    this.canvas.requestRenderAll();
  }

  toJSON() {
    console.log('ellipse', this);
    return {
      type: this.type,
      rx: Math.round(this.rx * (this.scaleX)),
      ry: Math.round(this.ry * (this.scaleY)),
      left: Math.round((this.left)),
      top: Math.round((this.top)),
      label: this.label
    };
  }

  _containsPoint(point, center) {
    
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return (dx * dx) / (this.rx * this.rx) + (dy * dy) / (this.ry * this.ry) <= 1;
  }


  containPoint(point) {
    const center = this.getCenterPoint();
    return this._containsPoint(point, center);
  }
  

  getMask(mask) {
    const boundingRect = this.getBoundingRect();
    const center = this.getCenterPoint();
    const { left, top, width, height } = boundingRect;
    const minLeft = Math.floor(left);
    const minTop = Math.floor(top);
    const maxLeft = Math.min(Math.round(left + width), mask[0].length - 1);
    const maxTop = Math.min(Math.round(top + height), mask.length - 1);
    console.log('bounds', boundingRect);
    for(let i = minLeft; i<= maxLeft; i++) {
      for(let j= minTop; j<= maxTop; j++) {
        if(this._containsPoint({ x: i, y: j }, center) && mask[j] ) {
          mask[j][i] = 1;
        }
      }
    }
  }

}