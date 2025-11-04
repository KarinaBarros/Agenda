import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function ServicosScreen() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const db = await SQLite.openDatabaseAsync('agenda.db');
      const rows = await db.getAllAsync('SELECT * FROM servicos ORDER BY id DESC');
      setServicos(rows);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  }

  async function adicionarServico() {
    if (!nome.trim() || !preco.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert('Erro', 'Digite um preço válido.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('agenda.db');
      await db.runAsync('INSERT INTO servicos (nome, preco) VALUES (?, ?)', [nome, precoNum]);

      setNome('');
      setPreco('');
      carregarServicos(); // Atualiza a lista
      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o serviço.');
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Cadastro de Serviços</Text>

      <Text style={{ marginBottom: 5 }}>Nome do serviço:</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Corte de cabelo"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Text style={{ marginBottom: 5 }}>Preço (R$):</Text>
      <TextInput
        value={preco}
        onChangeText={setPreco}
        placeholder="Ex: 50.00"
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 15,
        }}
      />

      <Button title="Adicionar Serviço" onPress={adicionarServico} />

      <Text style={{ fontSize: 18, marginVertical: 20 }}>Serviços cadastrados:</Text>

      <FlatList
        data={servicos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderColor: '#ddd',
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.nome}</Text>
            <Text style={{ color: '#666' }}>R$ {item.preco.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}
