/*
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Tela Inicial</Text>
      <Button
        title="Ir para Detalhes"
        onPress={() => navigation.navigate('Detalhes')}
      />
    </View>
  );
}
  */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import * as SQLite from "expo-sqlite";

export default function HomeScreen() {
  const [db, setDb] = useState(null);
  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const database = await SQLite.openDatabaseAsync("agenda.db");
      setDb(database);

      const diasRes = await database.getAllAsync(`SELECT * FROM dias ORDER BY data ASC`);
      const horariosRes = await database.getAllAsync(`SELECT * FROM horarios ORDER BY hora ASC`);

      setDias(diasRes);
      setHorarios(horariosRes);
      setLoading(false);
    }
    load();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando banco de dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Agenda do Mês Atual</Text>

      <FlatList
        data={dias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DropdownDia
            dia={item}
            horarios={horarios}
            expanded={expanded[item.id]}
            onToggle={() => toggleExpand(item.id)}
          />
        )}
      />
    </View>
  );
}

function DropdownDia({ dia, horarios, expanded, onToggle }) {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, horarios.length * 40],
  });

  return (
    <View style={styles.diaContainer}>
      <TouchableOpacity onPress={onToggle} style={styles.diaHeader}>
        <Text style={styles.diaTitulo}>{dia.data}</Text>
        <Text style={styles.seta}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.horariosContainer, { height }]}>
        {horarios.map((h) => (
          <View key={h.id} style={styles.horaItem}>
            <Text style={styles.horaTexto}>{h.hora}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingTop: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  diaContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  diaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#e3f2fd",
  },
  diaTitulo: {
    fontSize: 16,
    fontWeight: "600",
  },
  seta: {
    fontSize: 18,
    color: "#1976d2",
  },
  horariosContainer: {
    overflow: "hidden",
  },
  horaItem: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  horaTexto: {
    fontSize: 15,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});


