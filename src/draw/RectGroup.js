       import * as fabric from 'fabric';
       // 封装有标签的矩形类
       export default class LabeledRectangle {
        constructor({left, top, width, height, label}) {
          const labelText = label || 'Rectangle';
          console.log('init labeled rectangle');
            this.rect = new fabric.Rect({
                left: left,
                top: top,
                width: width,
                height: height,
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 2
            });

            this.label = new fabric.Textbox(labelText, {
                left: left + 5,
                top: top + 5,
                fontSize: 20,
                fill: 'white',
                textAlign: 'left',
                lockScalingX: true,
                lockScalingY: true
            });

            this.group = new fabric.Group([this.rect, this.label], {
                left: left,
                top: top
            });

            this.originalFontSize = this.label.fontSize;

            this.group.on('scaling', () => {
                this.label.set({
                    scaleX: 1,
                    scaleY: 1,
                    fontSize: this.originalFontSize
                });
            });
        }

        addToCanvas(canvas) {
            canvas.add(this.group);
        }

        _render(ctx) {
          console.log('group render');
            this.group._render(ctx);
        }
    }