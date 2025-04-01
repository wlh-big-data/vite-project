import * as fabric from 'fabric';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

fabric.FabricObject.prototype.transparentCorners = false;
fabric.FabricObject.prototype.cornerColor = 'blue';
fabric.FabricObject.prototype.cornerStyle = 'circle';

export default function Draw(props) {
  const canvasRef = useRef(null);
  const canvasDomRef = useRef(null);
  const fabricInstance = useRef();
  const [edit, setEdit] = useState(false);
  const typeRef = useRef('');
  useEffect(() => {
    fabricInstance.current = new fabric.Canvas(canvasRef.current);
    console.log('fabric innstance', fabricInstance.current, canvasDomRef.current.clientWidth, canvasDomRef.current.clientHeight);

    fabricInstance.current.setWidth(canvasDomRef.current.clientWidth);
    fabricInstance.current.setHeight(canvasDomRef.current.clientHeight);
    const canvas = fabricInstance.current;
    console.log(canvasDomRef.current.clientWidth, canvasDomRef.current.clientHeight);

    // 加载图片
    const backgroundImageUrl = '/hishop.png'; // 替换为实际的图片 URL
    fabric.FabricImage.fromURL(backgroundImageUrl).then((img) => {
        // debugger;
        // canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        //     scaleX: canvas.width / img.width,
        //     scaleY: canvas.height / img.height
        //   });
        // canvas.setScale()
        const scale = Math.round(Math.min(canvas.width / img.width, canvas.height / img.height) * 100) / 100;
        console.log(canvas.width , canvas.height , img.width,  img.height, scale);
        // 实际宽度
        const width = Math.round(img.width * scale);
        // 实际高度
        const height = Math.round(img.height * scale);

        console.log('abc', width, height);
        img.set({
            left: (canvas.width - width) / 2,
            top: (canvas.height - height) / 2,
            width: img.width,
            height: img.height,
            scaleX: scale,
            scaleY: scale,
            lockScalingX: false,
            lockScalingY: false,
            selectable: false,
        });


        canvas.insertAt(0, img);
    });


     // 拖动画布功能
     let isDragging = false;
     let lastPointerPosition;
     canvas.on('resize', () => {
         console.log('resize');
         canvas.setWidth(canvasDomRef.current.clientWidth);
         canvas.setHeight(canvasDomRef.current.clientHeight);
     });

     canvas.on('click', (options) => {
        console.log('click', options);
     });
 
     canvas.on('mouse:down', (options) => {
        //  if (options.e.button === 1) { // 中键拖动
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


    function drawRect() {
      let isDrawing = false;
      let startPoint;
      let rect;

      canvas.on('mouse:down', function (options) {
        console.log('typeRef.current', typeRef.current);
        console.log('isdrawing', isDrawing);
        if (typeRef.current !== 'rect') {
          return;
        }
        isDrawing = true;
        startPoint = options.pointer;
        rect = new fabric.Rect({
          left: startPoint.x,
          top: startPoint.y,
          width: 0,
          height: 0,
          fill: 'yellow',
          objectCaching: false,
          stroke: 'lightgreen',
          strokeWidth: 1,
        });
        canvas.add(rect);
      });

      canvas.on('mouse:move', function (options) {
        console.log('isdrawing', isDrawing);
        if (typeRef.current !== 'rect') {
          return;
        }
        if (isDrawing) {
          const pointer = options.pointer;
          rect.set({
            width: Math.abs(pointer.x - startPoint.x),
            height: Math.abs(pointer.y - startPoint.y),
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
          });
          canvas.renderAll();
        }
      });

      canvas.on('mouse:up', function () {
        console.log('isdrawing', isDrawing);
        if (typeRef.current !== 'rect') {
          return;
        }
        isDrawing = false;
        canvas.setActiveObject(rect);
      });
    }

    function drawEllipse() {

      let isDrawingEllipse = false;
      let startPointEllipse;
      let ellipse;

      canvas.on('mouse:down', function (options) {
        if (typeRef.current !== 'ellipse') {
          return;
        }
        isDrawingEllipse = true;
        startPointEllipse = options.pointer;
        ellipse = new fabric.Ellipse({
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
        if (typeRef.current !== 'ellipse') {
          return;
        }
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

      canvas.on('mouse:up', function () {
        if (typeRef.current !== 'ellipse') {
          return;
        }
        isDrawingEllipse = false;
        canvas.setActiveObject(ellipse);
      });
    }

    function drawPoly() {
      let isDrawingPolygon = false;
      let polygonPoints = [];
      let polygon;

      canvas.on('mouse:down', function (options) {
        if (!isDrawingPolygon) {
          isDrawingPolygon = true;
          polygonPoints = [];
        }
        const point = options.pointer;
        polygonPoints.push({ x: point.x, y: point.y });

        if (polygon) {
          canvas.remove(polygon);
        }

        polygon = new fabric.Polygon(polygonPoints, {
          fill: 'yellow',
          stroke: 'lightgreen',
          strokeWidth: 4,
          objectCaching: false
        });
        canvas.add(polygon);
      });

      canvas.on('mouse:dblclick', function () {
        console.log('dbclick', isDrawingPolygon);
        if (isDrawingPolygon) {
          closePolygon();
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
          const currentPoint = options.pointer;
          const firstPoint = polygonPoints[0];
          const distance = Math.sqrt(
            Math.pow(currentPoint.x - firstPoint.x, 2) + Math.pow(currentPoint.y - firstPoint.y, 2)
          );
          if (distance < 5) { // 可调整重合判定的距离阈值
            closePolygon();
          }
        }
      });



    }

    // drawCircle();
    drawRect();
    // drawEllipse();
    // drawPoly();

    // 禁止拖出边界
    canvas.on('object:moving', function (e) {
      const obj = e.target;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // 计算对象的边界
      const minX = 0;
      const minY = 0;
      const maxX = canvasWidth - obj.getScaledWidth();
      const maxY = canvasHeight - obj.getScaledHeight();

      // 检查对象的位置是否超出了画布的边界
      if (obj.left < minX) {
        obj.left = minX;
      } else if (obj.left > maxX) {
        obj.left = maxX;
      }

      if (obj.top < minY) {
        obj.top = minY;
      } else if (obj.top > maxY) {
        obj.top = maxY;
      }
    });

    canvas.on('selection:created', function (options) {
      const selectedObject = options.selected;
      console.log('选中的对象:', selectedObject);
      if (selectedObject.length) {
        typeRef.current = '';
        // isDrawing = false;
      }
      // 你可以在这里添加处理选中对象的逻辑
    });

    

    return () => {
      if (fabricInstance.current) {
        fabricInstance.current.dispose();
      }
    }
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.oper}>
        <button onClick={() => {
          setEdit(!edit);
        }}>{edit ? '编辑' : '查看'}</button>
        <button>保存</button>
        <button onClick={() => {
          typeRef.current = 'rect';
        }}>矩形</button>
        <button onClick={() => {
          typeRef.current = 'ellipse';
        }}>椭圆</button>
        <button>多边形</button>
      </div>
      <div className={styles.canvasDom} ref={canvasDomRef}>
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
      </div>
    </div>
  )
}

// const canvasEl = document.getElementById('canvas');
// const canvas = new fabric.Canvas(canvasEl);
// const deleteIcon =
//   "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

// var deleteImg = document.createElement('img');
// deleteImg.src = deleteIcon;
// window.myCanvas = canvas;

// console.log('canvas', canvas);

// function Add() {
//   const rect = new fabric.Rect({
//     left: 50,
//     top: 50,
//     fill: 'yellow',
//     width: 200,
//     height: 100,
//     objectCaching: false,
//     stroke: 'lightgreen',
//     strokeWidth: 4,
//   });

//   rect.controls.deleteControl = new fabric.Control({
//     x: 0.5,
//     y: -0.5,
//     offsetY: 16,
//     cursorStyle: 'pointer',
//     mouseUpHandler: deleteObject,
//     render: renderIcon,
//     cornerSize: 24,
//   });

//   canvas.add(rect);
//   canvas.setActiveObject(rect);
// }

// // document.getElementById('add').onclick = () => Add();

// Add();

// function deleteObject(_eventData, transform) {
//   const canvas = transform.target.canvas;
//   canvas.remove(transform.target);
//   canvas.requestRenderAll();
// }

// function renderIcon(ctx, left, top, _styleOverride, fabricObject) {
//   const size = this.cornerSize;
//   ctx.save();
//   ctx.translate(left, top);
//   ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
//   ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
//   ctx.restore();
// }



// ... 鼠标画矩形 ...

// let isDrawing = false;
// let startPoint;
// let rect;

// canvas.on('mouse:down', function (options) {
//     isDrawing = true;
//     startPoint = options.pointer;
//     rect = new fabric.Rect({
//         left: startPoint.x,
//         top: startPoint.y,
//         width: 0,
//         height: 0,
//         fill: 'yellow',
//         objectCaching: false,
//         stroke: 'lightgreen',
//         strokeWidth: 4,
//     });
//     canvas.add(rect);
// });

// canvas.on('mouse:move', function (options) {
//     if (isDrawing) {
//         const pointer = options.pointer;
//         rect.set({
//             width: Math.abs(pointer.x - startPoint.x),
//             height: Math.abs(pointer.y - startPoint.y),
//             left: Math.min(startPoint.x, pointer.x),
//             top: Math.min(startPoint.y, pointer.y),
//         });
//         canvas.renderAll();
//     }
// });

// canvas.on('mouse:up', function () {
//     isDrawing = false;
//     rect.controls.deleteControl = new fabric.Control({
//         x: 0.5,
//         y: -0.5,
//         offsetY: 16,
//         cursorStyle: 'pointer',
//         mouseUpHandler: deleteObject,
//         render: renderIcon,
//         cornerSize: 24,
//     });
//     canvas.setActiveObject(rect);
// });

// // ... existing code ...

// ... 鼠标画椭圆，按照shift时为正圆 ...


// let editing = false;

// let isDrawingEllipse = false;
// let startPointEllipse;
// let ellipse;

// document.getElementById('edit').onclick = () => {
//   editing = !editing;
//   document.getElementById('edit').innerText = editing ? '停止编辑' : '开始编辑';
// };

// canvas.on('mouse:down', function (options) {
//   if(!editing) {
//     return;
//   }
//     isDrawingEllipse = true;
//     startPointEllipse = options.pointer;
//     ellipse = new fabric.Ellipse({
//         left: startPointEllipse.x,
//         top: startPointEllipse.y,
//         rx: 0,
//         ry: 0,
//         fill: 'yellow',
//         objectCaching: false,
//         stroke: 'lightgreen',
//         strokeWidth: 4,
//     });
//     canvas.add(ellipse);
// });

// canvas.on('mouse:move', function (options) {
//   if(!editing) {
//     return ;
//   }
//     if (isDrawingEllipse) {
//         const pointer = options.pointer;
//         const dx = pointer.x - startPointEllipse.x;
//         const dy = pointer.y - startPointEllipse.y;
//         let rx = Math.abs(dx) / 2;
//         let ry = Math.abs(dy) / 2;

//         if (options.e.shiftKey) {
//             // 按下 Shift 键，绘制正圆
//             const radius = Math.min(rx, ry);
//             rx = radius;
//             ry = radius;
//         }

//         ellipse.set({
//             rx: rx,
//             ry: ry,
//             left: startPointEllipse.x + Math.min(0, dx),
//             top: startPointEllipse.y + Math.min(0, dy),
//         });
//         canvas.renderAll();
//     }
// });

// canvas.on('mouse:up', function () {
//   if(!editing) {
//     return;
//   }
//     isDrawingEllipse = false;
//     ellipse.controls.deleteControl = new fabric.Control({
//         x: 0.5,
//         y: -0.5,
//         offsetY: 16,
//         cursorStyle: 'pointer',
//         mouseUpHandler: deleteObject,
//         render: renderIcon,
//         cornerSize: 24,
//     });
//     canvas.setActiveObject(ellipse);
// });

// // ... existing code ...

// ... existing code ...



// ... existing code ...

// const zoomStep = 0.1; 

// document.getElementById('zoomout').addEventListener('click', () => {
//     const currentZoom = canvas.getZoom();
//     const newZoom = currentZoom + zoomStep;
//     canvas.zoomToPoint({x: 50, y:50}, newZoom);
//     canvas.renderAll();
// });

// document.getElementById('zoomin').addEventListener('click', () => {
//     const currentZoom = canvas.getZoom();
//     const newZoom = Math.max(0.1, currentZoom - zoomStep); 
//     canvas.setZoom(newZoom);
//     canvas.renderAll();
// });

// // ... existing code ...

// // 监听对象的 moving 事件


// // ... existing code ...



