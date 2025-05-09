import { Canvas, FabricImage, FabricObject, loadSVGFromString } from "fabric";
import paper from 'paper';
import EventBus from './EventBus';
import LabeledPolygon from './Polygon';
import LabeledRect from './Rect';
import Polyline from './Polyline';
// import Path from './Path';
import Ellipse from "./Ellipse";
import Circle from "./Circle";
import MyImage from "./Image";
import { EVENTS } from "./constants";

FabricObject.prototype.setControlVisible('mtr', false);

const CREATE_TYPE = {
  POLYGON: 'polygon',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  RECT: 'rect',
  PATH: 'path',
  NONE: 'none',
  IMAGE: 'image',
}

export const EditorType = CREATE_TYPE;

export default class Editor extends EventBus {

  constructor({
    container,
    imgUrl,
  }) {
    super();
    this.canvasDom = container;
    this.selected = [];
    this.createType = CREATE_TYPE.NONE;

    if (!container) {
      throw new Error('container is required');
    }


    this.resize = this.resize.bind(this);
    this.drag = this.drag.bind(this);
    this.keydown = this.keydown.bind(this);
    this.setCreateType = this.setCreateType.bind(this);

    this.getImageBounds = this.getImageBounds.bind(this);
    this.addMovementConstraints = this.addMovementConstraints.bind(this);

    const canvasDom = document.querySelector('canvas');
    this.canvas = new Canvas(canvasDom);

    const noshowCanvas = document.createElement('canvas');
    container.appendChild(noshowCanvas);
    noshowCanvas.width = container.clientWidth;
    noshowCanvas.height = container.clientHeight;
    noshowCanvas.style.display = 'none';

    paper.setup(noshowCanvas);



    this.canvas.setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    this.zoom();

    if (imgUrl) {
      this.setImage(imgUrl);
    }

    // window.addEventListener('resize', this.resize);
    this.addMovementConstraints();
    // 椭圆
    this.startDrawingEllipse = this.startDrawingEllipse.bind(this);
    this.endDrawingEllipse = this.endDrawingEllipse.bind(this);
    this.drawingEllipse = this.drawingEllipse.bind(this);

    // 矩形
    this.startDrawingRect = this.startDrawingRect.bind(this);
    this.endDrawingRect = this.endDrawingRect.bind(this);
    this.drawingRect = this.drawingRect.bind(this);

    // 多边形
    this.startDrawingPoly = this.startDrawingPoly.bind(this);
    this.endDrawingPoly = this.endDrawingPoly.bind(this);
    this.drawingPoly = this.drawingPoly.bind(this);

    // 圆型
    this.startDrawingCircle = this.startDrawingCircle.bind(this);
    this.endDrawingCircle = this.endDrawingCircle.bind(this);
    this.drawingCircle = this.drawingCircle.bind(this);

    this.getSelection = this.getSelection.bind(this);
    // this.addPath = this.addPath.bind(this);

    document.addEventListener('keydown', this.keydown);

    this.canvas.on('mouse:down', this.startDrawingEllipse);
    this.canvas.on('mouse:move', this.drawingEllipse);
    this.canvas.on('mouse:up', this.endDrawingEllipse);

    this.canvas.on('mouse:down', this.startDrawingRect);
    this.canvas.on('mouse:move', this.drawingRect);
    this.canvas.on('mouse:up', this.endDrawingRect);

    this.canvas.on('mouse:down', this.startDrawingPoly);
    this.canvas.on('mouse:move', this.drawingPoly);
    this.canvas.on('mouse:dblclick', this.endDrawingPoly);

    this.canvas.on('mouse:down', this.startDrawingCircle);
    this.canvas.on('mouse:move', this.drawingCircle);
    this.canvas.on('mouse:up', this.endDrawingCircle);
    this.canvas.on('mouse:up', (options) => {
      if(this.createType === CREATE_TYPE.NONE) {
        if(options.target) {
          const { scale } = this;
          const { left, top } = this.img;
          const { scenePoint } = options;
          const { x, y } = scenePoint;
          const x1 = Math.round((x - left) / scale);
          const y1 = Math.round((y - top) / scale);
          if(options.target.type === 'image') {
            // 点击到图片
            this.emit(EVENTS.CLICK, {
              point: {
                x: x1,
                y: y1,
              }
            })
          }else{
            // 点击到图形
            this.emit(EVENTS.CLICK, {
              point: {
                x: x1,
                y: y1,
              },
              target: options.target,
            })
          }
        }
      }
    })    


    this.canvas.on('selection:created', (options) => {
      this.selected = [];
      this.selected.push(...options.selected);
      console.log('selection:created');
    });


    this.canvas.on('selection:updated', (options) => {
      this.selected.push(...options.selected);
      options.deselected.forEach((item) => {
        if (this.selected.indexOf(item) > -1) {
          this.selected.splice(this.selected.indexOf(item), 1);
        }
      })
      console.log('selection:updated');
    });
    this.canvas.on('selection:cleared', (options) => {
      this.selected = [];
      console.log('selection:updated');
    });

    this.drag();
    this.currentIndex = 1;

  }

  getSelection() {
    return this.selected;
  }

  loadSVGFromString(svgString) {
    // loadSVGFromString(svgString, (objects, options) => {
    //   console.log('objects', objects, options);
    //   options.stroke = '#000';
    //   options.strokeWidth = 1;
    //   this.canvas.add(options);
    // })

    const path = new Path(svgString);
    this.canvas.add(path);
    debugger;

    
  }

  // setReadonly(flag = false) {
  //   console.log('set readonly', flag);
  //   this.readonly = flag;
  // }

  get readonly() {
    return this.createType === CREATE_TYPE.NONE;
  }

  // 反选
  invertSelection() {
    const objects = this.canvas.getActiveObjects().filter((item) => {
      return !(item.isBackground);
    });
    const { img, scale } = this;
    const { left, top, width, height } = img;
    console.log('left, top', left, top, width, height);
    const rect = new LabeledRect({
      width: width * scale,
      height: height * scale,
      left,
      top,
    });

    if(objects.length === 0) {
      this.canvas.add(rect);
    }else {
      // console.log('object', objects);
      // let result = objects[0].toPaperObject();
      // objects.forEach((item, index) => {

      //   if(index > 0) {
      //     result = result.unite(item.toPaperObject());
      //   }
      // });
      // const rectPaper = rect.toPaperObject();
      // this.excludePaper(rectPaper, result);
      // const path = rectPaper.subtract(result);
      this.canvas.remove(rect);
      this.canvas.remove(...objects);
      // if (path.pathData) {
      //   this.canvas.add(new Path(path.pathData, {
      //     // label: '范围' + (this.currentIndex++)
      //   }));
      // }
     
      
    }
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  // addPath(left, right, pathData) {
  //   this.canvas.remove(left);
  //   this.canvas.remove(right);

  //   const path = new Path(pathData, {
  //     // label: '范围' + (this.currentIndex++)
  //   });
  //   this.canvas.add(path);
  //   this.canvas.renderAll();
  // }

  removeObjects() {
    const objects = this.canvas.getObjects();
    objects.filter((item) => {
      // return (item.type !== 'image');
      return !(item.isBackground);
    }).forEach((item) => {
      this.canvas.remove(item);
    })
    this.canvas.renderAll();
  }

  removeObject(object) {
    this.canvas.remove(object);
    this.canvas.renderAll();
  }

  addObject(object) {
    this.canvas.add(object);
    this.canvas.renderAll();
  }

  addPolygon(points) {
    const polygon = new LabeledPolygon(points.map((item) => {
      return {
        x: (item.x),
        y: (item.y),
      }
    }), {
      objectCaching: false,
      // label: '范围' + (this.currentIndex++)
    });
    this.canvas.add(polygon);
    this.canvas.renderAll();
  }

  destroy() {
    document.removeEventListener('keydown', this.keydown);
    this.canvas.off('mouse:down', this.startDrawingEllipse);
    this.canvas.off('mouse:move', this.drawingEllipse);
    this.canvas.off('mouse:up', this.endDrawingEllipse);

    this.canvas.off('mouse:down', this.startDrawingRect);
    this.canvas.off('mouse:move', this.drawingRect);
    this.canvas.off('mouse:up', this.endDrawingRect);

    this.canvas.off('mouse:down', this.startDrawingPoly);
    this.canvas.off('mouse:move', this.drawingPoly);
    this.canvas.off('mouse:dblclick', this.endDrawingPoly);

    this.canvas.off('mouse:down', this.startDrawingCircle);
    this.canvas.off('mouse:move', this.drawingCircle);
    this.canvas.off('mouse:up', this.endDrawingCircle);

  }

  addMovementConstraints() {
    const { canvas } = this;
    // 移动不允许超过边界
    canvas.on('object:moving', (options) => {

      const obj = options.target;
      const imgBounds = this.getImageBounds();
      // console.log('mouse mov', imgBounds);

      if (!imgBounds) return;

      // 考虑对象尺寸
      const objLeft = obj.left;
      const objTop = obj.top;
      const objRight = objLeft + obj.width * obj.scaleX;
      const objBottom = objTop + obj.height * obj.scaleY;

      // 计算修正后的位置
      let newLeft = objLeft;
      let newTop = objTop;

      // 水平边界
      if (objLeft < imgBounds.left) {
        newLeft = imgBounds.left;
      } else if (objRight > imgBounds.right) {
        newLeft = imgBounds.right - obj.width * obj.scaleX;
      }

      // 垂直边界
      if (objTop < imgBounds.top) {
        newTop = imgBounds.top;
      } else if (objBottom > imgBounds.bottom) {
        newTop = imgBounds.bottom - obj.height * obj.scaleY;
      }

      // 应用修正
      if (newLeft !== objLeft || newTop !== objTop) {
        obj.set({
          left: newLeft,
          top: newTop
        }).setCoords();
        canvas.requestRenderAll();
      }
    });

    // 缩放不允许超过边界
    canvas.on('object:scaling', (options) => {
      const obj = options.target;
      const imgBounds = this.getImageBounds();

      if (!imgBounds) return;

      const objLeft = obj.left;
      const objTop = obj.top;
      const objRight = objLeft + obj.width * obj.scaleX;
      const objBottom = objTop + obj.height * obj.scaleY;

      let newScaleX = obj.scaleX;
      let newScaleY = obj.scaleY;

      if (objRight > imgBounds.right) {
        newScaleX = (imgBounds.right - objLeft) / obj.width;
      }
      if (objLeft < imgBounds.left) {
        newScaleX = (imgBounds.right - imgBounds.left) / obj.width;
        obj.set({ left: imgBounds.left });
      }

      if (objBottom > imgBounds.bottom) {
        newScaleY = (imgBounds.bottom - objTop) / obj.height;
      }
      if (objTop < imgBounds.top) {
        newScaleY = (imgBounds.bottom - imgBounds.top) / obj.height;
        obj.set({ top: imgBounds.top });
      }

      if (newScaleX !== obj.scaleX || newScaleY !== obj.scaleY) {
        obj.set({
          scaleX: newScaleX,
          scaleY: newScaleY
        }).setCoords();
        canvas.requestRenderAll();
      }
    });
  }

  getImageBounds() {
    if (!this.img) return null;
    return {
      left: this.img.left,
      top: this.img.top,
      right: this.img.left + this.img.width * this.img.scaleX,
      bottom: this.img.top + this.img.height * this.img.scaleY
    };
  }

  setCreateType(createType) {
    console.log('createType', createType);
    this.createType = createType;
    this.isDrawing = false;
    if(this.polygon) {
      this.canvas.remove(this.polygon);
      this.canvas.requestRenderAll();
    }
    
    this.currentShape = null;
  }

  keydown(e) {
    if (e.key === 'Escape') {
      this.cancelDrawingPoly();
    } else if (e.key === 'Delete' || e.key === 'Dead' || e.key === 'Backspace') {
      const selectedItems = this.selected || [];
      selectedItems.forEach(obj => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }
  }

  cancelDrawingPoly() {
    if (this.createType === CREATE_TYPE.POLYGON && this.isDrawing) {
      if (this.polygonPoints.length >= 2) {
        this.polygonPoints.pop();
      } else {
        this.canvas.remove(this.currentShape);
      }
    }
  }

  startDrawingCircle(options) {
    if(this.readonly) {
      return;
    }
    // if(options.target && options.target.type !== 'image') {
    //   return;
    // }
    if (!(this.createType === CREATE_TYPE.CIRCLE && this.checkImgBounds(options))) {
      return;
    }
    const { scenePoint } = options;
    this.isDrawing = true;
    this.startPoint = scenePoint;
    this.currentShape = new Circle({
      left: scenePoint.x,
      top: scenePoint.y,
      radius: 0,
      // label: '范围' + (this.currentIndex++)
    });
    this.canvas.add(this.currentShape);
  }


  caclRectBounds(options) {
    const { scenePoint } = options;
    // const imgBounds = this.getImageBounds();
    const { startPoint } = this;
    let left = Math.min(startPoint.x, scenePoint.x);
    let top = Math.min(startPoint.y, scenePoint.y);
    let right = Math.max(startPoint.x, scenePoint.x);
    let bottom = Math.max(startPoint.y, scenePoint.y);
    // if(left < imgBounds.left) {
    //   left = imgBounds.left;
    // }
    // if(top < imgBounds.top) {
    //   top = imgBounds.top;
    // }
    // if(right > imgBounds.right) {
    //   right = imgBounds.right;
    // }
    // if(bottom > imgBounds.bottom) {
    //   bottom = imgBounds.bottom;
    // }
    return {
      left, top, right, bottom
    }

  }

  drawingCircle(options) {
    if (!(this.createType === CREATE_TYPE.CIRCLE && this.isDrawing)) {
      return;
    }
    const { currentShape, canvas } = this;
    const { left, top, right, bottom } = this.caclRectBounds(options);
    // 设置椭圆的位置和半径
    currentShape.set({
      radius: Math.min((bottom - top)/2, (right - left)/2),
      left: left,
      top: top,
    });
    canvas.requestRenderAll();
  }

  endDrawingCircle(options) {
    if (!(this.createType === CREATE_TYPE.CIRCLE && this.isDrawing)) {
      return;
    }
    this.isDrawing = false;
    if (this.currentShape.radius === 0 || this.currentShape.radius === 0) {
      this.canvas.remove(this.currentShape);
    } else {
      this.canvas.setActiveObject(this.currentShape);
    }
  }

  checkImgBounds() {
    // const imgBounds = this.getImageBounds();
    // if (!imgBounds) return false;
    // const { scenePoint } = options;
    // if (scenePoint.x < imgBounds.left || scenePoint.x > imgBounds.right || scenePoint.y < imgBounds.top || scenePoint.y > imgBounds.bottom) {
    //   return false;
    // }
    return true;
  }

  startDrawingEllipse(options) {
    if(this.readonly) {
      return;
    }
    // if(options.target && options.target.type !== 'image') {
    //   return;
    // }
    if (this.createType !== CREATE_TYPE.ELLIPSE || !this.checkImgBounds(options)) {
      return;
    }
    const { scenePoint } = options;
    console.log('start drawing ellipse');
    this.isDrawing = true;
    this.startPoint = scenePoint;
    this.currentShape = new Ellipse({
      left: scenePoint.x,
      top: scenePoint.y,
      rx: 0,
      ry: 0,
      // label: '范围' + (this.currentIndex++)
    });
    this.canvas.add(this.currentShape);
  }

  drawingEllipse(options) {
    if (!(this.createType === CREATE_TYPE.ELLIPSE && this.isDrawing)) {
      return;
    }
    const { currentShape, canvas } = this;
    const {
      left, top, right, bottom
    } = this.caclRectBounds(options);

    // 设置椭圆的位置和半径
    currentShape.set({
      rx: (right - left)/2,
      ry: (bottom - top)/2,
      left: left,
      top: top,
    });
    canvas.requestRenderAll();
  }

  endDrawingEllipse(options) {
    if (!(this.createType === CREATE_TYPE.ELLIPSE && this.isDrawing)) {
      return;
    }
    console.log('endDrawingEllipse');
    this.isDrawing = false;
    if (this.currentShape.rx === 0 || this.currentShape.ry === 0) {
      this.canvas.remove(this.currentShape);
    } else {
      this.canvas.setActiveObject(this.currentShape);
    }
  }

  startDrawingPoly(options) {
    if(this.readonly) {
      return;
    }
    if (!(this.createType === CREATE_TYPE.POLYGON && this.checkImgBounds(options))) {
      return;
    }
    const { canvas } = this;
    console.log('start drawing poly', options);
    const point = options.scenePoint;
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.polygonPoints = [];
      this.polygonPoints.push({ x: point.x, y: point.y });
    }
    this.polygonPoints.push({ x: point.x, y: point.y });
    
    
    console.log('this.polygonPoints click', this.polygonPoints);

    if (this.polygon) {
      canvas.remove(this.polygon);
    }
    this.polygon = new Polyline(this.polygonPoints, {
      objectCaching: false,
      selectable: false,

    });
    canvas.add(this.polygon);
  }

  drawingPoly(options) {
    if (!(this.createType === CREATE_TYPE.POLYGON && this.isDrawing)) {
      return;
    }
    const { polygonPoints, polygon, canvas } = this;
    const point = options.scenePoint;

    polygonPoints[polygonPoints.length - 1] = { x: point.x, y: point.y };
    polygon.setCoords();
    canvas.renderAll();
  }

  endDrawingPoly(options) {
    if (!(this.createType === CREATE_TYPE.POLYGON && this.isDrawing && this.checkImgBounds(options))) {
      return;
    }
    this.polygonPoints.pop();
    const { polygonPoints, polygon, canvas } = this;
      // 确保至少有三个点才能形成多边形
    if (polygonPoints.length >= 3) {
      // polygonPoints.push(polygonPoints[0]);
      console.log('this.polygonPoints', this.polygonPoints);
      const polygonObject = new LabeledPolygon(polygonPoints, {
        objectCaching: false,
        // label: '范围' + (this.currentIndex++)
      });
      canvas.add(polygonObject);
      console.log('polygonObject', polygonObject);
      canvas.setActiveObject(polygonObject);
    } 
    canvas.remove(polygon);
    this.isDrawing = false;
  }

  zoomOut() {
    const { canvas } = this;
    const currentZoom = canvas.getZoom();
    const newZoom = Math.max(0.05, currentZoom + 0.05);
    canvas.zoomToPoint(canvas.getCenterPoint(), newZoom);
    canvas.renderAll();
  }

  zoomIn() {
    const { canvas } = this;
    const currentZoom = canvas.getZoom();
    const newZoom = Math.min(2, currentZoom - 0.05);
    canvas.zoomToPoint(canvas.getCenterPoint(), newZoom);
    canvas.renderAll();
  }

  zoom() {
    const zoomStep = 0.05;
    const { canvas } = this;
    // 监听鼠标滚轮事件
    const handleMouseWheel = (options) => {
      const { e } = options;
      e.stopPropagation();
      const delta = Math.sign(e.deltaY);
      const currentZoom = canvas.getZoom();
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

  getJSONObject() {
    const objects = this.canvas.getObjects();
    const { img } = this;
    return objects.filter((item) => {
      console.log('img', item);
      return !item.isBackground;
    }).map((item) => {
      return item.toJSON();
    }).filter((item) => !!item);
  }

  clickOnControls(options) {
    return (options.transform && options.transform.action === 'scale');
  }

  startDrawingRect(options) {
    if(this.readonly) {
      return;
    }
    console.log('options', options);
    // if(options.target && options.target.type !== 'image') {
    //   return;
    // }
<<<<<<< HEAD
    if (this.createType !== CREATE_TYPE.RECT || !this.checkImgBounds(options) || this.clickOnControls(options)) {
=======
    if (this.createType !== CREATE_TYPE.RECT || !this.checkImgBounds(options)) {
>>>>>>> d8c5146df38409be9cead03447f8973a6fe278a0
      return;
    }
    
    console.log('options', options);
    // if(!(options.target && options.target.type === 'image')) {
    //   return;
    // }
    console.log('startDrawingRect');
    this.isDrawing = true;
    this.startPoint = options.scenePoint;
    this.currentShape = new LabeledRect({
      left: this.startPoint.x,
      top: this.startPoint.y,
      width: 0,
      height: 0,
      // label: '范围' + (this.currentIndex++)
    });
    this.canvas.add(this.currentShape);
  }

  drawingRect(options) {
    if (!(this.createType === CREATE_TYPE.RECT && this.isDrawing)) {
      return;
    }
    console.log('drawingRect');
    const { currentShape, canvas } = this;
    const {
      left, top, right, bottom
    } = this.caclRectBounds(options);
    currentShape.set({
      width: (right - left),
      height: (bottom - top),
      left,
      top,
    });
    canvas.renderAll();
  }

  endDrawingRect() {
    if (!(this.createType === CREATE_TYPE.RECT && this.isDrawing)) {
      return;
    }
    console.log('endDrawingRect');
    this.isDrawing = false;
    if (this.currentShape.width === 0 || this.currentShape.height === 0) {
      this.canvas.remove(this.currentShape);
    } else {
      this.canvas.setActiveObject(this.currentShape);
    }
  }

  resize(width, height) {
    try{
    const { canvas, img } = this;
    if(canvas && img) {
      canvas.setDimensions({
        width: width,
        height: height,
      });

      const scale = Math.round(Math.min(width / img.width, height / img.height) * 100) / 100;
      canvas.setViewportTransform([scale, 0, 0, scale, (canvas.width - img.width * scale) / 2 , (canvas.height - img.height * scale) / 2]);
    }
  }catch(e) {
    console.log('resize error', e);
  }
  }

  // 画布拖动
  drag() {
    let isDragging = false;
    let lastPointerPosition;
    const { canvas } = this;

    canvas.on('mouse:down', (options) => {
      console.log('this.readonly', this.readonly);
      if(!this.readonly) {
        return;
      }
      if(options.target && options.target.type === 'image') {
        console.log('options.e', options.e);
        //  if (options.e.button === 1) { // 中键拖动
        // console.log('options.e', options, this.img);
        // console.log('options', (options.scenePoint.x - this.img.left) / this.scale,
        //   (options.scenePoint.y - this.img.top) / this.scale);
        isDragging = true;
        lastPointerPosition = canvas.getPointer(options.e);
      }
      //  }
    });

    canvas.on('mouse:move', (options) => {
      if (isDragging) {
        const pointer = canvas.getPointer(options.e);
        const deltaX = pointer.x - lastPointerPosition.x;
        const deltaY = pointer.y - lastPointerPosition.y;

        const currentTransform = canvas.viewportTransform;
        console.log('currentTransform', currentTransform)

        // 计算新的平移量（第四、五个元素是平移）
        const newTransform = [
          currentTransform[0], 
          currentTransform[1],
          currentTransform[2],
          currentTransform[3],
          currentTransform[4] + deltaX * currentTransform[0], // X增量
          currentTransform[5] + deltaY * currentTransform[3]  // Y增量
        ];

        canvas.setViewportTransform(newTransform);

        // this.canvas.setViewportTransform([1, 0, 0, 1, deltaX, deltaY])

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

 

  getOpersBound(leftObject, rightObject) {
    const leftObjectCoords = leftObject.getCoords();
    const rightObjectCoords = rightObject.getCoords();
    const { img } = this;
    
    const left = Math.round(Math.max(Math.min(leftObjectCoords[0].x, rightObjectCoords[0].x), img.left));
    const top = Math.round(Math.max(Math.min(leftObjectCoords[0].y, rightObjectCoords[0].y), img.top));
    const right = Math.round(Math.min( Math.max(leftObjectCoords[2].x, rightObjectCoords[2].x), img.width));
    const bottom = Math.round(Math.min(Math.max(leftObjectCoords[2].y, rightObjectCoords[2].y), img.height));
    return {
      left,
      top,
      right,
      bottom
    }
    
  }

   // 并集
   union(leftObject, rightObject) {
    const { left, top, right, bottom } = this.getOpersBound(leftObject, rightObject);

    const mask = Array.from({ length: bottom - top }, () => new Uint8Array(right - left).fill(0));
    console.log('left ttop right bottom', left, top, right, bottom);
    let str = '';
    for(let i=top; i<= bottom;i++) {
      for(let j=left;j<=right;j++ ) {
        const point = {
          x: j,
          y: i
        };
        if(leftObject.containPoint(point) || rightObject.containPoint(point)) {
          str += i + ',' + j + ';';
          
          mask[i-top] && (mask[i - top][j - left] = 1);
        }
      }
    }
    console.log('str', str);
    MyImage.createFromMatrix(mask, { left, top }).then((image) => {
      image.left = left;
      image.top = top;

      this.canvas.add(image);
      this.canvas.remove(leftObject);
      this.canvas.remove(rightObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }).catch((e) => {
      console.log('e', e);
    })
  }

  // 交集
  intersect(leftObject, rightObject) {
    
    const { left, top, right, bottom } = this.getOpersBound(leftObject, rightObject);
    const mask = Array.from({ length: bottom - top }, () => new Uint8Array(right - left).fill(0));

    let count = 0;
    for(let i=top; i<= bottom;i++) {
      for(let j=left;j<=right;j++ ) {
        const point = {
          x: j,
          y: i
        };
        if(leftObject.containPoint(point) && rightObject.containPoint(point)) {
          mask[i - top][j - left] = 1;
          count++;
        }
      }
    }
    if(count === 0) {
      this.canvas.remove(leftObject);
      this.canvas.remove(rightObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
      return;
    }

    MyImage.createFromMatrix(mask, { left, top }).then((image) => {
      image.left = left;
      image.top = top;
      this.canvas.add(image);
      this.canvas.remove(leftObject);
      this.canvas.remove(rightObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }).catch((e) => {
      console.log('e', e);
    })
  }

  // 减去顶层
  substract(leftObject, rightObject) {
    const { left, top, right, bottom } = this.getOpersBound(leftObject, rightObject);
    const mask = Array.from({ length: bottom - top }, () => new Uint8Array(right - left).fill(0));

    let count = 0;
    for(let i=top; i<= bottom;i++) {
      for(let j=left;j<=right;j++ ) {
        const point = {
          x: j,
          y: i
        };
        if(leftObject.containPoint(point) && !rightObject.containPoint(point)) {
          mask[i - top][j - left] = 1;
          count ++;
        }
      }
    }
    if(count === 0) {
      this.canvas.remove(leftObject);
      this.canvas.remove(rightObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
      return;
    }
    MyImage.createFromMatrix(mask, { left, top }).then((image) => {
      image.left = left;
      image.top = top;
      this.canvas.add(image);
      this.canvas.remove(leftObject);
      this.canvas.remove(rightObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }).catch((e) => {
      console.log('e', e);
    })

  }

  // excludePaper(leftPath, rightPath) {
  //   const path = leftPath.subtract(rightPath);

  //   if(path.pathData) {
  //     this.canvas.add(new Path(path.pathData, {
  //       // label: '范围' + (this.currentIndex++)
  //     }));
  //   }
  //   const path2 = rightPath.subtract(leftPath);
  //   if(path2.pathData) {
  //     this.canvas.add(new Path(path2.pathData, 
  //       {
  //         // label: '范围' + (this.currentIndex++)
  //       }
  //     ));
  //   }
  //   this.canvas.discardActiveObject();
  //   this.canvas.requestRenderAll();
  // }

  // 对称差集
  exclude(leftObject, rightObject) {
    const { left, top, right, bottom } = this.getOpersBound(leftObject, rightObject);
    const mask = Array.from({ length: bottom - top }, () => new Uint8Array(right - left).fill(0));
    console.log('left top', left, top, right, bottom);
    for(let i=top; i<= bottom;i++) {
      for(let j=left;j<=right;j++ ) {
        const point = {
          x: j,
          y: i
        };
        const leftFlag = leftObject.containPoint(point);
        const rightFlag = rightObject.containPoint(point);

        if(leftFlag && !rightFlag || !leftFlag && rightFlag) {
          mask[i - top][j - left] = 1;
        }
      }
    }
    MyImage.createFromMatrix(mask, { left, top }).then((image) => {
      image.left = left;
      image.top = top;
      this.canvas.add(image);
      this.canvas.remove(leftObject);
      this.canvas.remove(rightObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }).catch((e) => {
      console.log('e', e);
    })
  }

  getObject(item) {
    if (item.type === CREATE_TYPE.CIRCLE) {
      const circle = new Circle({
        left: (item.left),
        top: (item.top),
        radius: item.radius,
        label: item.label,
      });
      return (circle);
    }else if(item.type === CREATE_TYPE.RECT) {
      const rect = new LabeledRect({
        left: (item.left) ,
        top: (item.top),
        width: item.width,
        height: item.height,
        label: item.label,
      });
      return (rect);
    } else if(item.type === CREATE_TYPE.POLYGON) {
      const polygon = new LabeledPolygon(item.points.map((item) => {
        return {
          x: (item.x),
          y: (item.y),
        }
      }), {
        left: (item.left) ,
        top: (item.top),
        label: item.label,
      });
      return (polygon);
    // } else if(item.type === CREATE_TYPE.PATH) {
    //   const path = new Path(item.pathData, {
    //     left: item.left,
    //     top: item.top,
    //     label: item.label,
    //   });
    //   return (path);
    } else if(item.type === CREATE_TYPE.ELLIPSE) {
      const ellipse = new Ellipse({
        left: (item.left ) ,
        top: (item.top) ,
        rx: item.rx,
        ry: item.ry ,
        label: item.label,
      });
      return (ellipse);
    } else if(item.type === 'image') {
      return MyImage.createFromBase64(item.base64).then((image) => {
        image.left = item.left;
        image.top = item.top;
        image.width = item.width;
        image.height = item.height;
        return image;
      });
      
    }
  }

  loadJSON(json = []) {
    json.forEach((item) => {
      console.log('item', item);
      const object = this.getObject(item);
      if (object) {
        if(object.then) {
          object.then((object) => {
            this.canvas.add(object);
          })
        }else {
          this.canvas.add(object);
        }
      }
    })
  }

  setImage(src) {
    console.log('src', src);
    this.imgUrl = src;
    FabricImage.fromURL(src).then((img) => {
      const { canvas } = this;
      const scale = Math.round(Math.min(canvas.width / img.width, canvas.height / img.height) * 100) / 100;
      // console.log(canvas.width, canvas.height, img.width, img.height, scale);
      // 实际宽度
      const width = img.width;
      // 实际高度
      const height = img.height;
      img.isBackground = true;
      img.set({
        // left: (canvas.width - width) / 2,
        // top: (canvas.height - height) / 2,
        // scaleX: scale,
        // scaleY: scale,
        left: 0,
        top: 0,
        selectable: false,
      });
      canvas.setViewportTransform([scale, 0, 0, scale, (canvas.width - width * scale) / 2 , (canvas.height - height * scale) / 2]);
      // const center = canvas.getCenterPoint();
      // canvas.zoomToPoint(center, this.zoom)
      // canvas.setZoom(scale);
      this.img = img;

      canvas.insertAt(0, img);
      this.emit('load', {});
    });
  }

  getMask() {
    const { canvas, img } = this;
    const { left, top } = img;
    const { scale } = this;
    const objects = canvas.getObjects().filter(obj => !obj.isBackground);
    // const objects = this.getJSONObject();
    console.log('get mask object', objects);
    const mask = Array.from({ length: img.height }, () => new Uint8Array(img.width).fill(0));
    
    objects.forEach((item) => {
      if(item.type === CREATE_TYPE.CIRCLE) {
        const jsonObject = item.toJSON();
        const circle = new Circle({
          left: jsonObject.left,
          top: jsonObject.top,
          radius: jsonObject.radius,
        });
        item.getMask(mask);

      }else if(item.type === CREATE_TYPE.RECT) {
        const rect = new LabeledRect({
          left: item.left,
          top: item.top,
          width: item.width,
          height: item.height,
        });
        item.getMask(mask);
      }else if(item.type === CREATE_TYPE.POLYGON) {
        const polygon = new LabeledPolygon(item.points, {
          left: item.left,
          top: item.top,
        });
        item.getMask(mask);
      }else if(item.type === CREATE_TYPE.PATH) {
        const path = new Path(item.pathData, {
          // left: item.left,
          // top: item.top,
        });
        path.getMask(mask, { imgLeft: left, imgTop: top, imgScale: scale});
      }else  if(item.type === CREATE_TYPE.ELLIPSE) {
        const itemJSON = item.toJSON();
        const ellipse = new Ellipse({
          left: itemJSON.left,
          top: itemJSON.top,
          rx: itemJSON.rx,
          ry: itemJSON.ry,
        });
        ellipse.getMask(mask);
      } else if(item.type === CREATE_TYPE.IMAGE) {
        item.getMask(mask)
      }
    })
    return {
      mask,
      json: objects,
    }
  }



}