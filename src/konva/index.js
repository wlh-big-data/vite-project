import Konva from 'konva';
import Rect from './Rect'

export default class Editor {
  constructor({
    container,
    imgUrl,
  }) {
    this.container = container;

    if (!container) {
      throw new Error('container is required');
    }

    this.resize = this.resize.bind(this);
    this.drag = this.drag.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.drawPoly = this.drawPoly.bind(this);
    this.keydown = this.keydown.bind(this);
    window.addEventListener('resize', this.resize);

    this.stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    if (imgUrl) {
      this.setImage(imgUrl);
    }

    this.keydown();
  }

  keydown() {
    window.addEventListener('keydown', (e) => {
      console.log('keydown', e);
      if (e.key === 'Escape') {
        this.stage.find('.selected').forEach((node) => {
          node.setAttr('selected', false);
          node.strokeEnabled(false);
        });
      }
    });
  }

  drawEllipse() {
    let isDrawingEllipse = false;
    let startPointEllipse;
    let ellipse;

    this.stage.on('mousedown', (e) => {
      if (e.target === this.stage) {
        isDrawingEllipse = true;
        startPointEllipse = this.stage.getPointerPosition();
        ellipse = new Konva.Ellipse({
          x: startPointEllipse.x,
          y: startPointEllipse.y,
          radiusX: 0,
          radiusY: 0,
          fill: 'yellow',
          stroke: 'lightgreen',
          strokeWidth: 4,
        });
        this.layer.add(ellipse);
        this.layer.draw();
      }
    });

    this.stage.on('mousemove', (e) => {
      if (isDrawingEllipse) {
        const pointer = this.stage.getPointerPosition();
        const dx = pointer.x - startPointEllipse.x;
        const dy = pointer.y - startPointEllipse.y;
        let rx = Math.abs(dx) / 2;
        let ry = Math.abs(dy) / 2;

        if (e.evt.shiftKey) {
          const radius = Math.min(rx, ry);
          rx = radius;
          ry = radius;
        }

        ellipse.radiusX(rx);
        ellipse.radiusY(ry);
        ellipse.x(startPointEllipse.x + Math.min(0, dx));
        ellipse.y(startPointEllipse.y + Math.min(0, dy));
        this.layer.draw();
      }
    });

    this.stage.on('mouseup', () => {
      isDrawingEllipse = false;
    });
  }

  drawPoly() {
    let isDrawingPolygon = false;
    let polygonPoints = [];
    let polygon;

    this.stage.on('mousedown', (e) => {
      if (e.target === this.stage) {
        if (!isDrawingPolygon) {
          isDrawingPolygon = true;
          polygonPoints = [];
          const point = this.stage.getPointerPosition();
          polygonPoints.push(point.x, point.y);
        } else {
          const point = this.stage.getPointerPosition();
          polygonPoints.push(point.x, point.y);
        }

        if (polygon) {
          polygon.destroy();
        }

        polygon = new Konva.Line({
          points: polygonPoints,
          fill: 'yellow',
          stroke: 'lightgreen',
          strokeWidth: 1,
          closed: false,
          tension: 0,
        });

        this.layer.add(polygon);
        this.layer.draw();
      }
    });

    this.stage.on('mousemove', (e) => {
      if (isDrawingPolygon) {
        const point = this.stage.getPointerPosition();
        polygonPoints[polygonPoints.length - 2] = point.x;
        polygonPoints[polygonPoints.length - 1] = point.y;
        polygon.points(polygonPoints);
        this.layer.draw();
      }
    });

    this.stage.on('dblclick', () => {
      if (isDrawingPolygon) {
        if (polygonPoints.length >= 6) {
          polygonPoints.push(polygonPoints[0], polygonPoints[1]);
          polygon.destroy();
          const polygonObject = new Konva.Line({
            points: polygonPoints,
            fill: 'yellow',
            stroke: 'lightgreen',
            strokeWidth: 1,
            closed: true,
            tension: 0,
          });
          this.layer.add(polygonObject);
          this.layer.draw();
        }
        isDrawingPolygon = false;
      }
    });

    this.stage.on('mousedown', (e) => {
      if (isDrawingPolygon && polygonPoints.length >= 6) {
        const currentPoint = this.stage.getPointerPosition();
        const firstPoint = { x: polygonPoints[0], y: polygonPoints[1] };
        const distance = Math.sqrt(
          Math.pow(currentPoint.x - firstPoint.x, 2) + Math.pow(currentPoint.y - firstPoint.y, 2)
        );
        if (distance < 5) {
          if (polygonPoints.length >= 6) {
            polygonPoints.push(polygonPoints[0], polygonPoints[1]);
            polygon.destroy();
            const polygonObject = new Konva.Line({
              points: polygonPoints,
              fill: 'yellow',
              stroke: 'lightgreen',
              strokeWidth: 1,
              closed: true,
              tension: 0,
            });
            this.layer.add(polygonObject);
            this.layer.draw();
          }
          isDrawingPolygon = false;
        }
      }
    });
  }

  zoom() {
    const zoomStep = 0.1;
    this.stage.on('wheel', (e) => {
      const delta = Math.sign(e.evt.deltaY);
      const currentZoom = this.stage.scaleX();
      let newZoom;

      if (delta < 0) {
        newZoom = currentZoom + zoomStep;
      } else {
        newZoom = Math.max(0.1, currentZoom - zoomStep);
      }

      const pointer = this.stage.getPointerPosition();
      const stageRect = {
        x: this.stage.x(),
        y: this.stage.y(),
        width: this.stage.width() * this.stage.scaleX(),
        height: this.stage.height() * this.stage.scaleY(),
      };

      const newStageX = pointer.x - (pointer.x - stageRect.x) * (newZoom / currentZoom);
      const newStageY = pointer.y - (pointer.y - stageRect.y) * (newZoom / currentZoom);

      this.stage.scale({ x: newZoom, y: newZoom });
      this.stage.position({ x: newStageX, y: newStageY });
      this.stage.draw();
    });
  }

  drawRect() {
    let isDrawing = false;
    let startPoint;
    let rect;

    this.stage.on('mousedown', (e) => {
      if (e.target === this.stage) {
        isDrawing = true;
        startPoint = this.stage.getPointerPosition();
        rect = new Rect({
          x: startPoint.x,
          y: startPoint.y,
          width: 0,
          height: 0,
          fill: 'yellow',
          stroke: 'lightgreen',
          strokeWidth: 1,
        });
        this.layer.add(rect);
        this.layer.draw();
      }
    });

    this.stage.on('mousemove', (e) => {
      if (isDrawing) {
        const pointer = this.stage.getPointerPosition();
        const width = Math.abs(pointer.x - startPoint.x);
        const height = Math.abs(pointer.y - startPoint.y);
        const left = Math.min(startPoint.x, pointer.x);
        const top = Math.min(startPoint.y, pointer.y);

        rect.width(width);
        rect.height(height);
        rect.x(left);
        rect.y(top);
        this.layer.draw();
      }
    });

    this.stage.on('mouseup', () => {
      if (isDrawing) {
        isDrawing = false;
        rect.setAttr('selected', true);
        rect.strokeEnabled(true);
        this.layer.draw();
      }
    });
  }

  resize() {
    this.stage.width(this.container.clientWidth);
    this.stage.height(this.container.clientHeight);
    this.stage.draw();
  }

  drag() {
    let isDragging = false;
    let lastPointerPosition;

    this.stage.on('mousedown', (e) => {
      if (e.target === this.stage) {
        isDragging = true;
        lastPointerPosition = this.stage.getPointerPosition();
      }
    });

    this.stage.on('mousemove', (e) => {
      if (isDragging) {
        const pointer = this.stage.getPointerPosition();
        const deltaX = pointer.x - lastPointerPosition.x;
        const deltaY = pointer.y - lastPointerPosition.y;

        this.layer.children.forEach((node) => {
          node.x(node.x() + deltaX);
          node.y(node.y() + deltaY);
        });

        this.layer.draw();
        lastPointerPosition = pointer;
      }
    });

    this.stage.on('mouseup', () => {
      isDragging = false;
    });
  }

  destroy() {
    this.stage.destroy();
  }

  setImage(src) {
    const imageObj = new Image();
    imageObj.src = src;
    imageObj.onload = () => {
      const img = new Konva.Image({
        image: imageObj,
        width: imageObj.width,
        height: imageObj.height,
      });

      const scale = Math.min(
        this.stage.width() / img.width(),
        this.stage.height() / img.height()
      );

      img.scale({ x: scale, y: scale });
      img.x((this.stage.width() - img.width() * scale) / 2);
      img.y((this.stage.height() - img.height() * scale) / 2);

      this.layer.add(img);

      const rect = new Rect({
        x: img.x(),
        y: img.y(),
        width: 250,
        height: 250,
        fill: 'yellow',
        stroke: 'rgba(211, 61, 61, 1)',
        draggable: true,
        resizeable: true,
      });

      this.layer.add(rect);

      const { stage, layer } = this;
    //   stage.on('click tap', function(e) {
    //     // if click on empty area - remove all transformers
    //     if (e.target === stage) {
    //       stage.find('Transformer').destroy();
    //       layer.draw();
    //       return;
    //     }
    //     // do nothing if clicked NOT on our rectangles
    //     if (!e.target.hasName('rect')) {
    //       return;
    //     }
    //     // remove old transformers
    //     // TODO: we can skip it if current rect is already selected
    //     stage.find('Transformer').destroy();

    //     // create new transformer
    //     var tr = new Konva.Transformer();
    //     layer.add(tr);
    //     tr.attachTo(e.target);
    //     layer.draw();
    //   });

    var tr = new Konva.Transformer({
        boundBoxFunc: function(oldBoundBox, newBoundBox) {
          // "boundBox" is an object with
          // x, y, width, height and rotation properties
          // transformer tool will try to fit node into that box
          // "width" property here is a visible width of the object
          // so it equals to rect.width() * rect.scaleX()

          // the logic is simple, if new width is too big
          // we will return previous state
          return newBoundBox;
        }
      });
      layer.add(tr);
      tr.attachTo(rect);


    //   const text = new Konva.Text({
    //     x: img.x(),
    //     y: img.y(),
    //     text: 'Text on Rect',
    //     fill: 'black',
    //     fontSize: 20,
    //   });

    //   const group = new Konva.Group({
    //     x: img.x(),
    //     y: img.y(),
    //   });

    //   group.add(rect);
    //   group.add(text);
    //   this.layer.add(group);

      this.layer.draw();
    };
  }
}