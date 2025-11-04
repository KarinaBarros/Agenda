import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [dias, setDias] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [posicoes, setPosicoes] = useState({});
  const scrollRef = useRef(null);

  // usamos refs para garantir acesso sempre atualizado aos estados
  const diasRef = useRef([]);
  const posicoesRef = useRef({});

  useEffect(() => {
    diasRef.current = dias;
  }, [dias]);

  useEffect(() => {
    posicoesRef.current = posicoes;
  }, [posicoes]);

  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        const db = await SQLite.openDatabaseAsync('agenda.db');

        const allDias = await db.getAllAsync('SELECT * FROM dias ORDER BY data ASC');
        setDias(allDias);

        const allAgendamentos = await db.getAllAsync(`
          SELECT 
            a.id,
            a.dia_id,
            h.hora,
            c.nome AS cliente,
            s.nome AS servico,
            a.descricao
          FROM agendamentos a
          JOIN clientes c ON a.cliente_id = c.id
          JOIN servicos s ON a.servico_id = s.id
          JOIN horarios h ON a.horario_id = h.id
          ORDER BY a.dia_id, h.hora
        `);

        setAgendamentos(allAgendamentos);
      }

      carregarDados();
    }, [])
  );

  // rolar automaticamente na primeira carga
  useEffect(() => {
    if (Object.keys(posicoes).length > 0 && dias.length > 0) {
      rolarParaDiaAtual();
    }
  }, [posicoes]);

  function agendamentosDoDia(diaId) {
    return agendamentos.filter(a => a.dia_id === diaId);
  }

  function rolarParaDiaAtual() {
    const listaDias = diasRef.current;
    const pos = posicoesRef.current;

    if (!Array.isArray(listaDias) || listaDias.length === 0) return;

    const hojeStr = format(new Date(), 'yyyy-MM-dd');
    const diaHoje = listaDias.find(d => d.data === hojeStr);

    if (diaHoje && scrollRef.current && pos[diaHoje.data] !== undefined) {
      scrollRef.current.scrollTo({
        y: pos[diaHoje.data],
        animated: true,
      });
    }
  }

  function parseDataLocal(dateString) {
    const [ano, mes, dia] = dateString.split('-');
    return new Date(ano, mes - 1, dia);
  }

  return (
    <View style={styles.container}>
      <View style={styles.fixedButtons}>
        <TouchableOpacity
          style={[styles.topButton, { backgroundColor: '#3498db' }]}
          onPress={() => navigation.navigate('Clientes')}
        >
          <Text style={styles.topButtonText}>Cadastrar Cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topButton, { backgroundColor: '#27ae60' }]}
          onPress={() => navigation.navigate('Servicos')}
        >
          <Text style={styles.topButtonText}>Cadastrar Serviços</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContainer}>
        {dias.map(dia => {
          const hoje = format(new Date(), 'yyyy-MM-dd');
          const isHoje = dia.data === hoje;

          return (
            <View
              key={dia.id}
              onLayout={event => {
                const { y } = event.nativeEvent.layout;
                setPosicoes(prev => ({ ...prev, [dia.data]: y }));
              }}
              style={[
                styles.diaContainer,
                isHoje && { borderColor: '#27ae60', borderWidth: 2 },
              ]}
            >
              <TouchableOpacity
                style={[styles.diaButton, isHoje && { backgroundColor: '#27ae60' }]}
                onPress={() => navigation.navigate('Detalhes', { id: dia.id, data: dia.data })}
              >
                <Text style={styles.diaButtonText}>
                  {isHoje ? '📅 Hoje - ' : ''}
                  {format(parseDataLocal(dia.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Text>
              </TouchableOpacity>

              {agendamentosDoDia(dia.id).length > 0 &&
                agendamentosDoDia(dia.id).map(item => (
                  <View key={item.id} style={styles.agendamentoCard}>
                    <Text style={styles.hora}>🕒 {item.hora}</Text>
                    <Text style={styles.texto}>👤 {item.cliente}</Text>
                    <Text style={styles.texto}>💈 {item.servico}</Text>
                    {item.descricao ? (
                      <Text style={styles.texto}>🗒️ {item.descricao}</Text>
                    ) : null}
                  </View>
                ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Botão flutuante que agora funciona sempre */}
      <TouchableOpacity style={styles.floatingButton} onPress={rolarParaDiaAtual}>
        <Text style={styles.floatingButtonText}>📅 Ir para hoje</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', marginTop: 30 },
  fixedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  topButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  topButtonText: { color: '#fff', fontWeight: 'bold' },
  scrollContainer: { padding: 15 },
  diaContainer: { marginBottom: 15, borderRadius: 10, overflow: 'hidden' },
  diaButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  diaButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  agendamentoCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 6,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    elevation: 2,
  },
  hora: { fontWeight: 'bold' },
  texto: { fontSize: 14, color: '#333' },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#27ae60',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 5,
  },
  floatingButtonText: { color: '#fff', fontWeight: 'bold' },
});
