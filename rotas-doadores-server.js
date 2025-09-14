
// ==============================
// ADICIONAR ESTAS ROTAS NO SERVER.JS
// ==============================

// Copie e cole estas rotas no seu server.js, após as rotas de doações

// Listar todos os doadores
app.get('/api/doadores', (req, res) => {
  console.log('[API] GET /api/doadores');
  
  db.all(`
    SELECT 
      id,
      nome,
      email,
      telefone1,
      telefone2,
      cpf,
      codigo_doador,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      created_at
    FROM doadores 
    ORDER BY nome ASC
  `, [], (err, rows) => {
    if (err) {
      console.error('[API] Erro ao buscar doadores:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`[API] ${rows.length} doadores encontrados`);
    res.json(rows || []);
  });
});

// Buscar doador específico
app.get('/api/doadores/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[API] GET /api/doadores/${id}`);
  
  db.get(`
    SELECT * FROM doadores WHERE id = ?
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

// Criar novo doador
app.post('/api/doadores', (req, res) => {
  console.log('[API] POST /api/doadores', req.body);
  
  const {
    nome,
    email,
    telefone1,
    telefone2,
    cpf,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado
  } = req.body;
  
  // Gerar código único
  const codigo_doador = 'D' + String(Date.now()).slice(-3) + '-' + 
                       Math.random().toString(36).substring(2, 5).toUpperCase();
  
  db.run(`
    INSERT INTO doadores (
      nome, email, telefone1, telefone2, cpf, codigo_doador,
      cep, logradouro, numero, complemento, bairro, cidade, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    nome, email, telefone1, telefone2, cpf, codigo_doador,
    cep, logradouro, numero, complemento, bairro, cidade, estado
  ], function(err) {
    if (err) {
      console.error('[API] Erro ao criar doador:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    console.log(`[API] Doador criado com ID: ${this.lastID}`);
    res.json({ 
      id: this.lastID, 
      codigo_doador,
      message: 'Doador criado com sucesso!' 
    });
  });
});

// Atualizar doador
app.put('/api/doadores/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[API] PUT /api/doadores/${id}`, req.body);
  
  const {
    nome,
    email,
    telefone1,
    telefone2,
    cpf,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado
  } = req.body;
  
  db.run(`
    UPDATE doadores SET
      nome = ?,
      email = ?,
      telefone1 = ?,
      telefone2 = ?,
      cpf = ?,
      cep = ?,
      logradouro = ?,
      numero = ?,
      complemento = ?,
      bairro = ?,
      cidade = ?,
      estado = ?
    WHERE id = ?
  `, [
    nome, email, telefone1, telefone2, cpf,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    id
  ], function(err) {
    if (err) {
      console.error('[API] Erro ao atualizar doador:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Doador não encontrado' });
      return;
    }
    
    console.log(`[API] Doador ${id} atualizado`);
    res.json({ 
      id: Number(id),
      message: 'Doador atualizado com sucesso!',
      changes: this.changes 
    });
  });
});

// Deletar doador
app.delete('/api/doadores/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[API] DELETE /api/doadores/${id}`);
  
  // Verificar se tem doações vinculadas
  db.get(`
    SELECT COUNT(*) as total FROM doacoes WHERE doador_id = ?
  `, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.total > 0) {
      res.status(400).json({ 
        error: `Este doador possui ${row.total} doação(ões) vinculada(s). Não é possível excluir.`
      });
      return;
    }
    
    // Se não tem doações, pode deletar
    db.run('DELETE FROM doadores WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('[API] Erro ao deletar doador:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Doador não encontrado' });
        return;
      }
      
      console.log(`[API] Doador ${id} deletado`);
      res.json({ 
        message: 'Doador excluído com sucesso!',
        changes: this.changes 
      });
    });
  });
});

// Verificar duplicatas
app.post('/api/doadores/check-duplicates', (req, res) => {
  const { cpf, telefone1 } = req.body;
  console.log('[API] Verificando duplicatas:', { cpf, telefone1 });
  
  db.all(`
    SELECT id, nome, cpf, telefone1 
    FROM doadores 
    WHERE cpf = ? OR telefone1 = ?
  `, [cpf, telefone1], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({
      hasDuplicates: rows.length > 0,
      duplicates: rows
    });
  });
});
