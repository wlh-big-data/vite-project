import DxfParser from 'dxf-parser';

// Grab fileText in node.js or browser
const fileUrl = '/ImageToStl.com_螺杆.dxf';

fetch(fileUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(fileText => {
    const parser = new DxfParser();
    try {
      const dxf = parser.parse(fileText);
      console.log('解析成功:', dxf);
    } catch(err) {
      console.error(err.stack);
    }
  })
  .catch(error => {
    console.error('获取文件时出错:', error);
  });


export default function() {
  return <div>hello world</div>
}