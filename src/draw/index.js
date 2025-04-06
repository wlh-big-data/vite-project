import { Canvas, FabricImage, Rect, Ellipse, FabricObject, Polyline, Polygon, FabricText, controlsUtils, Group } from "fabric";
import paper from 'paper';
import LabeledPolygon from './Polygon';
import LabeledRect from './Rect';
import Path from './Path';

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

const CREATE_TYPE = {
  POLYGON: 1,
  CIRCLE: 2,
  ELLIPSE: 3,
  RECT: 4,
  NONE: 0,
}

export const EditorType = CREATE_TYPE;

export default class Editor {
  // this.canvasDom = null;
  // this.imgUrl = '';
  // this.readonly = true; 查看、编辑
  // createType = CREATE_TYPE.NONE;
  // selected = []; 选中的内容

  constructor({
    container,
    imgUrl,
  }) {
    this.canvasDom = container;
    this.readonly = true;

    if (!container) {
      throw new Error('container is required');
    }

    this.resize = this.resize.bind(this);
    this.drag = this.drag.bind(this);
    // this.drawRect = this.drawRect.bind(this);
    // this.drawPoly = this.drawPoly.bind(this);
    this.keydown = this.keydown.bind(this);
    this.setCreateType = this.setCreateType.bind(this);
    this.setReadonly = this.setReadonly.bind(this);
    // this.drawEllipse = this.drawEllipse.bind(this);
    
    this.getImageBounds = this.getImageBounds.bind(this);
    this.addMovementConstraints = this.addMovementConstraints.bind(this);

    const canvasDom = container.querySelector('canvas');
    this.canvas = new Canvas(canvasDom);

    const noshowCanvas = document.getElementById('noshowCanvas');
    noshowCanvas.width = container.clientWidth ;
    noshowCanvas.height = container.clientHeight;


    paper.setup(noshowCanvas);
    console.log('container', container.clientHeight, container.clientWidth);

    this.canvas.setDimensions({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    this.zoom();

    if (imgUrl) {
      this.setImage(imgUrl);
    }

    // window.addEventListener('resize', this.resize);
    // this.addMovementConstraints();
    this.startDrawingEllipse = this.startDrawingEllipse.bind(this);
    this.endDrawingEllipse = this.endDrawingEllipse.bind(this);
    this.drawingEllipse = this.drawingEllipse.bind(this);

    this.startDrawingRect = this.startDrawingRect.bind(this);
    this.endDrawingRect = this.endDrawingRect.bind(this);
    this.drawingRect = this.drawingRect.bind(this);

    this.startDrawingPoly = this.startDrawingPoly.bind(this);
    this.endDrawingPoly = this.endDrawingPoly.bind(this);
    this.drawingPoly = this.drawingPoly.bind(this);
    this.selectObjects = this.selectObjects.bind(this);
    this.getSelection = this.getSelection.bind(this);
    this.addPath = this.addPath.bind(this);

    document.addEventListener('keydown', this.keydown);
    this.selectObjects();

    this.canvas.on('mouse:down', this.startDrawingRect);
    this.canvas.on('mouse:move', this.drawingRect);
    this.canvas.on('mouse:up', this.endDrawingRect);
    this.canvas.on('mouse:down', this.startDrawingEllipse);
    this.canvas.on('mouse:move', this.drawingEllipse);
    this.canvas.on('mouse:up', this.endDrawingEllipse);
    this.canvas.on('mouse:down', this.startDrawingPoly);
    this.canvas.on('mouse:move', this.drawingPoly);
    this.canvas.on('mouse:dblclick', this.endDrawingPoly);
    this.canvas.on('selection:created', (options) => {
      console.log('selection:created', options);
      // this.setReadonly(true);
      this.selected = [];
      this.selected.push(...options.selected);
    });


    this.canvas.on('selection:updated', (options) => {
      console.log('selection:updated', options);
      // this.setReadonly(true);
      this.selected.push(...options.selected);
      options.deselected.forEach((item) => {
        if (this.selected.indexOf(item) > -1) {
          this.selected.splice(this.selected.indexOf(item), 1);
        }
      })
    });
    this.canvas.on('selection:cleared', (options) => {
      console.log('selection:cleared', options);
      this.selected = [];
      // this.setReadonly(false);
    });
    
  }

  getSelection() {
    return this.selected;
  }

  addPath(left, right, pathData) {
    debugger;
    this.canvas.remove(left);
    this.canvas.remove(right);
    
    const path = new Path(pathData, {
      // left: {
      //   x: Math.min(left.left, right.left),
      //   y: Math.min(left.top, right.top),
      // },
      // right: {
      //   x: Math.max(left.right, right.right),
      //   y: Math.max(left.bottom, right.bottom),
      // }
    });
    this.canvas.add(path);
    this.canvas.requestRenderAll();
  }

  destroy() {
    document.removeEventListener('keydown', this.keydown);
    this.canvas.off('mouse:down', this.startDrawingRect);
    this.canvas.off('mouse:move', this.drawingRect);
    this.canvas.off('mouse:up', this.endDrawingRect);
    this.canvas.off('mouse:down', this.startDrawingEllipse);
    this.canvas.off('mouse:move', this.drawingEllipse);
    this.canvas.off('mouse:up', this.endDrawingEllipse);
    this.canvas.off('mouse:down', this.startDrawingPoly);
    this.canvas.off('mouse:move', this.drawingPoly);
    this.canvas.off('mouse:up', this.endDrawingPoly);
    
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
  setReadonly(flag) {
    this.readonly = flag;
    console.log('flag', flag);
    if(flag) {
      this.setCreateType(CREATE_TYPE.NONE); 
    }
  }

  setCreateType(createType) {
    console.log('createType', createType);
    this.createType = createType;
    this.readonly = false;
  }

  selectObjects() {
    
  }

  keydown(e) {
    // console.log('e', e);
    console.log('keydown', e.key);
    if (e.key === 'Escape') {
      this.cancelDrawingPoly();
      // this.canvas.setActiveObject(null);
    } else if(e.key === 'Delete' || e.key === 'Dead' || e.key === 'Backspace') {
      const selectedItems = this.selected;
      selectedItems.forEach(obj => {
        this.canvas.remove(obj);
    });
      // if (activeObject) {
      //   this.canvas.remove(activeObject);
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
        // this.canvas.renderAll();
      // }
    }
  }

  cancelDrawingPoly() {
    if(this.createType === CREATE_TYPE.POLYGON && this.isDrawing) {
      if(this.polygonPoints.length > 2) {
        this.polygonPoints.pop();
      }
      this.polygonPoints.slice(-1);
      this.isDrawing = false;
      this.canvas.remove(this.currentShape);
      this.currentShape = null;
    }
  }

  startDrawingEllipse(options) {
    if(this.createType !== CREATE_TYPE.ELLIPSE) {
      return;
    }
    console.log('startDrawingEllipse', options);
    
    const imgBounds = this.getImageBounds();
    if (!imgBounds) return;
    const { pointer } = options;
    if (pointer.x < imgBounds.left || pointer.x > imgBounds.right || pointer.y < imgBounds.top || pointer.y > imgBounds.bottom) {
      return;
    }

    this.isDrawing = true;
    this.startPoint = options.scenePoint;
    this.currentShape = new Ellipse({
      left: this.startPoint.x,
      top: this.startPoint.y,
      rx: 0,
      ry: 0,
      fill: 'yellow',
      objectCaching: false,
      stroke: 'lightgreen',
      strokeWidth: 4,
    });
    this.canvas.add(this.currentShape);
  }

  drawingEllipse(options) {
    if(this.createType !== CREATE_TYPE.ELLIPSE) {
      return;
    }
    const { isDrawing, startPoint, currentShape, canvas } = this;
    if (isDrawing) {
      console.log('drawingEllipse', options);
      const pointer = options.scenePoint;
      const dx = pointer.x - startPoint.x;
      const dy = pointer.y - startPoint.y;
      let rx = Math.abs(dx) / 2;
      let ry = Math.abs(dy) / 2;
      const imageBounds = this.getImageBounds();

      // 计算椭圆的边界
      const ellipseLeft = startPoint.x + Math.min(0, dx);
      const ellipseTop = startPoint.y + Math.min(0, dy);
      const ellipseRight = ellipseLeft + rx * 2;
      const ellipseBottom = ellipseTop + ry * 2;

      // 水平边界检查
      if (ellipseLeft < imageBounds.left) {
        rx = Math.max(0, rx + (imageBounds.left - ellipseLeft) / 2);
        startPoint.x = imageBounds.left;
      } else if (ellipseRight > imageBounds.right) {
        rx = Math.max(0, (imageBounds.right - ellipseLeft) / 2);
      }

      // 垂直边界检查
      if (ellipseTop < imageBounds.top) {
        ry = Math.max(0, ry + (imageBounds.top - ellipseTop) / 2);
        startPoint.y = imageBounds.top;
      } else if (ellipseBottom > imageBounds.bottom) {
        ry = Math.max(0, (imageBounds.bottom - ellipseTop) / 2);
      }

      // 设置椭圆的位置和半径
      currentShape.set({
        rx: rx,
        ry: ry,
        left: startPoint.x,
        top: startPoint.y,
      });
      canvas.requestRenderAll();
    }
  }

  endDrawingEllipse(options) {
    if(this.createType !== CREATE_TYPE.ELLIPSE) {
      return;
    }
    console.log('endDrawingEllipse', options);
    this.isDrawing = false;
    if(this.currentShape.rx === 0 || this.currentShape.ry === 0) {
      this.canvas.remove(this.currentShape);
    }else {
      this.canvas.setActiveObject(this.currentShape);
    }
  }

  startDrawingPoly(options) {
    if(this.createType !== CREATE_TYPE.POLYGON) {
      return;
    }
    const { canvas } = this;
    console.log('click', options.pointer);
    const imgBounds = this.getImageBounds();
    if (!imgBounds) return;
    const pointer = options.scenePoint;
    if (pointer.x < imgBounds.left || pointer.x > imgBounds.right || pointer.y < imgBounds.top || pointer.y > imgBounds.bottom) {
      return;
    }
    if (!this.isDrawing) {
      this.isDrawing = true;
      this.polygonPoints = [];
      this.polygonPoints.push({ x: options.scenePoint.x, y: options.scenePoint.y });
    }
    const point = options.scenePoint;
    this.polygonPoints.push({ x: point.x, y: point.y });

    if (this.polygon) {
      canvas.remove(this.polygon);
    }

    this.polygon = new Polyline(this.polygonPoints, {
      fill: 'yellow',
      stroke: 'lightgreen',
      strokeWidth: 1,
      objectCaching: false,
      
    });
    
    canvas.add(this.polygon);
  }

  drawingPoly(options) {
    if(this.createType !== CREATE_TYPE.POLYGON) {
      return;
    }
    const { isDrawing, polygonPoints, polygon, canvas } = this;
    if (isDrawing) {
      const point = options.scenePoint;
      
      polygonPoints[polygonPoints.length - 1] = { x: point.x, y: point.y };
      polygon.setCoords();
      canvas.renderAll();
    }
  }

  endDrawingPoly(options) {
    if(this.createType !== CREATE_TYPE.POLYGON) {
      return;
    }
    const { isDrawing, polygonPoints, polygon, canvas } = this;
    if (isDrawing) {
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
        // polygonObject.controls = controlsUtils.createPolyControls(polygon);
        // 将新的 Polygon 添加到画布
        canvas.add(polygonObject);
        // 设置新的 Polygon 为活动对象
        canvas.setActiveObject(polygonObject);
      } else {
        canvas.remove(polygon);
      }
      this.isDrawing = false;
    }
  }

  // drawEllipse() {

  //   let isDrawingEllipse = false;
  //   let startPointEllipse;
  //   let ellipse;
  //   const { canvas, createType } = this;

  //   canvas.on('mouse:down', function (options) {

  //     isDrawingEllipse = true;
  //     startPointEllipse = options.pointer;
  //     ellipse = new Ellipse({
  //       left: startPointEllipse.x,
  //       top: startPointEllipse.y,
  //       rx: 0,
  //       ry: 0,
  //       fill: 'yellow',
  //       objectCaching: false,
  //       stroke: 'lightgreen',
  //       strokeWidth: 4,
  //     });
  //     canvas.add(ellipse);
  //   });

  //   canvas.on('mouse:move', function (options) {
  //     if(createType !== CREATE_TYPE.Ellipse) {
  //       return;
  //     }
  //     if (isDrawingEllipse) {
  //       const pointer = options.pointer;
  //       const dx = pointer.x - startPointEllipse.x;
  //       const dy = pointer.y - startPointEllipse.y;
  //       let rx = Math.abs(dx) / 2;
  //       let ry = Math.abs(dy) / 2;

  //       if (options.e.shiftKey) {
  //         // 按下 Shift 键，绘制正圆
  //         const radius = Math.min(rx, ry);
  //         rx = radius;
  //         ry = radius;
  //       }

  //       ellipse.set({
  //         rx: rx,
  //         ry: ry,
  //         left: startPointEllipse.x + Math.min(0, dx),
  //         top: startPointEllipse.y + Math.min(0, dy),
  //       });
  //       canvas.renderAll();
  //     }
  //   });
  //   // this.canvasDom.addEventListener('keydown', function (e) {
  //   //   if(createType !== CREATE_TYPE.Ellipse) {
  //   //     return;
  //   //   }
  //   //   console.log(e);
  //   // })
  // }


  // drawPoly() {
  //   let isDrawingPolygon = false;
  //   let polygonPoints = [];
  //   let polygon;

  //   const { canvas, createType } = this;
  //   canvas.on('mouse:down', function (options) {
      
  //   });

  //   canvas.on('mouse:move', function (options) {
  //     if( createType !== CREATE_TYPE.POLYGON) {
  //       return;
  //     }
  //     if (isDrawingPolygon) {
  //       const point = options.scenePoint;
        
  //       polygonPoints[polygonPoints.length - 1] = { x: point.x, y: point.y };
  //       polygon.setCoords();
  //       canvas.renderAll();
  //     }
  //   });

  //   canvas.on('mouse:dblclick', function () {
      
  //     console.log('dbclick', isDrawingPolygon);
  //     if (isDrawingPolygon) {
  //       // 确保至少有三个点才能形成多边形
  //       if (polygonPoints.length >= 3) {
  //         // 把起点添加到点列表末尾，封闭图形
  //         polygonPoints.push(polygonPoints[0]);
  //         // 移除当前的 Polyline
  //         canvas.remove(polygon);
  //         // 创建一个新的 Polygon 对象
  //         const polygonObject = new LabeledPolygon(polygonPoints, {
  //           fill: 'yellow',
  //           stroke: 'lightgreen',
  //           strokeWidth: 1,
  //           objectCaching: false,
  //           label: 'abc',
  //           background: 'red',
  //           zIndex: 1,
  //         });
  //         polygonObject.controls = controlsUtils.createPolyControls(polygon);
  //         // 将新的 Polygon 添加到画布
  //         canvas.add(polygonObject);
  //         // 设置新的 Polygon 为活动对象
  //         canvas.setActiveObject(polygonObject);
  //       }
  //       isDrawingPolygon = false;
  //     }
  //   });

  //   function closePolygon() {
  //     if (polygonPoints.length >= 3) {
  //       polygon.setCoords();

  //       canvas.setActiveObject(polygon);
  //       isDrawingPolygon = false;
  //     }
  //   }

  //   // 检查顶点是否重合
  //   canvas.on('mouse:down', function (options) {
  //     if( createType !== CREATE_TYPE.POLYGON) {
  //       return;
  //     }
  //     if (isDrawingPolygon && polygonPoints.length >= 3) {
  //       const currentPoint = options.scenePoint;
  //       const firstPoint = polygonPoints[0];
  //       const distance = Math.sqrt(
  //         Math.pow(currentPoint.x - firstPoint.x, 2) + Math.pow(currentPoint.y - firstPoint.y, 2)
  //       );
  //       if (distance < 5) { // 可调整重合判定的距离阈值
  //         closePolygon();
  //       }
  //     }
  //   });

  //   document.addEventListener('keydown', function (e) {
  //     console.log(e);
  //   })

  // }


  zoom() {
    const zoomStep = 0.05;
    const { canvas } = this;
    // 监听鼠标滚轮事件
    const handleMouseWheel = (options) => {
      const { e } = options;
      // console.log('e', e);
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

  startDrawingRect(options) {
   
    if(this.createType !== CREATE_TYPE.RECT) {
      return;
    }
    console.log('startDrawingRect');
    this.isDrawing = true;
      this.startPoint = options.scenePoint;
      this.currentShape = new LabeledRect({
        left: this.startPoint.x,
        top: this.startPoint.y,
        width: 0,
        height: 0,
        fill: 'yellow',
        fill: 'rgba(255,255,255,1)',
        objectCaching: false,
        stroke: 'lightgreen',
        strokeWidth: 1,
        label: 'ab'
      });
      this.canvas.add(this.currentShape);
  }

  drawingRect(options) {
    if(this.createType !== CREATE_TYPE.RECT) {
      return;
    }
    console.log('drawingRect');
    const { isDrawing, startPoint, currentShape, canvas } = this;
    if (isDrawing) {
      const pointer = options.scenePoint;
      currentShape.set({
        width: Math.abs(pointer.x - startPoint.x),
        height: Math.abs(pointer.y - startPoint.y),
        left: Math.min(startPoint.x, pointer.x),
        top: Math.min(startPoint.y, pointer.y),
        // scaleX: scale,
        // scaleY: scale,
      });
      canvas.renderAll();
    }
  }

  endDrawingRect() {
    if(this.createType !== CREATE_TYPE.RECT) {
      return;
    }
    console.log('endDrawingRect');
    this.isDrawing = false;
    if(this.currentShape.width === 0 || this.currentShape.height === 0) {
      this.canvas.remove(this.currentShape);
    }else {
      this.canvas.setActiveObject(this.currentShape);
    }
  }

  // drawRect() {
  //   let isDrawing = false;
  //   let startPoint;
  //   let rect;
  //   const { canvas, scale, createType } = this;
  //   console.log('scale', this.scale, this);

  //   canvas.on('mouse:down', function (options) {
  //     // console.log('react mouse down', createType, options);
  //     if( createType !== CREATE_TYPE.RECT) {
  //       return;
  //     }
  //     console.log('isdrawing', isDrawing);
  //     isDrawing = true;
  //     startPoint = options.pointer;
  //     rect = new LabeledRect({
  //       left: startPoint.x,
  //       top: startPoint.y,
  //       width: 0,
  //       height: 0,
  //       fill: 'yellow',
  //       fill: 'rgba(255,255,255,1)',
  //       objectCaching: false,
  //       stroke: 'lightgreen',
  //       strokeWidth: 1,
  //       label: 'ab'
  //     });
  //     canvas.add(rect);
  //   });

  //   canvas.on('mouse:move', function (options) {
  //     if( createType !== CREATE_TYPE.RECT) {
  //       return;
  //     }
  //     console.log('isdrawing', isDrawing);
  //     if (isDrawing) {
  //       const pointer = options.pointer;
  //       rect.set({
  //         width: Math.abs(pointer.x - startPoint.x),
  //         height: Math.abs(pointer.y - startPoint.y),
  //         left: Math.min(startPoint.x, pointer.x),
  //         top: Math.min(startPoint.y, pointer.y),
  //         // scaleX: scale,
  //         // scaleY: scale,
  //       });
  //       canvas.renderAll();
  //     }
  //   });

  //   canvas.on('mouse:up', function () {
  //     if( createType !== CREATE_TYPE.RECT) {
  //       return;
  //     }
  //     console.log('isdrawing', isDrawing);
  //     isDrawing = false;
  //     canvas.setActiveObject(rect);
  //   });
  // }

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

  unite(left, right) {
    // const group = new Group([left, right]);
    const leftPath = left.toPaperObject();
    const rightPath = right.toPaperObject();
    const path = leftPath.unite(rightPath);
    console.log('path', path.pathData);
    // this.canvas.remove(left);
    // this.canvas.remove(right);
    // this.canvas.add(path.pathData);
    this.canvas.add( new Path(path.pathData));
    this.canvas.renderAll();
  }
  intersect(left, right) {
    const leftPath = left.toPaperObject();
    const rightPath = right.toPaperObject();
    const path = leftPath.intersect(rightPath);
    console.log('path', path.pathData);

    this.canvas.remove(left);
    this.canvas.remove(right);
    if(path.pathData ) {
      this.canvas.add( new Path(path.pathData));
    }
    this.canvas.renderAll();
  }
  subtract(left, right) {
    const leftPath = left.toPaperObject();
    const rightPath = right.toPaperObject();
    const path = leftPath.subtract(rightPath);
    console.log('path', path.pathData);
    this.canvas.remove(left);
    this.canvas.remove(right);
    // this.canvas.add(path.pathData);
    this.canvas.add( new Path(path.pathData));
    this.canvas.renderAll();
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

      // const path = new Path('M200,200h-100c55.22847,0 100,-44.77153 100,-100z');
      // canvas.add(path);

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
        left: 0,
        top: 0,
        width: 250,
        'label': 'rect', 
        id: 1,
        // scaleX: scale,
        // scaleY: scale,

        height: 250,
        fill: 'yellow',
        stroke: 'rgba(211, 61, 61, 1)',
        // selectable: false,
      }))

      canvas.add(new Path('M300,300 h100 v100 h-100 z'));


      canvas.add(new LabeledRect({
        left: img.left + 300,
        top: img.top + 300,
        width: 150,
        'label': 'rect', 
        // scaleX: scale,
        // scaleY: scale,
        id: 2,
        height: 150,
        fill: 'red',
        stroke: 'rgba(211, 61, 61, 1)',
        // selectable: false,
      }))

      canvas.add(new LabeledRect({
        left: img.left + 500,
        top: img.top + 500,
        width: 50,
        'label': 'rect', 
        id: 3,
        // scaleX: scale,
        // scaleY: scale,
        height: 50,
        fill: 'red',
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

    });
  }


}