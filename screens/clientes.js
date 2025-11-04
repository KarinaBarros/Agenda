import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function ClientesScreen() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const db = await SQLite.openDatabaseAsync('agenda.db');
      const rows = await db.getAllAsync('SELECT * FROM clientes ORDER BY id DESC');
      setClientes(rows);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  async function adicionarCliente() {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome do cliente é obrigatório.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('agenda.db');
      await db.runAsync('INSERT INTO clientes (nome, telefone) VALUES (?, ?)', [nome, telefone]);

      setNome('');
      setTelefone('');
      carregarClientes();
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o cliente.');
    }
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Cadastro de Clientes</Text>

      <Text style={{ marginBottom: 5 }}>Nome:</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome do cliente"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <Text style={{ marginBottom: 5 }}>Telefone:</Text>
      <TextInput
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(99) 99999-9999"
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 15,
        }}
      />

      <Button title="Adicionar Cliente" onPress={adicionarCliente} />

      <Text style={{ fontSize: 18, marginVertical: 20 }}>Clientes cadastrados:</Text>

      <FlatList
        data={clientes}
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
            <Text style={{ color: '#666' }}>{item.telefone}</Text>
          </View>
        )}
      />
    </View>
  );
}
