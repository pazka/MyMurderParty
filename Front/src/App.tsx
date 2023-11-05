import React from 'react';
import logo from './logo.svg';
import './App.scss';
import { TestPage } from './UI/Pages/TestPage';
import GamePage from './UI/Pages/GamePage';
import GenericDialogBox from './UI/Components/GenericDialogBox';

function App() {
  return <div>
    <GamePage />
    <GenericDialogBox />
  </div>
}

export default App;
