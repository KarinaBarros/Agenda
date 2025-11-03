import { useState, useEffect } from 'react';
import { ScrollView, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function HomeScreen() {
  const [dias, setDias] = useState([]);

  useEffect(() => {
    async function carregarDias() {
      const db = await SQLite.openDatabaseAsync('agenda.db');
      console.log(db)
      // Buscar todos os dias do banco
      const allRows = await db.getAllAsync('SELECT * FROM dias ORDER BY data ASC');
      console.log(allRows);

      // Mapear para array de datas
      setDias(allRows.map(row => row.data));
    }

    carregarDias();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Dias cadastrados:</Text>

      {dias.map(dia => (
        <Text key={dia} style={{ fontSize: 16, marginVertical: 2 }}>
          {dia}
        </Text>
      ))}
    </ScrollView>
  );
}
