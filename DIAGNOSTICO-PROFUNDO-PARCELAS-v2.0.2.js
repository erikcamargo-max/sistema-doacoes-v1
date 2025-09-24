/**
 * ================================================================
 * SCRIPT: Diagnóstico Profundo do Sistema de Parcelas
 * ================================================================
 * 
 * VERSÃO: 2.0.2
 * DATA: 19/09/2025
 * OBJETIVO: Investigar completamente a lógica de parcelas recorrentes
 * 
 * ESTE SCRIPT VAI ANALISAR:
 * 1. HTML do modal - quais campos existem realmente
 * 2. Função addDonation() - como coleta os dados
 * 3. Função toggleRecurringFields() - se mostra/esconde campos
 * 4. Backend server.js - como processa os dados
 * 5. Tabela do banco - estrutura real das parcelas
 * 6. Fluxo completo da doação recorrente
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('╔════════════════════════════════════════════════════╗');
console.log('║      DIAGNÓSTICO PROFUNDO PARCELAS v2.0.2         ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const appJsPath = path.join(__dirname, 'public', 'app.js');
const indexHtmlPath = path.join(__dirname, 'public', 'index.html');
const serverJsPath = path.join(__dirname, 'server.js');
const dbPath = path.join(__dirname, 'database', 'doacoes.db');

// ================================================================
// 1. ANÁLISE DO HTML - CAMPOS DO MODAL
// ================================================================

console.log('1️⃣  ANALISANDO HTML DO MODAL...\n');

function analisarHTML() {
    if (!fs.existsSync(indexHtmlPath)) {
        console.log('❌ index.html não encontrado');
        return;
    }
    
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    console.log('🔍 CAMPOS RELACIONADOS A PARCELAS:');
    
    // Procurar checkbox recorrente
    const checkboxMatch = htmlContent.match(/<input[^>]*id=["\']input-recurrent["\'][^>]*>/);
    if (checkboxMatch) {
        console.log('✅ Checkbox recorrente encontrado:');
        console.log(`   ${checkboxMatch[0]}`);
    } else {
        console.log('❌ Checkbox input-recurrent NÃO encontrado');
    }
    
    // Procurar campo quantidade de parcelas
    const parcelasMatch = htmlContent.match(/<input[^>]*id=["\']input-parcelas["\'][^>]*>/);
    if (parcelasMatch) {
        console.log('✅ Campo parcelas encontrado:');
        console.log(`   ${parcelasMatch[0]}`);
    } else {
        console.log('❌ Campo input-parcelas NÃO encontrado');
    }
    
    // Procurar campo próxima parcela
    const proximaMatch = htmlContent.match(/<input[^>]*id=["\']input-proxima-parcela["\'][^>]*>/);
    if (proximaMatch) {
        console.log('✅ Campo próxima parcela encontrado:');
        console.log(`   ${proximaMatch[0]}`);
    } else {
        console.log('❌ Campo input-proxima-parcela NÃO encontrado');
    }
    
    // IMPORTANTE: Procurar campo VALOR DAS PARCELAS
    const valorParcelasPatterns = [
        /input-parcelas-valor/g,
        /valor.*parcela/gi,
        /parcela.*valor/gi,
        /input-valor-parcela/g
    ];
    
    console.log('\n🔍 PROCURANDO CAMPO VALOR DAS PARCELAS:');
    let valorParcelaEncontrado = false;
    
    valorParcelasPatterns.forEach((pattern, index) => {
        const matches = htmlContent.match(pattern);
        if (matches) {
            console.log(`✅ Padrão ${index + 1} encontrado: ${matches.length} ocorrências`);
            matches.forEach(match => console.log(`   → ${match}`));
            valorParcelaEncontrado = true;
        }
    });
    
    if (!valorParcelaEncontrado) {
        console.log('❌ CAMPO VALOR DAS PARCELAS NÃO ENCONTRADO NO HTML!');
        console.log('🚨 ESTE PODE SER O PROBLEMA PRINCIPAL!');
    }
    
    // Procurar div recurring-fields
    const recurringFieldsMatch = htmlContent.match(/<div[^>]*id=["\']recurring-fields["\'][^>]*>/);
    if (recurringFieldsMatch) {
        console.log('\n✅ Div recurring-fields encontrada:');
        console.log(`   ${recurringFieldsMatch[0]}`);
    } else {
        console.log('\n❌ Div recurring-fields NÃO encontrada');
    }
    
    // Extrair todo o conteúdo da section de parcelas
    const recurringSection = htmlContent.match(/<div[^>]*recurring-fields[^>]*>[\s\S]*?<\/div>/);
    if (recurringSection) {
        console.log('\n📋 CONTEÚDO COMPLETO DA SEÇÃO DE PARCELAS:');
        console.log('---'.repeat(20));
        console.log(recurringSection[0]);
        console.log('---'.repeat(20));
    }
}

// ================================================================
// 2. ANÁLISE DO JAVASCRIPT - FUNÇÃO addDonation
// ================================================================

console.log('\n2️⃣  ANALISANDO FUNÇÃO addDonation()...\n');

function analisarJavaScript() {
    if (!fs.existsSync(appJsPath)) {
        console.log('❌ app.js não encontrado');
        return;
    }
    
    const jsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Procurar função addDonation
    const addDonationMatch = jsContent.match(/window\.addDonation\s*=\s*async\s*function\(\)[\s\S]*?^}/m);
    if (addDonationMatch) {
        console.log('✅ Função addDonation encontrada');
        
        // Extrair seção de coleta de dados
        const formDataMatch = addDonationMatch[0].match(/const formData = \{[\s\S]*?\};/);
        if (formDataMatch) {
            console.log('\n📋 SEÇÃO DE COLETA DE DADOS:');
            console.log('---'.repeat(20));
            console.log(formDataMatch[0]);
            console.log('---'.repeat(20));
            
            // Verificar campos específicos
            const temRecorrente = /recorrente:/.test(formDataMatch[0]);
            const temParcelas = /parcelas:/.test(formDataMatch[0]);
            const temProximaParcela = /proxima_parcela:/.test(formDataMatch[0]);
            const temValorParcela = /valor_parcela:/.test(formDataMatch[0]);
            
            console.log('\n🔍 CAMPOS COLETADOS:');
            console.log(`   recorrente: ${temRecorrente ? '✅' : '❌'}`);
            console.log(`   parcelas: ${temParcelas ? '✅' : '❌'}`);
            console.log(`   proxima_parcela: ${temProximaParcela ? '✅' : '❌'}`);
            console.log(`   valor_parcela: ${temValorParcela ? '✅' : '❌'}`);
            
            if (!temValorParcela) {
                console.log('\n🚨 PROBLEMA IDENTIFICADO: valor_parcela não está sendo coletado!');
            }
        }
    } else {
        console.log('❌ Função addDonation NÃO encontrada');
    }
    
    // Procurar função toggleRecurringFields
    const toggleMatch = jsContent.match(/function toggleRecurringFields\(\)[\s\S]*?^}/m);
    if (toggleMatch) {
        console.log('\n✅ Função toggleRecurringFields encontrada:');
        console.log('---'.repeat(20));
        console.log(toggleMatch[0]);
        console.log('---'.repeat(20));
    } else {
        console.log('\n❌ Função toggleRecurringFields NÃO encontrada');
    }
}

// ================================================================
// 3. ANÁLISE DO BACKEND - server.js
// ================================================================

console.log('\n3️⃣  ANALISANDO BACKEND SERVER.JS...\n');

function analisarBackend() {
    if (!fs.existsSync(serverJsPath)) {
        console.log('❌ server.js não encontrado');
        return;
    }
    
    const serverContent = fs.readFileSync(serverJsPath, 'utf8');
    
    // Procurar rota POST /api/doacoes
    const postRouteMatch = serverContent.match(/app\.post\(['"`]\/api\/doacoes['"`][\s\S]*?^\}\);/m);
    if (postRouteMatch) {
        console.log('✅ Rota POST /api/doacoes encontrada');
        
        // Extrair destructuring dos dados
        const destructuringMatch = postRouteMatch[0].match(/const \{[\s\S]*?\} = req\.body;/);
        if (destructuringMatch) {
            console.log('\n📋 DADOS EXTRAÍDOS DO BODY:');
            console.log('---'.repeat(20));
            console.log(destructuringMatch[0]);
            console.log('---'.repeat(20));
            
            // Verificar se servidor espera valor_parcela
            const temValorParcelaServidor = /valor_parcela/.test(destructuringMatch[0]);
            console.log(`\n🔍 Servidor espera valor_parcela: ${temValorParcelaServidor ? '✅' : '❌'}`);
            
            if (!temValorParcelaServidor) {
                console.log('🚨 PROBLEMA: Servidor não está preparado para receber valor_parcela!');
            }
        }
        
        // Procurar função insertDoacao
        const insertDoacaoMatch = postRouteMatch[0].match(/const insertDoacao[\s\S]*?INSERT INTO doacoes[\s\S]*?\);/);
        if (insertDoacaoMatch) {
            console.log('\n📋 FUNÇÃO insertDoacao:');
            console.log('---'.repeat(20));
            console.log(insertDoacaoMatch[0]);
            console.log('---'.repeat(20));
        }
    } else {
        console.log('❌ Rota POST /api/doacoes NÃO encontrada');
    }
}

// ================================================================
// 4. ANÁLISE DO BANCO DE DADOS
// ================================================================

console.log('\n4️⃣  ANALISANDO ESTRUTURA DO BANCO...\n');

function analisarBanco() {
    return new Promise((resolve) => {
        if (!fs.existsSync(dbPath)) {
            console.log('❌ Banco de dados não encontrado');
            resolve();
            return;
        }
        
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log('❌ Erro ao conectar no banco:', err.message);
                resolve();
                return;
            }
            
            console.log('✅ Conectado ao banco de dados');
            
            // Analisar estrutura da tabela doacoes
            db.all("PRAGMA table_info(doacoes)", [], (err, columns) => {
                if (err) {
                    console.log('❌ Erro ao analisar tabela doacoes:', err.message);
                    resolve();
                    return;
                }
                
                console.log('\n📋 ESTRUTURA DA TABELA DOACOES:');
                columns.forEach(col => {
                    console.log(`   ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''}`);
                });
                
                // Verificar se tem campo para valor das parcelas
                const temCampoValorParcela = columns.some(col => 
                    col.name.includes('valor_parcela') || 
                    col.name.includes('parcela_valor')
                );
                
                console.log(`\n🔍 Banco tem campo para valor das parcelas: ${temCampoValorParcela ? '✅' : '❌'}`);
                
                if (!temCampoValorParcela) {
                    console.log('🚨 PROBLEMA: Banco não tem campo para salvar valor das parcelas!');
                }
                
                // Analisar doações recorrentes existentes
                db.all("SELECT * FROM doacoes WHERE recorrente = 1 LIMIT 3", [], (err, recorrentes) => {
                    if (!err && recorrentes.length > 0) {
                        console.log('\n📊 DOAÇÕES RECORRENTES EXISTENTES:');
                        recorrentes.forEach((doacao, index) => {
                            console.log(`\n   Doação ${index + 1}:`);
                            console.log(`   - ID: ${doacao.id}`);
                            console.log(`   - Valor: R$ ${doacao.valor}`);
                            console.log(`   - Parcelas totais: ${doacao.parcelas_totais || 'N/A'}`);
                            console.log(`   - Recorrente: ${doacao.recorrente ? 'Sim' : 'Não'}`);
                            console.log(`   - Data próxima: ${doacao.data_proxima_parcela || 'N/A'}`);
                        });
                    }
                    
                    db.close();
                    resolve();
                });
            });
        });
    });
}

// ================================================================
// 5. GERAÇÃO DE RELATÓRIO FINAL
// ================================================================

function gerarRelatorioFinal() {
    console.log('\n5️⃣  RELATÓRIO FINAL DO DIAGNÓSTICO...\n');
    
    console.log('🎯 PROBLEMAS IDENTIFICADOS:');
    console.log('');
    
    console.log('PROBLEMA 1 - CAMPO HTML:');
    console.log('   → Campo input-parcelas-valor pode não existir no HTML');
    console.log('   → Ou tem ID diferente do esperado');
    console.log('   → Ou está dentro de elemento escondido');
    console.log('');
    
    console.log('PROBLEMA 2 - COLETA JAVASCRIPT:');
    console.log('   → Função addDonation() não coleta valor_parcela');
    console.log('   → getElementById() retorna null');
    console.log('   → Campo pode ter nome diferente');
    console.log('');
    
    console.log('PROBLEMA 3 - BACKEND:');
    console.log('   → Servidor pode não estar preparado para valor_parcela');
    console.log('   → Tabela do banco pode não ter campo apropriado');
    console.log('   → Lógica de inserção pode estar incompleta');
    console.log('');
    
    console.log('🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('');
    console.log('SOLUÇÃO A - VERIFICAR HTML:');
    console.log('   → Confirmar se campo existe com ID correto');
    console.log('   → Verificar se está sendo criado dinamicamente');
    console.log('   → Testar document.getElementById() no console');
    console.log('');
    
    console.log('SOLUÇÃO B - CORRIGIR JAVASCRIPT:');
    console.log('   → Adicionar logs detalhados na função addDonation()');
    console.log('   → Verificar se toggleRecurringFields() funciona');
    console.log('   → Testar coleta de dados no console do navegador');
    console.log('');
    
    console.log('SOLUÇÃO C - AJUSTAR BACKEND:');
    console.log('   → Adicionar valor_parcela na rota POST');
    console.log('   → Criar campo na tabela se necessário');
    console.log('   → Implementar lógica de parcelas futuras');
    console.log('');
    
    console.log('🚀 PRÓXIMOS PASSOS RECOMENDADOS:');
    console.log('1. Executar este diagnóstico');
    console.log('2. Identificar o problema específico');
    console.log('3. Aplicar correção focada');
    console.log('4. Testar no navegador com F12 aberto');
    console.log('5. Verificar se dados chegam no servidor');
}

// ================================================================
// EXECUÇÃO DO DIAGNÓSTICO COMPLETO
// ================================================================

async function executarDiagnostico() {
    try {
        analisarHTML();
        analisarJavaScript();
        analisarBackend();
        await analisarBanco();
        gerarRelatorioFinal();
        
        console.log('\n' + '='.repeat(56));
        console.log('✅ DIAGNÓSTICO PROFUNDO COMPLETO!');
        console.log('='.repeat(56));
        console.log('\n📊 RESUMO EXECUTIVO:');
        console.log('Este diagnóstico revelou onde exatamente está o problema.');
        console.log('Use as informações acima para criar a correção específica.');
        console.log('\n🎯 FOQUE NA ÁREA IDENTIFICADA COMO PROBLEMÁTICA!');
        
    } catch (error) {
        console.error('❌ Erro durante diagnóstico:', error.message);
    }
}

// Executar diagnóstico
executarDiagnostico();