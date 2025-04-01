import { Canvas, FabricImage, Rect, Ellipse, FabricObject, Polyline, Polygon, FabricText, controlsUtils, Group } from "fabric";
import LabeledPolygon from './Polygon';
import LabeledRect from './Rect';

FabricObject.prototype.setControlVisible('mtr', false);
// 'tl', 'tr', 'br', 'bl', 'ml', 'mt', 'mr', 'mb', 'mtr'.
Polygon.prototype.setControlVisible('tl', false);
Polygon.prototype.setControlVisible('tr', false);
Polygon.prototype.setControlVisible('br', false);
Polygon.prototype.setControlVisible('bl', false);
Polygon.prototype.setControlVisible('ml', false);
Polygon.prototype.setControlVisible('mt', false);
Polygon.prototype.setControlVisible('mr', false);
Polygon.prototype.setControlVisible('mb', false);
Polygon.prototype.setControlVisible('mtr', false);

Rect.prototype.setControlVisible('tl', true);
Rect.prototype.setControlVisible('tr', true);
Rect.prototype.setControlVisible('br', true);
Rect.prototype.setControlVisible('bl', true);
Rect.prototype.setControlVisible('ml', true);
Rect.prototype.setControlVisible('mt', true);
Rect.prototype.setControlVisible('mr', true);
Rect.prototype.setControlVisible('mb', true);
Rect.prototype.setControlVisible('mtr', false);



export default class Editor {
  constructor({
    container,
    imgUrl,
  }) {
    this.canvasDom = container;

    if (!container) {
      throw new Error('container is required');
    }

    this.resize = this.resize.bind(this);
    this.drag = this.drag.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.drawPoly = this.drawPoly.bind(this);
    this.keydown = this.keydown.bind(this);
    window.addEventListener('resize', this.resize);

    this.canvas = new Canvas(container.querySelector('canvas'));
    console.log('container', container.clientHeight, container.clientWidth);

    this.canvas.setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    this.zoom();
    // this.drawPoly();
    // this.drawRect();
    this.keydown();

    if (imgUrl) {
      this.setImage(imgUrl);
    }

    const { canvas } = this;
    canvas.on('object:resize', function() {
      console.log('object:resize');
    });
  //   canvas.on('object:scaling', function(){
  //     var obj = canvas.getActiveObject(),
  //         width = obj.width,
  //         height = obj.height,
  //         scaleX = obj.scaleX,
  //         scaleY = obj.scaleY;
   
  //     obj.set({
  //         width : width * scaleX,
  //         height : height * scaleY,
  //         scaleX: 1,
  //         scaleY: 1
  //     });
  // });
  }

  keydown() {
    this.canvas.on('keydown', (e) => {
      console.log('keydown', e);
      if (e.key === 'Escape') {
        this.canvas.setActiveObject(null);
      }
    });
  }

  drawEllipse() {

    let isDrawingEllipse = false;
    let startPointEllipse;
    let ellipse;
    const { canvas } = this;

    canvas.on('mouse:down', function (options) {

      isDrawingEllipse = true;
      startPointEllipse = options.pointer;
      ellipse = new Ellipse({
        left: startPointEllipse.x,
        top: startPointEllipse.y,
        rx: 0,
        ry: 0,
        fill: 'yellow',
        objectCaching: false,
        stroke: 'lightgreen',
        strokeWidth: 4,
      });
      canvas.add(ellipse);
    });

    canvas.on('mouse:move', function (options) {

      if (isDrawingEllipse) {
        const pointer = options.pointer;
        const dx = pointer.x - startPointEllipse.x;
        const dy = pointer.y - startPointEllipse.y;
        let rx = Math.abs(dx) / 2;
        let ry = Math.abs(dy) / 2;

        if (options.e.shiftKey) {
          // 按下 Shift 键，绘制正圆
          const radius = Math.min(rx, ry);
          rx = radius;
          ry = radius;
        }

        ellipse.set({
          rx: rx,
          ry: ry,
          left: startPointEllipse.x + Math.min(0, dx),
          top: startPointEllipse.y + Math.min(0, dy),
        });
        canvas.renderAll();
      }
    });
    this.canvasDom.addEventListener('keydown', function (e) {
      console.log(e);
    })
  }

  drawPoly() {
    let isDrawingPolygon = false;
    let polygonPoints = [];
    let polygon;

    const { canvas } = this;
    console.log('canvas', canvas);
    canvas.on('keydown', (e) => {
      console.log('e', e);
    })
    canvas.on('mouse:down', function (options) {
      if (!isDrawingPolygon) {
        isDrawingPolygon = true;
        polygonPoints = [];
        polygonPoints.push({ x: options.scenePoint.x, y: options.scenePoint.y });
      }
      const point = options.scenePoint;
      polygonPoints.push({ x: point.x, y: point.y });

      if (polygon) {
        canvas.remove(polygon);
      }

      polygon = new Polyline(polygonPoints, {
        fill: 'yellow',
        stroke: 'lightgreen',
        strokeWidth: 1,
        objectCaching: false,
        
      });
      
      canvas.add(polygon);
    });

    canvas.on('mouse:move', function (options) {
      if (isDrawingPolygon) {
        const point = options.scenePoint;
        
        polygonPoints[polygonPoints.length - 1] = { x: point.x, y: point.y };
        polygon.setCoords();
        canvas.renderAll();
      }
    });

    // canvas.on('mouse:dblclick', function () {
    //   console.log('dbclick', isDrawingPolygon);
    //   if (isDrawingPolygon) {
    //     closePolygon();
    //   }
    // });

    canvas.on('mouse:dblclick', function () {
      console.log('dbclick', isDrawingPolygon);
      if (isDrawingPolygon) {
        // 确保至少有三个点才能形成多边形
        if (polygonPoints.length >= 3) {
          // 把起点添加到点列表末尾，封闭图形
          polygonPoints.push(polygonPoints[0]);
          // 移除当前的 Polyline
          canvas.remove(polygon);
          // 创建一个新的 Polygon 对象
          const polygonObject = new LabeledPolygon(polygonPoints, {
            fill: 'yellow',
            stroke: 'lightgreen',
            strokeWidth: 1,
            objectCaching: false,
            label: 'abc',
            background: 'red',
            zIndex: 1,
          });
          polygonObject.controls = controlsUtils.createPolyControls(polygon);
          // 将新的 Polygon 添加到画布
          canvas.add(polygonObject);
          // 设置新的 Polygon 为活动对象
          canvas.setActiveObject(polygonObject);
        }
        isDrawingPolygon = false;
      }
    });



    function closePolygon() {
      if (polygonPoints.length >= 3) {
        polygon.setCoords();

        canvas.setActiveObject(polygon);
        isDrawingPolygon = false;
      }
    }

    // 检查顶点是否重合
    canvas.on('mouse:down', function (options) {
      if (isDrawingPolygon && polygonPoints.length >= 3) {
        const currentPoint = options.scenePoint;
        const firstPoint = polygonPoints[0];
        const distance = Math.sqrt(
          Math.pow(currentPoint.x - firstPoint.x, 2) + Math.pow(currentPoint.y - firstPoint.y, 2)
        );
        if (distance < 5) { // 可调整重合判定的距离阈值
          closePolygon();
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      console.log(e);
    })

  }


  zoom() {
    const zoomStep = 0.05;
    const { canvas } = this;
    // 监听鼠标滚轮事件
    const handleMouseWheel = (options) => {
      const { e } = options;
      console.log('e', e);
      const delta = Math.sign(e.deltaY);
      const currentZoom = canvas.getZoom();
      console.log('currentZoom', currentZoom);
      let newZoom;

      if (delta < 0) {
        // 向上滚动，放大
        newZoom = currentZoom + zoomStep;
      } else {
        // 向下滚动，缩小
        newZoom = Math.max(0.05, currentZoom - zoomStep);
      }

      // 获取鼠标在画布上的位置
      const pointer = canvas.getScenePoint(e);
      // console.log('pointer', pointer);
      canvas.zoomToPoint({ x: pointer.x, y: pointer.y }, newZoom);
      // console.log(canvas.getObjects());
      canvas.renderAll();
    };

    canvas.on('mouse:wheel', handleMouseWheel);
  }

  drawRect() {
    let isDrawing = false;
    let startPoint;
    let rect;
    const { canvas, scale } = this;
    console.log('scale', this.scale, this);

    canvas.on('mouse:down', function (options) {
      console.log('isdrawing', isDrawing);
      isDrawing = true;
      startPoint = options.pointer;
      rect = new LabeledRect({
        left: startPoint.x,
        top: startPoint.y,
        width: 0,
        height: 0,
        fill: 'yellow',
        fill: 'rgba(255,255,255,1)',
        objectCaching: false,
        stroke: 'lightgreen',
        strokeWidth: 1,
        label: 'ab'
      });
      canvas.add(rect);
    });

    canvas.on('mouse:move', function (options) {
      console.log('isdrawing', isDrawing);
      if (isDrawing) {
        const pointer = options.pointer;
        rect.set({
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
          // scaleX: scale,
          // scaleY: scale,
        });
        canvas.renderAll();
      }
    });

    canvas.on('mouse:up', function () {
      console.log('isdrawing', isDrawing);
      isDrawing = false;
      canvas.setActiveObject(rect);
    });
  }

  resize() {
    const { canvas, img } = this;
    canvas.setDimensions({
      width: this.canvasDom.clientWidth,
      height: this.canvasDom.clientHeight,
    });
    console.log('resize', this.canvas, this.canvasDom.clientWidth, this.canvasDom.clientHeight);
    const scale = Math.round(Math.min(canvas.width / img.width, canvas.height / img.height) * 100) / 100;
    console.log(canvas.width, canvas.height, img.width, img.height, scale);
    this.scale = scale;

  }

  // 画布拖动
  drag() {
    let isDragging = false;
    let lastPointerPosition;
    const { canvas } = this;

    canvas.on('mouse:down', (options) => {
      console.log('options.e', options.e);
      //  if (options.e.button === 1) { // 中键拖动
      console.log('options.e', options, this.img);
      console.log('options', (options.scenePoint.x - this.img.left) / this.scale,
        (options.scenePoint.y - this.img.top) / this.scale);
      isDragging = true;
      lastPointerPosition = canvas.getPointer(options.e);
      //  }
    });

    canvas.on('mouse:move', (options) => {
      if (isDragging) {
        const pointer = canvas.getPointer(options.e);
        const deltaX = pointer.x - lastPointerPosition.x;
        const deltaY = pointer.y - lastPointerPosition.y;

        canvas.forEachObject((obj) => {
          obj.set({
            left: obj.left + deltaX,
            top: obj.top + deltaY
          });
        });

        canvas.renderAll();
        lastPointerPosition = pointer;
      }
    });

    canvas.on('mouse:up', () => {
      isDragging = false;
    });
  }

  destroy() {
    this.canvas.dispose();
  }

  setImage(src) {
    this.imgUrl = src;
    FabricImage.fromURL(src).then((img) => {
      const { canvas } = this;
      const scale = Math.round(Math.min(canvas.width / img.width, canvas.height / img.height) * 100) / 100;
      console.log(canvas.width, canvas.height, img.width, img.height, scale);
      this.scale = scale;
      // 实际宽度
      const width = Math.round(img.width * scale);
      // 实际高度
      const height = Math.round(img.height * scale);

      console.log('width height', width, height);
      img.set({
        left: (canvas.width - width) / 2,
        top: (canvas.height - height) / 2,
        // width: width,
        // height: height,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
      });
      this.img = img;
      console.log('this.img size', img.width, img.height);

      canvas.insertAt(0, img);

      // const rect = new LabeledRect({
      //   left: img.left,
      //   top: img.top,
      //   width: 250,
      //   'label': 'rect', 
      //   // scaleX: scale,
      //   // scaleY: scale,
      //   height: 250,
      //   fill: 'yellow',
      //   stroke: 'rgba(211, 61, 61, 1)',
      //   // selectable: false,
      // });

      // // 创建一个文字对象
      // const text = new FabricText('Text on Rect Text on Rect Text on Rect Text on Rect ', {
      //   left: img.left,
      //   width: rect.width,
      //   top: img.top,
      //   fill: 'black',
      //   fontSize: 20,
      // });

      // // 创建一个 Group 对象，将矩形和文字添加到 Group 中
      // const group = new Group([rect, text], {
      //   left: img.left,
      //   top: img.top,
      // });

      // // canvas.add(group);

      canvas.add(new LabeledRect({
        left: img.left,
        top: img.top,
        width: 250,
        'label': 'rect', 
        // scaleX: scale,
        // scaleY: scale,

        height: 250,
        fill: 'yellow',
        stroke: 'rgba(211, 61, 61, 1)',
        // selectable: false,
      }))

      // canvas.add(new LabeledRect({
      //   left: img.left,
      //   top: img.top,
      //   width: 250,
      //   'label': 'rect', 
      //   // scaleX: scale,
      //   // scaleY: scale,

      //   height: 250,
      //   fill: 'yellow',
      //   stroke: 'rgba(211, 61, 61, 1)',
      //   // selectable: false,
      // }))

      // canvas.add(new LabeledPolygon([{
      //   x: 0,
      //   y: 0
      // }, {
      //   x: 50,
      //   y: 0,
      // }, {
      //   x: 50,
      //   y: 50,
      // }, {
      //   x: 0,
      //   y: 50,
      // }], {
      //   left: img.left,
      //   top: img.top,
      //   width: 250,
      //   'label': 'polygon', 
      //   // scaleX: scale,
      //   // scaleY: scale,

      //   height: 250,
      //   fill: 'rgba(207, 51, 51, 1)',
      //   stroke: 'rgba(211, 61, 61, 1)',
      //   // selectable: false,
      // }))
      // canvas.add(new LabeledRect({
      //   left: img.left,
      //   top: img.top,
      //   width: 250,
      //   'label': 'abc', 
      //   // scaleX: scale,
      //   // scaleY: scale,

      //   height: 250,
      //   fill: 'rgba(207, 51, 51, 1)',
      //   stroke: 'rgba(211, 61, 61, 1)',
      //   // selectable: false,
      // }))

      window.canvas = canvas;
    });
  }


}