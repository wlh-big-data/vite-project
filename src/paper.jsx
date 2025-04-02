import { PointText, Group, Path, Point, Rect, Size } from 'paper';
import { useRef, useEffect } from 'react';
import paper from 'paper';

export default function Paper() {
  const ref = useRef();
  useEffect(() => {
    var canvas = document.getElementById('canvas');
		// Create an empty project and a view for the canvas:
paper.setup(canvas);
const { view } = paper;
var topLeft = new Point(100, 100);
var rectSize = new Size(100, 100);
    var square = new Path.Rectangle(topLeft, rectSize);
    
    // Make a ring using subtraction of two circles:
    var inner = new Path.Circle({
      center: {
        x: 100,
        y: 100,
      },
      radius: 100,
      // parent: originals,
      fillColor: 'white'
    });

    // var ring = square.intersect(inner);
    // ar ring = square.unite(inner);
    // var ring = square.exclude(inner);
    var ring = square.subtract(inner);
    // var ring = square.exclude(inner);
    // ring.parent = showGroups;
    ring.fillColor = 'yellow';
    console.log(ring);
    
  }, []);
  return (
    <canvas id="canvas" width="1000" height="1000" />
  )
}
// Create a Paper.js Path to draw a line into it:
// var canvas = document.getElementById('canvas');
// 		// Create an empty project and a view for the canvas:
// paper.setup(canvas);
// const { view } = paper;
// var text = new PointText({
//   position: view.center + [0, 200],
//   fillColor: 'black',
//   justification: 'center',
//   fontSize: 20
// });

// var originals = new Group({ insert: false }); // Don't insert in DOM.


// var square = new Path.Rectangle({
//   position: view.center,
//   size: 300,
//   parent: originals,
//   fillColor: 'white'
// });

// // Make a ring using subtraction of two circles:
// var inner = new Path.Circle({
//   center: view.center,
//   radius: 100,
//   parent: originals,
//   fillColor: 'white'
// });

// var outer = new Path.Circle({
//   center: view.center,
//   radius: 140,
//   parent: originals,
//   fillColor: 'white'
// });

// const showGroups = new Group({ insert: true });
// var ring = square.intersect(inner);
// ring.parent = showGroups;
// ring.fillColor = 'yellow';

// console.log('ring', ring);
// console.log('ring', ring.pathData);
// var operations = ['unite', 'intersect', 'subtract', 'exclude', 'divide'];
// var colors = ['red', 'green', 'blue', 'black'];
// var curIndex = -1;
// var operation, result, activeItem;

// // Change the mode every 3 seconds:
// setInterval(setMode, 3000);

// // Set the initial mode:
// setMode();

// function setMode() {
//   curIndex++;
//   if (curIndex == operations.length * 2)
//       curIndex = 0;
//   operation = operations[curIndex % operations.length];
// }

// function onMouseDown(event) {
//   var hitResult = originals.hitTest(event.point);
//   activeItem = hitResult && hitResult.item;
// }

// function onMouseDrag(event) {
//   if (activeItem)
//       activeItem.position = event.point;
// }

// function onMouseUp() {
//   activeItem = null;
//   square.position = view.center;
// }

// function onFrame(event) {
//   if (activeItem != ring) {
//       // Move the ring around:
//       var offset = new Point(140, 80) * [Math.sin(event.count / 60), Math.sin(event.count / 40)];
//       ring.position = view.center + offset;
//   }

//   // Remove the result of the last path operation:
//   if (result)
//       result.remove();

//   // Perform the path operation on the ring:
//   if (curIndex < operations.length) {
//       result = square[operation](ring);
//       text.content = 'square.' + operation + '(ring)';
//   } else {
//       result = ring[operation](square);
//       text.content = 'ring.' + operation + '(square)';
//   }
//   result.selected = true;
//   result.fillColor = colors[curIndex % colors.length];
//   result.moveBelow(text);

//   // If the result is a group, color each of its children differently:
//   if (result instanceof Group) {
//       for (var i = 0; i < result.children.length; i++) {
//           result.children[i].fillColor = colors[i];
//       }
//   }
// };

// function onResize() {
//   text.position = view.center + [0, 200];
//   square.position = view.center;
// }

// paper.view.onFrame = onFrame;