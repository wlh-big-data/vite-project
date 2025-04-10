export function createBmp(dataArray) {
    const width = dataArray[0].length;
    const height = dataArray.length;

     // BMP结构参数计算
     const bytesPerPixel = 1;
     const rowSize = Math.floor((width * bytesPerPixel + 3) / 4) * 4; // 行对齐
     const pixelArraySize = rowSize * height;
     const fileSize = 14 + 40 + 1024 + pixelArraySize;

     // 创建ArrayBuffer
     const buffer = new ArrayBuffer(fileSize);
     const view = new DataView(buffer);

     // BMP文件头（同原代码）
     let offset = 0;
     view.setUint16(offset, 0x4D42, true); offset += 2; // 'BM'
     view.setUint32(offset, fileSize, true); offset += 4;
     view.setUint32(offset, 0, true); offset += 4;
     view.setUint32(offset, 14 + 40 + 1024, true); offset +=4;

     // 信息头（同原代码）
     view.setUint32(offset, 40, true); offset +=4;
     view.setInt32(offset, width, true); offset +=4;
     view.setInt32(offset, height, true); offset +=4;
     view.setUint16(offset, 1, true); offset +=2;
     view.setUint16(offset, 8, true); offset +=2;
     view.setUint32(offset, 0, true); offset +=4;
     view.setUint32(offset, 0, true); offset +=4;
     view.setInt32(offset, 0, true); offset +=4;
     view.setInt32(offset, 0, true); offset +=4;
     view.setUint32(offset, 0, true); offset +=4;
     view.setUint32(offset, 0, true); offset +=4;

     // 调色板（同原代码）
     for(let i = 0; i < 256; i++) {
         view.setUint8(offset++, i);
         view.setUint8(offset++, i);
         view.setUint8(offset++, i);
         view.setUint8(offset++, 0);
     }

     // 像素数据（二维数组按BMP倒序写入）
     let rowOffset = offset;
     for(let y = height - 1; y >= 0; y--) { // 关键点：从最后一行开始写
         const rowData = dataArray[y];      // 获取二维数组中的第y行
         for(let x = 0; x < width; x++) {
             view.setUint8(rowOffset + x, rowData[x] === 0 ? 0 : 255);
         }
         rowOffset += rowSize; // 移动到下一行
     }

     return buffer;
}

export function saveBMP(bmp, filename) {
    const blob = new Blob([bmp], { type: 'image/bmp' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}