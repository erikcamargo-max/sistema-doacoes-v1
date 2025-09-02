// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Inicializar banco de dados SQLite
const db = new sqlite3.Database('./database/doacoes.db', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar tabelas se não existirem
db.serialize(() => {
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

  db.run(`CREATE TABLE IF NOT EXISTS historico_pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doacao_id INTEGER,
    data_pagamento TEXT NOT NULL,
    valor REAL NOT NULL,
    status TEXT DEFAULT 'Pago',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doacao_id) REFERENCES doacoes (id)
  )`);

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
});

// ==============================
// FUNÇÕES AUXILIARES
// ==============================

// Gerar código único do doador
function generateDoadorCode(nome, id) {
  const iniciais = nome.split(' ')
    .filter(palavra => palavra.length > 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
  return `D${id.toString().padStart(3, '0')}-${iniciais}`;
}

// Checar duplicatas
function checkPossibleDuplicates(nome, telefone1, cpf, callback) {
  const queries = [];
  const params = [];

  if (cpf && cpf.trim() !== '') {
    queries.push('cpf = ?');
    params.push(cpf.replace(/\D/g, ''));
  }
  if (nome && telefone1) {
    queries.push('(nome = ? AND telefone1 = ?)');
    params.push(nome, telefone1);
  }
  if (telefone1) {
    queries.push('(telefone1 = ? OR telefone2 = ?)');
    params.push(telefone1, telefone1);
  }

  if (queries.length === 0) return callback(null, []);

  const query = `SELECT * FROM doadores WHERE ${queries.join(' OR ')}`;
  db.all(query, params, (err, rows) => callback(err, rows));
}

// ==============================
// ROTAS
// ==============================

// Criar nova doação
app.post('/api/doacoes', (req, res) => {
  const { donor, amount, type, date, phone1, phone2, contact, recurring, notes, parcelas, proximaParcela, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, forceCreate } = req.body;

  const proceed = () => {
    // Verificar se doador já existe
    let searchQuery = 'SELECT id FROM doadores WHERE ';
    const searchParams = [];

    if (cpf && cpf.trim() !== '') {
      searchQuery += 'cpf = ?';
      searchParams.push(cpf.replace(/\D/g, ''));
    } else {
      searchQuery += 'telefone1 = ? OR nome = ?';
      searchParams.push(phone1, donor);
    }

    db.get(searchQuery, searchParams, (err, doador) => {
      if (err) return res.status(500).json({ error: err.message });

      const insertDoacao = (doadorId) => {
        db.run(
          'INSERT INTO doacoes (doador_id, valor, tipo, data_doacao, recorrente, observacoes, parcelas_totais, data_proxima_parcela) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [doadorId, amount, type, date, recurring ? 1 : 0, notes, parcelas || 1, proximaParcela],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const doacaoId = this.lastID;

            db.run(
              'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
              [doacaoId, date, amount, 'Pago'],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: doacaoId, message: 'Doação criada com sucesso!' });
              }
            );
          }
        );
      };

      if (doador) {
        // Atualizar doador existente
        db.run(
          'UPDATE doadores SET nome=?, email=?, telefone1=?, telefone2=?, cpf=?, cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=? WHERE id=?',
          [donor, contact, phone1, phone2, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, doador.id],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            insertDoacao(doador.id);
          }
        );
      } else {
        // Criar novo doador
        db.run(
          'INSERT INTO doadores (nome, email, telefone1, telefone2, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [donor, contact, phone1, phone2, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const doadorId = this.lastID;
            const codigo = generateDoadorCode(donor, doadorId);
            db.run('UPDATE doadores SET codigo_doador=? WHERE id=?', [codigo, doadorId], (err) => {
              if (err) console.error(err.message);
              insertDoacao(doadorId);
            });
          }
        );
      }
    });
  };

  if (!forceCreate) {
    checkPossibleDuplicates(donor, phone1, cpf, (err, duplicates) => {
      if (err) return res.status(500).json({ error: err.message });
      if (duplicates.length > 0) return res.status(409).json({ error: 'DUPLICATES_FOUND', duplicates });
      proceed();
    });
  } else {
    proceed();
  }
});

// Outras rotas (PUT, DELETE, GET) seguem a mesma lógica de usar `res` apenas dentro da rota
// Para não deixar muito extenso aqui, podemos ajustar as outras rotas se você quiser

// Servir index
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

// Fechar conexão SQLite ao encerrar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err.message);
    else console.log('Conexão com o banco de dados fechada.');
    process.exit(0);
  });
});
