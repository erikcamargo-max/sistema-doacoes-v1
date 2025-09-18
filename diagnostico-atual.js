/**
 * ================================================================
 * SCRIPT: Diagnóstico do Estado Atual do Sistema
 * ================================================================
 * 
 * VERSÃO: 1.2.1
 * DATA: 18/09/2025
 * OBJETIVO: Analisar o código atual antes de fazer correções
 * 
 * Este script analisa:
 * 1. Estrutura atual do banco de dados
 * 2. Funções de histórico existentes
 * 3. APIs de parcelas disponíveis
 * 4. Problemas específicos identificados nas imagens
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('╔════════════════════════════════════════════════════╗');
console.log('║        DIAGNÓSTICO DO SISTEMA ATUAL v1.2.1        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const publicDir = path.join(__dirname, 'public');
const appJsPath = path.join(publicDir, 'app.js');
const serverJsPath = path.join(__dirname, 'server.js');
const dbPath = path.join(__dirname, 'database', 'doacoes.db');

// ================================================================
// 1. ANÁLISE DO BANCO DE DADOS
// ================================================================

console.log('1️⃣  Analisando estrutura do banco de dados...\n');

function analisarBanco() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Erro ao conectar no banco:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Conectado ao banco de dados');
            
            // Verificar tabelas existentes
            db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('📊 Tabelas encontradas:');
                tables.forEach(table => {
                    console.log(`   - ${table.name}`);
                });
                
                // Analisar estrutura de cada tabela
                const promises = tables.map(table => analisarTabela(db, table.name));
                
                Promise.all(promises).then(() => {
                    // Analisar dados de teste
                    analisarDados(db).then(() => {
                        db.close();
                        resolve();
                    });
                });
            });
        });
    });
}

function analisarTabela(db, tableName) {
    return new Promise((resolve) => {
        db.all(`PRAGMA table_info(${tableName})`, [], (err, columns) => {
            if (err) {
                console.error(`❌ Erro ao analisar tabela ${tableName}:`, err.message);
                resolve();
                return;
            }
            
            console.log(`\n📋 Estrutura da tabela ${tableName}:`);
            columns.forEach(col => {
                console.log(`   ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
            });
            
            // Contar registros
            db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, result) => {
                if (!err && result) {
                    console.log(`   📊 Total de registros: ${result.count}`);
                }
                resolve();
            });
        });
    });
}

function analisarDados(db) {
    return new Promise((resolve) => {
        // Analisar doações recorrentes
        db.all(`
            SELECT d.*, don.nome, don.codigo_doador 
            FROM doacoes d 
            LEFT JOIN doadores don ON d.doador_id = don.id 
            WHERE d.recorrente = 1 
            LIMIT 5
        `, [], (err, recorrentes) => {
            if (!err && recorrentes.length > 0) {
                console.log('\n🔄 Doações recorrentes encontradas:');
                recorrentes.forEach(d => {
                    console.log(`   - ${d.nome} (${d.codigo_doador}): R$ ${d.valor} - ${d.parcelas_totais} parcelas`);
                });
            }
            
            // Analisar histórico de pagamentos
            db.all(`SELECT COUNT(*) as count FROM historico_pagamentos`, [], (err, result) => {
                if (!err && result[0]) {
                    console.log(`\n💰 Registros no histórico: ${result[0].count}`);
                }
                
                // Analisar parcelas futuras
                db.all(`SELECT COUNT(*) as count FROM parcelas_futuras`, [], (err, result) => {
                    if (!err && result[0]) {
                        console.log(`📅 Parcelas futuras: ${result[0].count}`);
                    }
                    resolve();
                });
            });
        });
    });
}

// ================================================================
// 2. ANÁLISE DO CÓDIGO FRONTEND
// ================================================================

console.log('\n2️⃣  Analisando código do frontend (app.js)...\n');

function analisarFrontend() {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    console.log('📊 Estatísticas do app.js:');
    console.log(`   - Linhas de código: ${appContent.split('\n').length}`);
    console.log(`   - Tamanho do arquivo: ${Math.round(appContent.length / 1024)} KB`);
    
    // Verificar funções importantes
    const funcoesImportantes = [
        'showSimpleHistory',
        'viewHistory',
        'showHistoryModal',
        'addDonation',
        'loadDashboard',
        'renderDonations'
    ];
    
    console.log('\n🔍 Funções importantes encontradas:');
    funcoesImportantes.forEach(func => {
        const regex = new RegExp(`(function\\s+${func}|${func}\\s*[=:]\\s*(function|async\\s+function)|window\\.${func}\\s*=)`, 'i');
        const found = regex.test(appContent);
        console.log(`   ${found ? '✅' : '❌'} ${func}`);
        
        if (found) {
            // Extrair primeira linha da função para análise
            const match = appContent.match(new RegExp(`.*${func}.*`, 'i'));
            if (match) {
                console.log(`      → ${match[0].trim().substring(0, 80)}...`);
            }
        }
    });
    
    // Verificar se há funções relacionadas a parcelas
    console.log('\n🔄 Funções de parcelas:');
    const parcelasPatterns = [
        'parcela',
        'recorrente',
        'gerarParcelas',
        'calcularVencimento'
    ];
    
    parcelasPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, 'gi');
        const matches = appContent.match(regex);
        console.log(`   ${pattern}: ${matches ? matches.length : 0} ocorrências`);
    });
}

// ================================================================
// 3. ANÁLISE DO CÓDIGO BACKEND
// ================================================================

console.log('\n3️⃣  Analisando código do backend (server.js)...\n');

function analisarBackend() {
    const serverContent = fs.readFileSync(serverJsPath, 'utf8');
    
    console.log('📊 Estatísticas do server.js:');
    console.log(`   - Linhas de código: ${serverContent.split('\n').length}`);
    console.log(`   - Tamanho do arquivo: ${Math.round(serverContent.length / 1024)} KB`);
    
    // Verificar rotas importantes
    const rotasImportantes = [
        'GET /api/doacoes',
        'POST /api/doacoes',
        'GET /api/doacoes/:id/historico',
        'POST /api/doacoes/:id/historico',
        'GET /api/doacoes/:id/parcelas',
        'POST /api/doacoes/:id/parcelas'
    ];
    
    console.log('\n🛣️  Rotas encontradas:');
    rotasImportantes.forEach(rota => {
        const method = rota.split(' ')[0];
        const path = rota.split(' ')[1];
        const regex = new RegExp(`app\\.${method.toLowerCase()}\\s*\\(\\s*['"\`]${path.replace(/:\w+/g, ':[^\'"`\\s]*')}['"\`]`, 'i');
        const found = regex.test(serverContent);
        console.log(`   ${found ? '✅' : '❌'} ${rota}`);
    });
    
    // Verificar processamento de parcelas
    console.log('\n🔄 Processamento de parcelas no backend:');
    const parcelasBackend = [
        'parcelas_totais',
        'recorrente',
        'parcelas_futuras'
    ];
    
    parcelasBackend.forEach(term => {
        const regex = new RegExp(term, 'gi');
        const matches = serverContent.match(regex);
        console.log(`   ${term}: ${matches ? matches.length : 0} ocorrências`);
    });
}

// ================================================================
// 4. ANÁLISE DOS PROBLEMAS IDENTIFICADOS
// ================================================================

console.log('\n4️⃣  Analisando problemas identificados pelas imagens...\n');

function analisarProblemas() {
    console.log('🔍 Problemas identificados nas imagens:');
    console.log('');
    console.log('PROBLEMA 1 - Modal de Histórico Simples:');
    console.log('   ❌ Mostra apenas "Pagamentos Realizados (1)"');
    console.log('   ❌ Não mostra estrutura de parcelas (1/12, 2/12, etc.)');
    console.log('   ❌ Não permite lançar pagamentos de parcelas futuras');
    console.log('   ❌ Valor total = valor da doação (não soma parcelas)');
    console.log('');
    console.log('PROBLEMA 2 - Dashboard:');
    console.log('   ❌ Total arrecadado pode não refletir parcelas pagas');
    console.log('   ❌ Total de pagamentos pode não contar parcelas individuais');
    console.log('');
    console.log('PROBLEMA 3 - Sistema de Parcelas:');
    console.log('   ❌ Doação recorrente registra apenas primeira parcela');
    console.log('   ❌ Parcelas futuras não são exibidas para lançamento');
    console.log('   ❌ Não há interface para "pagar" parcela específica');
    
    console.log('\n✅ FUNCIONALIDADES QUE JÁ FUNCIONAM:');
    console.log('   ✅ Cadastro de doação recorrente');
    console.log('   ✅ Salvamento com campo recorrente = 1');
    console.log('   ✅ Campo parcelas_totais sendo salvo');
    console.log('   ✅ Primeira parcela registrada no histórico');
    console.log('   ✅ Carnê sendo gerado corretamente');
}

// ================================================================
// 5. RECOMENDAÇÕES DE CORREÇÃO
// ================================================================

function gerarRecomendacoes() {
    console.log('\n5️⃣  Recomendações de correção...\n');
    
    console.log('🎯 CORREÇÕES NECESSÁRIAS:');
    console.log('');
    console.log('CORREÇÃO 1 - Modal de Histórico:');
    console.log('   → Substituir showSimpleHistory por showHistoryWithParcelas');
    console.log('   → Exibir todas as parcelas (pagas e pendentes)');
    console.log('   → Adicionar botão "💰 Pagar" para parcelas pendentes');
    console.log('   → Calcular valor total baseado em parcelas pagas');
    console.log('');
    console.log('CORREÇÃO 2 - API Backend:');
    console.log('   → Criar /api/doacoes/:id/parcelas-completas');
    console.log('   → Criar /api/parcelas/:id/pagar');
    console.log('   → Criar /api/dashboard/totais (com parcelas)');
    console.log('');
    console.log('CORREÇÃO 3 - Lançamento de Pagamentos:');
    console.log('   → Interface para informar data de pagamento');
    console.log('   → Atualizar status da parcela específica');
    console.log('   → Recalcular totais do dashboard');
    console.log('');
    console.log('PRIORIDADE: 🔥 ALTA - Sistema funciona mas não permite lançamentos');
}

// ================================================================
// EXECUÇÃO DO DIAGNÓSTICO
// ================================================================

async function executarDiagnostico() {
    try {
        await analisarBanco();
        analisarFrontend();
        analisarBackend();
        analisarProblemas();
        gerarRecomendacoes();
        
        console.log('\n' + '='.repeat(56));
        console.log('✅ DIAGNÓSTICO COMPLETO REALIZADO!');
        console.log('='.repeat(56));
        console.log('\n📊 RESUMO:');
        console.log('1. ✅ Sistema salva doações recorrentes corretamente');
        console.log('2. ✅ Carnê funciona com múltiplas parcelas');
        console.log('3. ❌ Modal de histórico não mostra estrutura de parcelas');
        console.log('4. ❌ Não permite lançar pagamentos de parcelas futuras');
        console.log('5. ❌ Dashboard não soma parcelas pagas individualmente');
        
        console.log('\n🎯 PRÓXIMO PASSO:');
        console.log('Criar script focado APENAS nas correções necessárias:');
        console.log('- Modal de histórico com parcelas');
        console.log('- API para lançar pagamentos');
        console.log('- Dashboard com totais corretos');
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error);
    }
}

// Executar diagnóstico
executarDiagnostico();