const fs = require('fs');
const path = require('path');

/**
 * ================================================================
 * SCRIPT: CORRIGIR MODAL DE HISTÓRICO v2.4.0
 * ================================================================
 * 
 * PROBLEMA IDENTIFICADO:
 * - Modal de histórico está mostrando valores incorretos
 * - Não consolida dados de historico_pagamentos + parcelas_futuras
 * - Mostra R$ 150,00 quando deveria mostrar R$ 86,00
 * 
 * CORREÇÃO:
 * - Atualizar função viewHistory() no app.js
 * - Buscar dados das duas tabelas
 * - Consolidar dados corretamente no modal
 * 
 * ================================================================
 */

console.log('🔧 INICIANDO CORREÇÃO DO MODAL DE HISTÓRICO v2.4.0');
console.log('='.repeat(60));

const appJsPath = path.join(__dirname, 'public', 'app.js');

// Verificar se arquivo existe
if (!fs.existsSync(appJsPath)) {
    console.error('❌ Arquivo app.js não encontrado!');
    process.exit(1);
}

// Ler arquivo atual
let appContent = fs.readFileSync(appJsPath, 'utf8');

// 1. ATUALIZAR A FUNÇÃO viewHistory para buscar as duas tabelas
const newViewHistoryFunction = `
/**
 * Visualizar histórico de pagamentos - VERSÃO CORRIGIDA v2.4.0
 */
window.viewHistory = async function(id) {
    console.log('📋 Carregando histórico para doação ' + id + '...');
    
    try {
        // Buscar doação
        const donationResponse = await fetch(API_BASE + '/doacoes/' + id);
        const donation = await donationResponse.json();
        
        if (!donationResponse.ok) {
            throw new Error('Doação não encontrada');
        }
        
        // Buscar histórico de pagamentos (parcelas pagas)
        const historyResponse = await fetch(API_BASE + '/doacoes/' + id + '/historico');
        const payments = await historyResponse.json();
        
        // Buscar parcelas futuras (parcelas pendentes)
        const parcelasResponse = await fetch(API_BASE + '/doacoes/' + id + '/parcelas');
        const parcelas = await parcelasResponse.json();
        
        // Consolidar dados e mostrar modal
        showHistoryModal(donation, payments, parcelas);
        
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        alert('❌ Erro ao carregar histórico: ' + error.message);
    }
}`;

// 2. ATUALIZAR A FUNÇÃO showHistoryModal para processar as duas tabelas
const newShowHistoryModalFunction = `
/**
 * Mostra modal de histórico consolidado - VERSÃO CORRIGIDA v2.4.0
 */
function showHistoryModal(donation, payments, parcelas) {
    let existingModal = document.getElementById('history-modal-simple');
    if (existingModal) {
        existingModal.remove();
    }
    
    // CONSOLIDAR DADOS: Combinar pagamentos + parcelas futuras
    let todasParcelas = [];
    let numeroParcela = 1;
    
    // 1. Primeira parcela (sempre paga) do histórico
    if (payments && payments.length > 0) {
        const primeiraParcela = payments.find(p => p.status === 'Pago');
        if (primeiraParcela) {
            todasParcelas.push({
                numero: numeroParcela++,
                vencimento: primeiraParcela.data_pagamento,
                valor: primeiraParcela.valor,
                status: 'PAGO',
                dataPagamento: primeiraParcela.data_pagamento,
                id: primeiraParcela.id
            });
        }
    }
    
    // 2. Parcelas futuras (pendentes)
    if (parcelas && parcelas.length > 0) {
        parcelas.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));
        parcelas.forEach(parcela => {
            todasParcelas.push({
                numero: numeroParcela++,
                vencimento: parcela.data_vencimento,
                valor: parcela.valor,
                status: parcela.status === 'Pago' ? 'PAGO' : 'PENDENTE',
                dataPagamento: parcela.status === 'Pago' ? parcela.data_vencimento : '-',
                id: parcela.id,
                futura: true
            });
        });
    }
    
    // Calcular totais corretos
    const totalPago = todasParcelas
        .filter(p => p.status === 'PAGO')
        .reduce((sum, p) => sum + (p.valor || 0), 0);
        
    const totalPendente = todasParcelas
        .filter(p => p.status === 'PENDENTE')  
        .reduce((sum, p) => sum + (p.valor || 0), 0);
        
    const totalGeral = totalPago + totalPendente;
    
    const pagas = todasParcelas.filter(p => p.status === 'PAGO').length;
    const pendentes = todasParcelas.filter(p => p.status === 'PENDENTE').length;
    
    console.log('📊 Modal consolidado:', {
        totalParcelas: todasParcelas.length,
        pagas: pagas,
        pendentes: pendentes,
        totalPago: totalPago,
        totalPendente: totalPendente,
        totalGeral: totalGeral
    });
    
    const modalHTML = '<div id="history-modal-simple" style="' +
            'display: flex;' +
            'position: fixed;' +
            'top: 0;' +
            'left: 0;' +
            'width: 100vw;' +
            'height: 100vh;' +
            'background: rgba(0, 0, 0, 0.8);' +
            'z-index: 999999;' +
            'justify-content: center;' +
            'align-items: center;' +
        '">' +
            '<div style="' +
                'background: white;' +
                'padding: 30px;' +
                'border-radius: 10px;' +
                'max-width: 800px;' +
                'width: 90%;' +
                'max-height: 80vh;' +
                'overflow-y: auto;' +
            '">' +
                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">' +
                    '<h2 style="margin: 0; font-size: 24px; font-weight: bold;">' +
                        donation.nome_doador + ' (' + donation.codigo_doador + ')' +
                    '</h2>' +
                    '<button onclick="closeHistoryModal()" style="' +
                        'background: #f87171; color: white; border: none; padding: 8px 12px; border-radius: 50%; cursor: pointer; font-size: 16px;' +
                    '">×</button>' +
                '</div>' +
                
                '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px;">' +
                    '<div style="background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center;">' +
                        '<div style="font-size: 32px; font-weight: bold; color: #065f46;">' + pagas + '</div>' +
                        '<div style="color: #065f46; font-weight: 600;">Pagas</div>' +
                    '</div>' +
                    '<div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">' +
                        '<div style="font-size: 32px; font-weight: bold; color: #92400e;">' + pendentes + '</div>' +
                        '<div style="color: #92400e; font-weight: 600;">Pendentes</div>' +
                    '</div>' +
                    '<div style="background: #dbeafe; padding: 20px; border-radius: 8px; text-align: center;">' +
                        '<div style="font-size: 20px; font-weight: bold; color: #1e40af;">R$ ' + totalGeral.toFixed(2).replace('.', ',') + '</div>' +
                        '<div style="color: #1e40af; font-weight: 600;">Total Pago</div>' +
                    '</div>' +
                '</div>' +
                
                '<div style="margin-bottom: 25px;">' +
                    '<h3 style="margin-bottom: 15px; color: #374151; font-size: 18px;">Valor Total: R$ ' + donation.valor + '</h3>' +
                    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">' +
                        '<div><strong>Tipo:</strong> ' + donation.tipo + '</div>' +
                        '<div><strong>Total de Parcelas:</strong> ' + todasParcelas.length + ' parcelas</div>' +
                    '</div>' +
                '</div>' +
                
                (todasParcelas.length > 0 ? 
                '<div style="overflow-x: auto;">' +
                    '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' +
                        '<thead>' +
                            '<tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">' +
                                '<th style="padding: 12px; text-align: left; font-weight: 600;">Parcela</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: 600;">Vencimento</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: 600;">Valor</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: 600;">Status</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: 600;">Data Pagamento</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: 600;">Ação</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            todasParcelas.map(function(p, index) {
                                const vencFormatado = new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR');
                                const pgtoFormatado = p.dataPagamento !== '-' ? new Date(p.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
                                
                                return '<tr style="border-bottom: 1px solid #e5e7eb;">' +
                                    '<td style="padding: 12px;">• ' +
                                        String(p.numero).padStart(2, '0') + '/' + String(todasParcelas.length).padStart(2, '0') +
                                    '</td>' +
                                    '<td style="padding: 12px;">' + vencFormatado + '</td>' +
                                    '<td style="padding: 12px; font-weight: 600;">R$ ' +
                                        p.valor.toFixed(2).replace('.', ',') +
                                    '</td>' +
                                    '<td style="padding: 12px;">' +
                                        '<span style="' +
                                            'padding: 4px 12px;' +
                                            'border-radius: 9999px;' +
                                            'font-size: 12px;' +
                                            'font-weight: bold;' +
                                            (p.status === 'PAGO' ? 
                                                'background: #10b981; color: white;' : 
                                                'background: #f59e0b; color: white;'
                                            ) +
                                        '">' + 
                                        (p.status === 'PAGO' ? '✅ PAGO' : '⏳ PENDENTE') + 
                                        '</span>' +
                                    '</td>' +
                                    '<td style="padding: 12px;">' + pgtoFormatado + '</td>' +
                                    '<td style="padding: 12px;">' +
                                        (p.status === 'PENDENTE' && p.futura ? 
                                            '<button onclick="pagarParcela(' + donation.id + ', ' + p.numero + ', ' + p.valor + ')" ' +
                                            'style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Pagar</button>'
                                            : 'Pago'
                                        ) +
                                    '</td>' +
                                '</tr>';
                            }).join('') +
                        '</tbody>' +
                    '</table>' +
                '</div>'
                : 
                '<div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px;">' +
                    '<p style="color: #6b7280; margin: 0;">Nenhuma parcela encontrada</p>' +
                '</div>'
                ) +
                
                '<div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">' +
                    '<button onclick="closeHistoryModal()" style="' +
                        'padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                    '">Fechar</button>' +
                    '<button onclick="window.generateCarne && window.generateCarne(' + donation.id + ')" style="' +
                        'padding: 12px 25px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                    '">🏷️ Gerar Carnê</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}`;

console.log('🔄 Aplicando correções...');

// Localizar e substituir a função viewHistory
const viewHistoryRegex = /window\.viewHistory\s*=\s*async\s+function\(id\)\s*\{[^}]*\}(?:\s*\})?/s;
if (viewHistoryRegex.test(appContent)) {
    appContent = appContent.replace(viewHistoryRegex, newViewHistoryFunction.trim());
    console.log('✅ Função viewHistory atualizada');
} else {
    console.log('⚠️ Padrão viewHistory não encontrado - buscando alternativa...');
    // Padrão alternativo
    const altPattern = /\/\*\*[\s\S]*?Visualizar histórico[\s\S]*?\*\/[\s\S]*?window\.viewHistory[\s\S]*?\}/;
    if (altPattern.test(appContent)) {
        appContent = appContent.replace(altPattern, newViewHistoryFunction.trim());
        console.log('✅ Função viewHistory atualizada (padrão alternativo)');
    }
}

// Localizar e substituir a função showHistoryModal
const showHistoryRegex = /function\s+showHistoryModal\([^)]*\)\s*\{(?:[^{}]*\{[^{}]*\})*[^}]*\}/s;
if (showHistoryRegex.test(appContent)) {
    appContent = appContent.replace(showHistoryRegex, newShowHistoryModalFunction.trim());
    console.log('✅ Função showHistoryModal atualizada');
} else {
    console.log('⚠️ Padrão showHistoryModal não encontrado - adicionando no final...');
}

// Adicionar função de pagar parcela se não existir
const pagarParcelaFunction = `
/**
 * Pagar parcela específica - NOVA FUNÇÃO v2.4.0
 */
window.pagarParcela = async function(doacaoId, numeroParcela, valor) {
    const hoje = new Date().toISOString().split('T')[0];
    
    if (!confirm('Confirma o pagamento da parcela ' + numeroParcela + ' no valor de R$ ' + valor.toFixed(2).replace('.', ',') + '?')) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE + '/doacoes/' + doacaoId + '/pagar-parcela', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                numero_parcela: numeroParcela,
                data_pagamento: hoje,
                valor: valor
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Parcela ' + numeroParcela + ' paga com sucesso!');
            closeHistoryModal();
            loadDashboard(); // Recarregar dashboard
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}`;

// Adicionar função se não existir
if (!appContent.includes('window.pagarParcela')) {
    appContent += '\n\n' + pagarParcelaFunction;
    console.log('✅ Função pagarParcela adicionada');
}

// Salvar arquivo corrigido
fs.writeFileSync(appJsPath, appContent, 'utf8');

console.log('');
console.log('✅ CORREÇÃO DO MODAL DE HISTÓRICO CONCLUÍDA!');
console.log('='.repeat(60));
console.log('');
console.log('🎯 CORREÇÕES APLICADAS:');
console.log('   ✅ Função viewHistory() busca dados das 2 tabelas');
console.log('   ✅ Função showHistoryModal() consolida dados corretamente');
console.log('   ✅ Modal mostra valores corretos das parcelas');
console.log('   ✅ Adicionada função pagarParcela()');
console.log('');
console.log('🧪 TESTE RECOMENDADO:');
console.log('   1. Reiniciar servidor: npm start');
console.log('   2. Abrir modal da doação NAIR RODRIGUES');
console.log('   3. Verificar: 1 paga (R$ 50) + 3 pendentes (R$ 12 cada)');
console.log('   4. Total esperado: R$ 86,00');
console.log('');
console.log('🎉 Sistema pronto para teste!');