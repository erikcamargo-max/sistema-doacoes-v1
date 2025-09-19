/**
 * ================================================================
 * SCRIPT: Diagnóstico Detalhado das Parcelas
 * ================================================================
 * 
 * OBJETIVO: Entender por que pagamentos não aparecem na interface
 * MÉTODO: Consultar banco diretamente e comparar com lógica frontend
 * 
 * ================================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 DIAGNÓSTICO DETALHADO DAS PARCELAS\n');

const dbPath = path.join(__dirname, 'database', 'doacoes.db');
const db = new sqlite3.Database(dbPath);

// Função auxiliar para calcular vencimento (igual ao frontend)
function calcularVencimento(dataInicial, meses) {
    const data = new Date(dataInicial + 'T00:00:00');
    if (meses > 0) {
        data.setMonth(data.getMonth() + meses);
    }
    return data.toISOString().substring(0, 10);
}

// Função auxiliar para buscar pagamento (igual ao frontend)
function buscarPagamentoProximo(historico, dataVencimento) {
    if (!historico || !Array.isArray(historico)) return null;
    
    const vencimento = new Date(dataVencimento + 'T00:00:00');
    
    for (let pagamento of historico) {
        const dataPagamento = new Date(pagamento.data_pagamento + 'T00:00:00');
        const diffDias = Math.abs((dataPagamento - vencimento) / (1000 * 60 * 60 * 24));
        
        console.log(`    📅 Comparando: ${pagamento.data_pagamento} vs ${dataVencimento} = ${diffDias} dias`);
        
        if (diffDias <= 10) { // Tolerância de 10 dias
            return pagamento;
        }
    }
    
    return null;
}

// Analisar doação específica (ID 33 do log)
db.get(`
    SELECT d.*, don.nome, don.codigo_doador
    FROM doacoes d
    LEFT JOIN doadores don ON d.doador_id = don.id
    WHERE d.id = 33
`, [], (err, doacao) => {
    if (err) {
        console.error('❌ Erro ao buscar doação:', err);
        return;
    }
    
    if (!doacao) {
        console.log('❌ Doação 33 não encontrada');
        return;
    }
    
    console.log('📋 DOAÇÃO ANALISADA:');
    console.log(`   ID: ${doacao.id}`);
    console.log(`   Doador: ${doacao.nome} (${doacao.codigo_doador})`);
    console.log(`   Valor: R$ ${doacao.valor}`);
    console.log(`   Parcelas: ${doacao.parcelas_totais}`);
    console.log(`   Data: ${doacao.data_doacao}`);
    console.log(`   Recorrente: ${doacao.recorrente ? 'Sim' : 'Não'}`);
    
    // Buscar histórico da doação
    db.all(`
        SELECT * FROM historico_pagamentos 
        WHERE doacao_id = 33 
        ORDER BY data_pagamento
    `, [], (err, historico) => {
        if (err) {
            console.error('❌ Erro ao buscar histórico:', err);
            return;
        }
        
        console.log('\n💰 HISTÓRICO DE PAGAMENTOS:');
        if (historico.length === 0) {
            console.log('   ❌ Nenhum pagamento encontrado');
        } else {
            historico.forEach(p => {
                console.log(`   ${p.id}: ${p.data_pagamento} - R$ ${p.valor} - ${p.status}`);
            });
        }
        
        // Buscar parcelas futuras
        db.all(`
            SELECT * FROM parcelas_futuras 
            WHERE doacao_id = 33 
            ORDER BY numero_parcela
        `, [], (err, parcelas) => {
            if (err) {
                console.error('❌ Erro ao buscar parcelas futuras:', err);
                return;
            }
            
            console.log('\n📅 PARCELAS FUTURAS:');
            if (parcelas.length === 0) {
                console.log('   ⚠️ Nenhuma parcela futura encontrada');
            } else {
                parcelas.forEach(p => {
                    console.log(`   ${p.numero_parcela}: ${p.data_vencimento} - R$ ${p.valor} - ${p.status}`);
                });
            }
            
            // SIMULAR LÓGICA DO FRONTEND
            console.log('\n🧮 SIMULAÇÃO DA LÓGICA DO FRONTEND:');
            
            const numParcelas = doacao.parcelas_totais || 1;
            const valorParcela = doacao.valor / (doacao.recorrente ? numParcelas : 1);
            
            console.log(`   Número de parcelas: ${numParcelas}`);
            console.log(`   Valor por parcela: R$ ${valorParcela.toFixed(2)}`);
            
            console.log('\n📊 ANÁLISE PARCELA POR PARCELA:');
            
            for (let i = 1; i <= numParcelas; i++) {
                const dataVencimento = calcularVencimento(doacao.data_doacao, i - 1, doacao.recorrente);
                const pagamentoEncontrado = buscarPagamentoProximo(historico, dataVencimento);
                
                console.log(`\n   PARCELA ${i}/${numParcelas}:`);
                console.log(`   📅 Data vencimento calculada: ${dataVencimento}`);
                console.log(`   💰 Valor: R$ ${valorParcela.toFixed(2)}`);
                console.log(`   🔍 Pagamento encontrado: ${pagamentoEncontrado ? 'SIM' : 'NÃO'}`);
                
                if (pagamentoEncontrado) {
                    console.log(`      → ID: ${pagamentoEncontrado.id}`);
                    console.log(`      → Data: ${pagamentoEncontrado.data_pagamento}`);
                    console.log(`      → Valor: R$ ${pagamentoEncontrado.valor}`);
                    console.log(`      → Status: PAGO`);
                } else {
                    console.log(`      → Status: PENDENTE`);
                }
            }
            
            // DIAGNÓSTICO FINAL
            console.log('\n🎯 DIAGNÓSTICO:');
            
            const totalParcelas = numParcelas;
            const parcelasNoBanco = historico.length;
            const parcelasPagas = historico.filter(p => p.status === 'Pago').length;
            
            console.log(`   Total de parcelas esperadas: ${totalParcelas}`);
            console.log(`   Pagamentos no banco: ${parcelasNoBanco}`);
            console.log(`   Parcelas pagas: ${parcelasPagas}`);
            
            if (parcelasNoBanco > 0 && parcelasPagas === 0) {
                console.log('   ❌ PROBLEMA: Pagamentos existem mas não estão marcados como PAGO');
            } else if (parcelasNoBanco === 0) {
                console.log('   ❌ PROBLEMA: Nenhum pagamento encontrado no banco');
            } else {
                console.log('   ✅ Pagamentos encontrados no banco');
                
                // Verificar se as datas batem
                let problemaDatas = false;
                for (let i = 1; i <= numParcelas; i++) {
                    const dataVencimento = calcularVencimento(doacao.data_doacao, i - 1, doacao.recorrente);
                    const pagamento = buscarPagamentoProximo(historico, dataVencimento);
                    
                    if (!pagamento && historico.length >= i) {
                        problemaDatas = true;
                        break;
                    }
                }
                
                if (problemaDatas) {
                    console.log('   ⚠️ PROBLEMA: Datas dos pagamentos não batem com vencimentos calculados');
                    console.log('   💡 SOLUÇÃO: Ajustar tolerância de dias ou lógica de busca');
                } else {
                    console.log('   ✅ Lógica de datas parece correta');
                }
            }
            
            db.close();
        });
    });
});

console.log('⏳ Analisando dados...\n');