// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Importar configurações e rotas
const { initDatabase, getDb } = require('./config/database');
const routes = require('./routes');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Log simples de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Inicializar banco de dados
initDatabase();

// Rotas da API principal
app.use('/api', routes);

// ========================================
// ROTAS ADICIONAIS PARA CARNÊ E EXPORTAÇÃO PDF
// ========================================

// Buscar doador específico por ID
app.get('/api/doadores/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.get(`
    SELECT id, nome, email, telefone1, telefone2, cpf, codigo_doador,
           cep, logradouro, numero, complemento, bairro, cidade, estado
    FROM doadores 
    WHERE id = ?
  `, [id], (err, row) => {
    if (err) {
      logger.error(`Erro ao buscar doador ${id}:`, err.message);
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

// Buscar doação específica por ID
app.get('/api/doacoes/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.get(`
    SELECT d.*, 
           don.nome as nome_doador, 
           don.codigo_doador, 
           don.telefone1,
           don.telefone2,
           don.cpf,
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
  `, [id], (err, row) => {
    if (err) {
      logger.error(`Erro ao buscar doação ${id}:`, err.message);
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

// Buscar histórico de pagamentos de uma doação
app.get('/api/doacoes/:id/historico', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.all(`
    SELECT * FROM historico_pagamentos
    WHERE doacao_id = ?
    ORDER BY data_pagamento DESC
  `, [id], (err, rows) => {
    if (err) {
      logger.error(`Erro ao buscar histórico da doação ${id}:`, err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Buscar parcelas futuras de uma doação
app.get('/api/doacoes/:id/parcelas', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.all(`
    SELECT * FROM parcelas_futuras
    WHERE doacao_id = ?
    ORDER BY data_vencimento ASC
  `, [id], (err, rows) => {
    if (err) {
      logger.error(`Erro ao buscar parcelas da doação ${id}:`, err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// Relatório resumo (já deve existir em routes, mas caso não exista)
app.get('/api/relatorios/resumo', (req, res) => {
  const db = getDb();
  
  const queries = {
    total_doacoes: 'SELECT COUNT(*) as count FROM doacoes',
    total_arrecadado: 'SELECT SUM(valor) as total FROM historico_pagamentos WHERE status = "Pago"',
    doacoes_recorrentes: 'SELECT COUNT(*) as count FROM doacoes WHERE recorrente = 1',
    total_pagamentos: 'SELECT COUNT(*) as count FROM historico_pagamentos WHERE status = "Pago"'
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.keys(queries).forEach(key => {
    db.get(queries[key], [], (err, row) => {
      if (err) {
        logger.error(`Erro na query ${key}:`, err.message);
      }
      
      if (key === 'total_arrecadado') {
        results[key] = row?.total || 0;
      } else {
        results[key] = row?.count || 0;
      }
      
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Relatório completo para exportação em PDF
app.get('/api/relatorios/completo', (req, res) => {
  const db = getDb();
  
  // Queries para o resumo
  const summaryQueries = [
    { key: 'total_doadores', query: 'SELECT COUNT(DISTINCT doador_id) as value FROM doacoes' },
    { key: 'total_doacoes', query: 'SELECT COUNT(*) as value FROM doacoes' },
    { key: 'total_arrecadado', query: 'SELECT COALESCE(SUM(valor), 0) as value FROM historico_pagamentos WHERE status = "Pago"' },
    { key: 'doacoes_recorrentes', query: 'SELECT COUNT(*) as value FROM doacoes WHERE recorrente = 1' }
  ];
  
  // Executar queries de resumo em paralelo
  Promise.all(summaryQueries.map(item => {
    return new Promise((resolve, reject) => {
      db.get(item.query, [], (err, row) => {
        if (err) {
          logger.error(`Erro na query ${item.key}:`, err.message);
          reject(err);
        } else {
          resolve({ [item.key]: row?.value || 0 });
        }
      });
    });
  }))
  .then(summaryResults => {
    // Combinar resultados do resumo
    const summary = Object.assign({}, ...summaryResults);
    
    // Buscar doações detalhadas
    db.all(`
      SELECT 
        d.id,
        d.valor,
        d.tipo,
        d.data_doacao,
        d.recorrente,
        d.observacoes,
        don.nome as nome_doador,
        don.codigo_doador,
        don.telefone1,
        don.telefone2,
        don.cpf,
        don.email,
        don.cep,
        don.logradouro,
        don.numero,
        don.bairro,
        don.cidade,
        don.estado
      FROM doacoes d
      LEFT JOIN doadores don ON d.doador_id = don.id
      ORDER BY d.data_doacao DESC
      LIMIT 100
    `, [], (err, doacoes) => {
      if (err) {
        logger.error('Erro ao buscar doações detalhadas:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Retornar resultado completo
      res.json({
        ...summary,
        doacoes: doacoes || []
      });
    });
  })
  .catch(err => {
    logger.error('Erro ao gerar relatório completo:', err.message);
    res.status(500).json({ error: err.message });
  });
});

// Lista de todas as doações (caso não exista em routes)
app.get('/api/doacoes', (req, res) => {
  const db = getDb();
  
  db.all(`
    SELECT 
      d.*,
      don.nome as nome_doador,
      don.codigo_doador,
      don.telefone1,
      don.telefone2
    FROM doacoes d
    LEFT JOIN doadores don ON d.doador_id = don.id
    ORDER BY d.data_doacao DESC
  `, [], (err, rows) => {
    if (err) {
      logger.error('Erro ao buscar doações:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows || []);
  });
});

// ========================================
// ROTA PRINCIPAL - SERVIR HTML
// ========================================

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 para rotas não encontradas
app.use((req, res) => {
  logger.warn(`404 - Rota não encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling geral
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  console.log(`\n🚀 Sistema de Doações v1.1.0`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log(`📊 API Base: http://localhost:${PORT}/api`);
  console.log(`✅ Servidor iniciado com sucesso!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});

module.exports = app;