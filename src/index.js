import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './draw-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// import Editor, { EditorType } from './draw/index';
// import * as utils from './draw/utils';
// Editor.EditorType = EditorType;
// Editor.utils = utils;
// window.ImageEditor = Editor;

// export default Editor;
