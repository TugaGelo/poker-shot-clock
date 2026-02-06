import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  Vibration 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [customTime, setCustomTime] = useState('30');
  const [gameStarted, setGameStarted] = useState(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const isNoLimit = !customTime || parseInt(customTime) === 0;

  useEffect(() => {
    let interval = null;
    if (gameStarted && !isNoLimit && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isNoLimit) {
      Vibration.vibrate([200, 100, 200, 100, 500]); 
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, isNoLimit]);

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
    setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
    setGameStarted(true);
  };

  const nextTurn = () => {
    Vibration.vibrate(50); 
    setActiveIdx((prev) => (prev + 1) % players.length);
    setTimeLeft(isNoLimit ? 0 : parseInt(customTime));
  };

  if (gameStarted) {
    return (
      <TouchableOpacity 
        style={[styles.gameContainer, (timeLeft <= 5 && !isNoLimit) && styles.dangerBg]} 
        onPress={nextTurn} 
        activeOpacity={1}
      >
        <StatusBar style="light" />
        
        {/* TOP MIRROR (Upside Down) */}
        <View style={[styles.gameHeader, styles.upsideDown]}>
          <Text style={styles.gameTitle}>CURRENT TURN</Text>
          <Text style={styles.activePlayerName}>{players[activeIdx].toUpperCase()}</Text>
        </View>

        <View style={styles.timerBox}>
          <Text style={[styles.timerText, (timeLeft <= 5 && !isNoLimit) && styles.timerDanger]}>
            {isNoLimit ? '∞' : timeLeft}
          </Text>
          <Text style={styles.secondsLabel}>{isNoLimit ? 'NO LIMIT' : 'SECONDS'}</Text>
        </View>

        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>CURRENT TURN</Text>
          <Text style={styles.activePlayerName}>{players[activeIdx].toUpperCase()}</Text>
          
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
              <Text style={styles.inputLabel}>TIMER (SECONDS - 0 FOR NO LIMIT)</Text>
              <TextInput 
                style={styles.timeInput}
                value={customTime}
                onChangeText={setCustomTime}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor="#39FF1444"
                maxLength={3}
              />
            </View>

            <View style={styles.inputSection}>
              <TextInput 
                style={styles.input} 
                placeholder="WHO'S IN?" 
                placeholderTextColor="#39FF1466" 
                value={playerName} 
                onChangeText={setPlayerName} 
                autoCapitalize="characters" 
              />
              <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <FlatList 
              data={players} 
              keyExtractor={(item, index) => index.toString()} 
              renderItem={({ item, index }) => (
                <View style={styles.playerCard}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerNumber}>#0{index + 1}</Text>
                    <Text style={styles.playerItem}>{item.toUpperCase()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removePlayer(index)} style={styles.minusButton}>
                    <Text style={styles.minusButtonText}>-</Text>
                  </TouchableOpacity>
                </View>
              )} 
            />
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
  inputLabel: { color: '#39FF14', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1, opacity: 0.7 },
  timeInput: { 
    borderWidth: 2, 
    borderColor: '#39FF14', 
    color: '#39FF14', 
    padding: 10, 
    fontSize: 20, 
    fontWeight: '900', 
    textAlign: 'center',
    backgroundColor: '#111'
  },

  inputSection: { flexDirection: 'row', marginBottom: 20, borderWidth: 2, borderColor: '#39FF14' },
  input: { flex: 1, color: '#39FF14', padding: 15, fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#39FF14', width: 60, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#000', fontSize: 30, fontWeight: 'bold' },
  
  playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#39FF14', justifyContent: 'space-between' },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  playerNumber: { color: '#39FF14', fontWeight: 'bold', marginRight: 15, fontSize: 12, opacity: 0.5 },
  playerItem: { color: '#fff', fontSize: 18, fontWeight: '800' },
  minusButton: { width: 40, height: 40, borderWidth: 2, borderColor: '#FF0055', justifyContent: 'center', alignItems: 'center' },
  minusButtonText: { color: '#FF0055', fontSize: 30, fontWeight: 'bold', lineHeight: 32 },
  
  startButton: { backgroundColor: '#39FF14', margin: 25, padding: 22, alignItems: 'center' },
  startButtonText: { color: '#000', fontSize: 20, fontWeight: '900', letterSpacing: 2 },

  gameContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  upsideDown: { transform: [{ rotate: '180deg' }] },
  dangerBg: { backgroundColor: '#1a0005' },
  gameHeader: { alignItems: 'center', width: '100%' },
  gameTitle: { color: '#39FF14', letterSpacing: 3, fontSize: 14, fontWeight: '900', opacity: 0.8 },
  activePlayerName: { color: '#fff', fontSize: 64, fontWeight: '900', textAlign: 'center', width: '90%' },
  
  timerBox: { alignItems: 'center', justifyContent: 'center' },
  timerText: { color: '#39FF14', fontSize: 140, fontWeight: '900', textAlign: 'center', lineHeight: 150 },
  timerDanger: { color: '#FF0055', textShadowColor: '#FF0055CC', textShadowRadius: 15 },
  secondsLabel: { color: '#39FF14', fontSize: 14, letterSpacing: 6, opacity: 0.5, marginTop: -10 },
  
  exitButton: { marginTop: 25, paddingBottom: 5, borderBottomWidth: 1, borderColor: '#222' },
  exitButtonText: { color: '#444', fontSize: 10, fontWeight: 'bold' },
});
