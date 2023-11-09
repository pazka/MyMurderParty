import './App.scss';

import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { useGlobalStorage } from './services/storageService';
import HomeHeader from './UI/Components/Headers/HomeHeader';
import RoomHeader from './UI/Components/Headers/RoomHeader';
import ChooseRoom from './UI/Pages/ChooseRoom';
import HomePage from './UI/Pages/HomePage';
import { NewRoom } from './UI/Pages/NewRoom';
import NewUser from './UI/Pages/NewUser';
import PartyRoom from './UI/Pages/PartyRoom';

function App() {
  const navigate = useNavigate()
  const [storage] = useGlobalStorage()

  useEffect(() => {

    if (!storage.currentUser) {
      navigate('/new-user')
    }

    if (storage.currentUser && !storage.currentRoom) {
      navigate('/choose-party')
    }

    if (storage.currentRoom) {
      navigate('/party/' + storage.currentRoom.id)
    }
  },[storage.currentUser, storage.currentRoom])


  return <>
    <Routes>
      <Route path="/*" element={<HomeHeader />} />
      <Route path="/party/*" element={<RoomHeader />}>
      </Route>
    </Routes>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new-user" element={<NewUser />} />
      <Route path="/choose-party" element={<ChooseRoom />} />
      <Route path="/new-party" element={<NewRoom />} />
      <Route path="/party/:roomId" element={<PartyRoom />} />
    </Routes>
  </>
}

export default App;
