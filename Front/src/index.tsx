import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SnackbarProvider } from 'notistack';
import { initSocketConnection } from './services/socketService';
import { initLoginIfAlreadyPossible } from './services/userService';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

initSocketConnection()
initLoginIfAlreadyPossible()

root.render(
  <React.StrictMode>
    <App />
    <SnackbarProvider maxSnack={3}/>
  </React.StrictMode>
);