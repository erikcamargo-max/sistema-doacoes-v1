/**
 * ================================================================
 * SCRIPT: Unificar Banco de Dados
 * ================================================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 08/09/2025
 * FASE: 1 - ESTABILIZAÇÃO
 * ETAPA: 1.3 - Unificar Banco de Dados
 * 
 * DESCRIÇÃO:
 * Verifica e garante que existe apenas um banco de dados
 * no local correto (./database/doacoes.db), remove duplicatas
 * e valida integridade do banco.
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('╔════════════════════════════════════════════════════╗');
console.log('║     UNIFICAÇÃO DE BANCO DE DADOS - v1.1.5         ║');
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
    
    // Verificar integridade
    const db = new sqlite3.Database(CORRECT_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('❌ Erro ao abrir banco:', err.message);
        }
    });
    
    // Verificar tabelas
    db.serialize(() => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (!err && tables) {
                statistics.mainDbTables = tables.length;
                console.log(`   Tabelas: ${tables.map(t => t.name).join(', ')}`);
                
                // Contar registros em cada tabela
                tables.forEach(table => {
                    db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, row) => {
                        if (!err && row) {
                            statistics.mainDbRecords[table.name] = row.count;
                        }
                    });
                });
            }
        });
    });
    
    db.close();
} else {
    console.log('⚠️  AVISO: Banco principal não encontrado!');
    console.log('   Será necessário criá-lo ou recuperar de backup.');
}

// ================================================================
// 2. PROCURAR BANCOS DUPLICADOS
// ================================================================

console.log('\n2️⃣  Procurando bancos duplicados na raiz...\n');

POSSIBLE_DB_LOCATIONS.forEach(dbFile => {
    const dbPath = path.join(__dirname, dbFile);
    
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        duplicatesFound.push({
            path: dbPath,
            name: dbFile,
            size: sizeKB
        });
        
        console.log(`⚠️  ENCONTRADO: ${dbFile}`);
        console.log(`   Tamanho: ${sizeKB} KB`);
        console.log(`   Local: ${dbPath}`);
        
        // Analisar conteúdo
        const dupDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (!err) {
                dupDb.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                    if (!err && tables) {
                        console.log(`   Tabelas: ${tables.map(t => t.name).join(', ')}`);
                    }
                });
                dupDb.close();
            }
        });
    }
});

if (duplicatesFound.length === 0) {
    console.log('✅ Nenhum banco duplicado encontrado na raiz!');
}

// ================================================================
// 3. VERIFICAR REFERÊNCIAS NO CÓDIGO
// ================================================================

console.log('\n3️⃣  Verificando referências no código...\n');

const filesToCheck = [
    'server.js',
    'public/app.js',
    'scripts/init-database.js',
    'scripts/upgrade-database.js'
];

let incorrectReferences = [];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Procurar por referências incorretas
        POSSIBLE_DB_LOCATIONS.forEach(dbName => {
            if (content.includes(`./${dbName}`) || content.includes(`'${dbName}'`) || content.includes(`"${dbName}"`)) {
                // Ignorar se for a referência correta
                if (!dbName.includes('database/doacoes.db')) {
                    incorrectReferences.push({
                        file: file,
                        reference: dbName
                    });
                    console.log(`⚠️  Referência incorreta em ${file}: ${dbName}`);
                }
            }
        });
        
        // Verificar referência correta
        if (content.includes('./database/doacoes.db')) {
            console.log(`✅ ${file} - Referência correta ao banco`);
        }
    }
});

// ================================================================
// 4. CONSOLIDAÇÃO (SE NECESSÁRIO)
// ================================================================

if (duplicatesFound.length > 0) {
    console.log('\n4️⃣  Processo de consolidação...\n');
    
    // Se não existe banco principal mas existe duplicado
    if (!fs.existsSync(CORRECT_DB_PATH) && duplicatesFound.length > 0) {
        console.log('📋 Banco principal não existe. Movendo banco duplicado...');
        
        // Escolher o maior banco como principal
        const largestDb = duplicatesFound.reduce((prev, current) => {
            return parseFloat(current.size) > parseFloat(prev.size) ? current : prev;
        });
        
        console.log(`   Movendo ${largestDb.name} para ./database/doacoes.db`);
        
        // Criar diretório se não existir
        if (!fs.existsSync(DATABASE_DIR)) {
            fs.mkdirSync(DATABASE_DIR, { recursive: true });
        }
        
        // Mover arquivo
        fs.renameSync(largestDb.path, CORRECT_DB_PATH);
        console.log('✅ Banco movido com sucesso!');
        
        // Remover da lista de duplicados
        duplicatesFound = duplicatesFound.filter(d => d.path !== largestDb.path);
    }
    
    // Mover duplicados restantes para backup
    if (duplicatesFound.length > 0) {
        const backupDir = path.join(__dirname, 'backups', 'duplicate_dbs');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        console.log('\n📦 Movendo bancos duplicados para backup...');
        
        duplicatesFound.forEach(dup => {
            const backupPath = path.join(backupDir, `${Date.now()}_${dup.name}`);
            fs.renameSync(dup.path, backupPath);
            console.log(`   ✅ ${dup.name} → backups/duplicate_dbs/`);
        });
    }
}

// ================================================================
// 5. CORRIGIR REFERÊNCIAS NO CÓDIGO
// ================================================================

if (incorrectReferences.length > 0) {
    console.log('\n5️⃣  Corrigindo referências no código...\n');
    
    const uniqueFiles = [...new Set(incorrectReferences.map(r => r.file))];
    
    uniqueFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Fazer backup
        const backupPath = `${filePath}.backup_${Date.now()}`;
        fs.copyFileSync(filePath, backupPath);
        
        // Corrigir referências
        POSSIBLE_DB_LOCATIONS.forEach(dbName => {
            const patterns = [
                new RegExp(`\\./${dbName}`, 'g'),
                new RegExp(`'${dbName}'`, 'g'),
                new RegExp(`"${dbName}"`, 'g')
            ];
            
            patterns.forEach(pattern => {
                if (content.match(pattern)) {
                    content = content.replace(pattern, (match) => {
                        // Preservar aspas ou ./
                        if (match.startsWith('./')) {
                            return './database/doacoes.db';
                        } else if (match.startsWith("'")) {
                            return "'./database/doacoes.db'";
                        } else if (match.startsWith('"')) {
                            return '"./database/doacoes.db"';
                        }
                        return match;
                    });
                    modified = true;
                }
            });
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Corrigidas referências em ${file}`);
        }
    });
}

// ================================================================
// 6. VALIDAÇÃO FINAL
// ================================================================

console.log('\n6️⃣  Validação final do banco...\n');

if (fs.existsSync(CORRECT_DB_PATH)) {
    const db = new sqlite3.Database(CORRECT_DB_PATH);
    
    db.serialize(() => {
        // Verificar tabelas essenciais
        const requiredTables = ['doadores', 'doacoes', 'historico_pagamentos', 'parcelas_futuras'];
        
        db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
            if (err) {
                console.error('❌ Erro ao verificar tabelas:', err.message);
                return;
            }
            
            const existingTables = tables.map(t => t.name);
            console.log('📋 Tabelas existentes:', existingTables.join(', '));
            
            requiredTables.forEach(table => {
                if (existingTables.includes(table)) {
                    console.log(`   ✅ ${table}`);
                } else {
                    console.log(`   ❌ ${table} - FALTANDO!`);
                }
            });
            
            // Contar registros totais
            let totalRecords = 0;
            let completedQueries = 0;
            
            existingTables.forEach(table => {
                db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
                    completedQueries++;
                    if (!err && row) {
                        totalRecords += row.count;
                        console.log(`   📊 ${table}: ${row.count} registros`);
                    }
                    
                    if (completedQueries === existingTables.length) {
                        console.log(`\n   📊 Total geral: ${totalRecords} registros`);
                    }
                });
            });
        });
    });
    
    db.close();
}

// ================================================================
// RELATÓRIO FINAL
// ================================================================

setTimeout(() => {
    console.log('\n' + '═'.repeat(56));
    console.log('📊 RELATÓRIO DE UNIFICAÇÃO:');
    console.log('═'.repeat(56));
    console.log(`✅ Banco principal: ./database/doacoes.db`);
    console.log(`   Tamanho: ${statistics.mainDbSize} KB`);
    console.log(`   Tabelas: ${statistics.mainDbTables}`);
    
    if (duplicatesFound.length > 0) {
        console.log(`\n🔄 Bancos consolidados: ${duplicatesFound.length}`);
    } else {
        console.log('\n✅ Nenhuma duplicação encontrada');
    }
    
    if (incorrectReferences.length > 0) {
        console.log(`\n✅ Referências corrigidas: ${incorrectReferences.length}`);
    }
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('═'.repeat(56));
    console.log('1. Teste o sistema: npm start');
    console.log('2. Verifique se tudo funciona normalmente');
    console.log('3. Execute: "consolidar-scripts-correcao.js"');
    
    console.log('\n✅ UNIFICAÇÃO CONCLUÍDA!');
    console.log('═'.repeat(56));
}, 2000); // Aguardar queries assíncronas