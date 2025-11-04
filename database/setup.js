import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync('agenda.db');

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        telefone TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS dias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT UNIQUE NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS horarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hora TEXT UNIQUE NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        dia_id INTEGER NOT NULL,
        horario_id INTEGER NOT NULL,
        servico_id INTEGER NOT NULL,
        descricao TEXT,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        FOREIGN KEY (dia_id) REFERENCES dias(id),
        FOREIGN KEY (horario_id) REFERENCES horarios(id),
        FOREIGN KEY (servico_id) REFERENCES servicos(id)
      );
    `);
  });

  // Inserir dias do mês atual e do próximo
  const hoje = new Date();
  const meses = [
    { ano: hoje.getFullYear(), mes: hoje.getMonth() },
    { ano: hoje.getMonth() === 11 ? hoje.getFullYear() + 1 : hoje.getFullYear(), mes: (hoje.getMonth() + 1) % 12 },
  ];

  const gerarDiasDoMes = (ano, mes) => {
    const dias = [];
    const qtdDias = new Date(ano, mes + 1, 0).getDate();
    for (let dia = 1; dia <= qtdDias; dia++) {
      const data = new Date(ano, mes, dia);
      dias.push(format(data, 'yyyy-MM-dd'));
    }
    return dias;
  };

  for (const { ano, mes } of meses) {
    const diasDoMes = gerarDiasDoMes(ano, mes);
    for (const dia of diasDoMes) {
      await db.runAsync('INSERT OR IGNORE INTO dias (data) VALUES (?)', [dia]);
    }
  }

    // 🕒 Inserir horários de 8:00 até 17:00, de meia em meia hora
  const horarios = [];
  for (let hora = 8; hora <= 17; hora++) {
    for (let min = 0; min < 60; min += 30) {
      if (hora === 17 && min > 0) break; // não passar das 17h
      const hStr = String(hora).padStart(2, '0');
      const mStr = String(min).padStart(2, '0');
      horarios.push(`${hStr}:${mStr}`);
    }
  }

  for (const hora of horarios) {
    await db.runAsync('INSERT OR IGNORE INTO horarios (hora) VALUES (?)', [hora]);
  }

  console.log('✅ Banco inicializado com sucesso!');
}


