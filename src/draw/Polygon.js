import { Polygon, Textbox, ActiveSelection } from 'fabric';

export default class LabeledPolygon extends Polygon {
  constructor(points, options = {}) {
    
    super(points, options);
    this.label = options.label || '';
    this.labelText = new Textbox(this.label, {
      fontSize: 16,
      fill: 'black',
      zIndex: 1000,
      hasBorders: false,
      // originX: 'left',
      // originY: 'top',
    });
    this.on('added', this.addLabel.bind(this));
    this.on('selected', () => {
      const canvas = this.canvas;
      if (canvas) {
        // 创建包含多边形和文本的临时选择组
        const activeSelection = new ActiveSelection([this, this.labelText], { canvas });
        canvas.setActiveObject(activeSelection);
        canvas.requestRenderAll();
      }
    })
    this.on('modified', this.updateLabelPosition.bind(this));
  }

  remove() {
    this.canvas.remove(this.labelText);
    super.remove();
  }

  addLabel() {
    console.log('触发add');
    if (this.canvas) {
      this.updateLabelPosition();
      // this.canvas.add(this.labelText);
    }
  }

  updateLabel(label) {
    this.label = label;
    this.labelText.setText(this.label);
    this.updateLabelPosition();
  }

  updateLabelPosition() {
    const center = this.getCoords()[0];
    console.log('update label position');
    console.log(center, this);
    this.labelText.set({
      left: center.x,
      top: center.y,
      zIndex: Infinity,
    });
    this.labelText.setCoords();
  }

  _render(ctx) {
    super._render(ctx);
    // this.labelText._render(ctx);
  }
}

// Usage example
// const canvas = new fabric.Canvas('canvas');
// const points = [
//   { x: 50, y: 50 },
//   { x: 150, y: 50 },
//   { x: 100, y: 150 },
// ];
// const polygon = new LabeledPolygon(points, { fill: 'lightblue' }, 'My Polygon');
// canvas.add(polygon);