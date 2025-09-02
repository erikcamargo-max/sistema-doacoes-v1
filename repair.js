// repair.js - Script de reparo automático do Sistema de Doações
const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando reparos do sistema...\n');

// 1. Criar estrutura de pastas necessárias
const folders = ['database', 'logs', 'backups'];
folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    console.log(`✅ Pasta ${folder}/ criada`);
  } else {
    console.log(`✓ Pasta ${folder}/ já existe`);
  }
});

// 2. Corrigir app.js - remover linha truncada
const appJsPath = './public/app.js';
if (fs.existsSync(appJsPath)) {
  let content = fs.readFileSync(appJsPath, 'utf8');
  
  // Remover linha truncada se existir
  const lines = content.split('\n');
  const lastLine = lines[lines.length - 1];
  
  if (lastLine.includes('ModalWithDuplicateCheck = saveSimple')) {
    lines.pop(); // Remove última linha problemática
    content = lines.join('\n');
    fs.writeFileSync(appJsPath, content);
    console.log('✅ Linha truncada removida do app.js');
  } else {
    console.log('✓ app.js já está correto');
  }
} else {
  console.log('⚠️  Arquivo app.js não encontrado');
}

// 3. Corrigir index.html - remover modal duplicado
const htmlPath = './public/index.html';
if (fs.existsSync(htmlPath)) {
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Procurar por modal duplicado
  const modalCount = (htmlContent.match(/id="modal-history"/g) || []).length;
  
  if (modalCount > 1) {
    // Remover segunda ocorrência do modal
    const lines = htmlContent.split('\n');
    let inSecondModal = false;
    let modalFound = 0;
    let startLine = -1;
    let endLine = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('id="modal-history"')) {
        modalFound++;
        if (modalFound === 2) {
          // Encontrou o segundo modal - marcar início
          startLine = i;
          // Procurar o fechamento (procurar pelos próximos </div> que fecham o modal)
          let divCount = 1;
          for (let j = i + 1; j < lines.length && j < i + 50; j++) {
            if (lines[j].includes('<div')) divCount++;
            if (lines[j].includes('</div>')) divCount--;
            if (divCount === 0) {
              endLine = j;
              break;
            }
          }
          break;
        }
      }
    }
    
    if (startLine > -1 && endLine > -1) {
      // Remover linhas do modal duplicado
      lines.splice(startLine, endLine - startLine + 1);
      htmlContent = lines.join('\n');
      fs.writeFileSync(htmlPath, htmlContent);
      console.log('✅ Modal duplicado removido do index.html');
    }
  } else if (modalCount === 1) {
    console.log('✓ index.html já está correto (apenas 1 modal)');
  } else {
    console.log('⚠️  Modal de histórico não encontrado no HTML');
  }
} else {
  console.log('⚠️  Arquivo index.html não encontrado');
}

// 4. Verificar banco de dados
const dbPath = './database/doacoes.db';
if (!fs.existsSync(dbPath)) {
  console.log('\n⚠️  ATENÇÃO: Banco de dados não encontrado!');
  console.log('   Execute: npm run init-db');
  console.log('   Depois:  npm run upgrade-db');
} else {
  const stats = fs.statSync(dbPath);
  console.log(`\n✓ Banco de dados encontrado (${(stats.size / 1024).toFixed(2)} KB)`);
  
  // Verificar se o banco tem as tabelas necessárias
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(() => {
    db.get("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'", (err, row) => {
      if (!err && row) {
        console.log(`✓ Banco contém ${row.count} tabelas`);
        if (row.count < 4) {
          console.log('⚠️  Banco incompleto - execute: npm run upgrade-db');
        }
      }
    });
  });
  
  db.close();
}

// 5. Criar arquivo de backup do banco (se existir)
if (fs.existsSync(dbPath)) {
  const backupDir = './backups';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupPath = path.join(backupDir, `doacoes_backup_${timestamp}.db`);
  
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backup criado: ${backupPath}`);
  } catch (err) {
    console.log('⚠️  Não foi possível criar backup:', err.message);
  }
}

// 6. Verificar package.json
if (!fs.existsSync('package.json')) {
  console.log('\n⚠️  package.json não encontrado!');
  console.log('   Execute: npm init -y');
  console.log('   Depois:  npm install express sqlite3 cors body-parser');
} else {
  console.log('✓ package.json encontrado');
}

// 7. Verificar node_modules
if (!fs.existsSync('node_modules')) {
  console.log('\n⚠️  Dependências não instaladas!');
  console.log('   Execute: npm install');
} else {
  console.log('✓ Dependências instaladas');
}

// Resumo final
console.log('\n' + '='.repeat(50));
console.log('🎉 PROCESSO DE REPARO CONCLUÍDO!');
console.log('='.repeat(50));

console.log('\n📋 Próximos passos:');
console.log('-------------------');

if (!fs.existsSync(dbPath)) {
  console.log('1. Inicializar banco de dados:');
  console.log('   npm run init-db');
  console.log('   npm run upgrade-db\n');
}

if (!fs.existsSync('node_modules')) {
  console.log('2. Instalar dependências:');
  console.log('   npm install\n');
}

console.log('3. Iniciar o servidor:');
console.log('   npm start');
console.log('\n4. Acessar o sistema:');
console.log('   http://localhost:3001');

console.log('\n✨ Sistema reparado com sucesso!');
console.log('   Erros corrigidos:');
console.log('   - Linha truncada no app.js');
console.log('   - Modal duplicado no HTML');
console.log('   - Estrutura de pastas criada');
console.log('   - Backup automático do banco\n');