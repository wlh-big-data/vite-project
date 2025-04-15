import { Path, util } from 'fabric';
import { Path as PaperPath, Point, Matrix } from 'paper';
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
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.font = "16px Arial";
    ctx.fillText(this.label, -this.width / 2 + 4, -this.height / 2 + 16);
  }

  toPaperObject() {
    const paper = new PaperPath(this.pathData);
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

  toJSON(left, top, scale) {
    const paper = this.toPaperObject();
    console.log('path to object', scale, left, top);
    // const newObject = new Path(paper.pathData);
    // this.canvas.add(newObject)
    
    return {
      type: this.type,
      label: this.label,
      pathData: paper.pathData,
      // left: this.left,
      // top: this.top,
    }
  }

  getTransformedPathData(left = 0, top = 0, scale = 1) {
    // 获取变换矩阵
    const matrix = this.calcTransformMatrix();
    matrix[0] = matrix[0] / scale;
    matrix[3] = matrix[3] / scale;
    matrix[4] = (matrix[4] - left - this.width / 2)/scale;
    matrix[5] = (matrix[5] - top - this.height / 2)/scale;
    
    // 解析原始路径数据
    const transformedCommands = [];
    let currentX = 0;
    let currentY = 0;
  
    this.path.forEach(command => {
      const [type, ...args] = command;
      const upperType = type.toUpperCase();
      const isRelative = type !== upperType;
      const transformedArgs = [];
  
      switch(upperType) {
        case 'M': // MoveTo
        case 'L': // LineTo
          for(let i = 0; i < args.length; i += 2) {
            let x = args[i];
            let y = args[i+1];
            if(isRelative) {
              x += currentX;
              y += currentY;
            }
            // 应用变换矩阵
            const point = util.transformPoint(
              { x, y }, 
              matrix
            );
            transformedArgs.push(point.x.toFixed(2), point.y.toFixed(2));
            if(upperType === 'M') {
              currentX = x;
              currentY = y;
            }
          }
          transformedCommands.push(`${upperType} ${transformedArgs.join(' ')}`);
          break;
  
        case 'C': // Cubic Bezier
          for(let i = 0; i < args.length; i += 6) {
            const points = [];
            for(let j = 0; j < 6; j += 2) {
              let x = args[i+j];
              let y = args[i+j+1];
              if(isRelative) {
                x += currentX;
                y += currentY;
              }
              const point = util.transformPoint(
                { x, y }, 
                matrix
              );
              points.push(point.x.toFixed(2), point.y.toFixed(2));
            }
            transformedArgs.push(...points);
            currentX = args[i+4];
            currentY = args[i+5];
          }
          transformedCommands.push(`${upperType} ${transformedArgs.join(' ')}`);
          break;
  
        case 'Q': // Quadratic Bezier
          // 类似Cubic处理逻辑...
          break;
  
        case 'Z': // ClosePath
          transformedCommands.push('Z');
          break;
  
        // 其他路径命令处理...
      }
    });
  
    return transformedCommands.join(' ');
  }
  
  getMask(mask, { imgLeft = 0, imgTop = 0, imgScale = 1}) {
    const paperPath = this.toPaperObject();
    // const matrix = this.calcTransformMatrix();
    // console.log('matrx', matrix);
    // paperPath.transform(new Matrix(1/imgScale, 0, 0, 1/imgScale, 0, 0));
    const boundingRect = this.getBoundingRect();
    const { left, top, width, height } = boundingRect;
    const minLeft = Math.floor(left);
    const minTop = Math.floor(top);
    const maxLeft = Math.round(left + width);
    const maxTop = Math.round(top + height);
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