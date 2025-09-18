/**
 * ================================================================
 * SCRIPT: Correção Final do Servidor
 * ================================================================
 * 
 * PROBLEMA: Rota existe no código mas servidor retorna 404
 * CAUSA: Provável erro de sintaxe ou posicionamento incorreto
 * SOLUÇÃO: Reescrever a rota na posição correta
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correção final do servidor...\n');

const serverJsPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverJsPath, 'utf8');

// Backup
fs.writeFileSync(serverJsPath + '.backup_final_' + Date.now(), serverContent);

console.log('📊 Análise atual:');
console.log(`   - Linhas: ${serverContent.split('\n').length}`);
console.log(`   - Rota /pagar-parcela existe: ${serverContent.includes('/pagar-parcela')}`);

// Remover qualquer rota /pagar-parcela existente (pode estar mal posicionada)
console.log('\n🗑️  Removendo rotas duplicadas/incorretas...');
const lines = serverContent.split('\n');
const cleanLines = [];
let skipLines = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('/pagar-parcela')) {
        console.log(`   - Removendo linha ${i+1}: ${line.trim()}`);
        skipLines = true;
        continue;
    }
    
    if (skipLines && line.trim() === '});') {
        console.log(`   - Removendo linha ${i+1}: ${line.trim()}`);
        skipLines = false;
        continue;
    }
    
    if (!skipLines) {
        cleanLines.push(line);
    }
}

serverContent = cleanLines.join('\n');

// Encontrar o local correto para adicionar a rota (depois das outras rotas de histórico)
const insertAfter = 'app.delete(\'/api/historico/:id\'';
const insertIndex = serverContent.indexOf(insertAfter);

if (insertIndex === -1) {
    console.log('⚠️ Ponto de inserção não encontrado, adicionando antes do final...');
    
    // Adicionar antes da inicialização do servidor
    const rotaCompleta = `
// ==============================
// ROTA: PAGAR PARCELA - v1.2.3 FINAL
// ==============================
app.post('/api/doacoes/:id/pagar-parcela', (req, res) => {
  const { id } = req.params;
  const { numero_parcela, data_pagamento, valor } = req.body;
  
  console.log(\`💰 ROTA CHAMADA: Pagando parcela \${numero_parcela} da doação \${id}\`);
  console.log('📦 Dados:', { numero_parcela, data_pagamento, valor });
  
  // Validar dados obrigatórios
  if (!numero_parcela || !data_pagamento || !valor) {
    console.log('❌ Dados incompletos');
    return res.status(400).json({ 
      error: 'Dados obrigatórios: numero_parcela, data_pagamento, valor' 
    });
  }
  
  // Inserir no histórico de pagamentos
  db.run(
    'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
    [id, data_pagamento, valor, 'Pago'],
    function(err) {
      if (err) {
        console.log('❌ Erro SQL:', err.message);
        return res.status(500).json({ error: 'Erro no banco: ' + err.message });
      }
      
      const pagamentoId = this.lastID;
      console.log(\`✅ Pagamento inserido com ID \${pagamentoId}\`);
      
      // Resposta de sucesso
      res.json({ 
        success: true,
        pagamento_id: pagamentoId,
        message: \`Parcela \${numero_parcela} registrada com sucesso!\`
      });
    }
  );
});

`;

    // Inserir antes da linha "// Iniciar servidor"
    if (serverContent.includes('// Iniciar servidor')) {
        serverContent = serverContent.replace('// Iniciar servidor', rotaCompleta + '// Iniciar servidor');
    } else {
        // Se não encontrou, adicionar antes do app.listen
        const listenIndex = serverContent.lastIndexOf('app.listen');
        if (listenIndex > -1) {
            const beforeListen = serverContent.substring(0, listenIndex);
            const afterListen = serverContent.substring(listenIndex);
            serverContent = beforeListen + rotaCompleta + afterListen;
        }
    }
} else {
    console.log('✅ Encontrado ponto de inserção após rotas de histórico');
    
    // Inserir depois da rota delete historico
    const rotaCompleta = `

// Pagar parcela específica
app.post('/api/doacoes/:id/pagar-parcela', (req, res) => {
  const { id } = req.params;
  const { numero_parcela, data_pagamento, valor } = req.body;
  
  console.log(\`💰 PAGANDO PARCELA: \${numero_parcela} da doação \${id}\`);
  console.log('📦 Dados recebidos:', { numero_parcela, data_pagamento, valor });
  
  db.run(
    'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
    [id, data_pagamento, valor, 'Pago'],
    function(err) {
      if (err) {
        console.log('❌ Erro:', err.message);
        return res.status(500).json({ error: err.message });
      }
      
      console.log(\`✅ Pagamento salvo: ID \${this.lastID}\`);
      res.json({ 
        success: true,
        pagamento_id: this.lastID,
        message: \`Parcela \${numero_parcela} paga!\`
      });
    }
  );
});`;

    // Encontrar o final da rota delete para inserir depois
    const deleteEndIndex = serverContent.indexOf('});', insertIndex) + 3;
    const before = serverContent.substring(0, deleteEndIndex);
    const after = serverContent.substring(deleteEndIndex);
    serverContent = before + rotaCompleta + after;
}

// Salvar arquivo corrigido
fs.writeFileSync(serverJsPath, serverContent);

console.log('\n✅ Servidor corrigido!');
console.log('\n📋 Verificação final:');
const finalContent = fs.readFileSync(serverJsPath, 'utf8');
console.log(`   - Linhas: ${finalContent.split('\n').length}`);
console.log(`   - Rota existe: ${finalContent.includes('/pagar-parcela')}`);
console.log(`   - Método POST: ${finalContent.includes("app.post('/api/doacoes/:id/pagar-parcela")}`);

// Mostrar contexto onde a rota foi inserida
const contextLines = finalContent.split('\n');
for (let i = 0; i < contextLines.length; i++) {
    if (contextLines[i].includes('/pagar-parcela')) {
        console.log(`\n📍 Rota na linha ${i+1}:`);
        for (let j = Math.max(0, i-2); j <= Math.min(contextLines.length-1, i+2); j++) {
            const marker = j === i ? '→' : ' ';
            console.log(`${marker} ${j+1}: ${contextLines[j]}`);
        }
        break;
    }
}

console.log('\n🔄 TESTE OBRIGATÓRIO:');
console.log('1. Pare o servidor (Ctrl+C)');
console.log('2. Reinicie: npm start');
console.log('3. Teste pagamento de parcela');
console.log('4. Verifique logs no console do servidor');

console.log('\n📝 LOGS ESPERADOS:');
console.log('💰 PAGANDO PARCELA: 2 da doação 32');
console.log('📦 Dados recebidos: { numero_parcela: 2, data_pagamento: "2025-09-19", valor: 3 }');
console.log('✅ Pagamento salvo: ID 123');