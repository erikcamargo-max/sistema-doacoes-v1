// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { logger } = require('../utils/logger');

// Variável para armazenar a instância do banco
let db = null;

// Função para obter a instância do banco
function getDb() {
  if (!db) {
    throw new Error('Banco de dados não inicializado. Chame initDatabase() primeiro.');
  }
  return db;
}

// Função para inicializar o banco
function initDatabase() {
  const dbPath = path.join(__dirname, '../database/doacoes.db');
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      logger.error('Erro ao conectar com o banco de dados:', err.message);
      process.exit(1);
    } else {
      logger.info('Conectado ao banco de dados SQLite.');
      createTables();
    }
  });
  
  return db;
}

// Criar tabelas se não existirem
function createTables() {
  db.serialize(() => {
    // Tabela de doadores com campos de endereço
    db.run(`CREATE TABLE IF NOT EXISTS doadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT,
      telefone1 TEXT NOT NULL,
      telefone2 TEXT,
      cpf TEXT UNIQUE,
      codigo_doador TEXT UNIQUE,
      cep TEXT,
      logradouro TEXT,
      numero TEXT,
      complemento TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de doações
    db.run(`CREATE TABLE IF NOT EXISTS doacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doador_id INTEGER,
      valor REAL NOT NULL,
      tipo TEXT NOT NULL,
      data_doacao TEXT NOT NULL,
      recorrente INTEGER DEFAULT 0,
      observacoes TEXT,
      parcelas_totais INTEGER DEFAULT 1,
      data_proxima_parcela TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doador_id) REFERENCES doadores (id)
    )`);

    // Tabela de histórico de pagamentos
    db.run(`CREATE TABLE IF NOT EXISTS historico_pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doacao_id INTEGER,
      data_pagamento TEXT NOT NULL,
      valor REAL NOT NULL,
      status TEXT DEFAULT 'Pago',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doacao_id) REFERENCES doacoes (id)
    )`);

    // Tabela de parcelas futuras
    db.run(`CREATE TABLE IF NOT EXISTS parcelas_futuras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doacao_id INTEGER,
      numero_parcela INTEGER,
      data_vencimento TEXT NOT NULL,
      valor REAL NOT NULL,
      status TEXT DEFAULT 'Pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doacao_id) REFERENCES doacoes (id)
    )`);

    logger.info('Tabelas verificadas/criadas com sucesso.');
  });
}

// Fechar conexão com o banco
process.on('SIGINT', () => {
  if (db) {
    db.close((err) => {
      if (err) {
        logger.error(err.message);
      } else {
        logger.info('Conexão com o banco de dados fechada.');
      }
      process.exit(0);
    });
  }
});

module.exports = {
  initDatabase,
  getDb
};