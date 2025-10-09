import * as SQLite from 'expo-sqlite';

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
