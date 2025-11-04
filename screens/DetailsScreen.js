import { SafeAreaViewBase, ScrollView, View, Text, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DetailsScreen({ route }) {
  const { id: dia_id, data } = route.params;

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [horas, setHoras] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const db = await SQLite.openDatabaseAsync('agenda.db');

    const clientesDB = await db.getAllAsync('SELECT * FROM clientes ORDER BY nome ASC');
    console.log(clientes)
    const servicosDB = await db.getAllAsync('SELECT * FROM servicos ORDER BY nome ASC');
    const horariosDB = await db.getAllAsync('SELECT * FROM horarios ORDER BY hora ASC');

    setClientes(clientesDB);
    setServicos(servicosDB);
    setHoras(horariosDB);
  }

  async function agendar(horario_id) {
    if (!clienteSelecionado || !servicoSelecionado) {
      Alert.alert('Atenção', 'Selecione um cliente e um serviço antes de agendar.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('agenda.db');

      const existe = await db.getAllAsync(
        'SELECT * FROM agendamentos WHERE dia_id = ? AND horario_id = ?',
        [dia_id, horario_id]
      );

      if (existe.length > 0) {
        Alert.alert('Horário ocupado', 'Este horário já está agendado.');
        return;
      }

      await db.runAsync(
        'INSERT INTO agendamentos (cliente_id, dia_id, horario_id, servico_id, descricao) VALUES (?, ?, ?, ?, ?)',
        [clienteSelecionado, dia_id, horario_id, servicoSelecionado, '']
      );

      Alert.alert('Sucesso', 'Agendamento realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar:', error);
      Alert.alert('Erro', 'Não foi possível realizar o agendamento.');
    }
  }

  return (
    <ScrollView style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 100,
      }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Agendamento</Text>
      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        Data: {format(new Date(`${data}T00:00:00`), "dd/MM/yyyy", { locale: ptBR })}

      </Text>

      <Text style={{ marginTop: 15 }}>Cliente:</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Picker
          selectedValue={clienteSelecionado}
          onValueChange={(itemValue) => setClienteSelecionado(itemValue)}
        >
          <Picker.Item label="Selecione o cliente" value={null} />
          {clientes.map((c) => (
            <Picker.Item key={c.id} label={c.nome} value={c.id} />
          ))}
        </Picker>
      </View>

      <Text>Serviço:</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Picker
          selectedValue={servicoSelecionado}
          onValueChange={(itemValue) => setServicoSelecionado(itemValue)}
        >
          <Picker.Item label="Selecione o serviço" value={null} />
          {servicos.map((s) => (
            <Picker.Item
              key={s.id}
              label={`${s.nome} - R$ ${s.preco.toFixed(2)}`}
              value={s.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={{ fontSize: 18, marginBottom: 10 }}>Horários disponíveis:</Text>
      {horas.map((hora) => (
        <View key={hora.id} style={{ marginBottom: 5 }}>
          <Button title={hora.hora} onPress={() => agendar(hora.id)} />
        </View>
      ))}
    </ScrollView>
  );
}

