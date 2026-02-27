import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

interface SetupScreenProps {
  players: string[];
  setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
  customTime: string;
  setCustomTime: React.Dispatch<React.SetStateAction<string>>;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SetupScreen({ 
  players, setPlayers, customTime, setCustomTime, setGameStarted 
}: SetupScreenProps) {
  
  const client = generateClient<Schema>();
  const [playerName, setPlayerName] = useState('');
  
  const [dbPlayers, setDbPlayers] = useState<Array<Schema["Player"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Player?.observeQuery().subscribe({
      next: ({ items }) => {
        setDbPlayers(items);
        
        const activePlayers = items.filter(p => p.status === 'ACTIVE');
        
        setPlayers(activePlayers.map(p => p.name));
      },
      error: (err) => console.error("Sync error:", err)
    });
    
    return () => sub?.unsubscribe(); 
  }, []);

  const addPlayer = async () => {
    const formattedName = playerName.trim().toUpperCase();
    
    if (formattedName.length > 0) {
      try {
        const existingPlayer = dbPlayers.find(p => p.name === formattedName);

        if (existingPlayer) {
          await client.models.Player.update({
            id: existingPlayer.id,
            status: 'ACTIVE'
          });
        } else {
          await client.models.Player.create({
            name: formattedName,
            totalProfit: 0,
            gamesPlayed: 0,
            status: 'ACTIVE',
          });
        }
        setPlayerName('');
      } catch (error) {
        console.error("Error adding player:", error);
      }
    }
  };

  const removePlayer = async (nameToRemove: string) => {
    try {
      const playerToHide = dbPlayers.find(p => p.name === nameToRemove);
      
      if (playerToHide) {
        await client.models.Player.update({ 
          id: playerToHide.id,
          status: 'SITTING_OUT' 
        });
      }
    } catch (error) {
      console.error("Error hiding player:", error);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
  };

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
                  <Text style={styles.playerItem}>{item}</Text>
                </View>
                <TouchableOpacity onPress={() => removePlayer(item)} style={styles.minusButton}>
                  <Text style={styles.minusButtonText}>-</Text>
                </TouchableOpacity>
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
});
