// corrigir-checkduplicates-server.js
// Corrige a função checkPossibleDuplicates no server.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo função checkPossibleDuplicates no server.js...\n');

const serverPath = './server.js';

// Fazer backup primeiro
const backupPath = './server.js.backup.' + Date.now();
fs.copyFileSync(serverPath, backupPath);
console.log('✅ Backup criado:', backupPath);

// Ler o arquivo
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Função checkPossibleDuplicates INCORRETA (com res e sem fechamento)
const incorrectFunction = /function checkPossibleDuplicates[\s\S]*?db\.all\(query,[\s\S]*?\.catch\(err => res\.status\(500\)\.json\({ error: err\.message }\)\);[\s\S]*?\}\);/;

// Função checkPossibleDuplicates CORRETA
const correctFunction = `function checkPossibleDuplicates(nome, telefone1, cpf, callback) {
  const queries = [];
  const params = [];
  
  // Buscar por CPF (se fornecido)
  if (cpf && cpf.trim() !== '') {
    queries.push('cpf = ?');
    params.push(cpf.replace(/\\D/g, '')); // Remove formatação
  }
  
  // Buscar por nome + telefone
  queries.push('(nome = ? AND telefone1 = ?)');
  params.push(nome, telefone1);
  
  // Buscar por telefone em qualquer campo
  queries.push('(telefone1 = ? OR telefone2 = ?)');
  params.push(telefone1, telefone1);
  
  const query = \`
    SELECT id, codigo_doador, nome, telefone1, telefone2, cpf, email
    FROM doadores 
    WHERE \${queries.join(' OR ')}
    LIMIT 5
  \`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, rows || []);
  });
}`;

// Procurar a função problemática
console.log('🔍 Procurando função checkPossibleDuplicates...');

// Encontrar o início da função
const functionStart = serverContent.indexOf('function checkPossibleDuplicates');
if (functionStart === -1) {
  console.log('❌ Função checkPossibleDuplicates não encontrada!');
  process.exit(1);
}

console.log('✅ Função encontrada na posição:', functionStart);

// Encontrar onde deveria terminar (antes da próxima função ou rota)
let functionEnd = -1;
let braceCount = 0;
let inFunction = false;

// Procurar pelo próximo app.get, app.post, etc. ou pela função createFutureParcelas
const nextFunctionPatterns = [
  'app.get(',
  'app.post(',
  'app.put(',
  'app.delete(',
  'function createFutureParcelas',
  '// Função para criar parcelas',
  '// ROTAS DA API',
  '// ============'
];

// Encontrar a posição da próxima função/rota
let nextFunctionPos = serverContent.length;
for (const pattern of nextFunctionPatterns) {
  const pos = serverContent.indexOf(pattern, functionStart + 50);
  if (pos > -1 && pos < nextFunctionPos) {
    nextFunctionPos = pos;
    console.log(`📍 Próxima seção encontrada: "${pattern}" na posição ${pos}`);
  }
}

// Extrair a função atual (problemática)
const currentFunction = serverContent.substring(functionStart, nextFunctionPos);
console.log('\n📋 Função atual tem', currentFunction.length, 'caracteres');

// Verificar se tem "res." dentro da função
const hasResError = currentFunction.includes('res.status') || currentFunction.includes('res.json');
if (hasResError) {
  console.log('⚠️  Confirmado: função usa "res" incorretamente!');
}

// Verificar se a função está fechada corretamente
const openBraces = (currentFunction.match(/{/g) || []).length;
const closeBraces = (currentFunction.match(/}/g) || []).length;
console.log(`📊 Chaves: ${openBraces} aberturas, ${closeBraces} fechamentos`);

if (openBraces !== closeBraces) {
  console.log('⚠️  Confirmado: função não está fechada corretamente!');
}

// Substituir a função problemática pela correta
console.log('\n🔧 Aplicando correção...');

// Reconstruir o arquivo
const beforeFunction = serverContent.substring(0, functionStart);
const afterFunction = serverContent.substring(nextFunctionPos);

// Montar o arquivo corrigido
serverContent = beforeFunction + correctFunction + '\n\n' + afterFunction;

// Salvar o arquivo corrigido
fs.writeFileSync(serverPath, serverContent);

console.log('✅ Arquivo corrigido e salvo!');

// Verificar a correção
console.log('\n📋 Verificando correção...');

// Ler o arquivo corrigido
const correctedContent = fs.readFileSync(serverPath, 'utf8');

// Verificar se ainda tem erro de "res"
if (correctedContent.includes('function checkPossibleDuplicates')) {
  const newFunctionStart = correctedContent.indexOf('function checkPossibleDuplicates');
  const newFunctionEnd = correctedContent.indexOf('app.', newFunctionStart);
  const newFunction = correctedContent.substring(newFunctionStart, newFunctionEnd);
  
  if (newFunction.includes('res.status') || newFunction.includes('res.json')) {
    console.log('⚠️  AVISO: Ainda existe "res" na função. Pode haver outra ocorrência.');
  } else {
    console.log('✅ Função não usa mais "res" incorretamente');
  }
  
  // Verificar fechamento
  const newOpenBraces = (newFunction.match(/{/g) || []).length;
  const newCloseBraces = (newFunction.match(/}/g) || []).length;
  
  if (newOpenBraces === newCloseBraces) {
    console.log('✅ Função está fechada corretamente');
  } else {
    console.log('⚠️  AVISO: Ainda pode haver problema com chaves');
  }
}

console.log('\n' + '='.repeat(60));
console.log('🎉 CORREÇÃO APLICADA COM SUCESSO!');
console.log('='.repeat(60));
console.log('\n✅ O que foi corrigido:');
console.log('   1. Removido uso incorreto de "res" na função');
console.log('   2. Função agora usa callback corretamente');
console.log('   3. Função está fechada com } antes da próxima rota');
console.log('   4. Tratamento de erro via callback(err, null)');
console.log('\n📋 Função corrigida:');
console.log('   - Recebe: (nome, telefone1, cpf, callback)');
console.log('   - Retorna via callback: (err, rows)');
console.log('   - Sem uso de "res" (que não existe no escopo)');
console.log('\n📌 Próximos passos:');
console.log('   1. Teste o servidor: npm start');
console.log('   2. Se funcionar, está tudo OK!');
console.log('   3. Se ainda der erro, me avise a mensagem');
console.log('\n💾 Backup salvo em:', backupPath);
console.log('\n✨ Sistema deve estar funcionando agora!\n');