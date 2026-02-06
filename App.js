import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);

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

  return (
    // SafeAreaView helps with the top notch, while the outer View fixes the bottom bar
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          
          <View style={styles.content}>
            <View style={styles.headerBox}>
              <Text style={styles.titleText}>POKER SETUP</Text>
              <View style={styles.neonLine} />
            </View>

            <View style={styles.inputSection}>
              <TextInput 
                style={styles.input}
                placeholder="WHO'S IN?"
                placeholderTextColor="#39FF1466"
                value={playerName}
                onChangeText={setPlayerName}
                autoCapitalize="characters" // Automatically makes input uppercase
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
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>

          {players.length >= 2 && (
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>DROP THE HAMMER</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 25,
  },
  headerBox: {
    marginBottom: 40,
    alignItems: 'center',
  },
  titleText: {
    color: '#39FF14',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#39FF14CC',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  neonLine: {
    height: 2,
    width: 140,
    backgroundColor: '#39FF14',
    marginTop: 10,
  },
  inputSection: {
    flexDirection: 'row',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#39FF14',
    backgroundColor: '#000',
  },
  input: {
    flex: 1,
    color: '#39FF14',
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#39FF14',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#39FF14', // Back to the aggressive left-border
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerNumber: {
    color: '#39FF14',
    fontWeight: 'bold',
    marginRight: 15,
    fontSize: 12,
    opacity: 0.5,
  },
  playerItem: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  minusButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#FF0055',
    justifyContent: 'center',
    alignItems: 'center',
    // Square/Boxy removal button
  },
  minusButtonText: {
    color: '#FF0055',
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  startButton: {
    backgroundColor: '#39FF14',
    margin: 25,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
