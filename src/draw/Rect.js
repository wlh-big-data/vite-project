import { Rect, FabricText } from 'fabric';
import { Path, Point, Size, Matrix } from 'paper';
import { STYLE } from './constants';

Rect.prototype.setControlVisible('tl', true);
Rect.prototype.setControlVisible('tr', true);
Rect.prototype.setControlVisible('br', true);
Rect.prototype.setControlVisible('bl', true);
Rect.prototype.setControlVisible('ml', true);
Rect.prototype.setControlVisible('mt', true);
Rect.prototype.setControlVisible('mr', true);
Rect.prototype.setControlVisible('mb', true);
Rect.prototype.setControlVisible('mtr', false);


export default class LabeledRect extends Rect {
  constructor(options = {}) {
    super(options);
    this.label = options.label || 'rect';
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
    this.fill = options.fill || STYLE.fillColor; // 填充颜色
    this.stroke = options.stroke || STYLE.strokeColor; // 边框颜色
  }

  _render(ctx) {
    super._render(ctx);
    // ctx.save();
    if(this.isCreating) {
      return;
    }
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "16px Arial";
    ctx.fillText(this.label, -this.width / 2 + 4, -this.height / 2 + 16);
  }

  toPaperObject() {
    // const matrix = this.calcTransformMatrix();
    // console.log('matrix', matrix);
    // if (this.group) {
    //   const square = new Path.Rectangle(this.group.left + this.group.width * this.group.scaleX / 2 + this.left,
    //     this.group.top + this.group.height * this.group.scaleY / 2 + this.top, this.width * this.scaleX, this.height * this.scaleY);
    //   return square;
    // } else {
    //   var square = new Path.Rectangle(this.left, this.top, this.width * this.scaleX, this.height * this.scaleY);
    //   return square;
    // }
    const paper = new Path.Rectangle(0, 0, this.width, this.height);
    const matrix = this.calcTransformMatrix();
    // const center = this.getCenterPoint();
    // const ownMathrix = this.calcOwnMatrix();
    
    console.log('paper object matrix', matrix);
    // 转换为 Paper.js 矩阵格式 [a, b, c, d, tx, ty]
    const paperMatrix = new Matrix(
      matrix[0], matrix[1],
      matrix[2], matrix[3],

      matrix[4] - this.width/2 * matrix[0],  // X 轴中心补偿
      matrix[5] - this.height/2 * matrix[3] 
    );
    paper.transform(paperMatrix);
    return paper;

  }

  expand(expand = 10) {
    console.log('expand', expand);
    // this.scale({
    //   x: 1.2,
    //   y: 1.2
    // });
    this.set({
      width: this.width + expand,
      height: this.height + expand,
    })
    this.canvas.requestRenderAll();
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

  toJSON(left, top, scale) {
    return {
        type: this.type,
        width: Math.round(this.width * this.scaleX / scale),
        height: Math.round(this.height * this.scaleY / scale),
        left: Math.round((this.left - left)/scale),
        top: Math.round((this.top - top)/scale),
        label: this.label,
        isCreating: this.isCreating,
    }
  }

  _containsPoint(point) {
    const flag = super.containsPoint(point);
    if(!flag) {
      return false;
    }
    if(point.x >= this.left && point.x <= this.left + this.width &&
      point.y >= this.top && point.y <= this.top + this.height) {
      return true;
    }
    return false;
  }

  getMask(mask) {
    const boundingRect = this.getBoundingRect();
    const { left, top, width, height } = boundingRect;
    console.log('bounds', boundingRect);
    const minLeft = Math.floor(left);
    const minTop = Math.floor(top);
    const maxLeft = Math.round(left + width);
    const maxTop = Math.round(top + height);
    
    for(let i=minLeft; i<=maxLeft; i++) {
      for(let j=minTop; j<=maxTop; j++) {
          mask[j][i] = 1;
      }
    }
  }
}