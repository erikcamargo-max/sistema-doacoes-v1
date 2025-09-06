/**
 * SISTEMA DE CONTROLE DE DOAÇÕES - v1.2.0
 * Data: 06/09/2025
 * Descrição: Versão otimizada e limpa do sistema
 */

// ============================================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================================

const CONFIG = {
    API_BASE: '/api',
    VERSION: '1.2.0',
    NOTIFICATION_DURATION: 5000
};

// ============================================================================
// ESTADO GLOBAL
// ============================================================================

const State = {
    allDonations: [],
    filteredDonations: [],
    editingId: null,
    elements: {},
    modals: {
        donation: false,
        history: false,
        export: false
    }
};

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================================================

function showNotification(message, type = 'info', duration = CONFIG.NOTIFICATION_DURATION) {
    const notification = document.createElement('div');
    const colors = {
        info: 'background: #3b82f6; border-left: 4px solid #1d4ed8;',
        success: 'background: #10b981; border-left: 4px solid #059669;',
        error: 'background: #ef4444; border-left: 4px solid #dc2626;',
        warning: 'background: #f59e0b; border-left: 4px solid #d97706;'
    };
    
    const icons = {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        ${colors[type] || colors.info}
        color: white; padding: 16px 20px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000;
        max-width: 350px; font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 14px; font-weight: 500;
        transform: translateX(100%); transition: transform 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// ============================================================================
// SISTEMA DE BUSCA CEP
// ============================================================================

async function buscarCEP(cepValue, contexto = 'input') {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length !== 8) return;
    
    const ids = {
        input: { cep: 'input-cep', logradouro: 'input-logradouro', bairro: 'input-bairro', cidade: 'input-cidade', estado: 'input-estado' },
        edit: { cep: 'edit-cep', logradouro: 'edit-logradouro', bairro: 'edit-bairro', cidade: 'edit-cidade', estado: 'edit-estado' }
    }[contexto];
    
    if (!ids) return;
    
    const fields = {};
    Object.keys(ids).forEach(key => {
        fields[key] = document.getElementById(ids[key]);
    });
    
    if (fields.cep) fields.cep.style.borderColor = '#fbbf24';
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            if (fields.logradouro && data.logradouro) fields.logradouro.value = data.logradouro;
            if (fields.bairro && data.bairro) fields.bairro.value = data.bairro;
            if (fields.cidade && data.localidade) fields.cidade.value = data.localidade;
            if (fields.estado && data.uf) fields.estado.value = data.uf;
            
            if (fields.cep) {
                fields.cep.style.borderColor = '#10b981';
                setTimeout(() => fields.cep.style.borderColor = '#d1d5db', 2000);
            }
        } else {
            if (fields.cep) {
                fields.cep.style.borderColor = '#ef4444';
                setTimeout(() => fields.cep.style.borderColor = '#d1d5db', 2000);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        if (fields.cep) {
            fields.cep.style.borderColor = '#ef4444';
            setTimeout(() => fields.cep.style.borderColor = '#d1d5db', 2000);
        }
    }
}

function formatCEPInput(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    if (value.length > 5) value = value.substring(0, 5) + '-' + value.substring(5);
    
    event.target.value = value;
    
    if (value.replace(/\D/g, '').length === 8) {
        const contexto = event.target.id.includes('edit-') ? 'edit' : 'input';
        buscarCEP(value, contexto);
    }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Sistema de Doações v' + CONFIG.VERSION);
    
    initializeElements();
    setupEventListeners();
    feather.replace();
    loadDashboard();
    
    console.log('✅ Sistema inicializado com sucesso');
});

function initializeElements() {
    const elementIds = [
        'loading', 'summary', 'table-container', 'empty-state', 'modal', 'modal-history',
        'search-input', 'filter-type', 'filter-recurrent', 'donations-tbody',
        'btn-new-donation', 'btn-export', 'total-arrecadado', 'total-doacoes',
        'doacoes-recorrentes', 'total-pagamentos'
    ];
    
    elementIds.forEach(id => {
        State.elements[id] = document.getElementById(id);
    });
}

function setupEventListeners() {
    // Botão Nova Doação
    if (State.elements['btn-new-donation']) {
        State.elements['btn-new-donation'].addEventListener('click', openModal);
    }
    
    // Botão Exportar
    if (State.elements['btn-export']) {
        State.elements['btn-export'].addEventListener('click', showExportModal);
    }
    
    // Filtros
    if (State.elements['search-input']) {
        State.elements['search-input'].addEventListener('input', applyFilters);
    }
    if (State.elements['filter-type']) {
        State.elements['filter-type'].addEventListener('change', applyFilters);
    }
    if (State.elements['filter-recurrent']) {
        State.elements['filter-recurrent'].addEventListener('change', applyFilters);
    }
    
    // Modal - Fechar
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    
    // CEP
    const cepField = document.getElementById('input-cep');
    if (cepField) cepField.addEventListener('input', formatCEPInput);
    
    // Recorrente
    const recurrentCheckbox = document.getElementById('input-recurrent');
    if (recurrentCheckbox) recurrentCheckbox.addEventListener('change', toggleRecurringFields);
}

// ============================================================================
// CARREGAMENTO DE DADOS
// ============================================================================

async function loadDashboard() {
    try {
        showLoading(true);
        await Promise.all([loadSummary(), loadDonations()]);
        showLoading(false);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dashboard: ' + error.message, 'error');
        showLoading(false);
    }
}

async function loadSummary() {
    const response = await fetch(CONFIG.API_BASE + '/relatorios/resumo');
    if (!response.ok) throw new Error('Erro ao carregar resumo');
    
    const data = await response.json();
    
    if (State.elements['total-arrecadado']) {
        State.elements['total-arrecadado'].textContent = formatCurrency(data.total_arrecadado || 0);
    }
    if (State.elements['total-doacoes']) {
        State.elements['total-doacoes'].textContent = data.total_doacoes || 0;
    }
    if (State.elements['doacoes-recorrentes']) {
        State.elements['doacoes-recorrentes'].textContent = data.doacoes_recorrentes || 0;
    }
    if (State.elements['total-pagamentos']) {
        State.elements['total-pagamentos'].textContent = data.total_pagamentos || 0;
    }
}

async function loadDonations() {
    const response = await fetch(CONFIG.API_BASE + '/doacoes');
    if (!response.ok) throw new Error('Erro ao carregar doações');
    
    const data = await response.json();
    State.allDonations = Array.isArray(data) ? data : [];
    applyFilters();
}

// ============================================================================
// FILTROS E RENDERIZAÇÃO
// ============================================================================

function applyFilters() {
    const searchTerm = (State.elements['search-input']?.value || '').toLowerCase();
    const filterType = State.elements['filter-type']?.value || '';
    const filterRecurrent = State.elements['filter-recurrent']?.value || '';
    
    State.filteredDonations = State.allDonations.filter(donation => {
        const matchSearch = !searchTerm || 
            (donation.nome_doador || '').toLowerCase().includes(searchTerm) ||
            (donation.codigo_doador || '').toLowerCase().includes(searchTerm) ||
            (donation.telefone1 || '').toLowerCase().includes(searchTerm);
        
        const matchType = !filterType || donation.tipo === filterType;
        const matchRecurrent = filterRecurrent === '' || donation.recorrente === parseInt(filterRecurrent);
        
        return matchSearch && matchType && matchRecurrent;
    });
    
    renderDonationsTable();
}

function renderDonationsTable() {
    const tbody = State.elements['donations-tbody'];
    const tableContainer = State.elements['table-container'];
    const emptyState = State.elements['empty-state'];
    
    if (!tbody || !tableContainer || !emptyState) return;
    
    if (State.filteredDonations.length === 0) {
        tableContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';
    
    tbody.innerHTML = State.filteredDonations.map(donation => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
                <div class="text-sm">
                    <div class="font-medium text-gray-900">${donation.nome_doador || 'N/A'}</div>
                    <div class="text-gray-500">${donation.codigo_doador || 'D' + String(donation.doador_id || 0).padStart(3, '0')}</div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-semibold text-green-600">
                    ${formatCurrency(donation.valor || 0)}
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(donation.tipo)}">
                    ${donation.tipo}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                ${formatDate(donation.data_doacao)}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                <div>${donation.telefone1 || 'N/A'}</div>
                ${donation.telefone2 ? `<div class="text-xs">${donation.telefone2}</div>` : ''}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${donation.recorrente ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                    ${donation.recorrente ? 'Sim' : 'Não'}
                </span>
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="viewHistory(${donation.id})" class="text-indigo-600 hover:text-indigo-900 transition-colors" title="Ver histórico">
                    <i data-feather="clock" class="h-4 w-4"></i>
                </button>
            </td>
            <td class="px-6 py-4 text-sm font-medium">
                <div class="flex gap-2">
                    <button onclick="editDonation(${donation.id})" class="text-blue-600 hover:text-blue-900 transition-colors" title="Editar">
                        <i data-feather="edit" class="h-4 w-4"></i>
                    </button>
                    <button onclick="generateCarne(${donation.id})" class="text-green-600 hover:text-green-900 transition-colors" title="Gerar carnê">
                        <i data-feather="file-text" class="h-4 w-4"></i>
                    </button>
                    <button onclick="deleteDonation(${donation.id})" class="text-red-600 hover:text-red-900 transition-colors" title="Excluir">
                        <i data-feather="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    feather.replace();
}

// ============================================================================
// MODAL DE DOAÇÃO
// ============================================================================

function openModal() {
    const modal = State.elements.modal;
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal) return;
    
    if (modalTitle) modalTitle.textContent = 'Nova Doação';
    clearModalFields();
    
    const dateField = document.getElementById('input-date');
    if (dateField) dateField.value = new Date().toISOString().split('T')[0];
    
    modal.style.display = 'flex';
    
    const firstInput = document.getElementById('input-donor');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function closeModal() {
    const modal = State.elements.modal;
    if (modal) modal.style.display = 'none';
}

function clearModalFields() {
    const fields = [
        'input-donor', 'input-cpf', 'input-phone1', 'input-phone2', 'input-contact',
        'input-cep', 'input-logradouro', 'input-numero', 'input-complemento',
        'input-bairro', 'input-cidade', 'input-estado',
        'input-amount', 'input-type', 'input-date', 'input-observations',
        'input-parcelas', 'input-proxima-parcela'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = false;
            } else {
                field.value = '';
            }
        }
    });
    
    const recurringFields = document.getElementById('recurring-fields');
    if (recurringFields) recurringFields.style.display = 'none';
}

function toggleRecurringFields() {
    const checkbox = document.getElementById('input-recurrent');
    const fields = document.getElementById('recurring-fields');
    const proximaParcelaField = document.getElementById('input-proxima-parcela');
    
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.style.display = 'block';
            if (proximaParcelaField) {
                const hoje = new Date();
                const proximaData = new Date(hoje);
                proximaData.setDate(proximaData.getDate() + 30);
                proximaParcelaField.value = proximaData.toISOString().substring(0, 10);
            }
        } else {
            fields.style.display = 'none';
        }
    }
}

// ============================================================================
// FUNÇÕES CRUD
// ============================================================================

async function saveDonation() {
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    try {
        const response = await fetch(CONFIG.API_BASE + '/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Doação criada com sucesso!', 'success');
            closeModal();
            loadDashboard();
        } else {
            showNotification('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

window.editDonation = async function(id) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/doacoes/${id}`);
        if (!response.ok) throw new Error('Doação não encontrada');
        
        const donation = await response.json();
        showEditModal(donation);
    } catch (error) {
        showNotification('Erro ao carregar doação: ' + error.message, 'error');
    }
}

window.deleteDonation = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta doação?')) return;
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/doacoes/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Doação excluída!', 'success');
            loadDashboard();
        } else {
            showNotification('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

// ============================================================================
// GERAÇÃO DE CARNÊ
// ============================================================================

window.generateCarne = async function(doacaoId) {
    try {
        showNotification('Gerando carnê...', 'info');
        
        const [doacaoResponse, doadorResponse] = await Promise.all([
            fetch(`${CONFIG.API_BASE}/doacoes/${doacaoId}`),
            fetch(`${CONFIG.API_BASE}/doacoes/${doacaoId}`).then(r => r.json()).then(d => 
                fetch(`${CONFIG.API_BASE}/doadores/${d.doador_id}`)
            )
        ]);
        
        const doacao = await doacaoResponse.json();
        const doador = await doadorResponse.json();
        
        const carneWindow = window.open('', '_blank', 'width=900,height=700');
        if (!carneWindow) throw new Error('Popup bloqueado');
        
        carneWindow.document.write(createCarneHTML(doacao, doador));
        carneWindow.document.close();
        
        showNotification('Carnê gerado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar carnê: ' + error.message, 'error');
    }
}

function createCarneHTML(doacao, doador) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Carnê - ${doador.nome}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.4; 
            color: #333; 
            background: #f8f9fa; 
            padding: 20px; 
        }
        
        .selo-autenticidade {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 120px !important;
            height: 120px !important;
            background: linear-gradient(45deg, #28a745, #20c997) !important;
            border: 4px solid #1e7e34 !important;
            border-radius: 50% !important;
            color: white !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            font-size: 12px !important;
            font-weight: bold !important;
            z-index: 99999 !important;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3) !important;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .cabecalho {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            text-align: center;
            padding: 30px 20px;
        }
        
        .parcela {
            border-bottom: 3px solid #e9ecef;
            display: flex;
            min-height: 280px;
        }
        
        .canhoto {
            width: 35%;
            background: #f8f9fa;
            padding: 20px;
            border-right: 3px dashed #6c757d;
        }
        
        .recibo {
            width: 65%;
            padding: 20px;
            background: white;
        }
        
        .qr-section {
            margin-top: 20px !important;
            padding: 15px !important;
            background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
            border: 3px solid #2196f3 !important;
            border-radius: 8px !important;
            text-align: center !important;
        }
        
        .qr-code-box {
            width: 100px !important;
            height: 100px !important;
            border: 3px dashed #1976d2 !important;
            background: white !important;
            margin: 10px auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            font-weight: bold !important;
            color: #1565c0 !important;
            border-radius: 8px !important;
        }
        
        .btn-imprimir {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            border-radius: 8px;
            cursor: pointer;
            display: block;
            margin: 30px auto;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .btn-imprimir { display: none; }
        }
    </style>
</head>
<body>
    <div class="selo-autenticidade">
        <div style="font-size: 24px; margin-bottom: 5px;">🔒</div>
        <div>DOCUMENTO</div>
        <div>AUTÊNTICO</div>
        <div style="font-size: 10px; margin-top: 5px;">v${CONFIG.VERSION}</div>
    </div>

    <div class="container">
        <div class="cabecalho">
            <h1>CARNÊ DE PAGAMENTO</h1>
            <h2>${doador.nome.toUpperCase()}</h2>
            <div style="margin-top: 15px;">
                <strong>Código:</strong> ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
                ${doador.cpf ? ` | <strong>CPF:</strong> ${doador.cpf}` : ''}
            </div>
        </div>

        <div class="parcela">
            <div class="canhoto">
                <h3>CANHOTO - CONTROLE</h3>
                <div style="margin: 12px 0;">
                    <strong>Código:</strong> ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Valor:</strong> <span style="color: #dc3545; font-size: 18px; font-weight: bold;">
                        ${formatCurrency(doacao.valor)}
                    </span>
                </div>
                <div style="margin: 12px 0;">
                    <strong>Vencimento:</strong> ${formatDate(doacao.data_doacao)}
                </div>
            </div>
            
            <div class="recibo">
                <h3>RECIBO DE PAGAMENTO</h3>
                <div style="margin: 12px 0;">
                    <strong>Recebemos de:</strong> ${doador.nome.toUpperCase()}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Importância de:</strong> <span style="color: #dc3545; font-size: 18px; font-weight: bold;">
                        ${formatCurrency(doacao.valor)}
                    </span>
                </div>
                <div style="margin: 12px 0;">
                    <strong>Vencimento:</strong> ${formatDate(doacao.data_doacao)}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Telefone:</strong> ${doador.telefone1 || 'Não informado'}
                </div>
                
                ${doacao.tipo === 'PIX' ? `
                <div class="qr-section">
                    <h4 style="margin: 0 0 10px 0; color: #1976d2;">📱 QR Code PIX</h4>
                    <div class="qr-code-box">
                        <div style="font-size: 20px;">📱</div>
                        <div style="font-size: 10px;">QR CODE</div>
                        <div style="font-size: 8px;">${formatCurrency(doacao.valor)}</div>
                    </div>
                    <div style="font-size: 11px; color: #1976d2; margin-top: 8px;">
                        📲 Aponte a câmera do celular<br>
                        💰 Valor: ${formatCurrency(doacao.valor)}<br>
                        📅 Vencimento: ${formatDate(doacao.data_doacao)}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </div>
    
    <button class="btn-imprimir" onclick="window.print()">
        🖨️ Imprimir Carnê
    </button>
</body>
</html>`;
}

// ============================================================================
// HISTÓRICO E EXPORTAÇÃO
// ============================================================================

window.viewHistory = async function(id) {
    try {
        const [donationResponse, historyResponse] = await Promise.all([
            fetch(`${CONFIG.API_BASE}/doacoes/${id}`),
            fetch(`${CONFIG.API_BASE}/doacoes/${id}/historico`)
        ]);
        
        const donation = await donationResponse.json();
        const payments = await historyResponse.json();
        
        showHistoryModal(donation, payments);
    } catch (error) {
        showNotification('Erro ao carregar histórico: ' + error.message, 'error');
    }
}

function showExportModal() {
    const existingModal = document.getElementById('export-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="export-modal" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); z-index: 999999;
            display: flex; justify-content: center; align-items: center;
        ">
            <div style="
                background: white; padding: 40px; border-radius: 16px;
                max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 28px; font-weight: bold;">Exportar Dados</h2>
                    <button onclick="closeExportModal()" style="
                        background: none; border: none; font-size: 32px; cursor: pointer; color: #666;
                    ">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <button onclick="exportPDF()" style="
                        padding: 20px 15px; border: 2px solid #dc2626; background: #fef2f2;
                        color: #dc2626; border-radius: 12px; cursor: pointer; font-weight: bold;
                    ">
                        <div style="font-size: 24px; margin-bottom: 8px;">📄</div>
                        <div>Relatório PDF</div>
                    </button>
                    
                    <button onclick="exportCSV()" style="
                        padding: 20px 15px; border: 2px solid #059669; background: #f0fdf4;
                        color: #059669; border-radius: 12px; cursor: pointer; font-weight: bold;
                    ">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div>Planilha CSV</div>
                    </button>
                    
                    <button onclick="exportJSON()" style="
                        padding: 20px 15px; border: 2px solid #2563eb; background: #eff6ff;
                        color: #2563eb; border-radius: 12px; cursor: pointer; font-weight: bold;
                    ">
                        <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
                        <div>Dados JSON</div>
                    </button>
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="closeExportModal()" style="
                        padding: 12px 25px; border: 2px solid #d1d5db; background: white;
                        color: #374151; border-radius: 8px; cursor: pointer; font-weight: bold;
                    ">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.closeExportModal = function() {
    const modal = document.getElementById('export-modal');
    if (modal) modal.remove();
}

window.exportPDF = async function() {
    try {
        showNotification('Gerando PDF...', 'info');
        
        const [resumoResponse, doacoesResponse] = await Promise.all([
            fetch(CONFIG.API_BASE + '/relatorios/resumo'),
            fetch(CONFIG.API_BASE + '/doacoes')
        ]);
        
        const resumo = await resumoResponse.json();
        const doacoes = await doacoesResponse.json();
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) throw new Error('Popup bloqueado');
        
        printWindow.document.write(createReportHTML(resumo, doacoes));
        printWindow.document.close();
        
        closeExportModal();
        showNotification('PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar PDF: ' + error.message, 'error');
    }
}

window.exportCSV = async function() {
    try {
        showNotification('Gerando CSV...', 'info');
        
        const response = await fetch(CONFIG.API_BASE + '/doacoes');
        const doacoes = await response.json();
        
        const csvContent = createCSVContent(doacoes);
        downloadFile(csvContent, `doacoes_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        
        closeExportModal();
        showNotification('CSV baixado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar CSV: ' + error.message, 'error');
    }
}

window.exportJSON = async function() {
    try {
        showNotification('Gerando JSON...', 'info');
        
        const [resumoResponse, doacoesResponse] = await Promise.all([
            fetch(CONFIG.API_BASE + '/relatorios/resumo'),
            fetch(CONFIG.API_BASE + '/doacoes')
        ]);
        
        const resumo = await resumoResponse.json();
        const doacoes = await doacoesResponse.json();
        
        const jsonContent = JSON.stringify({
            metadata: {
                exportado_em: new Date().toISOString(),
                total_registros: doacoes.length,
                sistema: `Sistema de Doações v${CONFIG.VERSION}`
            },
            resumo,
            doacoes
        }, null, 2);
        
        downloadFile(jsonContent, `doacoes_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        
        closeExportModal();
        showNotification('JSON baixado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar JSON: ' + error.message, 'error');
    }
}

function createReportHTML(resumo, doacoes) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Doações</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { 
            text-align: center; 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .summary-card { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 12px; 
            text-align: center; 
        }
        .summary-card h3 { 
            margin: 0 0 10px 0; 
            color: #6b7280; 
            font-size: 14px; 
        }
        .summary-card .value { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1f2937; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        th { 
            background: #374151; 
            color: white; 
            padding: 15px; 
            text-align: left; 
        }
        td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb; 
        }
        tr:nth-child(even) { 
            background: #f9fafb; 
        }
        .btn-print { 
            background: #3b82f6; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-weight: bold; 
            display: block; 
            margin: 30px auto; 
        }
        @media print { .btn-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>RELATÓRIO DE DOAÇÕES</h1>
        <p>Sistema de Controle de Doações v${CONFIG.VERSION}</p>
        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    </div>
    
    <div class="summary-grid">
        <div class="summary-card">
            <h3>Total Arrecadado</h3>
            <div class="value">${formatCurrency(resumo.total_arrecadado || 0)}</div>
        </div>
        <div class="summary-card">
            <h3>Total de Doações</h3>
            <div class="value">${resumo.total_doacoes || 0}</div>
        </div>
        <div class="summary-card">
            <h3>Doações Recorrentes</h3>
            <div class="value">${resumo.doacoes_recorrentes || 0}</div>
        </div>
    </div>
    
    <h2>Detalhamento das Doações</h2>
    
    ${doacoes.length > 0 ? `
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Doador</th>
                <th>Valor</th>
                <th>Tipo</th>
                <th>Data</th>
                <th>Recorrente</th>
            </tr>
        </thead>
        <tbody>
            ${doacoes.map(d => `
                <tr>
                    <td>${d.codigo_doador || 'D' + String(d.doador_id).padStart(3, '0')}</td>
                    <td>${d.nome_doador || 'N/A'}</td>
                    <td style="font-weight: bold; color: #059669;">${formatCurrency(d.valor)}</td>
                    <td>${d.tipo}</td>
                    <td>${formatDate(d.data_doacao)}</td>
                    <td>${d.recorrente ? 'Sim' : 'Não'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    ` : '<p style="text-align: center; padding: 40px;">Nenhuma doação encontrada.</p>'}
    
    <button class="btn-print" onclick="window.print()">Imprimir PDF</button>
</body>
</html>`;
}

function createCSVContent(doacoes) {
    const headers = ['Código', 'Doador', 'Valor', 'Tipo', 'Data', 'Recorrente', 'Telefone'];
    const rows = [headers.join(',')];
    
    doacoes.forEach(d => {
        const row = [
            `"${d.codigo_doador || 'D' + String(d.doador_id).padStart(3, '0')}"`,
            `"${d.nome_doador || ''}"`,
            `"${(d.valor || 0).toFixed(2).replace('.', ',')}"`,
            `"${d.tipo}"`,
            `"${formatDate(d.data_doacao)}"`,
            `"${d.recorrente ? 'Sim' : 'Não'}"`,
            `"${d.telefone1 || ''}"`
        ];
        rows.push(row.join(','));
    });
    
    return '\uFEFF' + rows.join('\n');
}

function showHistoryModal(donation, payments) {
    const existingModal = document.getElementById('history-modal');
    if (existingModal) existingModal.remove();
    
    const totalPago = payments.reduce((sum, p) => sum + (p.valor || 0), 0);
    
    const modalHTML = `
        <div id="history-modal" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); z-index: 999999;
            display: flex; justify-content: center; align-items: center;
        ">
            <div style="
                background: white; padding: 30px; border-radius: 10px;
                max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Histórico de Pagamentos</h2>
                    <button onclick="closeHistoryModal()" style="
                        background: none; border: none; font-size: 30px; cursor: pointer; color: #666;
                    ">×</button>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                        <div>
                            <p style="margin: 0; color: #666; font-size: 14px;">Doador</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px;">
                                ${donation.codigo_doador || 'D' + donation.doador_id} - ${donation.nome_doador || donation.doador_nome}
                            </p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #666; font-size: 14px;">Valor da Doação</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #3b82f6;">
                                ${formatCurrency(donation.valor || 0)}
                            </p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #666; font-size: 14px;">Total Pago</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #10b981;">
                                ${formatCurrency(totalPago)}
                            </p>
                        </div>
                    </div>
                </div>
                
                <h3 style="margin: 20px 0 15px 0; font-size: 18px; font-weight: bold;">
                    Pagamentos Realizados (${payments.length})
                </h3>
                
                ${payments.length > 0 ? `
                <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f3f4f6;">
                            <tr>
                                <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Data</th>
                                <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Valor</th>
                                <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payments.map(p => `
                                <tr style="border-top: 1px solid #e5e7eb;">
                                    <td style="padding: 12px;">${formatDate(p.data_pagamento)}</td>
                                    <td style="padding: 12px; font-weight: bold; color: #059669;">
                                        ${formatCurrency(p.valor || 0)}
                                    </td>
                                    <td style="padding: 12px;">
                                        <span style="
                                            padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold;
                                            background: #10b981; color: white;
                                        ">${p.status || 'Pago'}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : `
                <div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px;">
                    <p style="color: #6b7280; margin: 0;">Nenhum pagamento registrado ainda</p>
                </div>
                `}
                
                <div style="text-align: right; margin-top: 25px;">
                    <button onclick="closeHistoryModal()" style="
                        padding: 12px 25px; border: 2px solid #ccc; background: white; 
                        border-radius: 8px; cursor: pointer; font-weight: bold;
                    ">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.closeHistoryModal = function() {
    const modal = document.getElementById('history-modal');
    if (modal) modal.remove();
}

function showEditModal(donation) {
    // Implementação do modal de edição será similar ao modal de criação
    console.log('Modal de edição para doação:', donation.id);
    showNotification('Funcionalidade de edição em desenvolvimento', 'info');
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

function collectFormData() {
    return {
        donor: document.getElementById('input-donor')?.value?.trim() || '',
        amount: parseFloat(document.getElementById('input-amount')?.value) || 0,
        type: document.getElementById('input-type')?.value || '',
        date: document.getElementById('input-date')?.value || '',
        phone1: document.getElementById('input-phone1')?.value?.trim() || '',
        phone2: document.getElementById('input-phone2')?.value?.trim() || '',
        contact: document.getElementById('input-contact')?.value?.trim() || '',
        recurring: document.getElementById('input-recurrent')?.checked || false,
        notes: document.getElementById('input-observations')?.value?.trim() || '',
        cpf: document.getElementById('input-cpf')?.value?.trim() || '',
        cep: document.getElementById('input-cep')?.value?.trim() || '',
        logradouro: document.getElementById('input-logradouro')?.value?.trim() || '',
        numero: document.getElementById('input-numero')?.value?.trim() || '',
        complemento: document.getElementById('input-complemento')?.value?.trim() || '',
        bairro: document.getElementById('input-bairro')?.value?.trim() || '',
        cidade: document.getElementById('input-cidade')?.value?.trim() || '',
        estado: document.getElementById('input-estado')?.value?.trim() || ''
    };
}

function validateFormData(data) {
    return data.donor && data.amount > 0 && data.date && data.phone1;
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString + 'T00:00:00');
        return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
}

function formatCurrency(value) {
    return 'R$ ' + (value || 0).toFixed(2).replace('.', ',');
}

function getTypeColor(type) {
    const colors = {
        'Dinheiro': 'bg-green-100 text-green-800',
        'PIX': 'bg-blue-100 text-blue-800',
        'Produto': 'bg-yellow-100 text-yellow-800',
        'Serviço': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

function formatCPFInput(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
        if (value.length <= 3) {
            value = value.replace(/(\d{3})/, '$1');
        } else if (value.length <= 6) {
            value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
        } else if (value.length <= 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
    }
    event.target.value = value;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function showLoading(show) {
    if (State.elements.loading) State.elements.loading.style.display = show ? 'block' : 'none';
    if (State.elements.summary) State.elements.summary.style.display = show ? 'none' : 'grid';
}

// Tornar funções globalmente acessíveis
window.saveDonation = saveDonation;
window.formatCPFInput = formatCPFInput;
window.formatCEPInput = formatCEPInput;
window.buscarCEP = buscarCEP;
window.loadDashboard = loadDashboard;
window.toggleRecurringFields = toggleRecurringFields;

console.log(`Sistema de Doações v${CONFIG.VERSION} - Versão otimizada carregada com sucesso`)