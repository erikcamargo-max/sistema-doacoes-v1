const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados
const db = new sqlite3.Database('./database/doacoes.db', (err) => {
  if (err) {
    console.error('Erro ao conectar com o banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  console.log('🔄 Iniciando upgrade do banco de dados...');
  
  // 1. Adicionar coluna CPF na tabela doadores (se não existir)
  db.run(`ALTER TABLE doadores ADD COLUMN cpf TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna CPF:', err.message);
    } else {
      console.log('✅ Coluna CPF adicionada/verificada');
    }
  });
  
  // 2. Adicionar coluna ID visível na tabela doadores (se não existir)
  db.run(`ALTER TABLE doadores ADD COLUMN codigo_doador TEXT UNIQUE`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Erro ao adicionar coluna codigo_doador:', err.message);
    } else {
      console.log('✅ Coluna codigo_doador adicionada/verificada');
    }
  });
  
  // 3. Gerar códigos para doadores existentes (se não tiverem)
  db.all('SELECT id, nome FROM doadores WHERE codigo_doador IS NULL OR codigo_doador = ""', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar doadores:', err.message);
      return;
    }
    
    console.log(`🔄 Atualizando ${rows.length} doadores sem código...`);
    
    rows.forEach((row, index) => {
      // Gerar código único: D + ID com padding + iniciais do nome
      const iniciais = row.nome.split(' ')
        .map(palavra => palavra.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3); // Máximo 3 iniciais
      
      const codigo = `D${row.id.toString().padStart(3, '0')}-${iniciais}`;
      
      db.run(
        'UPDATE doadores SET codigo_doador = ? WHERE id = ?',
        [codigo, row.id],
        function(err) {
          if (err) {
            console.error(`Erro ao atualizar doador ${row.id}:`, err.message);
          } else {
            console.log(`✅ Doador ${row.nome} → Código: ${codigo}`);
          }
        }
      );
    });
  });
  
  // 4. Criar índices únicos para evitar duplicatas
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_doadores_cpf ON doadores(cpf) WHERE cpf IS NOT NULL AND cpf != ''`, (err) => {
    if (err) {
      console.error('Erro ao criar índice CPF:', err.message);
    } else {
      console.log('✅ Índice único CPF criado');
    }
  });
  
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_doadores_codigo ON doadores(codigo_doador)`, (err) => {
    if (err) {
      console.error('Erro ao criar índice código:', err.message);
    } else {
      console.log('✅ Índice único código criado');
    }
  });
  
  // 5. Criar índice para busca por nome + telefone (detectar duplicatas)
  db.run(`CREATE INDEX IF NOT EXISTS idx_doadores_nome_telefone ON doadores(nome, telefone1)`, (err) => {
    if (err) {
      console.error('Erro ao criar índice nome+telefone:', err.message);
    } else {
      console.log('✅ Índice nome+telefone criado');
    }
  });
  
  console.log('🎉 Upgrade do banco de dados concluído!');
  console.log('');
  console.log('📋 Novos campos adicionados:');
  console.log('   - doadores.cpf (TEXT, UNIQUE)');
  console.log('   - doadores.codigo_doador (TEXT, UNIQUE)');
  console.log('');
  console.log('🔒 Proteções implementadas:');
  console.log('   - CPF único por doador');
  console.log('   - Código único gerado automaticamente');
  console.log('   - Índices para detectar duplicatas');
  console.log('');
  console.log('✅ Execute "npm start" para usar o sistema atualizado');
});

db.close((err) => {
  if (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
  } else {
    console.log('Conexão com o banco de dados fechada.');
  }
});