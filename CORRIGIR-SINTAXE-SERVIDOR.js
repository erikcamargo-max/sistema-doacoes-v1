/**
 * ================================================================
 * SCRIPT: Corrigir Erro de Sintaxe no Servidor
 * ================================================================
 * 
 * ERRO: SyntaxError: missing ) after argument list na linha 625
 * SOLUÇÃO: Encontrar e corrigir o erro de sintaxe
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo erro de sintaxe...\n');

const serverJsPath = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverJsPath, 'utf8');
const lines = serverContent.split('\n');

// Backup
fs.writeFileSync(serverJsPath + '.backup_syntax_' + Date.now(), serverContent);

console.log('🔍 Analisando linha 625 e contexto:');
const errorLine = 625;

for (let i = errorLine - 5; i <= errorLine + 5; i++) {
    if (i >= 0 && i < lines.length) {
        const marker = i === errorLine - 1 ? '❌' : '  ';
        console.log(`${marker} ${i+1}: ${lines[i]}`);
    }
}

// Procurar por problemas comuns de sintaxe
console.log('\n🔍 Procurando problemas de sintaxe...');

let hasError = false;
const corrections = [];

// Verificar se existe backup funcional
const backupFiles = require('fs').readdirSync('.')
    .filter(f => f.startsWith('server.js.backup') && !f.includes('syntax'))
    .sort()
    .reverse();

if (backupFiles.length > 0) {
    console.log(`\n💡 Encontrados ${backupFiles.length} backups:`);
    backupFiles.slice(0, 3).forEach(f => console.log(`   - ${f}`));
    
    console.log('\n🔄 Restaurando do backup mais recente...');
    const latestBackup = backupFiles[0];
    const backupContent = fs.readFileSync(latestBackup, 'utf8');
    
    // Adicionar a rota correta ao backup
    const rotaCorreta = `
// Pagar parcela específica
app.post('/api/doacoes/:id/pagar-parcela', (req, res) => {
  const { id } = req.params;
  const { numero_parcela, data_pagamento, valor } = req.body;
  
  console.log(\`💰 PAGANDO PARCELA: \${numero_parcela} da doação \${id}\`);
  console.log('📦 Dados:', { numero_parcela, data_pagamento, valor });
  
  if (!numero_parcela || !data_pagamento || !valor) {
    return res.status(400).json({ error: 'Dados obrigatórios faltando' });
  }
  
  db.run(
    'INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status) VALUES (?, ?, ?, ?)',
    [id, data_pagamento, valor, 'Pago'],
    function(err) {
      if (err) {
        console.log('❌ Erro SQL:', err.message);
        return res.status(500).json({ error: err.message });
      }
      
      console.log(\`✅ Pagamento salvo: ID \${this.lastID}\`);
      res.json({ 
        success: true,
        pagamento_id: this.lastID,
        message: \`Parcela \${numero_parcela} registrada!\`
      });
    }
  );
});
`;

    // Encontrar local seguro para inserir (antes do app.listen)
    let restoredContent = backupContent;
    
    // Procurar por app.listen
    const listenIndex = restoredContent.lastIndexOf('app.listen');
    if (listenIndex > -1) {
        const before = restoredContent.substring(0, listenIndex);
        const after = restoredContent.substring(listenIndex);
        restoredContent = before + rotaCorreta + '\n' + after;
        
        // Salvar servidor restaurado
        fs.writeFileSync(serverJsPath, restoredContent);
        
        console.log('✅ Servidor restaurado do backup com rota adicionada');
        console.log(`   - Backup usado: ${latestBackup}`);
        console.log(`   - Rota inserida antes de app.listen`);
        
    } else {
        console.log('⚠️ app.listen não encontrado, adicionando no final');
        restoredContent = backupContent + rotaCorreta;
        fs.writeFileSync(serverJsPath, restoredContent);
        console.log('✅ Servidor restaurado com rota no final');
    }
    
} else {
    console.log('\n❌ Nenhum backup encontrado para restaurar');
    console.log('Tentando corrigir o arquivo atual...');
    
    // Tentar corrigir problemas comuns
    let fixedContent = serverContent;
    
    // Corrigir parênteses desbalanceados
    const openParens = (fixedContent.match(/\(/g) || []).length;
    const closeParens = (fixedContent.match(/\)/g) || []).length;
    
    console.log(`   - Parênteses abertos: ${openParens}`);
    console.log(`   - Parênteses fechados: ${closeParens}`);
    
    if (openParens !== closeParens) {
        console.log('❌ Parênteses desbalanceados detectados');
        
        // Adicionar parênteses faltantes no final se necessário
        const diff = openParens - closeParens;
        if (diff > 0) {
            fixedContent += ')'.repeat(diff);
            console.log(`✅ Adicionados ${diff} parênteses de fechamento`);
        }
    }
    
    // Verificar chaves
    const openBraces = (fixedContent.match(/\{/g) || []).length;
    const closeBraces = (fixedContent.match(/\}/g) || []).length;
    
    console.log(`   - Chaves abertas: ${openBraces}`);
    console.log(`   - Chaves fechadas: ${closeBraces}`);
    
    if (openBraces !== closeBraces) {
        console.log('❌ Chaves desbalanceadas detectadas');
        
        const diff = openBraces - closeBraces;
        if (diff > 0) {
            fixedContent += '}'.repeat(diff);
            console.log(`✅ Adicionadas ${diff} chaves de fechamento`);
        }
    }
    
    fs.writeFileSync(serverJsPath, fixedContent);
    console.log('✅ Correções aplicadas');
}

// Verificação final
const finalContent = fs.readFileSync(serverJsPath, 'utf8');
console.log('\n📋 Verificação final:');
console.log(`   - Linhas: ${finalContent.split('\n').length}`);
console.log(`   - Rota pagar-parcela: ${finalContent.includes('/pagar-parcela') ? '✅' : '❌'}`);
console.log(`   - app.listen: ${finalContent.includes('app.listen') ? '✅' : '❌'}`);

console.log('\n🔄 TESTE AGORA:');
console.log('npm start');
console.log('\nSe ainda der erro, me informe a nova mensagem de erro.');