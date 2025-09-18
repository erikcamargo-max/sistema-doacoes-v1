/**
 * ================================================================
 * SCRIPT: Verificar e Corrigir Servidor
 * ================================================================
 * 
 * PROBLEMA: Erro 404 na rota /pagar-parcela
 * SOLUÇÃO: Verificar se rota existe e funcionando
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando servidor...\n');

const serverJsPath = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverJsPath, 'utf8');

console.log('📊 Analisando server.js:');
console.log(`   - Linhas: ${serverContent.split('\n').length}`);
console.log(`   - Tamanho: ${Math.round(serverContent.length / 1024)} KB`);

// Verificar se rota existe
const hasRoute = serverContent.includes('/pagar-parcela');
console.log(`   - Rota /pagar-parcela: ${hasRoute ? '✅ Encontrada' : '❌ NÃO encontrada'}`);

if (hasRoute) {
    // Extrair e mostrar as linhas da rota
    const lines = serverContent.split('\n');
    const routeLines = [];
    let inRoute = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.includes('/pagar-parcela')) {
            inRoute = true;
            routeLines.push(`${i+1}: ${line}`);
        } else if (inRoute && line.trim() === '});') {
            routeLines.push(`${i+1}: ${line}`);
            break;
        } else if (inRoute) {
            routeLines.push(`${i+1}: ${line}`);
        }
    }
    
    console.log('\n📋 Rota encontrada:');
    routeLines.forEach(line => console.log(`   ${line}`));
    
} else {
    console.log('\n❌ PROBLEMA: Rota não foi adicionada corretamente!');
    console.log('\n🔧 ADICIONANDO ROTA AGORA...');
    
    // Backup
    fs.writeFileSync(serverJsPath + '.backup_rota_' + Date.now(), serverContent);
    
    // Adicionar rota correta
    const rotaCorreta = `
// Pagar parcela específica - v1.2.3
app.post('/api/doacoes/:id/pagar-parcela', (req, res) => {
  const { id } = req.params;
  const { numero_parcela, data_pagamento, valor } = req.body;
  
  console.log(\`💰 Pagando parcela \${numero_parcela} da doação \${id}\`);
  console.log('📦 Dados recebidos:', { numero_parcela, data_pagamento, valor });
  
  // Validar dados
  if (!numero_parcela || !data_pagamento || !valor) {
    return res.status(400).json({ 
      error: 'Dados incompletos: número_parcela, data_pagamento e valor são obrigatórios' 
    });
  }
  
  // Inserir pagamento no histórico
  db.run(
    'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
    [id, data_pagamento, valor, 'Pago'],
    function(err) {
      if (err) {
        console.error('❌ Erro SQL:', err);
        return res.status(500).json({ error: 'Erro ao salvar pagamento: ' + err.message });
      }
      
      console.log(\`✅ Pagamento salvo com ID \${this.lastID}\`);
      
      // Atualizar parcela futura (opcional)
      db.run(
        'UPDATE parcelas_futuras SET status = ? WHERE doacao_id = ? AND numero_parcela = ?',
        ['Pago', id, numero_parcela],
        (updateErr) => {
          if (updateErr) {
            console.warn('⚠️ Parcela futura não atualizada:', updateErr.message);
          } else {
            console.log('✅ Parcela futura atualizada');
          }
        }
      );
      
      res.json({ 
        success: true,
        pagamento_id: this.lastID,
        message: \`Parcela \${numero_parcela} paga com sucesso!\`
      });
    }
  );
});
`;
    
    // Procurar onde inserir (antes do "Iniciar servidor")
    const insertPoint = '// Iniciar servidor';
    if (serverContent.includes(insertPoint)) {
        const serverUpdated = serverContent.replace(insertPoint, rotaCorreta + '\n' + insertPoint);
        fs.writeFileSync(serverJsPath, serverUpdated);
        console.log('✅ Rota adicionada com sucesso!');
    } else {
        // Se não encontrou o ponto de inserção, adicionar no final antes da última linha
        const lines = serverContent.split('\n');
        const lastLineIndex = lines.length - 1;
        lines.splice(lastLineIndex, 0, rotaCorreta);
        fs.writeFileSync(serverJsPath, lines.join('\n'));
        console.log('✅ Rota adicionada no final do arquivo!');
    }
}

// Verificar outras rotas importantes
console.log('\n🛣️  Outras rotas encontradas:');
const routes = [
    'GET /api/doacoes',
    'POST /api/doacoes', 
    'GET /api/doacoes/:id',
    'GET /api/doacoes/:id/historico',
    'POST /api/doacoes/:id/historico'
];

routes.forEach(route => {
    const method = route.split(' ')[0].toLowerCase();
    const path = route.split(' ')[1];
    const pattern = new RegExp(`app\\.${method}\\s*\\(\\s*['"\`]${path.replace(/:\w+/g, ':[^\'"`\\s]*')}['"\`]`, 'i');
    const found = pattern.test(serverContent);
    console.log(`   ${found ? '✅' : '❌'} ${route}`);
});

console.log('\n🔄 PRÓXIMOS PASSOS:');
console.log('1. Reinicie o servidor: npm start');
console.log('2. Teste o pagamento da parcela');
console.log('3. Verifique o console do servidor para logs');

console.log('\n📝 LOGS ESPERADOS NO SERVIDOR:');
console.log('💰 Pagando parcela 2 da doação 32');
console.log('📦 Dados recebidos: { numero_parcela: 2, data_pagamento: "2025-09-18", valor: 3 }');
console.log('✅ Pagamento salvo com ID 123');