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
  const [gameStarted, setGameStarted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let interval = null;
    if (gameStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      Vibration.vibrate([200, 100, 200, 100, 500]); 
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft]);

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

  const nextTurn = () => {
    Vibration.vibrate(50); 
    setActiveIdx((prev) => (prev + 1) % players.length);
    setTimeLeft(30);
  };

  if (gameStarted) {
    return (
      <TouchableOpacity 
        style={[styles.gameContainer, timeLeft <= 5 && styles.dangerBg]} 
        onPress={nextTurn} 
        activeOpacity={1}
      >
        <StatusBar style="light" />
        
        <View style={[styles.gameHeader, styles.upsideDown]}>
          <Text style={styles.gameTitle}>CURRENT TURN</Text>
          <Text style={styles.activePlayerName} numberOfLines={1}>
            {players[activeIdx].toUpperCase()}
          </Text>
        </View>

        <View style={styles.timerBox}>
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerDanger]}>
            {timeLeft}
          </Text>
          <Text style={styles.secondsLabel}>SECONDS</Text>
        </View>

        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>CURRENT TURN</Text>
          <Text style={styles.activePlayerName} numberOfLines={1}>
            {players[activeIdx].toUpperCase()}
          </Text>
          
          <TouchableOpacity 
            style={styles.exitButton} 
            onPress={() => setGameStarted(false)}
          >
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
            <View style={styles.headerBox}><Text style={styles.titleText}>POKER SETUP</Text><View style={styles.neonLine} /></View>
            <View style={styles.inputSection}>
              <TextInput style={styles.input} placeholder="WHO'S IN?" placeholderTextColor="#39FF1466" value={playerName} onChangeText={setPlayerName} autoCapitalize="characters" />
              <TouchableOpacity style={styles.addButton} onPress={addPlayer}><Text style={styles.addButtonText}>+</Text></TouchableOpacity>
            </View>
            <FlatList data={players} keyExtractor={(item, index) => index.toString()} renderItem={({ item, index }) => (
              <View style={styles.playerCard}>
                <View style={styles.playerInfo}><Text style={styles.playerNumber}>#0{index + 1}</Text><Text style={styles.playerItem}>{item.toUpperCase()}</Text></View>
                <TouchableOpacity onPress={() => removePlayer(index)} style={styles.minusButton}><Text style={styles.minusButtonText}>-</Text></TouchableOpacity>
              </View>
            )} />
          </View>
          {players.length >= 2 && (
            <TouchableOpacity style={styles.startButton} onPress={() => setGameStarted(true)}>
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
  content: { flex: 1, paddingTop: 40, paddingHorizontal: 25 },
  headerBox: { marginBottom: 40, alignItems: 'center' },
  titleText: { color: '#39FF14', fontSize: 32, fontWeight: '900', letterSpacing: 4, textAlign: 'center', width: '100%' },
  neonLine: { height: 2, width: 140, backgroundColor: '#39FF14', marginTop: 10 },
  inputSection: { flexDirection: 'row', marginBottom: 30, borderWidth: 2, borderColor: '#39FF14' },
  input: { flex: 1, color: '#39FF14', padding: 15, fontSize: 18, fontWeight: 'bold' },
  addButton: { backgroundColor: '#39FF14', width: 60, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#000', fontSize: 30, fontWeight: 'bold' },
  playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 15, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#39FF14', justifyContent: 'space-between' },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  playerNumber: { color: '#39FF14', fontWeight: 'bold', marginRight: 15, fontSize: 12, opacity: 0.5 },
  playerItem: { color: '#fff', fontSize: 20, fontWeight: '800' },
  minusButton: { width: 40, height: 40, borderWidth: 2, borderColor: '#FF0055', justifyContent: 'center', alignItems: 'center' },
  minusButtonText: { color: '#FF0055', fontSize: 30, fontWeight: 'bold', lineHeight: 32 },
  startButton: { backgroundColor: '#39FF14', margin: 25, padding: 22, alignItems: 'center' },
  startButtonText: { color: '#000', fontSize: 20, fontWeight: '900', letterSpacing: 2 },

  gameContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 40 },
  upsideDown: { transform: [{ rotate: '180deg' }] },
  dangerBg: { backgroundColor: '#1a0005' },
  gameHeader: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  gameTitle: { color: '#39FF14', letterSpacing: 4, fontSize: 14, fontWeight: '900', textAlign: 'center', width: '100%' },
  activePlayerName: { color: '#fff', fontSize: 42, fontWeight: '900', marginTop: 5, textAlign: 'center' },
  timerBox: { alignItems: 'center', justifyContent: 'center' },
  timerText: { color: '#39FF14', fontSize: 160, fontWeight: '900', textAlign: 'center' },
  timerDanger: { color: '#FF0055', textShadowColor: '#FF0055CC', textShadowRadius: 20 },
  secondsLabel: { color: '#39FF14', fontSize: 14, letterSpacing: 8, opacity: 0.6, marginTop: -10 },
  exitButton: { marginTop: 20, borderBottomWidth: 1, borderColor: '#222' },
  exitButtonText: { color: '#333', fontSize: 10, fontWeight: 'bold' },
});
