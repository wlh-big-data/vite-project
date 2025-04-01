import { useEffect, useState, useRef } from 'react'
import Editor from './draw/index.js';
import styles from './draw-react/index.module.less';
import './App.css'

function App() {
  const canvasRef = useRef(null);
  const editorRef = useRef(null);
  useEffect(() => {
    console.log('canvas ref', canvasRef);
    const editor = new Editor({
      container: canvasRef.current
    });
    window.editor = editor;
    editorRef.current = editor;
    return () => {
      editor.destroy();
    }
  }, []);
  const [edit, setEdit] = useState(false);

  return (
    <>
    <div className={styles.container}>
      <div className={styles.oper}>
        <button onClick={() => {
          setEdit(!edit);
          editorRef.current.setEdit(edit);
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
      <div className={styles.canvasDom}>
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
      </div>
    </div>
    </>
  )
}

export default App
