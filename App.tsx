import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs);

import React, { useState } from 'react';
import SetupScreen from './src/screens/SetupScreen';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  const [players, setPlayers] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState<string>('30');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  if (gameStarted) {
    return (
      <GameScreen 
        players={players} 
        customTime={customTime} 
        setGameStarted={setGameStarted} 
      />
    );
  }

  return (
    <SetupScreen 
      players={players} 
      setPlayers={setPlayers} 
      customTime={customTime} 
      setCustomTime={setCustomTime} 
      setGameStarted={setGameStarted} 
    />
  );
}
