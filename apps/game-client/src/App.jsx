import React, { useState } from 'react';
import MainMenu from './pages/MainMenu.jsx';
import GameView from './pages/GameView.jsx';
import { useGameStore } from './store/gameStore.js';

export default function App() {
  const { phase, setPhase } = useGameStore();

  if (phase === 'menu') {
    return <MainMenu onStart={(opts) => {
      useGameStore.getState().startNewGame(opts);
      setPhase('playing');
    }} />;
  }

  return <GameView />;
}
