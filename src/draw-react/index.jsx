import React, { useEffect, useRef, useState } from 'react';
import Editor, { EditorType } from '../draw/index';
import './index.css';

export default function Draw(props) {
  const canvasRef = useRef(null);
  const canvasDomRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const editorRef = useRef();
  const typeRef = useRef('');
  useEffect(() => {
    const editor = new Editor({
      container: canvasDomRef.current,
      imgUrl: '/grid.png',
    })
    editorRef.current = editor;
    return () => {
      editor.destroy();
    }

    // 'M200,200h-100c55.22847,0 100,-44.77153 100,-100z'

  }, []);
  return (
    <div className={"container"}>
      <div className={"opers"}>
        <button onClick={() => {
          setEdit(!edit);
          editorRef.current.setReadonly(edit);
        }}>{edit ? '编辑' : '查看'}</button>
        <button>保存</button>
        <button onClick={() => {
          console.log('juxing');
          editorRef.current.setCreateType(EditorType.RECT);
        }}>矩形</button>
        <button onClick={() => {
          editorRef.current.setCreateType(EditorType.ELLIPSE);
        }}>椭圆</button>
        <button onClick={() => {
          editorRef.current.setCreateType(EditorType.POLYGON);
        }}>多边形</button>
        <button onClick={() => {
          editorRef.current.canvas.getObjects().forEach((item) => {
            console.log(item);
          })
        }}>获取所有物体</button>
        <button onClick={() => {
          editorRef.current.getSelection().forEach((item) => {
            console.log(item.toPaperObject());
          })
        }}>获取选中物体</button>
        <button onClick={() => {
          const selections = editorRef.current.getSelection();
          console.log(selections);
          if(selections.length == 2) {
            const left = selections[0].toPaperObject();
            const right = selections[1].toPaperObject();
            const newObject = left.intersect(right);
            console.log(left, right, newObject);
            if(newObject) {
              editorRef.current.addPath(left, right, newObject.pathData);
            }
          }
        }}>交集</button>
        <button onClick={() => {
          const selections = editorRef.current.getSelection();
          console.log(selections);
          if(selections.length == 2) {
            const left = selections[0].toPaperObject();
            const right = selections[1].toPaperObject();
            const newObject = left.unite(right);
            editorRef.current.addPath(selections[0], selections[1], newObject.pathData);
          }
        }}>并集</button>
        <button>差集</button>
      
      </div>
      
      <div className={"canvasDom"} ref={canvasDomRef}>
        <canvas ref={canvasRef} />
        <canvas className={"hide_canvas"} id="noshowCanvas"></canvas>
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



