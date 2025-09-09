/**
 * ================================================================
 * SCRIPT: Backup Completo do Sistema
 * ================================================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 08/09/2025
 * FASE: 1 - ESTABILIZAÇÃO
 * ETAPA: 1.1 - Backup Completo
 * 
 * DESCRIÇÃO:
 * Cria backup completo de todos os arquivos críticos do sistema
 * antes de iniciar processo de refatoração.
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

// Configuração
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
const BACKUP_DIR = path.join(__dirname, 'backups', `backup_${TIMESTAMP}`);

// Lista de arquivos/pastas para backup
const BACKUP_LIST = [
    'server.js',
    'package.json',
    'package-lock.json',
    'CONTROLE_VERSAO.md',
    'CHANGELOG.md',
    'public/index.html',
    'public/app.js',
    'database/doacoes.db',
    'scripts/init-database.js',
    'scripts/upgrade-database.js'
];

// Verificar se existe banco duplicado na raiz
const POSSIBLE_DUPLICATE_DB = [
    'doacoes.db',
    'database.db',
    'sistema.db',
    'doacao.db'
];

console.log('╔════════════════════════════════════════════════════╗');
console.log('║         BACKUP COMPLETO DO SISTEMA v1.1.5          ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}`);
console.log(`📁 Diretório de backup: ${BACKUP_DIR}\n`);

// Função para copiar arquivo
function copyFile(source, destination) {
    try {
        const destDir = path.dirname(destination);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, destination);
            const stats = fs.statSync(source);
            const size = (stats.size / 1024).toFixed(2);
            console.log(`✅ ${source} (${size} KB)`);
            return true;
        } else {
            console.log(`⚠️  ${source} - arquivo não encontrado`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Erro ao copiar ${source}: ${error.message}`);
        return false;
    }
}

// Criar diretório de backup
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Executar backup
console.log('🔄 Iniciando backup dos arquivos principais:\n');

let successCount = 0;
let errorCount = 0;
let totalSize = 0;

// Backup dos arquivos principais
BACKUP_LIST.forEach(file => {
    const source = path.join(__dirname, file);
    const destination = path.join(BACKUP_DIR, file);
    
    if (copyFile(source, destination)) {
        successCount++;
        if (fs.existsSync(source)) {
            totalSize += fs.statSync(source).size;
        }
    } else {
        errorCount++;
    }
});

// Verificar bancos duplicados na raiz
console.log('\n🔍 Verificando possíveis bancos duplicados na raiz:\n');

let duplicateDBs = [];
POSSIBLE_DUPLICATE_DB.forEach(dbFile => {
    const dbPath = path.join(__dirname, dbFile);
    if (fs.existsSync(dbPath)) {
        console.log(`⚠️  ENCONTRADO: ${dbFile} na raiz do projeto`);
        duplicateDBs.push(dbFile);
        
        // Fazer backup do banco duplicado também
        const destination = path.join(BACKUP_DIR, 'duplicados', dbFile);
        copyFile(dbPath, destination);
    }
});

if (duplicateDBs.length === 0) {
    console.log('✅ Nenhum banco duplicado encontrado na raiz');
}

// Análise do app.js
console.log('\n📊 Análise do arquivo app.js:\n');

const appJsPath = path.join(__dirname, 'public', 'app.js');
if (fs.existsSync(appJsPath)) {
    const content = fs.readFileSync(appJsPath, 'utf8');
    const lines = content.split('\n').length;
    const size = (fs.statSync(appJsPath).size / 1024).toFixed(2);
    
    console.log(`📝 Total de linhas: ${lines}`);
    console.log(`💾 Tamanho: ${size} KB`);
    
    // Contar funções
    const functions = content.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*(?:async\s+)?\(/g);
    console.log(`🔧 Funções encontradas: ${functions ? functions.length : 0}`);
    
    // Detectar possíveis erros de sintaxe
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    
    console.log(`\n⚙️  Análise de sintaxe:`);
    console.log(`   Chaves: { ${openBraces} | } ${closeBraces} | Diferença: ${openBraces - closeBraces}`);
    console.log(`   Parênteses: ( ${openParens} | ) ${closeParens} | Diferença: ${openParens - closeParens}`);
    
    if (openBraces !== closeBraces) {
        console.log(`\n⚠️  ALERTA: Possível erro de sintaxe - chaves não balanceadas!`);
    }
    if (openParens !== closeParens) {
        console.log(`⚠️  ALERTA: Possível erro de sintaxe - parênteses não balanceados!`);
    }
}

// Criar arquivo de informações do backup
const backupInfo = {
    timestamp: TIMESTAMP,
    date: new Date().toISOString(),
    version: '1.1.5',
    files_backed_up: successCount,
    files_failed: errorCount,
    total_size_kb: (totalSize / 1024).toFixed(2),
    duplicate_dbs_found: duplicateDBs,
    backup_directory: BACKUP_DIR,
    node_version: process.version,
    platform: process.platform
};

fs.writeFileSync(
    path.join(BACKUP_DIR, 'backup_info.json'),
    JSON.stringify(backupInfo, null, 2)
);

// Resumo final
console.log('\n' + '═'.repeat(56));
console.log('📊 RESUMO DO BACKUP:');
console.log('═'.repeat(56));
console.log(`✅ Arquivos copiados: ${successCount}`);
console.log(`❌ Arquivos falhados: ${errorCount}`);
console.log(`💾 Tamanho total: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`📁 Local do backup: ${BACKUP_DIR}`);

if (duplicateDBs.length > 0) {
    console.log(`\n⚠️  ATENÇÃO: ${duplicateDBs.length} banco(s) duplicado(s) encontrado(s)!`);
    console.log('   Execute o script "unificar-banco-dados.js" para corrigir.');
}

console.log('\n✅ BACKUP COMPLETO REALIZADO COM SUCESSO!');
console.log('\n📝 Próximo passo: Execute "diagnostico-erros-sintaxe.js"');
console.log('═'.repeat(56));