import { Polygon, controlsUtils } from 'fabric';
import { STYLE } from './constants';

export default class LabeledPolygon extends Polygon {
  constructor(points, options = {}) {
    super(points, options);
    this.fill = options.fill || STYLE.fillColor; // 填充颜色
    this.stroke = options.stroke || STYLE.strokeColor; // 边框颜色
    this.strokeWidth = options.strokeWidth || STYLE.strokeWidth;
    this.controls = controlsUtils.createPolyControls(this);
  }

  toJSON(left, top, scale) {
    return null;
  }
}