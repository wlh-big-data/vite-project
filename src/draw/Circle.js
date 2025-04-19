import { Circle } from "fabric";
// import { Path } from "paper";
import { STYLE } from './constants';

export default class LabeledCircle extends Circle {
  constructor(options = {}) {
    super(options);
    this.label = options.label || "circle"; // 标签文本
    this.fill = options.fill || STYLE.fillColor; // 填充颜色
    this.stroke = options.stroke || STYLE.strokeColor; // 边框颜色
  }

  _render(ctx) {
    super._render(ctx); // 调用父类的渲染方法 
    if(this.isCreating) {
      return;
    }
    // ctx.fillStyle = "rgb(0,0,0)"; // 设置文本颜色为黑色
    // ctx.font = "16px Arial"; // 设置字体样式为 Arial，大小为 16px
    // ctx.fillText(this.label, -this.radius + 4, -this.radius + 16); // 在圆形中心绘制标签文本
  }

  // toPaperObject() {
  //   const paper = new Path.Circle(0, 0, this.radius); // 创建 Paper.js 圆形对象
  //   const matrix = this.calcTransformMatrix(); // 获取 Fabric 对象的变换矩
  //   paper.matrix = matrix; // 将 Paper.js 圆形对象的变换矩阵
  //   return paper; 
  // }

  toJSON() {
    const radius = Math.round(this.radius * Math.max(this.scaleX, this.scaleY));
    return {
        type: this.type,
        radius,
        left: Math.round((this.left)),
        top: Math.round((this.top)),
        label: this.label
    }
  }

  _containsPoint(point, center) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  containPoint(point) {
    const center = this.getCenterPoint();
    console.log('center', center);
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
          if(this._containsPoint({ x: i, y: j }, center)) {
            mask[j][i] = 1;
          }
      }
    }
  }

}