/**
 * ================================================================
 * MÓDULO: Funções Completas Restauradas
 * ================================================================
 * Arquivo: functions.js
 * Descrição: Todas as funções críticas restauradas do backup
 * Versão: 1.0.0 - Restaurado em 09/09/2025
 * ================================================================
 */

// Variáveis globais necessárias
if (!window.appState) {
    window.appState = {
        allDonations: [],
        currentEditingId: null,
        currentDonationId: null
    };
}

let allDonations = [];

// ========== FUNÇÕES PRINCIPAIS ==========

function loadDonations() {
    try {
        console.log('📋 Carregando doações...');
        
        const response = await fetch(API_BASE + '/doacoes');
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        
        const data = await response.json();
        
        // CORREÇÃO: Garantir que allDonations seja um array
        allDonations = Array.isArray(data) ? data : [];
        
        console.log(allDonations.length + ' doações carregadas');
        
        // Aplicar filtros e renderizar
        applyFilters();
        
    } catch (error) {
        console.error('❌ Erro ao carregar doações:', error);
        
        // Mostrar estado de erro
        showErrorState(error.message);
        throw error;
    }
}


// Função renderDonations restaurada
function renderDonations(donations) {
    const tbody = document.getElementById('donations-tbody');
    if (!tbody) return;
    
    if (!donations || donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Nenhuma doação encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = donations.map(d => `
        <tr class="hover:bg-gray-50 border-b">
            <td class="px-6 py-4">${d.codigo_doador || '-'}</td>
            <td class="px-6 py-4 font-medium">${d.nome_doador || 'Não informado'}</td>
            <td class="px-6 py-4">${d.telefone1 || '-'}</td>
            <td class="px-6 py-4">${formatCurrency(d.valor)}</td>
            <td class="px-6 py-4">${d.tipo || 'Dinheiro'}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${d.recorrente ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                    ${d.recorrente ? 'Recorrente' : 'Única'}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="editDonation(${d.id})" class="text-blue-600 hover:text-blue-900 mr-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button onclick="deleteDonation(${d.id})" class="text-red-600 hover:text-red-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ ${donations.length} doações renderizadas`);
}


// Função para atualizar dashboard
function updateDashboard(donations) {
    // Total de doações
    const totalEl = document.querySelector('.bg-white .text-2xl');
    if (totalEl) totalEl.textContent = donations.length;
    
    // Total arrecadado
    const total = donations.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    const totalValueEl = document.querySelectorAll('.bg-white .text-2xl')[1];
    if (totalValueEl) totalValueEl.textContent = formatCurrency(total);
    
    // Doações recorrentes
    const recurrent = donations.filter(d => d.recorrente === 1).length;
    const recurrentEl = document.querySelectorAll('.bg-white .text-2xl')[2];
    if (recurrentEl) recurrentEl.textContent = recurrent;
}

// Funções de formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Outras funções extraídas
window.editDonation = async function(id) {
    console.log('✏️ Editando doação ' + id);
    
    try {
        // Buscar dados completos da doação
        const response = await fetch(API_BASE + '/doacoes/' + id);
        if (!response.ok) {
            throw new Error('Doação não encontrada');
        }
        
        const donation = await response.json();
        
        // Criar modal de edição
        let existingModal = document.getElementById('edit-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = '<div id="edit-modal" style="' +
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
                    'width: 90%;' +
                    'max-height: 90vh;' +
                    'overflow-y: auto;' +
                '">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">' +
                        '<h2 style="margin: 0; font-size: 24px; font-weight: bold;">' +
                            'Editar Doação - ' + (donation.codigo_doador || 'D' + donation.doador_id) +
                        '</h2>' +
                        '<button onclick="closeEditModal()" style="' +
                            'background: none;' +
                            'border: none;' +
                            'font-size: 30px;' +
                            'cursor: pointer;' +
                            'color: #666;' +
                        '">&times;</button>' +
                    '</div>' +
                    
                    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">' +
                        '<div>' +
                            '<h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">' +
                                '👤 Dados do Doador' +
                            '</h3>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome Completo *</label>' +
                                '<input type="text" id="edit-donor" value="' + (donation.nome_doador || donation.doador_nome) + '" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">CPF</label>' +
                                '<input type="text" id="edit-cpf" value="' + (donation.doador_cpf || '') + '" placeholder="000.000.000-00" maxlength="14" ' +
                                       'oninput="formatCPFInput(event)" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Principal *</label>' +
                                '<input type="tel" id="edit-phone1" value="' + (donation.doador_telefone1 || donation.telefone1) + '" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Alternativo</label>' +
                                '<input type="tel" id="edit-phone2" value="' + (donation.doador_telefone2 || donation.telefone2 || '') + '" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">E-mail</label>' +
                                '<input type="email" id="edit-email" value="' + (donation.doador_email || '') + '" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<h4 style="margin: 20px 0 15px 0; font-size: 16px; font-weight: bold; color: #555; border-top: 1px solid #eee; padding-top: 15px;">' +
                                '📍 Endereço' +
                            '</h4>' +
                            
                            '<div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 10px;">' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">CEP</label>' +
                                    '<input type="text" id="edit-cep" value="' + (donation.doador_cep || '') + '" placeholder="00000-000" maxlength="9" ' +
                                           'oninput="formatCEPInput(event)" style="' +
                                        'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' +
                                    '">' +
                                '</div>' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Logradouro</label>' +
                                    '<input type="text" id="edit-logradouro" value="' + (donation.doador_logradouro || '') + '" placeholder="Rua, Avenida..." style="' +
                                        'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' +
                                    '">' +
                                '</div>' +
                            '</div>' +
                            
                            '<div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 10px;">' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Número</label>' +
                                    '<input type="text" id="edit-numero" value="' + (donation.doador_numero || '') + '" placeholder="123" style="' +
                                        'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' +
                                    '">' +
                                '</div>' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Complemento</label>' +
                                    '<input type="text" id="edit-complemento" value="' + (donation.doador_complemento || '') + '" placeholder="Apto, Bloco, Sala..." style="' +
                                        'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' +
                                    '">' +
                                '</div>' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 10px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Bairro</label>' +
                                '<input type="text" id="edit-bairro" value="' + (donation.doador_bairro || '') + '" placeholder="Nome do bairro" style="' +
                                    'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' +
                                '">' +
                            '</div>' +
                            
                            '<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Cidade</label>' +
                                    '<input type="text" id="edit-cidade" value="' + (donation.doador_cidade || '') + '" placeholder="Nome da cidade" style="' +
                                        'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' +
                                    '">' +
                                '</div>' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Estado</label>' +
                                    '<input type="text" id="edit-estado" value="' + (donation.doador_estado || '') + '" placeholder="UF" maxlength="2" style="' +
                                        'width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; text-transform: uppercase;' +
                                    '">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        
                        '<div>' +
                            '<h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">' +
                                '💰 Dados da Doação' +
                            '</h3>' +
                            
                            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">' +
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Valor (R$) *</label>' +
                                    '<input type="number" id="edit-amount" value="' + donation.valor + '" step="0.01" style="' +
                                        'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                    '">' +
                                '</div>' +
                                
                                '<div>' +
                                    '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo *</label>' +
                                    '<select id="edit-type" style="' +
                                        'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;' +
                                    '">' +
                                        '<option value="Dinheiro"' + (donation.tipo === 'Dinheiro' ? ' selected' : '') + '>Dinheiro</option>' +
                                        '<option value="PIX"' + (donation.tipo === 'PIX' ? ' selected' : '') + '>PIX</option>' +
                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Data da Doação *</label>' +
                                '<input type="date" id="edit-date" value="' + donation.data_doacao + '" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 15px;">' +
                                '<label style="display: flex; align-items: center; gap: 10px; font-weight: bold;">' +
                                    '<input type="checkbox" id="edit-recurring"' + (donation.recorrente ? ' checked' : '') + ' style="' +
                                        'width: 18px; height: 18px; cursor: pointer;' +
                                    '">' +
                                    '<span>Doação recorrente</span>' +
                                '</label>' +
                            '</div>' +
                            
                            '<div style="margin-bottom: 20px;">' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Observações</label>' +
                                '<textarea id="edit-notes" rows="4" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; resize: vertical;' +
                                '">' + (donation.observacoes || '') + '</textarea>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">' +
                        '<button onclick="closeEditModal()" style="' +
                            'padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                        '">Cancelar</button>' +
                        
                        '<button onclick="saveEditedDonation(' + id + ')" style="' +
                            'padding: 12px 25px; border: none; background: #3b82f6; color: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                        '">💾 Salvar Alterações</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('❌ Erro ao carregar doação:', error);
        alert('❌ Erro ao carregar doação: ' + error.message);
    }
}

window.deleteDonation = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta doação?')) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE + '/doacoes/' + id, { 
            method: 'DELETE' 
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Doação excluída!');
            loadDashboard(); // Recarregar dashboard
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

function applyFilters() {
    const searchTerm = elements.searchInput && elements.searchInput.value ? elements.searchInput.value.toLowerCase() : '';
    const filterType = elements.filterType ? elements.filterType.value : '';
    const filterRecurrent = elements.filterRecurring ? elements.filterRecurring.value : '';
    
    filteredDonations = allDonations.filter(donation => {
        // Verificar se os campos existem antes de usar toLowerCase()
        const donorName = (donation.nome_doador || '').toLowerCase();
        const donorCode = (donation.codigo_doador || '').toLowerCase();
        const phone1 = (donation.telefone1 || '').toLowerCase();
        const phone2 = (donation.telefone2 || '').toLowerCase();
        
        // Filtro de busca
        const matchSearch = !searchTerm || 
            donorName.includes(searchTerm) ||
            donorCode.includes(searchTerm) ||
            phone1.includes(searchTerm) ||
            phone2.includes(searchTerm);
        
        // Filtro de tipo
        const matchType = !filterType || donation.tipo === filterType;
        
        // Filtro de recorrência
        const matchRecurrent = filterRecurrent === '' || 
            donation.recorrente === parseInt(filterRecurrent);
        
        return matchSearch && matchType && matchRecurrent;
    });
    
    console.log('🔍 Filtros aplicados: ' + filteredDonations.length + '/' + allDonations.length + ' doações');
    
    // Renderizar tabela
    renderDonationsTable(filteredDonations);
}

function generateCarne(doacaoId) {
    try {
        alert('🔍 Iniciando geração do carnê...');
        
        // Buscar dados básicos
        const doacaoResponse = await fetch(`/api/doacoes/${doacaoId}`);
        const doacao = await doacaoResponse.json();
        const doadorResponse = await fetch(`/api/doadores/${doacao.doador_id}`);
        const doador = await doadorResponse.json();
        
        alert('📄 Dados carregados. Criando janela...');
        
        // Criar janela
        const novaJanela = window.open('', '_blank', 'width=900,height=700');
        
        // HTML MÍNIMO com selo e QR FORÇADOS
        const htmlTeste = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TESTE - Carnê com Selo e QR</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f0f0f0;
        }
        
        /* SELO TESTE - SUPER VISÍVEL */
        #selo-teste {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 150px !important;
            height: 150px !important;
            background: red !important;
            color: white !important;
            border: 5px solid black !important;
            border-radius: 50% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            font-size: 14px !important;
            font-weight: bold !important;
            z-index: 99999 !important;
            box-shadow: 0 0 20px rgba(255,0,0,0.8) !important;
        }
        
        /* QR CODE TESTE - SUPER VISÍVEL */
        .qr-teste {
            width: 200px !important;
            height: 200px !important;
            background: blue !important;
            color: white !important;
            border: 5px solid black !important;
            margin: 20px auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            font-size: 16px !important;
            font-weight: bold !important;
        }
        
        .cabecalho {
            text-align: center;
            padding: 20px;
            background: yellow;
            border: 3px solid black;
            margin-bottom: 20px;
        }
        
        .parcela-teste {
            border: 3px solid black;
            padding: 20px;
            margin: 20px 0;
            background: white;
        }
    </style>
</head>
<body>
    <!-- SELO TESTE -->
    <div id="selo-teste">
        🔒<br>
        SELO<br>
        TESTE<br>
        VISÍVEL
    </div>
    
    <!-- CABEÇALHO -->
    <div class="cabecalho">
        <h1>🔍 TESTE - CARNÊ COM SELO E QR</h1>
        <h2>${doador.nome}</h2>
        <p>Código: ${doador.codigo_doador || 'D' + doador.id}</p>
    </div>
    
    <!-- PARCELA TESTE -->
    <div class="parcela-teste">
        <h3>📄 PARCELA DE TESTE</h3>
        <p><strong>Valor:</strong> R$ ${doacao.valor.toFixed(2).replace('.', ',')}</p>
        <p><strong>Tipo:</strong> ${doacao.tipo}</p>
        
        <!-- QR CODE TESTE -->
        <div class="qr-teste">
            📱<br>
            QR CODE<br>
            TESTE<br>
            VISÍVEL
        </div>
        
        <p style="color: red; font-weight: bold;">
            ⚠️ Se você está vendo este texto, o carnê está sendo gerado!<br>
            ✅ Se você vê o SELO VERMELHO no canto, o CSS está funcionando!<br>
            ✅ Se você vê o QR CODE AZUL, tudo está OK!
        </p>
    </div>
    
    <div style="text-align: center; margin: 30px;">
        <button onclick="window.print()" style="
            padding: 15px 30px; 
            background: green; 
            color: white; 
            border: none; 
            font-size: 16px; 
            cursor: pointer;
        ">🖨️ Imprimir Teste</button>
    </div>
    
    <script>
        // Debug no console
        console.log('🔍 Carnê de teste carregado!');
        console.log('Selo:', document.getElementById('selo-teste'));
        console.log('QR Codes:', document.querySelectorAll('.qr-teste'));
        
        // Garantir que o selo seja visível
        setTimeout(() => {
            const selo = document.getElementById('selo-teste');
            if (selo) {
                selo.style.background = 'red';
                selo.style.display = 'flex';
                console.log('✅ Selo forçado como visível');
            }
        }, 100);
    </script>
</body>
</html>`;
        
        // Escrever na janela
        novaJanela.document.write(htmlTeste);
        novaJanela.document.close();
        
        alert('✅ Carnê de teste criado! Verifique se o SELO VERMELHO e QR CODE AZUL estão visíveis.');
        
    } catch (error) {
        alert('❌ Erro no teste: ' + error.message);
        console.error('Erro:', error);
    }
}

window.exportData = async function() {
    try {
        console.log('📤 Gerando relatório PDF...');
        
        // Buscar dados do resumo
        const resumoResponse = await fetch(API_BASE + '/relatorios/resumo');
        const resumo = await resumoResponse.json();
        
        // Buscar lista de doações
        const doacoesResponse = await fetch(API_BASE + '/doacoes');
        const doacoes = await doacoesResponse.json();
        
        // Criar janela para PDF
        const printWindow = window.open('', '_blank');
        
        // HTML do relatório
        const relatorioHTML = '' +
'<!DOCTYPE html>' +
'<html lang="pt-BR">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <title>Relatório de Doações - ' + new Date().toLocaleDateString('pt-BR') + '</title>' +
'    <style>' +
'        @media print {' +
'            body { margin: 0; }' +
'            .no-print { display: none !important; }' +
'            .page-break { page-break-after: always; }' +
'        }' +
'        body {' +
'            font-family: Arial, sans-serif;' +
'            margin: 20px;' +
'            color: #333;' +
'            line-height: 1.6;' +
'        }' +
'        .header {' +
'            text-align: center;' +
'            margin-bottom: 30px;' +
'            padding: 20px;' +
'            background: #f5f5f5;' +
'            border: 2px solid #333;' +
'        }' +
'        .header h1 {' +
'            margin: 0;' +
'            color: #333;' +
'        }' +
'        .section {' +
'            margin: 30px 0;' +
'        }' +
'        .section-title {' +
'            font-size: 18px;' +
'            font-weight: bold;' +
'            margin-bottom: 15px;' +
'            padding-bottom: 5px;' +
'            border-bottom: 2px solid #333;' +
'        }' +
'        .summary-grid {' +
'            display: grid;' +
'            grid-template-columns: repeat(2, 1fr);' +
'            gap: 20px;' +
'            margin: 20px 0;' +
'        }' +
'        .summary-card {' +
'            padding: 15px;' +
'            background: #f9f9f9;' +
'            border: 1px solid #ddd;' +
'            border-radius: 5px;' +
'        }' +
'        .summary-card h3 {' +
'            margin: 0 0 10px 0;' +
'            color: #555;' +
'            font-size: 14px;' +
'        }' +
'        .summary-card .value {' +
'            font-size: 24px;' +
'            font-weight: bold;' +
'            color: #333;' +
'        }' +
'        table {' +
'            width: 100%;' +
'            border-collapse: collapse;' +
'            margin: 20px 0;' +
'        }' +
'        th {' +
'            background: #333;' +
'            color: white;' +
'            padding: 10px;' +
'            text-align: left;' +
'            font-size: 14px;' +
'        }' +
'        td {' +
'            padding: 8px;' +
'            border-bottom: 1px solid #ddd;' +
'            font-size: 13px;' +
'        }' +
'        tr:nth-child(even) {' +
'            background: #f9f9f9;' +
'        }' +
'        .footer {' +
'            margin-top: 50px;' +
'            padding-top: 20px;' +
'            border-top: 1px solid #ddd;' +
'            text-align: center;' +
'            font-size: 12px;' +
'            color: #666;' +
'        }' +
'        @page {' +
'            size: A4;' +
'            margin: 15mm;' +
'        }' +
'    </style>' +
'</head>' +
'<body>' +
'    <div class="header">' +
'        <h1>RELATÓRIO DE DOAÇÕES</h1>' +
'        <p>Gerado em ' + new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR') + '</p>' +
'    </div>' +
'    ' +
'    <div class="section">' +
'        <div class="section-title">RESUMO GERAL</div>' +
'        <div class="summary-grid">' +
'            <div class="summary-card">' +
'                <h3>Total Arrecadado</h3>' +
'                <div class="value">R$ ' + (resumo.total_arrecadado || 0).toFixed(2).replace('.', ',') + '</div>' +
'            </div>' +
'            <div class="summary-card">' +
'                <h3>Total de Doações</h3>' +
'                <div class="value">' + (resumo.total_doacoes || 0) + '</div>' +
'            </div>' +
'            <div class="summary-card">' +
'                <h3>Doações Recorrentes</h3>' +
'                <div class="value">' + (resumo.doacoes_recorrentes || 0) + '</div>' +
'            </div>' +
'            <div class="summary-card">' +
'                <h3>Total de Pagamentos</h3>' +
'                <div class="value">' + (resumo.total_pagamentos || 0) + '</div>' +
'            </div>' +
'        </div>' +
'    </div>' +
'    ' +
'    <div class="section">' +
'        <div class="section-title">DETALHAMENTO DAS DOAÇÕES</div>' +
'        <table>' +
'            <thead>' +
'                <tr>' +
'                    <th>Código</th>' +
'                    <th>Doador</th>' +
'                    <th>Valor</th>' +
'                    <th>Tipo</th>' +
'                    <th>Data</th>' +
'                    <th>Recorrente</th>' +
'                    <th>Telefone</th>' +
'                </tr>' +
'            </thead>' +
'            <tbody>';
        
        // Adicionar linhas da tabela
        let tabelaRows = '';
        doacoes.forEach(function(doacao) {
            tabelaRows += '' +
'                <tr>' +
'                    <td>' + (doacao.codigo_doador || 'D' + String(doacao.doador_id).padStart(3, '0')) + '</td>' +
'                    <td>' + (doacao.nome_doador || 'N/A') + '</td>' +
'                    <td>R$ ' + doacao.valor.toFixed(2).replace('.', ',') + '</td>' +
'                    <td>' + doacao.tipo + '</td>' +
'                    <td>' + formatDate(doacao.data_doacao) + '</td>' +
'                    <td>' + (doacao.recorrente ? 'Sim' : 'Não') + '</td>' +
'                    <td>' + (doacao.telefone1 || 'N/A') + '</td>' +
'                </tr>';
        });
        
        const finalHTML = relatorioHTML + tabelaRows + '' +
'            </tbody>' +
'        </table>' +
'    </div>' +
'    ' +
'    <div class="footer">' +
'        <p>Sistema de Controle de Doações - Relatório Oficial</p>' +
'        <p>Este documento foi gerado automaticamente e contém informações confidenciais.</p>' +
'    </div>' +
'    ' +
'    <div class="no-print" style="text-align: center; margin: 30px;">' +
'        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">' +
'            Imprimir Relatório' +
'        </button>' +
'    </div>' +
'</body>' +
'</html>';
        
        // Escrever HTML na nova janela
        printWindow.document.write(finalHTML);
        printWindow.document.close();
        
        alert('✅ Relatório PDF gerado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        alert('❌ Erro ao gerar relatório PDF: ' + error.message);
    }
}

window.buscarCEP = async function(cepValue, contexto = 'input') {
    console.log('🔍 buscarCEP chamada:', { cepValue, contexto });
    
    // Limpar CEP
    const cep = cepValue.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        console.log('⚠️ CEP inválido (não tem 8 dígitos):', cep);
        return;
    }
    
    // Definir IDs dos campos baseado no contexto
    let ids = {};
    if (contexto === 'input') {
        // Modal Nova Doação
        ids = {
            cep: 'input-cep',
            logradouro: 'input-logradouro',
            bairro: 'input-bairro',
            cidade: 'input-cidade',
            estado: 'input-estado'
        };
    } else if (contexto === 'edit') {
        // Modal Edição
        ids = {
            cep: 'edit-cep',
            logradouro: 'edit-logradouro',
            bairro: 'edit-bairro',
            cidade: 'edit-cidade',
            estado: 'edit-estado'
        };
    } else if (contexto === 'simple') {
        // Modal Simples (legado)
        ids = {
            cep: 'simple-cep',
            logradouro: 'simple-logradouro',
            bairro: 'simple-bairro',
            cidade: 'simple-cidade',
            estado: 'simple-estado'
        };
    } else {
        console.error('❌ Contexto inválido:', contexto);
        return;
    }
    
    console.log('🎯 IDs que serão usados:', ids);
    
    // Obter elementos
    const cepField = document.getElementById(ids.cep);
    const logradouroField = document.getElementById(ids.logradouro);
    const bairroField = document.getElementById(ids.bairro);
    const cidadeField = document.getElementById(ids.cidade);
    const estadoField = document.getElementById(ids.estado);
    
    console.log('📱 Elementos encontrados:', {
        cep: !!cepField,
        logradouro: !!logradouroField,
        bairro: !!bairroField,
        cidade: !!cidadeField,
        estado: !!estadoField
    });
    
    // Mostrar indicador de carregamento
    if (cepField) {
        cepField.style.borderColor = '#fbbf24'; // Amarelo
        console.log('🟡 Indicador de carregamento ativado');
    }
    
    try {
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        console.log('🌐 Fazendo requisição para:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('📦 Resposta ViaCEP:', data);
        
        if (!data.erro) {
            // Preencher campos automaticamente
            if (logradouroField && data.logradouro) {
                logradouroField.value = data.logradouro;
                console.log('✅ Logradouro preenchido:', data.logradouro);
            }
            if (bairroField && data.bairro) {
                bairroField.value = data.bairro;
                console.log('✅ Bairro preenchido:', data.bairro);
            }
            if (cidadeField && data.localidade) {
                cidadeField.value = data.localidade;
                console.log('✅ Cidade preenchida:', data.localidade);
            }
            if (estadoField && data.uf) {
                estadoField.value = data.uf;
                console.log('✅ Estado preenchido:', data.uf);
            }
            
            // Indicar sucesso
            if (cepField) {
                cepField.style.borderColor = '#10b981'; // Verde
                setTimeout(() => {
                    cepField.style.borderColor = '#d1d5db'; // Volta ao normal
                }, 2000);
                console.log('🟢 Indicador de sucesso ativado');
            }
            
            // Focar no próximo campo (número)
            const numeroField = document.getElementById(ids.cep.replace('-cep', '-numero'));
            if (numeroField) {
                setTimeout(() => numeroField.focus(), 100);
                console.log('🎯 Foco movido para campo número');
            }
            
        } else {
            console.log('❌ CEP não encontrado na base ViaCEP');
            if (cepField) {
                cepField.style.borderColor = '#ef4444'; // Vermelho
                setTimeout(() => {
                    cepField.style.borderColor = '#d1d5db';
                }, 2000);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao buscar CEP:', error);
        if (cepField) {
            cepField.style.borderColor = '#ef4444'; // Vermelho
            setTimeout(() => {
                cepField.style.borderColor = '#d1d5db';
            }, 2000);
        }
        
        // Mostrar erro amigável ao usuário
        alert('Erro ao buscar CEP. Verifique sua conexão com a internet e tente novamente.');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        return date.toLocaleDateString('pt-BR');
    } catch (error) {
        return dateString;
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    const colors = {
        'info': 'background: #3b82f6; border-left: 4px solid #1d4ed8;',
        'success': 'background: #10b981; border-left: 4px solid #059669;',
        'error': 'background: #ef4444; border-left: 4px solid #dc2626;',
        'warning': 'background: #f59e0b; border-left: 4px solid #d97706;'
    };
    
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        ${colors[type] || colors.info}
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 350px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease, opacity 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">${icons[type] || icons.info}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px;">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}

// Tornar funções globais
window.loadDonations = loadDonations;
window.renderDonations = renderDonations;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatPhone = formatPhone;
window.allDonations = allDonations;

// Auto-executar ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadDonations, 100);
    });
} else {
    setTimeout(loadDonations, 100);
}

console.log('✅ Funções restauradas e prontas');
