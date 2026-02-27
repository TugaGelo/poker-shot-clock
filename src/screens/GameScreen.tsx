import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Vibration, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const STREETS = ['PRE-FLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];

interface GameScreenProps {
  players: string[];
  customTime: string;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function GameScreen({ players, customTime, setGameStarted }: GameScreenProps) {
  const [foldedIndices, setFoldedIndices] = useState<number[]>([]);
  const [handStarterIdx, setHandStarterIdx] = useState<number>(0); 
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [streetIdx, setStreetIdx] = useState<number>(-1); 
  
  const [playerTurnCount, setPlayerTurnCount] = useState<number>(0);
  
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(true);

  const isNoLimit = !customTime || parseInt(customTime) === 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isNoLimit && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isNoLimit) {
      Vibration.vibrate([200, 100, 200, 100, 500]); 
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, isNoLimit, isPaused]);

  const getNextActivePlayer = (currentIdx: number) => {
    let next = (currentIdx + 1) % players.length;
    for (let i = 0; i < players.length; i++) {
      if (!foldedIndices.includes(next)) return next;
      next = (next + 1) % players.length;
    }
    return currentIdx; 
  };

  const handleFold = () => {
    if (isPaused || streetIdx === 4) return;
    
    Vibration.vibrate([100, 50, 100]);
    const newFolds = [...foldedIndices, activeIdx];
    setFoldedIndices(newFolds);

    const activePlayersLeft = players.length - newFolds.length;

    if (activePlayersLeft === 1) {
        const winnerIdx = getNextActivePlayer(activeIdx);
        setActiveIdx(winnerIdx);
        setStreetIdx(4);
        setIsPaused(true);
        setPlayerTurnCount(0);
        return;
    }

    if (playerTurnCount < activePlayersLeft) {
       setActiveIdx(getNextActivePlayer(activeIdx));
       setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
    } else {
       setStreetIdx(streetIdx + 1);
       setIsPaused(true);
       setPlayerTurnCount(0);
    }
  };

  const handleMainTap = () => {
    Vibration.vibrate(40);

    if (isPaused) {
      if (streetIdx === 4) {
        const nextStart = (handStarterIdx + 1) % players.length;
        setHandStarterIdx(nextStart);
        setFoldedIndices([]);
        setStreetIdx(-1);
        setIsPaused(true);
        return;
      }

      if (streetIdx === -1) setStreetIdx(0);
      
      const startNode = foldedIndices.includes(handStarterIdx) ? getNextActivePlayer(handStarterIdx) : handStarterIdx;
      
      setActiveIdx(startNode);
      setPlayerTurnCount(0);
      setIsPaused(false);
      setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
      return;
    }

    const totalActive = players.length - foldedIndices.length;
    const newTurnCount = playerTurnCount + 1;

    if (newTurnCount < totalActive) {
      setActiveIdx(getNextActivePlayer(activeIdx));
      setPlayerTurnCount(newTurnCount);
      setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
    } else {
      setStreetIdx(streetIdx + 1);
      setIsPaused(true);
      setPlayerTurnCount(0);
    }
  };

  const currentPhase = streetIdx === -1 ? "PRE-FLOP" : STREETS[streetIdx];
  const isShowdown = streetIdx === 4;

  const touchableProps: any = {
    style: [styles.gameContainer, (timeLeft <= 5 && !isNoLimit && !isPaused) && styles.dangerBg],
    onPress: handleMainTap,
    onLongPress: handleFold,
    delayLongPress: 600,
    activeOpacity: 1,
    onContextMenu: (e: React.MouseEvent) => {
      if (Platform.OS === 'web') {
        e.preventDefault();
        handleFold();
      }
    }
  };

  return (
    <TouchableOpacity {...touchableProps}>
      <StatusBar style="light" />
      
      <View style={[styles.gameHeader, styles.upsideDown]}>
        <Text style={styles.gameTitle}>{isShowdown ? "WINNER" : currentPhase}</Text>
        {!isPaused && <Text style={styles.activePlayerName}>{players[activeIdx]?.toUpperCase()}</Text>}
        {isShowdown && <Text style={styles.activePlayerName}>{players[activeIdx]?.toUpperCase()}</Text>}
      </View>

      <View style={styles.timerBox}>
        <Text style={[
          styles.timerText, 
          (timeLeft <= 5 && !isNoLimit && !isPaused) && styles.timerDanger,
          isPaused && styles.phaseDisplayText
        ]}>
          {isShowdown ? "🏆" : (isPaused ? currentPhase : (isNoLimit ? '∞' : timeLeft))}
        </Text>
        <Text style={styles.secondsLabel}>
          {isShowdown ? 'TAP TO NEXT HAND' : (isPaused ? 'READY TO START' : (isNoLimit ? 'NO LIMIT' : 'HOLD TO FOLD'))}
        </Text>
      </View>

      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>{isShowdown ? "WINNER" : currentPhase}</Text>
        {!isPaused && <Text style={styles.activePlayerName}>{players[activeIdx]?.toUpperCase()}</Text>}
        {isShowdown && <Text style={styles.activePlayerName}>{players[activeIdx]?.toUpperCase()}</Text>}
        
        <TouchableOpacity style={styles.exitButton} onPress={() => setGameStarted(false)}>
          <Text style={styles.exitButtonText}>END SESSION</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gameContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  upsideDown: { transform: [{ rotate: '180deg' }] },
  dangerBg: { backgroundColor: '#1a0005' },
  gameHeader: { alignItems: 'center', width: '100%' },
  gameTitle: { color: '#39FF14', letterSpacing: 3, fontSize: 14, fontWeight: '900' },
  activePlayerName: { color: '#fff', fontSize: 64, fontWeight: '900', textAlign: 'center', width: '90%', marginTop: 5 },
  timerBox: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  timerText: { color: '#39FF14', fontSize: 100, fontWeight: '900', textAlign: 'center' },
  phaseDisplayText: { fontSize: 60, letterSpacing: 2 }, 
  timerDanger: { color: '#FF0055' },
  secondsLabel: { color: '#39FF14', fontSize: 14, letterSpacing: 2, fontWeight: 'bold', marginTop: 10 },
  exitButton: { marginTop: 25 },
  exitButtonText: { color: '#333', fontSize: 10, fontWeight: 'bold' },
});