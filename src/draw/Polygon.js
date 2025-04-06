import { Polygon, Textbox, ActiveSelection } from 'fabric';
import { Path as PaperPath, Point, Matrix } from 'paper';

// export default class LabeledPolygon extends Polygon {
//   constructor(points, options = {}) {
    
//     super(points, options);
//     this.label = options.label || '';
//     this.labelText = new Textbox(this.label, {
//       fontSize: 16,
//       fill: 'black',
//       zIndex: 1000,
//       hasBorders: false,
//       // originX: 'left',
//       // originY: 'top',
//     });
//     this.on('added', this.addLabel.bind(this));
//     this.on('selected', () => {
//       const canvas = this.canvas;
//       if (canvas) {
//         // 创建包含多边形和文本的临时选择组
//         const activeSelection = new ActiveSelection([this, this.labelText], { canvas });
//         canvas.setActiveObject(activeSelection);
//         canvas.requestRenderAll();
//       }
//     })
//     this.on('modified', this.updateLabelPosition.bind(this));
//   }

//   remove() {
//     this.canvas.remove(this.labelText);
//     super.remove();
//   }

//   addLabel() {
//     console.log('触发add');
//     if (this.canvas) {
//       this.updateLabelPosition();
//       // this.canvas.add(this.labelText);
//     }
//   }

//   updateLabel(label) {
//     this.label = label;
//     this.labelText.setText(this.label);
//     this.updateLabelPosition();
//   }

//   updateLabelPosition() {
//     const center = this.getCoords()[0];
//     console.log('update label position');
//     console.log(center, this);
//     this.labelText.set({
//       left: center.x,
//       top: center.y,
//       zIndex: Infinity,
//     });
//     this.labelText.setCoords();
//   }

//   _render(ctx) {
//     super._render(ctx);
//     // this.labelText._render(ctx);
//   }
// }

// Usage example
// const canvas = new fabric.Canvas('canvas');
// const points = [
//   { x: 50, y: 50 },
//   { x: 150, y: 50 },
//   { x: 100, y: 150 },
// ];
// const polygon = new LabeledPolygon(points, { fill: 'lightblue' }, 'My Polygon');
// canvas.add(polygon);

export default class LabeledPolygon extends Polygon {
  constructor(points, options = {}) {
    super(points, options);
  }
  _render(ctx) {
    super._render(ctx);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "16px Arial";
    ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 16);
  }

  getPathData() {
    
    console.log('this.points', this.points);
    let path = '';
    const pathData = this.points.forEach((item, index) => {
      if (index === 0) {
        path += `M${item.x},${item.y}`;
      } else if(index === this.points.length - 1) {
        path += `L${item.x},${item.y}Z`;
      }else {
        path += `L${item.x},${item.y}`;
      }
    });
    console.log('path', path);
    // console.log('pathData', pathData);
    return path;
  }

  toPaperObject() {
    const paper = new PaperPath(this.getPathData());
    console.log('paper', paper);
    paper.position = new Point(0, 0);
    // console.log(paper.position, paper.matrix);

    const matrix = this.calcTransformMatrix();
    // const center = this.getCenterPoint();
    // const ownMathrix = this.calcOwnMatrix();
    
    console.log('paper object matrix', matrix);
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