import * as SQLite from 'expo-sqlite';

const db = await SQLite.openDatabaseAsync('agenda.db');

await db.withTransactionAsync(async () => {
  // Criação das tabelas
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

// Função para obter número de dias do mês atual
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate(); 
}

// Função para gerar horários
function generateHalfHourTimes() {
  const times = [];
  for (let hour = 8; hour <= 18; hour++) {
    if (hour === 18) {
      times.push("18:00");
    } else {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return times;
}

// Inserir dias e horários automaticamente
async function initializeMonthData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; 
  const daysInMonth = getDaysInMonth(year, month);

  const monthPrefix = `${year}-${month.toString().padStart(2, "0")}`; // ex: "2025-10"

  // Verificar se já existem dias do mês
  const existing = await db.getAllAsync(
    `SELECT * FROM dias WHERE data LIKE ?`,
    [`${monthPrefix}-%`]
  );

  if (existing.length === 0) {
    console.log("Inserindo dias do mês atual...");
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthPrefix}-${day.toString().padStart(2, "0")}`;
      await db.runAsync(`INSERT INTO dias (data) VALUES (?)`, [dateStr]);
    }
  } else {
    console.log("Dias do mês atual já inseridos.");
  }

  // Inserir horários, se não existirem
  const horariosExist = await db.getAllAsync(`SELECT * FROM horarios`);
  if (horariosExist.length === 0) {
    console.log("Inserindo horários padrão...");
    const times = generateHalfHourTimes();
    for (const t of times) {
      await db.runAsync(`INSERT INTO horarios (hora) VALUES (?)`, [t]);
    }
  } else {
    console.log("Horários já inseridos.");
  }

  console.log("Banco de dados inicializado com sucesso!");
}

await initializeMonthData();

