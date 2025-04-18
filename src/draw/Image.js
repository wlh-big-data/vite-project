import { FabricImage } from 'fabric';

export default class MyImage extends FabricImage {
    constructor(options = {}) {
      super(options);
      this.type = 'myImage';
      this.controls = [];
    }
  
    static createFromMatrix(matrix) {
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置画布尺寸
      const width = matrix[0].length;
      const height = matrix.length;
      canvas.width = width;
      canvas.height = height;
  
      // 创建图像数据
      const imageData = ctx.createImageData(width, height);
      
      // 填充像素数据
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          if (matrix[y][x] === 1) {
            // 黑色带透明度0.2（51 = 255 * 0.2）
            imageData.data[index] = 255;       // R
            imageData.data[index + 1] = 0;   // G
            imageData.data[index + 2] = 0;   // B
            imageData.data[index + 3] = 51;  // A
          } else {
            // 全透明
            imageData.data[index + 3] = 0;   // A
          }
        }
      }
      debugger;
      // 将图像数据绘制到canvas
      ctx.putImageData(imageData, 0, 0);
      const imageSrc = canvas.toDataURL('image/png');
      return MyImage.fromURL(imageSrc).then((image) => {
        image.imageSrc = imageSrc;
        image.matrix = matrix;
        return image;
      });
    }

    static createFromBase64(base64) {
        return MyImage.fromURL(base64).then((image) => {
            const mask = Array.from({ length: image.height }, () => new Uint8Array(image.width).fill(0));
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置画布尺寸
            const width = image.width;
            const height = image.height;
            canvas.width = width;
            canvas.height = height;
        
            // 创建图像数据
            canvas.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height);
            const matrix = Array.from({ length: height }, () => new Uint8Array(width).fill(0));
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                if (imageData.data[index + 3] > 0) {
                    matrix[y][x] = 1;
                }
                }
            }
            image.matrix = matrix;
            image.imageSrc = base64;
            return image;
        });
    }

    toJSON() {
        return {
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height,
            src: this.imageSrc,
            type: this.type,
            // matrix: this.matrix
        }
    }
  }