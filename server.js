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
  // Tabela de doadores
  db.run(`CREATE TABLE IF NOT EXISTS doadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone1 TEXT NOT NULL,
    telefone2 TEXT,
    cpf TEXT,
    codigo_doador TEXT UNIQUE,
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
});

// ==============================================================================
// FUNÇÕES AUXILIARES
// ==============================================================================

// Função para gerar código único do doador
function generateDoadorCode(nome, id) {
  // Gerar iniciais do nome (máximo 3)
  const iniciais = nome.split(' ')
    .filter(palavra => palavra.length > 2) // Ignorar preposições pequenas
    .map(palavra => palavra.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
  
  // Formato: D + ID com padding + iniciais
  return `D${id.toString().padStart(3, '0')}-${iniciais}`;
}

// Função para detectar possíveis duplicatas
function checkPossibleDuplicates(nome, telefone1, cpf, callback) {
  const queries = [];
  const params = [];
  
  // Buscar por CPF (se fornecido)
  if (cpf && cpf.trim() !== '') {
    queries.push('cpf = ?');
    params.push(cpf.replace(/\D/g, '')); // Remove formatação
  }
  
  // Buscar por nome + telefone
  queries.push('(nome = ? AND telefone1 = ?)');
  params.push(nome, telefone1);
  
  // Buscar por telefone em qualquer campo
  queries.push('(telefone1 = ? OR telefone2 = ?)');
  params.push(telefone1, telefone1);
  
  const query = `
    SELECT id, codigo_doador, nome, telefone1, telefone2, cpf, email
    FROM doadores 
    WHERE ${queries.join(' OR ')}
    LIMIT 5
  `;
  
  db.all(query, params, callback);
}

// Função para criar parcelas futuras
function createFutureParcelas(doacaoId, valor, dataInicial, numParcelas) {
  for (let i = 0; i < numParcelas; i++) {
    const dataVencimento = new Date(dataInicial);
    dataVencimento.setMonth(dataVencimento.getMonth() + i);
    
    db.run(
      'INSERT INTO parcelas_futuras (doacao_id, numero_parcela, data_vencimento, valor) VALUES (?, ?, ?, ?)',
      [doacaoId, i + 2, dataVencimento.toISOString().split('T')[0], valor],
      (err) => {
        if (err) console.error('Erro ao criar parcela futura:', err.message);
      }
    );
  }
}

// ==============================================================================
// ROTAS DA API
// ==============================================================================

// Rota para verificar duplicatas
app.post('/api/doadores/check-duplicates', (req, res) => {
  const { nome, telefone1, cpf } = req.body;
  
  if (!nome || !telefone1) {
    res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    return;
  }
  
  checkPossibleDuplicates(nome, telefone1, cpf, (err, duplicates) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      found: duplicates.length > 0,
      duplicates: duplicates.map(d => ({
        id: d.id,
        codigo: d.codigo_doador,
        nome: d.nome,
        telefone1: d.telefone1,
        telefone2: d.telefone2,
        cpf: d.cpf,
        email: d.email
      }))
    });
  });
});

// Rota para buscar doador por código/ID
app.get('/api/doadores/:codigo', (req, res) => {
  const { codigo } = req.params;
  
  // Buscar por código ou ID
  const query = `
    SELECT 
      id, codigo_doador, nome, email, telefone1, telefone2, cpf,
      (SELECT COUNT(*) FROM doacoes WHERE doador_id = doadores.id) as total_doacoes,
      (SELECT COALESCE(SUM(valor), 0) FROM historico_pagamentos hp 
       JOIN doacoes d ON hp.doacao_id = d.id 
       WHERE d.doador_id = doadores.id AND hp.status = 'Pago') as total_doado
    FROM doadores 
    WHERE codigo_doador = ? OR id = ?
  `;
  
  db.get(query, [codigo, codigo], (err, doador) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!doador) {
      res.status(404).json({ error: 'Doador não encontrado' });
      return;
    }
    
    // Buscar últimas doações do doador
    db.all(
      `SELECT id, valor, tipo, data_doacao, recorrente, observacoes 
       FROM doacoes 
       WHERE doador_id = ? 
       ORDER BY data_doacao DESC 
       LIMIT 10`,
      [doador.id],
      (err, doacoes) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        doador.doacoes_recentes = doacoes;
        res.json(doador);
      }
    );
  });
});

// Listar todas as doações com doadores e histórico
app.get('/api/doacoes', (req, res) => {
  const query = `
    SELECT 
      d.id,
      d.valor,
      d.tipo,
      d.data_doacao,
      d.recorrente,
      d.observacoes,
      d.parcelas_totais,
      d.data_proxima_parcela,
      doador.id as doador_id,
      doador.codigo_doador,
      doador.nome as doador_nome,
      doador.email as doador_email,
      doador.telefone1 as doador_telefone1,
      doador.telefone2 as doador_telefone2,
      doador.cpf as doador_cpf
    FROM doacoes d
    JOIN doadores doador ON d.doador_id = doador.id
    ORDER BY d.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Buscar histórico de pagamentos para cada doação
    const promises = rows.map(row => {
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM historico_pagamentos WHERE doacao_id = ? ORDER BY data_pagamento DESC',
          [row.id],
          (err, payments) => {
            if (err) reject(err);
            else {
              row.historico_pagamentos = payments;
              resolve(row);
            }
          }
        );
      });
    });
    
    Promise.all(promises)
      .then(results => res.json(results))
      .catch(err => res.status(500).json({ error: err.message }));
  });
});

// Criar nova doação (com proteção contra duplicatas)
app.post('/api/doacoes', (req, res) => {
  const { donor, amount, type, date, phone1, phone2, contact, recurring, notes, parcelas, proximaParcela, cpf, forceCreate } = req.body;
  
  // Se não for criação forçada, verificar duplicatas primeiro
  if (!forceCreate) {
    checkPossibleDuplicates(donor, phone1, cpf, (err, duplicates) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (duplicates.length > 0) {
        res.status(409).json({ 
          error: 'DUPLICATES_FOUND',
          message: 'Possíveis doadores duplicados encontrados',
          duplicates: duplicates.map(d => ({
            id: d.id,
            codigo: d.codigo_doador,
            nome: d.nome,
            telefone1: d.telefone1,
            telefone2: d.telefone2,
            cpf: d.cpf,
            email: d.email
          }))
        });
        return;
      }
      
      // Nenhuma duplicata, prosseguir com criação
      createDoacao();
    });
  } else {
    // Criação forçada, prosseguir direto
    createDoacao();
  }
  
  function createDoacao() {
    // Verificar se já existe doador por CPF ou telefone
    let searchQuery = 'SELECT id FROM doadores WHERE ';
    let searchParams = [];
    
    if (cpf && cpf.trim() !== '') {
      searchQuery += 'cpf = ?';
      searchParams.push(cpf.replace(/\D/g, ''));
    } else {
      searchQuery += 'telefone1 = ? OR nome = ?';
      searchParams.push(phone1, donor);
    }
    
    db.get(searchQuery, searchParams, (err, doador) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const insertDoacao = (doadorId) => {
        db.run(
          'INSERT INTO doacoes (doador_id, valor, tipo, data_doacao, recorrente, observacoes, parcelas_totais, data_proxima_parcela) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [doadorId, amount, type, date, recurring ? 1 : 0, notes, parcelas || 1, proximaParcela],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            
            const doacaoId = this.lastID;
            
            // Adicionar primeiro pagamento ao histórico
            db.run(
              'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
              [doacaoId, date, amount, 'Pago'],
              (err) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                
                // Se for recorrente, criar parcelas futuras
                if (recurring && parcelas > 1) {
                  createFutureParcelas(doacaoId, amount, proximaParcela, parcelas - 1);
                }
                
                res.json({ 
                  id: doacaoId, 
                  message: 'Doação criada com sucesso!',
                  doador_codigo: doador ? 'existente' : 'novo'
                });
              }
            );
          }
        );
      };
      
      if (doador) {
        // Atualizar dados do doador existente
        db.run(
          'UPDATE doadores SET nome = ?, email = ?, telefone1 = ?, telefone2 = ?, cpf = ? WHERE id = ?',
          [donor, contact, phone1, phone2, cpf ? cpf.replace(/\D/g, '') : null, doador.id],
          (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            insertDoacao(doador.id);
          }
        );
      } else {
        // Criar novo doador
        db.run(
          'INSERT INTO doadores (nome, email, telefone1, telefone2, cpf) VALUES (?, ?, ?, ?, ?)',
          [donor, contact, phone1, phone2, cpf ? cpf.replace(/\D/g, '') : null],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed: doadores.cpf')) {
                res.status(400).json({ error: 'CPF já cadastrado para outro doador' });
                return;
              }
              res.status(500).json({ error: err.message });
              return;
            }
            
            const doadorId = this.lastID;
            
            // Gerar código único para o doador
            const codigo = generateDoadorCode(donor, doadorId);
            
            db.run(
              'UPDATE doadores SET codigo_doador = ? WHERE id = ?',
              [codigo, doadorId],
              (err) => {
                if (err) {
                  console.error('Erro ao atualizar código do doador:', err.message);
                }
                insertDoacao(doadorId);
              }
            );
          }
        );
      }
    });
  }
});

// Atualizar doação
app.put('/api/doacoes/:id', (req, res) => {
  const { id } = req.params;
  const { donor, amount, type, date, phone1, phone2, contact, recurring, notes } = req.body;
  
  // Primeiro, atualizar dados do doador
  db.get('SELECT doador_id FROM doacoes WHERE id = ?', [id], (err, doacao) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!doacao) {
      res.status(404).json({ error: 'Doação não encontrada' });
      return;
    }
    
    db.run(
      'UPDATE doadores SET nome = ?, email = ?, telefone1 = ?, telefone2 = ? WHERE id = ?',
      [donor, contact, phone1, phone2, doacao.doador_id],
      (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Atualizar doação
        db.run(
          'UPDATE doacoes SET valor = ?, tipo = ?, data_doacao = ?, recorrente = ?, observacoes = ? WHERE id = ?',
          [amount, type, date, recurring ? 1 : 0, notes, id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            
            res.json({ message: 'Doação atualizada com sucesso!' });
          }
        );
      }
    );
  });
});

// Deletar doação
app.delete('/api/doacoes/:id', (req, res) => {
  const { id } = req.params;
  
  // Primeiro, deletar parcelas futuras
  db.run('DELETE FROM parcelas_futuras WHERE doacao_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Depois, deletar histórico de pagamentos
    db.run('DELETE FROM historico_pagamentos WHERE doacao_id = ?', [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Por último, deletar a doação
      db.run('DELETE FROM doacoes WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({ message: 'Doação deletada com sucesso!' });
      });
    });
  });
});

// Buscar parcelas futuras de uma doação
app.get('/api/doacoes/:id/parcelas-futuras', (req, res) => {
  const { id } = req.params;
  
  db.all(
    'SELECT * FROM parcelas_futuras WHERE doacao_id = ? ORDER BY numero_parcela',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Gerar dados para carnê PDF
app.get('/api/doacoes/:id/carne', (req, res) => {
  const { id } = req.params;
  
  // Buscar dados da doação e doador
  const query = `
    SELECT 
      d.*,
      doador.nome as doador_nome,
      doador.email as doador_email,
      doador.telefone1 as doador_telefone1,
      doador.telefone2 as doador_telefone2
    FROM doacoes d
    JOIN doadores doador ON d.doador_id = doador.id
    WHERE d.id = ?
  `;
  
  db.get(query, [id], (err, doacao) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!doacao) {
      res.status(404).json({ error: 'Doação não encontrada' });
      return;
    }
    
    // Buscar parcelas futuras
    db.all(
      'SELECT * FROM parcelas_futuras WHERE doacao_id = ? ORDER BY numero_parcela',
      [id],
      (err, parcelas) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          doacao: doacao,
          parcelas: parcelas
        });
      }
    );
  });
});

// Adicionar pagamento ao histórico
app.post('/api/doacoes/:id/pagamento', (req, res) => {
  const { id } = req.params;
  const { data_pagamento, valor, status } = req.body;
  
  db.run(
    'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
    [id, data_pagamento, valor, status || 'Pago'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ 
        id: this.lastID, 
        message: 'Pagamento adicionado ao histórico!' 
      });
    }
  );
});

// Relatórios
app.get('/api/relatorios/resumo', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_doacoes FROM doacoes',
    'SELECT SUM(valor) as total_pagamentos FROM historico_pagamentos WHERE status = "Pago"',
    'SELECT COUNT(*) as doacoes_recorrentes FROM doacoes WHERE recorrente = 1'
  ];
  
  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }))
  .then(results => {
    res.json({
      total_doacoes: results[0].total_doacoes,
      total_arrecadado: results[1].total_pagamentos || 0,
      doacoes_recorrentes: results[2].doacoes_recorrentes,
      total_pagamentos: results[1].total_pagamentos || 0
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// Servir arquivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

// Fechar conexão com o banco ao encerrar o servidor
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexão com o banco de dados fechada.');
    process.exit(0);
  });
});