import { Polygon, Textbox, Rect } from 'fabric';

// 标签和矩形的组合类
export default class LabeledPolygon extends Rect {
  constructor(points, options = {}) {
    
    super(points, options);
    this.label = options.label || 'adfbsfds';
    this.labelText = new Textbox(this.label, {
      fontSize: 16,
      fill: 'black',
      zIndex: 1000,

    });
    this.on('added', this.addLabel.bind(this));
    this.on('modified', this.updateLabelPosition.bind(this));
    this.on('moving', this.updateLabelPosition.bind(this));
    this.on('selected', (...args) => {
      // this.canvas.bringObjectToFront(this.labelText);
      // this.canvas.renderAll();
      // this.labelText.onSelect();
      console.log('args', args);

      console.log('selected', this);
      // this.labelText.bringToFront();
    });
  }

  remove() {
    this.canvas.remove(this.labelText);
    super.remove();
  }

  addLabel() {
    if (this.canvas) {
      console.log('触发add');
      this.updateLabelPosition();
      this.canvas.add(this.labelText);
    }
  }

  updateLabel(label) {
    this.label = label;
    this.labelText.setText(this.label);
    this.updateLabelPosition();
  }

  updateLabelPosition() {
    const center = this.getCoords()[0];
    this.labelText.set({
      left: center.x ,
      top: center.y + 10,
    });
    this.labelText.setCoords();
  }

  _render(ctx) {
    super._render(ctx);
    // this.updateLabelPosition();
    this.labelText._render(ctx);

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