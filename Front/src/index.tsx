import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initSocketConnection } from './services/socketService';
import MySnackbar from './Utils/MySnackbar';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


initSocketConnection()
root.render(
  <React.StrictMode>
    <App />
    <MySnackbar />
  </React.StrictMode>
);