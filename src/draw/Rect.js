import { Rect, FabricText } from 'fabric';
import { Path, Point, Size, Matrix } from 'paper';

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
    // ctx.save();
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "16px Arial";

    // this.labelText._render.bind(this.labelText)(ctx);
    ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 16);

    // ctx.restore();
    // this.labelText._render.bind(this.labelText)(ctx);
    // Update label text content and position

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

  scale() {

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