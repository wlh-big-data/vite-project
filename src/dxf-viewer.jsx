
import {DxfViewer} from "dxf-viewer"

const canvasDom = document.getElementById('canvas')
const dxfViewer = new DxfViewer(canvasDom)
dxfViewer.Load({
  url: '/ImageToStl.com_螺杆.dxf',
  onLoad: () => {
    console.log('加载成功')
  },
  onError: (err) => {
    console.log('加载失败', err)
  }
});