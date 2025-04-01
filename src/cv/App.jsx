import React from 'react';
import * as fabric from 'fabric';
import ColorItem from './Color';
import styles from './app.module.less';

const { useEffect, useState, useRef } = React;
const { cv } = window;

export default function App() {
  const canvasRef = useRef(null);
  const [colors, setColors] = useState([]);
  const [checkedValue, setCheckedValue] = useState([]);
  const resultCanvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fabricInstance = useRef(null);
  useEffect(() => {
    console.log('fabricInstance', fabricInstance.current);
    fabricInstance.current = new fabric.Canvas(fabricRef.current);
    fabricInstance.current.on('mouse:wheel', function(opt) {
      const delta = opt.e.deltaY;
      let zoom = fabricInstance.current.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      fabricInstance.current.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    
    return () => {
      if (fabricInstance.current) {
        fabricInstance.current.dispose();
      }
    }
  }, []);
  const changeFile = (e) => {
    if (!e.target.files[0]) return;
    const imgElement = new Image();
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    imgElement.onload = function () {
      setupCanvas();
      fabricInstance.current.setWidth(imgElement.naturalWidth);
      fabricInstance.current.setHeight(imgElement.naturalHeight);
    };

    function getUniqueColorsFromCanvas(ctx, canvas) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const colorsMap = new Set();

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // const a = data[i + 3];
        const color = `${r},${g},${b}`;
        colorsMap.add(color);
      }

      const colorArray = Array.from(colorsMap);
      return colorArray;
    }

    function setupCanvas() {
      const canvas = canvasRef.current;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 设置canvas尺寸与图片一致
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;

      // 绘制图片到canvas
      ctx.drawImage(imgElement, 0, 0);
      const colorArray = getUniqueColorsFromCanvas(ctx, canvas);
      setColors(colorArray);
    }
  };
  useEffect(() => {
    function drawPoly(points, ctx) {
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    if (Object.keys(checkedValue).length === 0) return;
    const canvas = canvasRef.current;
    const originalMat = cv.imread(canvas);
    cv.cvtColor(originalMat, originalMat, cv.COLOR_RGBA2RGB); // 转为3通道
    const allMask = cv.Mat.zeros(originalMat.rows, originalMat.cols, cv.CV_8UC1);
    Object.keys(checkedValue).forEach((color) => {
      if (checkedValue[color]) {
        const [r, g, b] = color.split(',').map(Number);
        const lowerColor = new cv.Mat(originalMat.rows, originalMat.cols, cv.CV_8UC3, new cv.Scalar(r, g, b));
        const mask = new cv.Mat();
        cv.inRange(originalMat, lowerColor, lowerColor, mask);
        cv.bitwise_or(mask, allMask, allMask);
        mask.delete();
        lowerColor.delete();
      }
    });
    cv.imshow(resultCanvasRef.current, allMask);
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(allMask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    const contoursPoly = [];
    fabricInstance.current.clear();

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 1.0, true);
      const approxData = [];
      for (let j = 0; j < approx.rows; j++) {
        const point = {
          x: approx.data32S[j * 2],
          y: approx.data32S[j * 2 + 1],
        };
        approxData.push(point);
      }
      console.log('approxData', approxData );
      contoursPoly.push(approxData);
      fabricRef.current.width = canvas.width;
      fabricRef.current.height = canvas.height;

      drawPoly(approxData, resultCanvasRef.current.getContext('2d'));
      const poly = new fabric.Polygon(approxData, {
        fill: 'rgba(255, 0, 0, 0.3)',
        stroke: 'red',
        strokeWidth: 1,
        cornerColor: 'blue',
        // hasControls: true, 
        // transparentCorners: false
      });
      poly.controls = fabric.controlsUtils.createPolyControls(poly);
      fabricInstance.current.add(poly);
    }
    allMask.delete();
    originalMat.delete();
  }, [checkedValue]);
  return (
    <div className={styles.container}>
      <div className="caption">
        上传图片
        <input type="file" onChange={changeFile} name="file" />
      </div>
      <canvas ref={canvasRef}></canvas>
      <div id="showArea">
        {
          colors.map((color, index) => {
            return (
              <ColorItem
                key={index}
                color={color}
                index={index}
                onCheck={(flag) => {
                  setCheckedValue({ ...checkedValue, [color]: flag });
                }}
                checked={checkedValue[color]}
              >
              </ColorItem>
            );
          })
        }
      </div>
      <canvas ref={resultCanvasRef}></canvas>
      <canvas ref={fabricRef}></canvas>
    </div>
  );
}
