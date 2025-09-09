/**
 * ================================================================
 * SCRIPT: Unificar Banco de Dados (Versão 2)
 * ================================================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 08/09/2025
 * FASE: 1 - ESTABILIZAÇÃO
 * ETAPA: 1.3 - Unificar Banco de Dados (com tratamento de erros)
 * 
 * DESCRIÇÃO:
 * Versão melhorada que trata arquivos bloqueados/em uso
 * e oferece alternativas para consolidação do banco.
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   UNIFICAÇÃO DE BANCO DE DADOS v2 - Sistema v1.1.5 ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// Configurações
const CORRECT_DB_PATH = path.join(__dirname, 'database', 'doacoes.db');
const DATABASE_DIR = path.join(__dirname, 'database');

// Possíveis locais de bancos duplicados
const POSSIBLE_DB_LOCATIONS = [
    'doacoes.db',
    'database.db',
    'sistema.db',
    'doacao.db',
    'donations.db',
    'db.sqlite',
    'data.db'
];

let duplicatesFound = [];
let statistics = {
    mainDbSize: 0,
    mainDbTables: 0,
    mainDbRecords: {},
    duplicatesInfo: []
};

// ================================================================
// 1. VERIFICAR BANCO PRINCIPAL
// ================================================================

console.log('1️⃣  Verificando banco de dados principal...\n');

if (!fs.existsSync(DATABASE_DIR)) {
    console.log('📁 Criando diretório database...');
    fs.mkdirSync(DATABASE_DIR, { recursive: true });
}

if (fs.existsSync(CORRECT_DB_PATH)) {
    const stats = fs.statSync(CORRECT_DB_PATH);
    statistics.mainDbSize = (stats.size / 1024).toFixed(2);
    console.log(`✅ Banco principal encontrado: ${CORRECT_DB_PATH}`);
    console.log(`   Tamanho: ${statistics.mainDbSize} KB`);
    console.log(`   Modificado: ${stats.mtime.toLocaleString('pt-BR')}`);
} else {
    console.log('⚠️  AVISO: Banco principal não encontrado!');
}

// ================================================================
// 2. PROCURAR BANCOS DUPLICADOS
// ================================================================

console.log('\n2️⃣  Procurando bancos duplicados na raiz...\n');

POSSIBLE_DB_LOCATIONS.forEach(dbFile => {
    const dbPath = path.join(__dirname, dbFile);
    
    if (fs.existsSync(dbPath)) {
        try {
            const stats = fs.statSync(dbPath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            
            duplicatesFound.push({
                path: dbPath,
                name: dbFile,
                size: sizeKB,
                modified: stats.mtime
            });
            
            console.log(`⚠️  ENCONTRADO: ${dbFile}`);
            console.log(`   Tamanho: ${sizeKB} KB`);
            console.log(`   Modificado: ${stats.mtime.toLocaleString('pt-BR')}`);
            console.log(`   Local: ${dbPath}`);
        } catch (error) {
            console.log(`❌ Erro ao acessar ${dbFile}: ${error.message}`);
        }
    }
});

if (duplicatesFound.length === 0) {
    console.log('✅ Nenhum banco duplicado encontrado na raiz!');
}

// ================================================================
// 3. ANALISAR CONTEÚDO DOS BANCOS
// ================================================================

if (duplicatesFound.length > 0) {
    console.log('\n3️⃣  Analisando conteúdo dos bancos encontrados...\n');
    
    duplicatesFound.forEach(dup => {
        console.log(`📊 Analisando ${dup.name}:`);
        
        try {
            const db = new sqlite3.Database(dup.path, sqlite3.OPEN_READONLY);
            
            db.serialize(() => {
                db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                    if (!err && tables) {
                        console.log(`   Tabelas: ${tables.map(t => t.name).join(', ')}`);
                        dup.tables = tables.map(t => t.name);
                    }
                });
            });
            
            db.close();
        } catch (error) {
            console.log(`   ❌ Não foi possível ler: ${error.message}`);
        }
    });
}

// ================================================================
// 4. TRATAMENTO DE BANCOS DUPLICADOS
// ================================================================

if (duplicatesFound.length > 0) {
    console.log('\n4️⃣  Tratamento de bancos duplicados...\n');
    
    const backupDir = path.join(__dirname, 'backups', 'duplicate_dbs');
    
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    duplicatesFound.forEach(dup => {
        console.log(`\n📦 Processando ${dup.name}...`);
        
        try {
            // Tentar mover o arquivo
            const timestamp = Date.now();
            const backupPath = path.join(backupDir, `${timestamp}_${dup.name}`);
            
            // Primeiro, tentar copiar
            fs.copyFileSync(dup.path, backupPath);
            console.log(`   ✅ Copiado para backup: ${backupPath}`);
            
            // Depois, tentar deletar o original
            try {
                fs.unlinkSync(dup.path);
                console.log(`   ✅ Original removido da raiz`);
            } catch (deleteError) {
                if (deleteError.code === 'EBUSY' || deleteError.code === 'EACCES') {
                    console.log(`   ⚠️  AVISO: Não foi possível remover o original`);
                    console.log(`      Arquivo pode estar em uso (OneDrive/Antivírus)`);
                    console.log(`      AÇÃO MANUAL NECESSÁRIA:`);
                    console.log(`      1. Feche todos os programas`);
                    console.log(`      2. Pause o OneDrive temporariamente`);
                    console.log(`      3. Delete manualmente: ${dup.name}`);
                    
                    // Criar arquivo .bat para deletar
                    const batContent = `@echo off
echo Deletando banco duplicado...
timeout /t 2 /nobreak > nul
del "${dup.path}"
if exist "${dup.path}" (
    echo ERRO: Nao foi possivel deletar
    echo Tente fechar todos os programas e executar novamente
) else (
    echo SUCESSO: Arquivo deletado!
)
pause`;
                    
                    const batPath = path.join(__dirname, `delete_${dup.name}.bat`);
                    fs.writeFileSync(batPath, batContent);
                    console.log(`      4. Ou execute: delete_${dup.name}.bat`);
                } else {
                    throw deleteError;
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
        }
    });
}

// ================================================================
// 5. VERIFICAR REFERÊNCIAS NO CÓDIGO
// ================================================================

console.log('\n5️⃣  Verificando referências no código...\n');

const filesToCheck = [
    'server.js',
    'public/app.js',
    'scripts/init-database.js',
    'scripts/upgrade-database.js'
];

let correctReferences = 0;
let incorrectReferences = [];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Verificar referência correta
            if (content.includes('./database/doacoes.db') || 
                content.includes('database/doacoes.db') ||
                content.includes('database\\doacoes.db')) {
                console.log(`✅ ${file} - Referência correta ao banco`);
                correctReferences++;
            } else {
                // Procurar por referências incorretas
                let hasIncorrect = false;
                POSSIBLE_DB_LOCATIONS.forEach(dbName => {
                    if (content.includes(`./${dbName}`) || 
                        content.includes(`'${dbName}'`) || 
                        content.includes(`"${dbName}"`)) {
                        hasIncorrect = true;
                        incorrectReferences.push({
                            file: file,
                            reference: dbName
                        });
                    }
                });
                
                if (hasIncorrect) {
                    console.log(`⚠️  ${file} - Contém referências incorretas`);
                }
            }
        } catch (error) {
            console.log(`❌ Erro ao ler ${file}: ${error.message}`);
        }
    }
});

// ================================================================
// 6. VALIDAÇÃO FINAL DO BANCO PRINCIPAL
// ================================================================

console.log('\n6️⃣  Validação final do banco principal...\n');

if (fs.existsSync(CORRECT_DB_PATH)) {
    const db = new sqlite3.Database(CORRECT_DB_PATH);
    
    const requiredTables = ['doadores', 'doacoes', 'historico_pagamentos', 'parcelas_futuras'];
    
    db.serialize(() => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                console.error('❌ Erro ao verificar tabelas:', err.message);
                return;
            }
            
            const existingTables = tables.map(t => t.name);
            console.log('📋 Tabelas no banco principal:');
            
            requiredTables.forEach(table => {
                if (existingTables.includes(table)) {
                    console.log(`   ✅ ${table}`);
                } else {
                    console.log(`   ❌ ${table} - FALTANDO!`);
                }
            });
            
            // Contar registros
            existingTables.forEach(table => {
                db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
                    if (!err && row) {
                        console.log(`      └─ ${row.count} registros em ${table}`);
                    }
                });
            });
        });
    });
    
    setTimeout(() => {
        db.close();
    }, 1000);
}

// ================================================================
// RELATÓRIO FINAL
// ================================================================

setTimeout(() => {
    console.log('\n' + '═'.repeat(56));
    console.log('📊 RELATÓRIO DE UNIFICAÇÃO:');
    console.log('═'.repeat(56));
    
    console.log('\n📁 BANCO PRINCIPAL:');
    console.log(`   Local: ./database/doacoes.db`);
    console.log(`   Tamanho: ${statistics.mainDbSize} KB`);
    console.log(`   Status: ${fs.existsSync(CORRECT_DB_PATH) ? '✅ Ativo' : '❌ Não encontrado'}`);
    
    if (duplicatesFound.length > 0) {
        console.log('\n⚠️  BANCOS DUPLICADOS ENCONTRADOS:');
        duplicatesFound.forEach(dup => {
            console.log(`   - ${dup.name} (${dup.size} KB)`);
        });
        
        // Verificar se ainda existem na raiz
        console.log('\n🔍 VERIFICAÇÃO PÓS-PROCESSAMENTO:');
        duplicatesFound.forEach(dup => {
            if (fs.existsSync(dup.path)) {
                console.log(`   ⚠️  ${dup.name} - Ainda existe (requer ação manual)`);
            } else {
                console.log(`   ✅ ${dup.name} - Removido com sucesso`);
            }
        });
    } else {
        console.log('\n✅ Nenhum banco duplicado encontrado');
    }
    
    console.log('\n📋 AÇÕES NECESSÁRIAS:');
    console.log('═'.repeat(56));
    
    // Verificar se donations.db ainda existe
    if (fs.existsSync(path.join(__dirname, 'donations.db'))) {
        console.log('⚠️  AÇÃO MANUAL NECESSÁRIA:');
        console.log('   1. Pause o OneDrive temporariamente');
        console.log('   2. Delete manualmente: donations.db');
        console.log('   3. Ou execute: delete_donations.db.bat');
    } else {
        console.log('✅ Todos os bancos duplicados foram removidos!');
    }
    
    console.log('\n📝 PRÓXIMOS PASSOS:');
    console.log('   1. Resolva pendências manuais (se houver)');
    console.log('   2. Teste o sistema: npm start');
    console.log('   3. Execute: "consolidar-scripts-correcao.js"');
    
    console.log('\n✅ SCRIPT CONCLUÍDO!');
    console.log('═'.repeat(56));
}, 2500);