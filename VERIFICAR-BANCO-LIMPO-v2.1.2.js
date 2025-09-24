/**
 * ================================================================
 * SCRIPT: Verificação do Banco de Dados Limpo
 * ================================================================
 * 
 * VERSÃO: 2.1.2
 * DATA: 20/09/2025
 * OBJETIVO: Verificar se banco está limpo e explicar lógica do modal
 * 
 * VERIFICAÇÕES:
 * 1. Contar registros em todas as tabelas
 * 2. Mostrar estrutura das tabelas
 * 3. Explicar lógica do modal de histórico
 * 4. Identificar possíveis problemas no código atual
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('╔════════════════════════════════════════════════════╗');
console.log('║        VERIFICAÇÃO BANCO LIMPO v2.1.2             ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const dbPath = path.join(__dirname, 'database', 'doacoes.db');
const appJsPath = path.join(__dirname, 'public', 'app.js');

// ================================================================
// 1. VERIFICAR BANCO DE DADOS
// ================================================================

function verificarBanco() {
    return new Promise((resolve, reject) => {
        console.log('1️⃣ VERIFICANDO ESTADO DO BANCO DE DADOS...\n');
        
        if (!fs.existsSync(dbPath)) {
            console.log('❌ Banco de dados não encontrado:', dbPath);
            resolve();
            return;
        }
        
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log('❌ Erro ao conectar:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Conectado ao banco SQLite');
            
            // Listar todas as tabelas
            db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('\n📋 TABELAS ENCONTRADAS:');
                tables.forEach(table => {
                    console.log(`   - ${table.name}`);
                });
                
                // Verificar quantidade de registros em cada tabela
                const promises = tables.map(table => verificarTabela(db, table.name));
                
                Promise.all(promises).then(() => {
                    db.close();
                    resolve();
                }).catch(reject);
            });
        });
    });
}

function verificarTabela(db, tableName) {
    return new Promise((resolve) => {
        // Contar registros
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, result) => {
            if (err) {
                console.log(`❌ Erro ao contar ${tableName}:`, err.message);
                resolve();
                return;
            }
            
            const count = result.count;
            const status = count === 0 ? '✅ LIMPA' : `⚠️  ${count} registros`;
            console.log(`   ${tableName}: ${status}`);
            
            // Se tem registros, mostrar exemplos
            if (count > 0) {
                db.all(`SELECT * FROM ${tableName} LIMIT 3`, [], (err, rows) => {
                    if (!err && rows.length > 0) {
                        console.log(`      Exemplos em ${tableName}:`);
                        rows.forEach((row, i) => {
                            const preview = JSON.stringify(row).substring(0, 100);
                            console.log(`        ${i + 1}. ${preview}...`);
                        });
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
}

// ================================================================
// 2. ANALISAR LÓGICA DO MODAL DE HISTÓRICO
// ================================================================

function analisarModalHistorico() {
    console.log('\n2️⃣ ANALISANDO LÓGICA DO MODAL DE HISTÓRICO...\n');
    
    if (!fs.existsSync(appJsPath)) {
        console.log('❌ app.js não encontrado');
        return;
    }
    
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    
    console.log('🔍 PROCURANDO FUNÇÃO DE HISTÓRICO DE PARCELAS...');
    
    // Procurar função que carrega histórico
    const patterns = [
        /showHistoryWithParcelas/gi,
        /carregando histórico com parcelas/gi,
        /\/api\/doacoes\/.*\/historico/gi,
        /Histórico de Parcelas/gi
    ];
    
    patterns.forEach((pattern, index) => {
        const matches = appContent.match(pattern);
        if (matches) {
            console.log(`✅ Padrão ${index + 1} encontrado: ${matches.length} ocorrências`);
        } else {
            console.log(`❌ Padrão ${index + 1} não encontrado`);
        }
    });
    
    // Extrair função específica do histórico
    const historicoMatch = appContent.match(/function.*[Hh]istor.*\(.*\)[\s\S]*?\}/);
    if (historicoMatch) {
        console.log('\n📋 FUNÇÃO DE HISTÓRICO ENCONTRADA:');
        console.log('---'.repeat(20));
        console.log(historicoMatch[0].substring(0, 500) + '...');
        console.log('---'.repeat(20));
    }
    
    // Procurar como dados são buscados
    const fetchMatch = appContent.match(/fetch\(.*historico.*\)[\s\S]*?\.json\(\)/);
    if (fetchMatch) {
        console.log('\n📡 BUSCA DE DADOS:');
        console.log('---'.repeat(20));
        console.log(fetchMatch[0]);
        console.log('---'.repeat(20));
    }
    
    // Procurar como dados são renderizados
    const renderMatch = appContent.match(/parcelas\.forEach[\s\S]*?\}\);/);
    if (renderMatch) {
        console.log('\n🎨 RENDERIZAÇÃO DAS PARCELAS:');
        console.log('---'.repeat(20));
        console.log(renderMatch[0].substring(0, 300) + '...');
        console.log('---'.repeat(20));
    }
}

// ================================================================
// 3. EXPLICAR LÓGICA ATUAL DO MODAL
// ================================================================

function explicarLogicaModal() {
    console.log('\n3️⃣ EXPLICAÇÃO DA LÓGICA DO MODAL DE HISTÓRICO...\n');
    
    console.log('🎯 COMO DEVERIA FUNCIONAR (LÓGICA CORRETA):');
    console.log('');
    console.log('PASSO 1 - BUSCA DE DADOS:');
    console.log('   1. Modal abre para doação ID específico');
    console.log('   2. Faz fetch para /api/doacoes/:id/historico');
    console.log('   3. Backend combina dados de 2 tabelas:');
    console.log('      - historico_pagamentos (primeira parcela - PAGA)');
    console.log('      - parcelas_futuras (parcelas 2+ - PENDENTES)');
    console.log('');
    console.log('PASSO 2 - PROCESSAMENTO:');
    console.log('   1. Primeira parcela: valor da doação, status PAGO');
    console.log('   2. Parcelas futuras: valor_parcelas_futuras, status PENDENTE');
    console.log('   3. Ordena por número da parcela (1, 2, 3...)');
    console.log('');
    console.log('PASSO 3 - EXIBIÇÃO:');
    console.log('   1. Conta pagas vs pendentes');
    console.log('   2. Calcula valor total pago (apenas parcelas pagas)');
    console.log('   3. Renderiza lista com status correto');
    console.log('   4. Permite ações (pagar parcela pendente)');
    console.log('');
    
    console.log('❌ PROBLEMAS POSSÍVEIS:');
    console.log('');
    console.log('PROBLEMA A - Backend:');
    console.log('   • Rota /api/doacoes/:id/historico não existe');
    console.log('   • Não combina dados das duas tabelas');
    console.log('   • Retorna dados inconsistentes');
    console.log('');
    console.log('PROBLEMA B - Frontend:');
    console.log('   • Não diferencia primeira parcela de futuras');
    console.log('   • Status hardcoded como PAGO');
    console.log('   • Contadores incorretos');
    console.log('');
    console.log('PROBLEMA C - Dados:');
    console.log('   • Parcelas futuras não são criadas');
    console.log('   • Valores incorretos no banco');
    console.log('   • Referências entre tabelas quebradas');
}

// ================================================================
// 4. GERAR PLANO DE AÇÃO
// ================================================================

function gerarPlanoAcao() {
    console.log('\n4️⃣ PLANO DE AÇÃO BASEADO NO DIAGNÓSTICO...\n');
    
    console.log('🎯 SEQUÊNCIA DE VERIFICAÇÃO:');
    console.log('');
    console.log('ETAPA 1 - Se banco estiver limpo:');
    console.log('   ✅ Criar uma doação teste simples (única)');
    console.log('   ✅ Verificar se salva corretamente');
    console.log('   ✅ Confirmar que modal funciona para doação única');
    console.log('');
    console.log('ETAPA 2 - Se doação única funcionar:');
    console.log('   ✅ Criar doação recorrente teste');
    console.log('   ✅ Verificar logs do servidor');
    console.log('   ✅ Conferir se parcelas futuras são criadas');
    console.log('');
    console.log('ETAPA 3 - Se parcelas forem criadas:');
    console.log('   ✅ Testar modal de histórico');
    console.log('   ✅ Verificar se dados são buscados corretamente');
    console.log('   ✅ Confirmar exibição de status');
    console.log('');
    console.log('ETAPA 4 - Correções específicas:');
    console.log('   🔧 Corrigir apenas o que não funcionar');
    console.log('   🔧 Uma correção por vez');
    console.log('   🔧 Testar após cada correção');
}

// ================================================================
// EXECUÇÃO COMPLETA
// ================================================================

async function executarVerificacao() {
    try {
        await verificarBanco();
        analisarModalHistorico();
        explicarLogicaModal();
        gerarPlanoAcao();
        
        console.log('\n' + '='.repeat(56));
        console.log('✅ VERIFICAÇÃO COMPLETA REALIZADA!');
        console.log('='.repeat(56));
        console.log('\n📋 RESUMO:');
        console.log('• Estado do banco foi verificado');
        console.log('• Lógica do modal foi analisada');
        console.log('• Plano de ação foi definido');
        console.log('\n🎯 PRÓXIMO PASSO:');
        console.log('Execute uma doação teste (única primeiro) e veja o resultado');
        
    } catch (error) {
        console.error('❌ Erro durante verificação:', error.message);
    }
}

// Executar verificação
executarVerificacao();