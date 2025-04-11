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
    this.on('modified', () => this.validatePosition(this));
  }
  validatePosition(polygon) {
    const expected = polygon.getCenterPoint();
    const calculated = polygon._getTransformedPoints()
      .reduce((acc, p) => {
        acc.x += p.x;
        acc.y += p.y;
        return acc;
      }, {x:0, y:0});
    
    calculated.x /= polygon.points.length;
    calculated.y /= polygon.points.length;
  
    console.log('位置校验:', {
      center: expected,
      calcenter: calculated,
      diff: {
        x: calculated.x - expected.x,
        y: calculated.y - expected.y
      }
    });
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

    const matrix = this.calcTransformMatrix();
    
    console.log('paper object matrix', matrix);
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
  _getTransformedPoints(left = 0, top = 0, scale = 1) {
    // 获取组合变换矩阵（包含缩放、旋转、平移）
    const matrix = this.calcTransformMatrix();
    const center = this.getCenterPoint();
    console.log('width height', center, this.width, this.height, this.left, this.top, matrix);

    return this.points.map((p, index) => {
      const adjustedPoint = new FabricPoint(
        p.x - center.x,
        p.y - center.y
      );
      const transformed = util.transformPoint(
        adjustedPoint,
        matrix
      );

      const point = { 
        x: (transformed.x),
        y: (transformed.y)
      };
      console.log('point' + index , p, point);
      return point;
    }).map((p) => {
      return {
        x: Math.round((p.x - left)/scale),
        y: Math.round((p.y - top)/scale)
      }
    });
  }

  expand(expand) {
    this.left = this.left - expand;
    this.top = this.top - expand;
    this.width = this.width + expand * 2;
    this.height = this.height + expand * 2;
    this.canvas.requestRenderAll();
  }

  toJSON(left, top, scale) {
    const data = this._getTransformedPoints(left, top, scale);
    console.log('points', data, left, top, scale);
    return {
      type: this.type,
      label: this.label,
      points: data,
    }
  }

  _containsPoint(point) {
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