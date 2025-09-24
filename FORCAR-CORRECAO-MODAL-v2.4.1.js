/**
 * Mostra modal de histórico consolidado - VERSÃO CORRIGIDA v2.4.1
 */
function showHistoryModal(donation, payments, parcelas) {
    // Remover modal existente
    let existingModal = document.getElementById('history-modal-simple');
    if (existingModal) {
        existingModal.remove();
    }
    
    console.log('🔄 Construindo modal consolidado...');
    
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
                id: primeiraParcela.id,
                tipo: 'historico'
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
                tipo: 'futura'
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
        totalPago: totalPago.toFixed(2),
        totalPendente: totalPendente.toFixed(2),
        totalGeral: totalGeral.toFixed(2)
    });
    
    // Construir HTML do modal
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
                'max-width: 900px;' +
                'width: 95%;' +
                'max-height: 85vh;' +
                'overflow-y: auto;' +
                'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' +
            '">' +
                // Cabeçalho
                '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">' +
                    '<h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">' +
                        donation.nome_doador + ' (' + donation.codigo_doador + ')' +
                    '</h2>' +
                    '<button onclick="closeHistoryModal()" style="' +
                        'background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 50%; cursor: pointer; font-size: 18px; font-weight: bold;' +
                    '">×</button>' +
                '</div>' +
                
                // Cards de resumo
                '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">' +
                    '<div style="background: #d1fae5; padding: 25px; border-radius: 12px; text-align: center;">' +
                        '<div style="font-size: 36px; font-weight: bold; color: #065f46; margin-bottom: 5px;">' + pagas + '</div>' +
                        '<div style="color: #065f46; font-weight: 600;">Pagas</div>' +
                    '</div>' +
                    '<div style="background: #fef3c7; padding: 25px; border-radius: 12px; text-align: center;">' +
                        '<div style="font-size: 36px; font-weight: bold; color: #92400e; margin-bottom: 5px;">' + pendentes + '</div>' +
                        '<div style="color: #92400e; font-weight: 600;">Pendentes</div>' +
                    '</div>' +
                    '<div style="background: #dbeafe; padding: 25px; border-radius: 12px; text-align: center;">' +
                        '<div style="font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 5px;">R$ ' + totalGeral.toFixed(2).replace('.', ',') + '</div>' +
                        '<div style="color: #1e40af; font-weight: 600;">Total Geral</div>' +
                    '</div>' +
                '</div>' +
                
                // Tabela de parcelas
                (todasParcelas.length > 0 ? 
                '<div style="overflow-x: auto; margin-bottom: 25px;">' +
                    '<table style="width: 100%; border-collapse: collapse; font-size: 14px; background: white;">' +
                        '<thead>' +
                            '<tr style="background: #4f46e5; color: white;">' +
                                '<th style="padding: 15px; text-align: left; font-weight: 600;">Parcela</th>' +
                                '<th style="padding: 15px; text-align: left; font-weight: 600;">Vencimento</th>' +
                                '<th style="padding: 15px; text-align: left; font-weight: 600;">Valor</th>' +
                                '<th style="padding: 15px; text-align: center; font-weight: 600;">Status</th>' +
                                '<th style="padding: 15px; text-align: left; font-weight: 600;">Pagamento</th>' +
                                '<th style="padding: 15px; text-align: center; font-weight: 600;">Ação</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            todasParcelas.map(function(p, index) {
                                const vencFormatado = new Date(p.vencimento + 'T00:00:00').toLocaleDateString('pt-BR');
                                const pgtoFormatado = p.dataPagamento !== '-' ? new Date(p.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
                                const isEven = index % 2 === 0;
                                
                                return '<tr style="' + (isEven ? 'background: #f8fafc;' : 'background: white;') + ' border-bottom: 1px solid #e5e7eb;">' +
                                    '<td style="padding: 15px; font-weight: 600;">' +
                                        String(p.numero).padStart(2, '0') + '/' + String(todasParcelas.length).padStart(2, '0') +
                                    '</td>' +
                                    '<td style="padding: 15px;">' + vencFormatado + '</td>' +
                                    '<td style="padding: 15px; font-weight: 700; color: #059669;">R$ ' +
                                        p.valor.toFixed(2).replace('.', ',') +
                                    '</td>' +
                                    '<td style="padding: 15px; text-align: center;">' +
                                        '<span style="' +
                                            'padding: 6px 12px;' +
                                            'border-radius: 20px;' +
                                            'font-size: 11px;' +
                                            'font-weight: bold;' +
                                            (p.status === 'PAGO' ? 
                                                'background: #10b981; color: white;' : 
                                                'background: #f59e0b; color: white;'
                                            ) +
                                        '">' + 
                                        (p.status === 'PAGO' ? '✅ PAGO' : '⏳ PENDENTE') + 
                                        '</span>' +
                                    '</td>' +
                                    '<td style="padding: 15px;">' + pgtoFormatado + '</td>' +
                                    '<td style="padding: 15px; text-align: center;">' +
                                        (p.status === 'PENDENTE' && p.tipo === 'futura' ? 
                                            '<button onclick="pagarParcela(' + donation.id + ', ' + p.numero + ', ' + p.valor + ')" ' +
                                            'style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">Pagar</button>'
                                            : '<span style="color: #6b7280;">Pago</span>'
                                        ) +
                                    '</td>' +
                                '</tr>';
                            }).join('') +
                        '</tbody>' +
                    '</table>' +
                '</div>'
                : 
                '<div style="text-align: center; padding: 60px; background: #f9fafb; border-radius: 12px;">' +
                    '<p style="color: #6b7280; margin: 0;">Nenhuma parcela encontrada</p>' +
                '</div>'
                ) +
                
                // Rodapé com botões
                '<div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">' +
                    '<button onclick="closeHistoryModal()" style="' +
                        'padding: 12px 25px; border: 2px solid #d1d5db; background: white; color: #374151; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;' +
                    '">Fechar</button>' +
                    '<button onclick="window.generateCarne && window.generateCarne(' + donation.id + ')" style="' +
                        'padding: 12px 25px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;' +
                    '">🏷️ Gerar Carnê</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Fecha modal de histórico - v2.4.1
 */
window.closeHistoryModal = function() {
    const modal = document.getElementById('history-modal-simple');
    if (modal) {
        modal.remove();
        console.log('❌ Modal de histórico fechado');
    }
}

/**
 * Pagar parcela específica - v2.4.1
 */
window.pagarParcela = async function(doacaoId, numeroParcela, valor) {
    const hoje = new Date().toISOString().split('T')[0];
    
    if (!confirm('Confirma o pagamento da parcela ' + numeroParcela + ' no valor de R$ ' + valor.toFixed(2).replace('.', ',') + '?')) {
        return;
    }
    
    try {
        console.log('💰 Processando pagamento da parcela ' + numeroParcela + '...');
        
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
        console.error('❌ Erro ao processar pagamento:', error);
        alert('❌ Erro: ' + error.message);
    }
}

// ================================================================
// FIM DAS FUNÇÕES CORRIGIDAS v2.4.1
// ================================================================
`;

// Adicionar as novas funções
appContent += novasFuncoes;

// Salvar arquivo
fs.writeFileSync(appJsPath, appContent, 'utf8');

console.log('');
console.log('✅ CORREÇÃO FORÇADA CONCLUÍDA!');
console.log('='.repeat(60));
console.log('📊 Informações:');
console.log('   📂 Arquivo: ' + Math.round(appContent.length / 1024) + ' KB');
console.log('   ➕ Funções adicionadas no final do arquivo');
console.log('   🔧 Modal completamente reconstruído');
console.log('');
console.log('🧪 TESTE AGORA:');
console.log('   1. Reiniciar servidor: npm start');
console.log('   2. Abrir modal da NAIR RODRIGUES');
console.log('   3. Verificar valores consolidados');
console.log('');
console.log('🎯 Resultado esperado:');
console.log('   • 1 paga: R$ 50,00');
console.log('   • 3 pendentes: R$ 12,00 cada');
console.log('   • Total: R$ 86,00');
console.log('');
console.log('🎉 Script concluído com sucesso!');