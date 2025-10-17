// server.js - Sistema de Doações v2.5.0
// Reescrito e otimizado - 30/09/2025

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
app.use(express.static(__dirname));

// Conectar ao banco de dados
const db = new sqlite3.Database('./database/doacoes.db', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados SQLite.');
  }
});

// v2.5.0 - Criar tabelas
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

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// v2.5.0 - Gerar código único do doador
function generateDoadorCode(nome, id) {
  const iniciais = nome.split(' ')
    .filter(palavra => palavra.length > 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
  return `D${id.toString().padStart(3, '0')}-${iniciais}`;
}

// v2.5.0 - Verificar duplicatas
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

  if (queries.length === 0) {
    callback(null, []);
    return;
  }

  const sql = `SELECT * FROM doadores WHERE ${queries.join(' OR ')}`;
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows || []);
    }
  });
}

// ============================================================================
// ROTAS - DOAÇÕES
// ============================================================================

// v2.5.0 - Listar todas as doações
app.get('/api/doacoes', (req, res) => {
  const sql = `
    SELECT d.*, don.nome as nome_doador, don.codigo_doador, don.telefone1, don.telefone2
    FROM doacoes d
    LEFT JOIN doadores don ON d.doador_id = don.id
    ORDER BY d.data_doacao DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// v2.5.0 - Buscar doação específica
app.get('/api/doacoes/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = `
    SELECT d.*, 
           don.nome as nome_doador, 
           don.codigo_doador, 
           don.telefone1,
           don.telefone2,
           don.cpf,
           don.email,
           don.cep,
           don.logradouro,
           don.numero,
           don.complemento,
           don.bairro,
           don.cidade,
           don.estado
    FROM doacoes d
    LEFT JOIN doadores don ON d.doador_id = don.id
    WHERE d.id = ?
  `;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Doação não encontrada' });
      return;
    }
    res.json(row);
  });
});

// v2.5.0 - Criar nova doação
app.post('/api/doacoes', (req, res) => {
  const {
    donor, contact, phone1, phone2, cpf,
    amount, type, date, observations,
    forceCreate,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    recorrente, parcelas, proxima_parcela, valor_parcelas_futuras 
  } = req.body;

  
	const insertDoacao = (doadorId) => {
    // v2.5.9 - Lógica corrigida: parcelas = quantidade de FUTURAS (não inclui entrada)
	const parcelasFuturas = recorrente ? Math.max(parseInt(parcelas) || 0, 0) : 0;
	const parcelasTotais = 1 + parcelasFuturas; // 1 entrada + N futuras	
    const valorPrimeiraParcela = parseFloat(amount) || 0;
    const valorParcelasFuturas = parseFloat(valor_parcelas_futuras) || valorPrimeiraParcela;
    
    db.run(
      `INSERT INTO doacoes (doador_id, valor, tipo, data_doacao, recorrente, observacoes, parcelas_totais, data_proxima_parcela, valor_parcelas_futuras)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [doadorId, valorPrimeiraParcela, type, date, recorrente ? 1 : 0, observations, parcelasTotais, proxima_parcela, valorParcelasFuturas],
  
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const doacaoId = this.lastID;
        
        // Inserir primeiro pagamento (PAGA)
        db.run(
          `INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status)
           VALUES (?, ?, ?, ?)`,
          [doacaoId, date, valorPrimeiraParcela, 'Pago']
        );
        
			// Criar parcelas futuras (PENDENTES)
			// Inicia em 2 porque a parcela 1 é a entrada (já registrada em historico_pagamentos)
			if (recorrente && parcelasFuturas > 0) {
				for (let i = 2; i <= parcelasTotais; i++) {
            const dataVencimento = new Date(proxima_parcela || date);
            dataVencimento.setMonth(dataVencimento.getMonth() + (i - 2));
            
            db.run(
              `INSERT INTO parcelas_futuras (doacao_id, numero_parcela, data_vencimento, valor, status)
               VALUES (?, ?, ?, ?, ?)`,
              [doacaoId, i, dataVencimento.toISOString().split('T')[0], valorParcelasFuturas, 'Pendente']
            );
          }
        }
        
        res.json({ 
          id: doacaoId, 
          doador_id: doadorId, 
          message: `Doação ${recorrente ? 'recorrente' : 'única'} criada com sucesso!`,
          parcelas: parcelasTotais
        });
      }
    );
  };

  const proceed = () => {
    db.get('SELECT * FROM doadores WHERE cpf = ? OR telefone1 = ?', [cpf, phone1], (err, doador) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (doador) {
        // Atualizar doador existente
        db.run(
          `UPDATE doadores SET nome=?, email=?, telefone1=?, telefone2=?, cpf=?,
           cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?
           WHERE id=?`,
          [donor, contact, phone1, phone2, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, doador.id],
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
          `INSERT INTO doadores (nome, email, telefone1, telefone2, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [donor, contact, phone1, phone2, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            const doadorId = this.lastID;
            const codigo = generateDoadorCode(donor, doadorId);
            db.run('UPDATE doadores SET codigo_doador=? WHERE id=?', [codigo, doadorId], () => {
              insertDoacao(doadorId);
            });
          }
        );
      }
    });
  };

  if (!forceCreate) {
    checkPossibleDuplicates(donor, phone1, cpf, (err, duplicates) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (duplicates.length > 0) {
        res.status(409).json({ error: 'DUPLICATES_FOUND', duplicates });
        return;
      }
      proceed();
    });
  } else {
    proceed();
  }
});

// v2.5.9 - Atualizar doação COMPLETA (doação + doador)
app.put('/api/doacoes/:id', (req, res) => {
  const { id } = req.params;
  const { 
    // Dados do doador (recebidos do frontend)
    donor, phone1, phone2, contact, cpf,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    // Dados da doação
    amount, type, date, recurring, notes 
  } = req.body;
  
  // 1. Buscar ID do doador
  db.get('SELECT doador_id FROM doacoes WHERE id = ?', [id], (err, doacao) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!doacao) {
      res.status(404).json({ error: 'Doação não encontrada' });
      return;
    }
    
    const doadorId = doacao.doador_id;
    
    // 2. Atualizar dados do doador
    db.run(
      `UPDATE doadores SET 
        nome=?, telefone1=?, telefone2=?, email=?, cpf=?,
        cep=?, logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, estado=?
       WHERE id=?`,
      [donor, phone1, phone2, contact, cpf, cep, logradouro, numero, complemento, bairro, cidade, estado, doadorId],
      function(errDoador) {
        if (errDoador) {
          res.status(500).json({ error: 'Erro ao atualizar doador: ' + errDoador.message });
          return;
        }
        
        // 3. Atualizar dados da doação
        db.run(
          `UPDATE doacoes SET 
            valor=?, tipo=?, data_doacao=?, recorrente=?, observacoes=?
           WHERE id=?`,
          [amount, type, date, recurring ? 1 : 0, notes, id],
          function(errDoacao) {
            if (errDoacao) {
              res.status(500).json({ error: 'Erro ao atualizar doação: ' + errDoacao.message });
              return;
            }
            
            res.json({ 
              message: 'Doação e doador atualizados com sucesso!', 
              changes: this.changes 
            });
          }
        );
      }
    );
  });
});

// v2.5.0 - Deletar doação
app.delete('/api/doacoes/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM parcelas_futuras WHERE doacao_id=?', [id], () => {
    db.run('DELETE FROM historico_pagamentos WHERE doacao_id=?', [id], () => {
      db.run('DELETE FROM doacoes WHERE id=?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Doação excluída!', changes: this.changes });
      });
    });
  });
});

// ============================================================================
// ROTAS - DOADORES
// ============================================================================

// v2.5.0 - Buscar doador específico
app.get('/api/doadores/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT id, nome, email, telefone1, telefone2, cpf, codigo_doador,
           cep, logradouro, numero, complemento, bairro, cidade, estado
    FROM doadores 
    WHERE id = ?
  `, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Doador não encontrado' });
      return;
    }
    res.json(row);
  });
});

// v2.5.0 - Verificar duplicatas
app.post('/api/doadores/check-duplicates', (req, res) => {
  const { nome, telefone1, cpf } = req.body;
  
  checkPossibleDuplicates(nome, telefone1, cpf, (err, duplicates) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(duplicates || []);
  });
});

// ============================================================================
// ROTAS - HISTÓRICO DE PAGAMENTOS
// ============================================================================

// v2.5.0 - Buscar histórico de uma doação
app.get('/api/doacoes/:id/historico', (req, res) => {
  const { id } = req.params;
  
  db.all(
    'SELECT * FROM historico_pagamentos WHERE doacao_id = ? ORDER BY data_pagamento DESC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    }
  );
});

// v2.5.0 - Adicionar pagamento ao histórico
app.post('/api/doacoes/:id/historico', (req, res) => {
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
      res.json({ id: this.lastID, message: 'Pagamento adicionado!' });
    }
  );
});

// v2.5.0 - Deletar pagamento do histórico
app.delete('/api/historico/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM historico_pagamentos WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Pagamento excluído!', changes: this.changes });
  });
});

// ============================================================================
// ROTAS - PARCELAS FUTURAS
// ============================================================================

// v2.5.0 - Buscar parcelas futuras de uma doação
app.get('/api/doacoes/:id/parcelas-futuras', (req, res) => {
  const { id } = req.params;
  
  db.all(
    'SELECT * FROM parcelas_futuras WHERE doacao_id = ? ORDER BY numero_parcela ASC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows || []);
    }
  );
});

// v2.5.8 - Pagar parcela especifica (COM data_pagamento real)
// Data: 13/10/2025 - Registra data real do pagamento para conciliacao
app.post('/api/doacoes/:id/pagar-parcela', (req, res) => {
  const { id } = req.params;
  const { numero_parcela, data_pagamento, valor } = req.body;
  
  // Validar dados
  if (!numero_parcela || !data_pagamento || !valor) {
    res.status(400).json({ error: 'Dados incompletos' });
    return;
  }
  
  // Atualizar status E data_pagamento (data REAL do pagamento)
  db.run(
    'UPDATE parcelas_futuras SET status = ?, data_pagamento = ? WHERE doacao_id = ? AND numero_parcela = ?',
    ['Pago', data_pagamento, id, numero_parcela],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar parcela:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Parcela nao encontrada' });
        return;
      }
      
      console.log('Parcela', numero_parcela, 'paga em', data_pagamento, '- Alteracoes:', this.changes);
      res.json({ 
        message: 'Pagamento registrado com sucesso!',
        parcela: numero_parcela,
        data_pagamento: data_pagamento,
        changes: this.changes
      });
    }
  );
});

// ============================================================================
// ROTAS - RELATÓRIOS
// ============================================================================

// v2.5.9 - Relatório resumo (debugs removidos)
app.get('/api/relatorios/resumo', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_doacoes FROM doacoes',
    `SELECT 
      (COALESCE((SELECT SUM(valor) FROM historico_pagamentos WHERE status IN ("Pago", "PAGO")), 0) + 
       COALESCE((SELECT SUM(valor) FROM parcelas_futuras WHERE status IN ("Pago", "PAGO")), 0)) 
     as total_arrecadado`,
    'SELECT COUNT(*) as doacoes_recorrentes FROM doacoes WHERE recorrente = 1',
    `SELECT 
      (COALESCE((SELECT COUNT(*) FROM historico_pagamentos WHERE status IN ("Pago", "PAGO")), 0) + 
       COALESCE((SELECT COUNT(*) FROM parcelas_futuras WHERE status IN ("Pago", "PAGO")), 0)) 
     as total_pagamentos`
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
      total_doacoes: results[0].total_doacoes || 0,
      total_arrecadado: results[1].total_arrecadado || 0,
      doacoes_recorrentes: results[2].doacoes_recorrentes || 0,
      total_pagamentos: results[3].total_pagamentos || 0
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});
  
 // v2.5.0 - Relatório completo
app.get('/api/relatorios/completo', (req, res) => {
  const queries = [
    'SELECT COUNT(DISTINCT doador_id) as total_doadores FROM doacoes',
    'SELECT COUNT(*) as total_doacoes FROM doacoes',
    'SELECT SUM(valor) as total_arrecadado FROM historico_pagamentos WHERE (status = "Pago" OR status = "PAGO")',
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
    db.all(`
      SELECT d.*, don.nome as nome_doador, don.codigo_doador, 
             don.telefone1, don.telefone2, don.cpf
      FROM doacoes d
      LEFT JOIN doadores don ON d.doador_id = don.id
      ORDER BY d.data_doacao DESC
      LIMIT 100
    `, [], (err, doacoes) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        total_doadores: results[0].total_doadores || 0,
        total_doacoes: results[1].total_doacoes || 0,
        total_arrecadado: results[2].total_arrecadado || 0,
        doacoes_recorrentes: results[3].doacoes_recorrentes || 0,
        doacoes: doacoes || []
      });
    });
  })
  .catch(err => res.status(500).json({ error: err.message }));
});

// ============================================================================
// ROTA PRINCIPAL
// ============================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log('\n🚀 Sistema de Doações v2.5.0 - SERVIDOR LIMPO');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('✅ Servidor iniciado com sucesso!\n');
});

// Fechar conexão ao encerrar
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('\n👋 Banco de dados fechado.');
    process.exit(0);
  });
});