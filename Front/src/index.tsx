import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts.scss';
import './controls.scss';
import './index.scss';
import App from './App';
import { initSocketConnection } from './services/socketService';
import MySnackbar from './Utils/MySnackbar';
import PopUps from './UI/Components/PopUps';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TestPage } from './UI/Pages/TestPage';
import GameModeObjectsPrinting from './UI/Pages/GameModeObjectsPrinting';
import QrCodeReader from './UI/Components/QrCodeReader';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


initSocketConnection()
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/objects/" element={<GameModeObjectsPrinting/>} />
        <Route path="/objects/:gamemodeName" element={<GameModeObjectsPrinting/>} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/*" element={
          <div className='app-root'>
            <App />
            <MySnackbar />
            <PopUps />
            <QrCodeReader />
          </div>}>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);