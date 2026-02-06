import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Vibration 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const STREETS = ['PRE-FLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [foldedIndices, setFoldedIndices] = useState([]);
  const [customTime, setCustomTime] = useState('30');
  const [gameStarted, setGameStarted] = useState(false);

  const [handStarterIdx, setHandStarterIdx] = useState(0); 
  const [activeIdx, setActiveIdx] = useState(0);
  const [streetIdx, setStreetIdx] = useState(-1); 
  const [playerTurnCount, setPlayerTurnCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(true);

  const isNoLimit = !customTime || parseInt(customTime) === 0;

  useEffect(() => {
    let interval = null;
    if (gameStarted && !isNoLimit && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isNoLimit) {
      Vibration.vibrate([200, 100, 200, 100, 500]); 
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, isNoLimit, isPaused]);

  const addPlayer = () => {
    if (playerName.trim().length > 0) {
      setPlayers([...players, playerName]); 
      setPlayerName('');
    }
  };

  const removePlayer = (index) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const handleStart = () => {
    setHandStarterIdx(0);
    setFoldedIndices([]);
    setStreetIdx(-1);
    setIsPaused(true);
    setGameStarted(true);
  };

  const getNextActivePlayer = (currentIdx) => {
    let next = (currentIdx + 1) % players.length;
    for (let i = 0; i < players.length; i++) {
      if (!foldedIndices.includes(next)) return next;
      next = (next + 1) % players.length;
    }
    return currentIdx;
  };

  const handleFold = () => {
    if (isPaused) return;
    
    Vibration.vibrate([100, 50, 100]);
    const newFolds = [...foldedIndices, activeIdx];
    setFoldedIndices(newFolds);

    const remainingCount = players.length - newFolds.length;
    if (remainingCount <= 1 || playerTurnCount >= players.length) {
       goToNextPhase();
    } else {
       setActiveIdx(getNextActivePlayer(activeIdx));
       setPlayerTurnCount(prev => prev + 1);
       setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
    }
  };

  const goToNextPhase = () => {
    if (streetIdx === STREETS.length - 1) {
      const nextStart = (handStarterIdx + 1) % players.length;
      setHandStarterIdx(nextStart);
      setFoldedIndices([]);
      setStreetIdx(-1);
    } else {
      setStreetIdx(streetIdx + 1);
    }
    setIsPaused(true);
    setPlayerTurnCount(0);
  };

  const handleMainTap = () => {
    Vibration.vibrate(40);

    if (isPaused) {
      if (STREETS[streetIdx] === 'SHOWDOWN') {
        goToNextPhase();
        return;
      }
      if (streetIdx === -1) setStreetIdx(0);
      
      setActiveIdx(foldedIndices.includes(handStarterIdx) ? getNextActivePlayer(handStarterIdx) : handStarterIdx);
      setPlayerTurnCount(1);
      setIsPaused(false);
      setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
      return;
    }

    if (playerTurnCount < (players.length - foldedIndices.length)) {
      setActiveIdx(getNextActivePlayer(activeIdx));
      setPlayerTurnCount(prev => prev + 1);
      setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
    } else {
      goToNextPhase();
    }
  };

  if (gameStarted) {
    const currentPhase = streetIdx === -1 ? "DEAL" : STREETS[streetIdx];

    return (
      <TouchableOpacity 
        style={[styles.gameContainer, (timeLeft <= 5 && !isNoLimit && !isPaused) && styles.dangerBg]} 
        onPress={handleMainTap} 
        onLongPress={handleFold}
        delayLongPress={800}
        activeOpacity={1}
      >
        <StatusBar style="light" />
        
        <View style={[styles.gameHeader, styles.upsideDown]}>
          <Text style={styles.gameTitle}>{currentPhase}</Text>
          {!isPaused && <Text style={styles.activePlayerName}>{players[activeIdx].toUpperCase()}</Text>}
        </View>

        <View style={styles.timerBox}>
          <Text style={[
            styles.timerText, 
            (timeLeft <= 5 && !isNoLimit && !isPaused) && styles.timerDanger,
            isPaused && styles.phaseDisplayText
          ]}>
            {isPaused ? currentPhase : (isNoLimit ? '∞' : timeLeft)}
          </Text>
          <Text style={styles.secondsLabel}>
            {isPaused ? 'READY TO START' : (isNoLimit ? 'NO LIMIT' : 'HOLD TO FOLD')}
          </Text>
        </View>

        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>{currentPhase}</Text>
          {!isPaused && <Text style={styles.activePlayerName}>{players[activeIdx].toUpperCase()}</Text>}
          
          <TouchableOpacity style={styles.exitButton} onPress={() => setGameStarted(false)}>
            <Text style={styles.exitButtonText}>END SESSION</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.outerWrapper}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexOne}>
          <View style={styles.content}>
            <View style={styles.headerBox}>
              <Text style={styles.titleText}>POKER SETUP</Text>
              <View style={styles.neonLine} />
            </View>
            <View style={styles.timeInputContainer}>
              <Text style={styles.inputLabel}>TIMER (0 FOR NO LIMIT)</Text>
              <TextInput style={styles.timeInput} value={customTime} onChangeText={setCustomTime} keyboardType="numeric" maxLength={3} />
            </View>
            <View style={styles.inputSection}>
              <TextInput style={styles.input} placeholder="WHO'S IN?" placeholderTextColor="#39FF1466" value={playerName} onChangeText={setPlayerName} autoCapitalize="characters" />
              <TouchableOpacity style={styles.addButton} onPress={addPlayer}><Text style={styles.addButtonText}>+</Text></TouchableOpacity>
            </View>
            <FlatList data={players} keyExtractor={(item, index) => index.toString()} renderItem={({ item, index }) => (
              <View style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerNumber}>#0{index + 1}</Text>
                  <Text style={styles.playerItem}>{item.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={() => removePlayer(index)} style={styles.minusButton}><Text style={styles.minusButtonText}>-</Text></TouchableOpacity>
              </View>
            )} />
          </View>
          {players.length >= 2 && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>DROP THE HAMMER</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  flexOne: { flex: 1 },
  content: { flex: 1, paddingTop: 30, paddingHorizontal: 25 },
  headerBox: { marginBottom: 20, alignItems: 'center' },
  titleText: { color: '#39FF14', fontSize: 32, fontWeight: '900', letterSpacing: 4, textAlign: 'center' },
  neonLine: { height: 2, width: 140, backgroundColor: '#39FF14', marginTop: 10 },
  timeInputContainer: { marginBottom: 20 },
  inputLabel: { color: '#39FF14', fontSize: 10, fontWeight: 'bold', marginBottom: 8, opacity: 0.9 },
  timeInput: { borderWidth: 2, borderColor: '#39FF14', color: '#39FF14', padding: 10, fontSize: 20, fontWeight: '900', textAlign: 'center', backgroundColor: '#111' },
  inputSection: { flexDirection: 'row', marginBottom: 20, borderWidth: 2, borderColor: '#39FF14' },
  input: { flex: 1, color: '#39FF14', padding: 15, fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#39FF14', width: 60, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#000', fontSize: 30, fontWeight: 'bold' },
  playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#39FF14', justifyContent: 'space-between' },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  playerNumber: { color: '#39FF14', fontWeight: 'bold', marginRight: 15, fontSize: 12, opacity: 0.5 },
  playerItem: { color: '#fff', fontSize: 18, fontWeight: '800' },
  minusButton: { width: 40, height: 40, borderWidth: 2, borderColor: '#FF0055', justifyContent: 'center', alignItems: 'center' },
  minusButtonText: { color: '#FF0055', fontSize: 30, fontWeight: 'bold' },
  startButton: { backgroundColor: '#39FF14', margin: 25, padding: 22, alignItems: 'center' },
  startButtonText: { color: '#000', fontSize: 20, fontWeight: '900' },

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
