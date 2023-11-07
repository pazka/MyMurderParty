import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts.scss';
import './index.scss';
import App from './App';
import { initSocketConnection } from './services/socketService';
import MySnackbar from './Utils/MySnackbar';
import PopUps from './UI/Components/PopUps';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


initSocketConnection()
root.render(
  <React.StrictMode>
    <App />
    <MySnackbar />
    <PopUps />
  </React.StrictMode>
);