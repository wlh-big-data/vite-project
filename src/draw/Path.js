import { Path } from 'fabric';
import { Path as PaperPath, Point, Matrix } from 'paper';

export default class LabeledPath extends Path {
  constructor(points, options) {
    
    console.log('options', points);
    super(points, options);
    this.pathData = points;
  }
  _render(ctx) {
    super._render(ctx);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "16px Arial";
    ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 16);
  }

  _getTransformedPath(matrix) {
    // 复制原始路径数据
    const pathCopy = new Path(this.pathData);
    
    // 应用变换矩阵
    pathCopy.transform(matrix);
    
    // 获取应用变换后的 SVG 路径字符串
    return pathCopy.toSVG().match(/d="([^"]*)"/)[1];
  }

  // toPaperObject() {
  //   console.log('tosvg', this.toSVG());
  //   console.log('pathData', this.pathData);
  //   const paper = new PaperPath(this.pathData);
  //   console.log(paper);
  //   paper.scale(this.scaleX, this.scaleY);
  //   paper.rotate(this.angle);
  //   console.log(this.left, this.top);
  //   paper.position = new Point(this.group.left + this.group.width * this.group.scaleX / 2 + this.left,
  //      this.group.top + this.group.height * this.group.scaleY / 2 + this.top);
  //   return paper;
  // }

  toPaperObject() {
    const paper = new PaperPath(this.pathData);
    // console.log('paper matrix', paper.matrix);
    paper.position = new Point(0, 0);
    // console.log(paper.position, paper.matrix);

    const matrix = this.calcTransformMatrix();
    // const center = this.getCenterPoint();
    // const ownMathrix = this.calcOwnMatrix();
    
    console.log('paper object matrix', matrix, this.width, this.height);
    // 转换为 Paper.js 矩阵格式 [a, b, c, d, tx, ty]
    // console.log(matrix[4] - this.width/2 * matrix[0] - paper.position.x, matrix[5] - this.height/2 * matrix[3] - paper.position.y);
    const paperMatrix = new Matrix(
      matrix[0], matrix[1],
      matrix[2], matrix[3],
      matrix[4],
      matrix[5]
    );
    paper.transform(paperMatrix);
    return paper;
  }

}