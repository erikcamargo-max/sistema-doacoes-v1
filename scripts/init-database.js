const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Criar diretório database se não existir
if (!fs.existsSync('./database')) {
  fs.mkdirSync('./database');
}

// Conectar ao banco de dados
const db = new sqlite3.Database('./database/doacoes.db', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  console.log('Criando tabelas...');
  
  // Tabela de doadores
  db.run(`CREATE TABLE IF NOT EXISTS doadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone1 TEXT NOT NULL,
    telefone2 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela doadores:', err.message);
    } else {
      console.log('Tabela doadores criada com sucesso.');
    }
  });

  // Tabela de doações
  db.run(`CREATE TABLE IF NOT EXISTS doacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doador_id INTEGER,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL,
    data_doacao TEXT NOT NULL,
    recorrente INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doador_id) REFERENCES doadores (id)
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela doacoes:', err.message);
    } else {
      console.log('Tabela doacoes criada com sucesso.');
    }
  });

  // Tabela de histórico de pagamentos
  db.run(`CREATE TABLE IF NOT EXISTS historico_pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doacao_id INTEGER,
    data_pagamento TEXT NOT NULL,
    valor REAL NOT NULL,
    status TEXT DEFAULT 'Pago',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doacao_id) REFERENCES doacoes (id)
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela historico_pagamentos:', err.message);
    } else {
      console.log('Tabela historico_pagamentos criada com sucesso.');
    }
  });

  // Inserir dados de exemplo
  console.log('Inserindo dados de exemplo...');
  
  db.run(`INSERT INTO doadores (nome, email, telefone1, telefone2) VALUES (?, ?, ?, ?)`, 
    ['João Silva', 'joao@email.com', '(11) 99999-9999', '(11) 8888-8888'], 
    function(err) {
      if (err) {
        console.error('Erro ao inserir doador:', err.message);
      } else {
        const doadorId = this.lastID;
        
        db.run(`INSERT INTO doacoes (doador_id, valor, tipo, data_doacao, recorrente, observacoes) VALUES (?, ?, ?, ?, ?, ?)`,
          [doadorId, 500.00, 'Dinheiro', '2024-07-10', 0, 'Doação única'],
          function(err) {
            if (err) {
              console.error('Erro ao inserir doação:', err.message);
            } else {
              db.run(`INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)`,
                [this.lastID, '2024-07-10', 500.00, 'Pago']);
            }
          }
        );
      }
    }
  );
  
  db.run(`INSERT INTO doadores (nome, email, telefone1, telefone2) VALUES (?, ?, ?, ?)`, 
    ['Maria Santos', 'maria@email.com', '(11) 77777-7777', ''], 
    function(err) {
      if (err) {
        console.error('Erro ao inserir doador:', err.message);
      } else {
        const doadorId = this.lastID;
        
        db.run(`INSERT INTO doacoes (doador_id, valor, tipo, data_doacao, recorrente, observacoes) VALUES (?, ?, ?, ?, ?, ?)`,
          [doadorId, 200.00, 'Dinheiro', '2024-07-12', 1, 'Doação mensal'],
          function(err) {
            if (err) {
              console.error('Erro ao inserir doação:', err.message);
            } else {
              const doacaoId = this.lastID;
              
              // Inserir histórico de pagamentos para doação recorrente
              db.run(`INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)`,
                [doacaoId, '2024-06-12', 200.00, 'Pago']);
              
              db.run(`INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)`,
                [doacaoId, '2024-07-12', 200.00, 'Pago']);
            }
          }
        );
      }
    }
  );
});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
  } else {
    console.log('Banco de dados inicializado com sucesso!');
    console.log('Execute "npm start" para iniciar o servidor.');
  }
});