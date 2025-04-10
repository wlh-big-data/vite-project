import { Polygon, Textbox, ActiveSelection, controlsUtils, util, Point as FabricPoint} from 'fabric';
import { Path as PaperPath, Point, Matrix } from 'paper';
import { STYLE } from './constants';

Polygon.prototype.setControlVisible('tl', false);
Polygon.prototype.setControlVisible('tr', false);
Polygon.prototype.setControlVisible('br', false);
Polygon.prototype.setControlVisible('bl', false);
Polygon.prototype.setControlVisible('ml', false);
Polygon.prototype.setControlVisible('mt', false);
Polygon.prototype.setControlVisible('mr', false);
Polygon.prototype.setControlVisible('mb', false);
Polygon.prototype.setControlVisible('mtr', false);

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
    this.controls = controlsUtils.createPolyControls(this);
    this.label = options.label || 'polygon';
    this.fill = options.fill || STYLE.fillColor; // 填充颜色
    this.stroke = options.stroke || STYLE.strokeColor; // 边框颜色
    // this.on('modified', () => {
    //   console.log('Polygon modified, new points:', this.getTransformedPoints());
    // });
  }
  _render(ctx) {
    super._render(ctx);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "16px Arial";
    ctx.fillText(this.label, -this.width / 2, -this.height / 2 - 4);
  }

  getPathData() {
    
    console.log('this.points', this.points);
    let path = '';
    this.points.forEach((item, index) => {
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

  // 修改方法定义（移除不必要参数）
  getTransformedPoints(left = 0, top = 0, scale = 1) {
    // 获取组合变换矩阵（包含缩放、旋转、平移）
    const matrix = this.calcTransformMatrix();
    console.log('Transform Matrix:', matrix);
    matrix[4] = matrix[4] - this.width/2 * matrix[0];
    matrix[5] = matrix[5] - this.height/2 * matrix[3];

    // 转换原始点到实际坐标
    return this.points.map(p => {
      // 应用变换矩阵到每个点
      const transformed = util.transformPoint(
        new FabricPoint(p.x, p.y),
        matrix
      );

      return { 
        x: (transformed.x),
        y: (transformed.y)
      };
    }).map((item, index) => {
      const point = {
        x: Math.round((item.x - left)/scale),
        y: Math.round((item.y - top)/scale)
      }
      console.log('point' + index, point)
      return point;
    });
  }

  expand(expand) {
    console.log('expand', expand);
    // this.scale({
    //   x: 1.2,
    //   y: 1.2
    // });
    this.left = this.left - expand;
    this.top = this.top - expand;
    this.width = this.width + expand * 2;
    this.height = this.height + expand * 2;
    this.canvas.requestRenderAll();
  }

  toJSON(left, top, scale) {
    const data = this.getTransformedPoints(left, top, scale);
    console.log('points', data, left, top, scale);
    return {
      type: this.type,
      label: this.label,
      points: data,
    }
  }

  _containsPoint(point) {
    // const flag = super.containsPoint(point);
    // if(!flag) {
    //   return false;
    // }
    const { x, y } = point;
    const polygon = this.points;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
  
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;

  }

  getMask(mask) {
    const boundingRect = this.getBoundingRect();
    const { left, top, width, height } = boundingRect;
    
    const minLeft = Math.floor(left);
    const minTop = Math.floor(top);
    const maxLeft = Math.round(left + width);
    const maxTop = Math.round(top + height);

    for(let i = minLeft; i<= maxLeft; i++) {
      for(let j= minTop; j<= maxTop; j++) {
        if(this._containsPoint({ x: i, y: j })) {
          mask[j][i] = 1;
        }
      }
    }
  }
  
}