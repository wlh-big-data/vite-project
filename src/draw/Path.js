import { Path, util } from 'fabric';
import { Path as PaperPath, Point, Matrix, CompoundPath } from 'paper';
import { STYLE } from './constants';

export default class LabeledPath extends Path {
  constructor(points, options = {}) {
    
    super(points, options);
    this.pathData = points;
    this.label = options.label || 'path';
    this.fill = options.fill || STYLE.fillColor; // 填充颜色
    this.stroke = options.stroke || STYLE.strokeColor; // 边框颜色
  }
  _render(ctx) {
    super._render(ctx);
    // ctx.fillStyle = 'rgb(0,0,0)';
    // ctx.font = "16px Arial";
    // ctx.fillText(this.label, -this.width / 2 + 4, -this.height / 2 + 16);
  }

  toPaperObject() {
    const paper = new CompoundPath(this.pathData);
    paper.position = new Point(0, 0);

    const matrix = this.calcTransformMatrix();
    console.log('matrix', matrix);
    const paperMatrix = new Matrix(
      matrix[0], matrix[1],
      matrix[2], matrix[3],
      matrix[4],
      matrix[5]
    );
    paper.transform(paperMatrix);
    return paper;
  }

  toJSON() {
    const paper = this.toPaperObject();
    
    return {
      type: this.type,
      label: this.label,
      pathData: paper.pathData,
      // left: this.left,
      // top: this.top,
    }
  }
  
  getMask(mask, { imgLeft = 0, imgTop = 0, imgScale = 1}) {
    const paperPath = this.toPaperObject();
    debugger;
    // const matrix = this.calcTransformMatrix();
    // console.log('matrx', matrix);
    // paperPath.transform(new Matrix(1/imgScale, 0, 0, 1/imgScale, 0, 0));
    const boundingRect = this.getBoundingRect();
    const { left, top, width, height } = boundingRect;
    const minLeft = Math.floor(left);
    const minTop = Math.floor(top);
    const maxLeft = Math.min(Math.round(left + width), mask[0].length - 1);
    const maxTop = Math.min(Math.round(top + height), mask.length - 1);
    for(let i = minLeft; i<= maxLeft; i++) {
      for(let j= minTop; j<= maxTop; j++) {
        const paperPoint = new Point(i, j);
        if(paperPath.contains(paperPoint)) {
          mask[j]  && (mask[j][i] = 1);
        }
      }
    }
  }

}