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
    loadHistoryWithParcelas(id);
}/doacoes/${id}`),
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

// ============================================================================
// FUNÇÃO DE EDIÇÃO DE DOAÇÃO - IMPLEMENTAÇÃO COMPLETA
// ============================================================================

function showEditModal(donation) {
    const existingModal = document.getElementById('edit-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="edit-modal" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); z-index: 999999;
            display: flex; justify-content: center; align-items: center;
        ">
            <div style="
                background: white; padding: 30px; border-radius: 12px;
                max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">
                        Editar Doação - ${donation.codigo_doador || 'D' + donation.doador_id}
                    </h2>
                    <button onclick="closeEditModal()" style="
                        background: none; border: none; font-size: 30px; cursor: pointer; color: #666;
                    ">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                            👤 Dados do Doador
                        </h3>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome Completo *</label>
                            <input type="text" id="edit-donor" value="${donation.nome_doador || donation.doador_nome}" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">CPF</label>
                            <input type="text" id="edit-cpf" value="${donation.doador_cpf || ''}" placeholder="000.000.000-00" maxlength="14" 
                                   oninput="formatCPFInput(event)" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Principal *</label>
                            <input type="tel" id="edit-phone1" value="${donation.doador_telefone1 || donation.telefone1}" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Alternativo</label>
                            <input type="tel" id="edit-phone2" value="${donation.doador_telefone2 || donation.telefone2 || ''}" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">E-mail</label>
                            <input type="email" id="edit-email" value="${donation.doador_email || ''}" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <h4 style="margin: 20px 0 15px 0; font-size: 16px; font-weight: bold; color: #555; border-top: 1px solid #eee; padding-top: 15px;">
                            📍 Endereço
                        </h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">CEP</label>
                                <input type="text" id="edit-cep" value="${donation.doador_cep || ''}" placeholder="00000-000" maxlength="9" 
                                       oninput="formatCEPInput(event)" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Logradouro</label>
                                <input type="text" id="edit-logradouro" value="${donation.doador_logradouro || ''}" placeholder="Rua, Avenida..." style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Número</label>
                                <input type="text" id="edit-numero" value="${donation.doador_numero || ''}" placeholder="123" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Complemento</label>
                                <input type="text" id="edit-complemento" value="${donation.doador_complemento || ''}" placeholder="Apto, Bloco..." style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Bairro</label>
                            <input type="text" id="edit-bairro" value="${donation.doador_bairro || ''}" placeholder="Nome do bairro" style="
                                width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                            ">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Cidade</label>
                                <input type="text" id="edit-cidade" value="${donation.doador_cidade || ''}" placeholder="Nome da cidade" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Estado</label>
                                <input type="text" id="edit-estado" value="${donation.doador_estado || ''}" placeholder="UF" maxlength="2" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; text-transform: uppercase;
                                ">
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                            💰 Dados da Doação
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Valor (R$) *</label>
                                <input type="number" id="edit-amount" value="${donation.valor}" step="0.01" style="
                                    width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                                ">
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo *</label>
                                <select id="edit-type" style="
                                    width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;
                                ">
                                    <option value="Dinheiro"${donation.tipo === 'Dinheiro' ? ' selected' : ''}>Dinheiro</option>
                                    <option value="PIX"${donation.tipo === 'PIX' ? ' selected' : ''}>PIX</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Data da Doação *</label>
                            <input type="date" id="edit-date" value="${donation.data_doacao}" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; font-weight: bold;">
                                <input type="checkbox" id="edit-recurring"${donation.recorrente ? ' checked' : ''} style="
                                    width: 18px; height: 18px; cursor: pointer;
                                ">
                                <span>Doação recorrente</span>
                            </label>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Observações</label>
                            <textarea id="edit-notes" rows="4" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; resize: vertical;
                            ">${donation.observacoes || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">
                    <button onclick="closeEditModal()" style="
                        padding: 12px 25px; border: 2px solid #ccc; background: white; 
                        border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    ">Cancelar</button>
                    
                    <button onclick="saveEditedDonation(${donation.id})" style="
                        padding: 12px 25px; border: none; background: #3b82f6; color: white; 
                        border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    ">💾 Salvar Alterações</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.closeEditModal = function() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.remove();
}

window.saveEditedDonation = async function(id) {
    const formData = {
        donor: document.getElementById('edit-donor').value.trim(),
        amount: parseFloat(document.getElementById('edit-amount').value),
        type: document.getElementById('edit-type').value,
        date: document.getElementById('edit-date').value,
        phone1: document.getElementById('edit-phone1').value.trim(),
        phone2: document.getElementById('edit-phone2').value.trim(),
        contact: document.getElementById('edit-email').value.trim(),
        recurring: document.getElementById('edit-recurring').checked,
        notes: document.getElementById('edit-notes').value.trim(),
        cpf: document.getElementById('edit-cpf').value.trim(),
        cep: document.getElementById('edit-cep').value.trim(),
        logradouro: document.getElementById('edit-logradouro').value.trim(),
        numero: document.getElementById('edit-numero').value.trim(),
        complemento: document.getElementById('edit-complemento').value.trim(),
        bairro: document.getElementById('edit-bairro').value.trim(),
        cidade: document.getElementById('edit-cidade').value.trim(),
        estado: document.getElementById('edit-estado').value.trim()
    };
    
    if (!formData.donor || !formData.amount || !formData.date || !formData.phone1) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/doacoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Doação atualizada com sucesso!', 'success');
            closeEditModal();
            loadDashboard();
        } else {
            showNotification('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
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

// ============================================================================
// HISTÓRICO MELHORADO COM GESTÃO DE PARCELAS
// ============================================================================

async function loadHistoryWithParcelas(id) {
    try {
        const [donationResponse, historyResponse] = await Promise.all([
            fetch(`${CONFIG.API_BASE}/doacoes/${id}`),
            fetch(`${CONFIG.API_BASE}/doacoes/${id}/historico`)
        ]);
        
        const donation = await donationResponse.json();
        const payments = await historyResponse.json();
        
        // Gerar todas as parcelas (pagas e futuras)
        const parcelas = generateAllParcelas(donation, payments);
        
        showHistoryModalWithParcelas(donation, parcelas);
    } catch (error) {
        showNotification('Erro ao carregar histórico: ' + error.message, 'error');
    }
}

function generateAllParcelas(donation, payments) {
    const totalParcelas = donation.recorrente ? (donation.parcelas_totais || 12) : 1;
    const parcelas = [];
    
    for (let i = 1; i <= totalParcelas; i++) {
        const dataVencimento = calculateDueDate(donation.data_doacao, i - 1, donation.recorrente);
        const pagamento = findPaymentForDate(payments, dataVencimento);
        
        parcelas.push({
            numero: i,
            total: totalParcelas,
            valor: donation.valor,
            dataVencimento: dataVencimento,
            pagamento: pagamento,
            status: pagamento ? 'pago' : (new Date(dataVencimento) < new Date() ? 'vencido' : 'pendente')
        });
    }
    
    return parcelas;
}

function calculateDueDate(dataInicial, mesesAdicionais, recorrente) {
    const data = new Date(dataInicial + 'T00:00:00');
    if (recorrente && mesesAdicionais > 0) {
        data.setMonth(data.getMonth() + mesesAdicionais);
    }
    return data.toISOString().substring(0, 10);
}

function findPaymentForDate(payments, dataVencimento) {
    const vencimento = new Date(dataVencimento);
    return payments.find(payment => {
        const dataPgto = new Date(payment.data_pagamento);
        const diffDays = Math.abs((dataPgto - vencimento) / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // Tolerância de 7 dias
    });
}

function showHistoryModalWithParcelas(donation, parcelas) {
    const existingModal = document.getElementById('history-modal-parcelas');
    if (existingModal) existingModal.remove();
    
    const totalPago = parcelas.filter(p => p.pagamento).reduce((sum, p) => sum + (p.pagamento.valor || 0), 0);
    const totalPendente = parcelas.filter(p => !p.pagamento).reduce((sum, p) => sum + p.valor, 0);
    
    const modalHTML = `
        <div id="history-modal-parcelas" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); z-index: 999999;
            display: flex; justify-content: center; align-items: center;
        ">
            <div style="
                background: white; padding: 30px; border-radius: 12px;
                max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: bold;">Gestão de Parcelas</h2>
                    <button onclick="closeHistoryModalParcelas()" style="
                        background: none; border: none; font-size: 30px; cursor: pointer; color: #666;
                    ">×</button>
                </div>
                
                <!-- Resumo da Doação -->
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; text-align: center;">
                        <div>
                            <div style="font-size: 14px; opacity: 0.8;">Doador</div>
                            <div style="font-weight: bold; font-size: 16px;">
                                ${donation.codigo_doador || 'D' + donation.doador_id} - ${donation.nome_doador || donation.doador_nome}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.8;">Valor por Parcela</div>
                            <div style="font-weight: bold; font-size: 18px;">${formatCurrency(donation.valor)}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.8;">Total Pago</div>
                            <div style="font-weight: bold; font-size: 18px; color: #10b981;">${formatCurrency(totalPago)}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.8;">Total Pendente</div>
                            <div style="font-weight: bold; font-size: 18px; color: #fbbf24;">${formatCurrency(totalPendente)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Tabela de Parcelas -->
                <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f3f4f6;">
                            <tr>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Parcela</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Vencimento</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Valor</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Status</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Data Pagamento</th>
                                <th style="padding: 15px; text-align: center; font-weight: bold;">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${parcelas.map(parcela => `
                                <tr style="border-top: 1px solid #e5e7eb;" id="parcela-row-${parcela.numero}">
                                    <td style="padding: 15px; font-weight: bold;">
                                        ${String(parcela.numero).padStart(2, '0')}/${String(parcela.total).padStart(2, '0')}
                                    </td>
                                    <td style="padding: 15px;">${formatDate(parcela.dataVencimento)}</td>
                                    <td style="padding: 15px; font-weight: bold; color: #059669;">
                                        ${formatCurrency(parcela.valor)}
                                    </td>
                                    <td style="padding: 15px;">
                                        ${getStatusBadge(parcela.status)}
                                    </td>
                                    <td style="padding: 15px;">
                                        ${parcela.pagamento ? formatDate(parcela.pagamento.data_pagamento) : '-'}
                                    </td>
                                    <td style="padding: 15px; text-align: center;">
                                        ${parcela.status !== 'pago' ? `
                                            <button onclick="abrirModalPagamento(${donation.id}, ${parcela.numero}, ${parcela.valor}, '${parcela.dataVencimento}')" 
                                                    style="background: #10b981; color: white; border: none; padding: 8px 15px; 
                                                           border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">
                                                💰 Registrar Pagamento
                                            </button>
                                        ` : `
                                            <span style="color: #10b981; font-weight: bold;">✅ Pago</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="text-align: right; margin-top: 25px;">
                    <button onclick="closeHistoryModalParcelas()" style="
                        padding: 12px 25px; border: 2px solid #d1d5db; background: white; 
                        border-radius: 8px; cursor: pointer; font-weight: bold; margin-right: 10px;
                    ">Fechar</button>
                    
                    <button onclick="generateCarneCompleto(${donation.id})" style="
                        padding: 12px 25px; border: none; background: #3b82f6; color: white; 
                        border-radius: 8px; cursor: pointer; font-weight: bold;
                    ">📄 Gerar Carnê Completo</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function getStatusBadge(status) {
    const badges = {
        'pago': '<span style="padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #dcfce7; color: #166534;">✅ PAGO</span>',
        'pendente': '<span style="padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #fef3c7; color: #92400e;">⏳ PENDENTE</span>',
        'vencido': '<span style="padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #fee2e2; color: #991b1b;">❌ VENCIDO</span>'
    };
    return badges[status] || badges['pendente'];
}

window.closeHistoryModalParcelas = function() {
    const modal = document.getElementById('history-modal-parcelas');
    if (modal) modal.remove();
}

// Modal para registrar pagamento
window.abrirModalPagamento = function(doacaoId, numeroParcela, valorParcela, dataVencimento) {
    const existingModal = document.getElementById('payment-modal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="payment-modal" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.8); z-index: 999998;
            display: flex; justify-content: center; align-items: center;
        ">
            <div style="
                background: white; padding: 30px; border-radius: 12px;
                max-width: 500px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="text-align: center; margin-bottom: 25px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: bold;">💰 Registrar Pagamento</h3>
                    <p style="margin: 10px 0 0 0; color: #666;">Parcela ${numeroParcela} - ${formatCurrency(valorParcela)}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Valor Recebido (R$) *</label>
                    <input type="number" id="payment-amount" value="${valorParcela}" step="0.01" style="
                        width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                    ">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Data do Pagamento *</label>
                    <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}" style="
                        width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                    ">
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Tipo de Pagamento *</label>
                    <select id="payment-type" style="
                        width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;
                    ">
                        <option value="PIX">PIX</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Transferência">Transferência</option>
                        <option value="Cartão">Cartão</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Observações</label>
                    <textarea id="payment-notes" rows="3" placeholder="Informações adicionais sobre o pagamento..." style="
                        width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical;
                    "></textarea>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end;">
                    <button onclick="fecharModalPagamento()" style="
                        padding: 12px 20px; border: 2px solid #ccc; background: white; 
                        border-radius: 8px; cursor: pointer; font-weight: bold;
                    ">Cancelar</button>
                    
                    <button onclick="salvarPagamento(${doacaoId}, ${numeroParcela})" style="
                        padding: 12px 20px; border: none; background: #10b981; color: white; 
                        border-radius: 8px; cursor: pointer; font-weight: bold;
                    ">💰 Confirmar Pagamento</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.fecharModalPagamento = function() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.remove();
}

window.salvarPagamento = async function(doacaoId, numeroParcela) {
    const valor = parseFloat(document.getElementById('payment-amount').value);
    const data = document.getElementById('payment-date').value;
    const tipo = document.getElementById('payment-type').value;
    const observacoes = document.getElementById('payment-notes').value.trim();
    
    if (!valor || !data || !tipo) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/doacoes/${doacaoId}/pagamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                valor: valor,
                data_pagamento: data,
                tipo_pagamento: tipo,
                numero_parcela: numeroParcela,
                observacoes: observacoes
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Pagamento registrado com sucesso!', 'success');
            fecharModalPagamento();
            
            // Recarregar o histórico
            closeHistoryModalParcelas();
            setTimeout(() => loadHistoryWithParcelas(doacaoId), 300);
        } else {
            showNotification('Erro ao registrar pagamento: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Erro ao registrar pagamento: ' + error.message, 'error');
    }
}

// ============================================================================
// CARNÊ COMPLETO COM TODAS AS PARCELAS
// ============================================================================

window.generateCarneCompleto = async function(doacaoId) {
    try {
        showNotification('Gerando carnê completo...', 'info');
        
        const [doacaoResponse, doadorResponse, historicoResponse] = await Promise.all([
            fetch(`${CONFIG.API_BASE}/doacoes/${doacaoId}`),
            fetch(`${CONFIG.API_BASE}/doacoes/${doacaoId}`).then(r => r.json()).then(d => 
                fetch(`${CONFIG.API_BASE}/doadores/${d.doador_id}`)
            ),
            fetch(`${CONFIG.API_BASE}/doacoes/${doacaoId}/historico`)
        ]);
        
        const doacao = await doacaoResponse.json();
        const doador = await doadorResponse.json();
        const historico = await historicoResponse.json();
        
        const carneWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
        if (!carneWindow) throw new Error('Popup bloqueado');
        
        carneWindow.document.write(createCarneCompletoHTML(doacao, doador, historico));
        carneWindow.document.close();
        
        showNotification('Carnê completo gerado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar carnê: ' + error.message, 'error');
    }
}

function createCarneCompletoHTML(doacao, doador, historico) {
    const parcelas = generateAllParcelas(doacao, historico);
    const totalPago = parcelas.filter(p => p.pagamento).reduce((sum, p) => sum + (p.pagamento.valor || 0), 0);
    const totalPendente = parcelas.filter(p => !p.pagamento).reduce((sum, p) => sum + p.valor, 0);
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Carnê Completo - ${doador.nome}</title>
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
            max-width: 900px;
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
        
        .resumo-financeiro {
            background: linear-gradient(135deg, #6c757d, #495057);
            color: white;
            padding: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 20px;
            text-align: center;
        }
        
        .resumo-item h4 {
            margin: 0 0 5px 0;
            font-size: 14px;
            opacity: 0.8;
        }
        
        .resumo-item .valor {
            font-size: 18px;
            font-weight: bold;
        }
        
        .parcela {
            border-bottom: 3px solid #e9ecef;
            display: flex;
            min-height: 280px;
            page-break-inside: avoid;
        }
        
        .parcela.paga {
            background: #f8f9fa;
            opacity: 0.8;
        }
        
        .parcela.vencida {
            border-left: 5px solid #dc3545;
        }
        
        .canhoto {
            width: 35%;
            background: #f8f9fa;
            padding: 20px;
            border-right: 3px dashed #6c757d;
            position: relative;
        }
        
        .recibo {
            width: 65%;
            padding: 20px;
            background: white;
            position: relative;
        }
        
        .status-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .status-pago { background: #d4edda; color: #155724; }
        .status-pendente { background: #fff3cd; color: #856404; }
        .status-vencido { background: #f8d7da; color: #721c24; }
        
        .qr-section {
            margin-top: 15px !important;
            padding: 12px !important;
            background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
            border: 2px solid #2196f3 !important;
            border-radius: 6px !important;
            text-align: center !important;
        }
        
        .qr-code-box {
            width: 80px !important;
            height: 80px !important;
            border: 2px dashed #1976d2 !important;
            background: white !important;
            margin: 8px auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            font-weight: bold !important;
            color: #1565c0 !important;
            border-radius: 6px !important;
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
            .parcela { page-break-inside: avoid; }
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
            <h1>CARNÊ DE PAGAMENTO COMPLETO</h1>
            <h2>${doador.nome.toUpperCase()}</h2>
            <div style="margin-top: 15px;">
                <strong>Código:</strong> ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
                ${doador.cpf ? ` | <strong>CPF:</strong> ${doador.cpf}` : ''}
            </div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">
                Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </div>
        </div>
        
        <div class="resumo-financeiro">
            <div class="resumo-item">
                <h4>Total da Doação</h4>
                <div class="valor">${formatCurrency(doacao.valor * parcelas.length)}</div>
            </div>
            <div class="resumo-item">
                <h4>Total de Parcelas</h4>
                <div class="valor">${parcelas.length}</div>
            </div>
            <div class="resumo-item">
                <h4>Total Pago</h4>
                <div class="valor" style="color: #28a745;">${formatCurrency(totalPago)}</div>
            </div>
            <div class="resumo-item">
                <h4>Total Pendente</h4>
                <div class="valor" style="color: #ffc107;">${formatCurrency(totalPendente)}</div>
            </div>
        </div>

        ${parcelas.map(parcela => `
        <div class="parcela ${parcela.status}">
            <div class="canhoto">
                <div class="status-badge status-${parcela.status}">
                    ${parcela.status === 'pago' ? '✅ PAGO' : 
                      parcela.status === 'vencido' ? '❌ VENCIDO' : '⏳ PENDENTE'}
                </div>
                
                <h3 style="margin-bottom: 15px;">CANHOTO - CONTROLE</h3>
                <div style="margin: 12px 0;">
                    <strong>Parcela:</strong> ${String(parcela.numero).padStart(2, '0')}/${String(parcela.total).padStart(2, '0')}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Código:</strong> ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Valor:</strong> <span style="color: #dc3545; font-size: 16px; font-weight: bold;">
                        ${formatCurrency(parcela.valor)}
                    </span>
                </div>
                <div style="margin: 12px 0;">
                    <strong>Vencimento:</strong> ${formatDate(parcela.dataVencimento)}
                </div>
                ${parcela.pagamento ? `
                <div style="margin: 12px 0;">
                    <strong>Pago em:</strong> ${formatDate(parcela.pagamento.data_pagamento)}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Tipo:</strong> ${parcela.pagamento.tipo_pagamento || 'N/A'}
                </div>
                ` : ''}
            </div>
            
            <div class="recibo">
                <h3 style="margin-bottom: 15px;">
                    RECIBO DE PAGAMENTO
                    <span style="float: right; font-size: 14px; font-weight: normal;">
                        Parcela ${String(parcela.numero).padStart(2, '0')}/${String(parcela.total).padStart(2, '0')}
                    </span>
                </h3>
                
                <div style="margin: 12px 0;">
                    <strong>Recebemos de:</strong> ${doador.nome.toUpperCase()}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Importância de:</strong> <span style="color: #dc3545; font-size: 18px; font-weight: bold;">
                        ${formatCurrency(parcela.valor)}
                    </span>
                </div>
                <div style="margin: 12px 0;">
                    <strong>Vencimento:</strong> ${formatDate(parcela.dataVencimento)}
                </div>
                <div style="margin: 12px 0;">
                    <strong>Data Pagamento:</strong> ${parcela.pagamento ? formatDate(parcela.pagamento.data_pagamento) : '___/___/_____'}
                </div>
                <div style="margin: 12px 0; font-size: 13px; color: #666;">
                    <strong>Telefone:</strong> ${doador.telefone1 || 'Não informado'}
                </div>
                
                ${(doacao.tipo === 'PIX' || !parcela.pagamento) ? `
                <div class="qr-section">
                    <h4 style="margin: 0 0 8px 0; color: #1976d2; font-size: 12px;">📱 QR Code PIX</h4>
                    <div class="qr-code-box">
                        <div style="font-size: 16px;">📱</div>
                        <div style="font-size: 8px;">QR CODE</div>
                        <div style="font-size: 7px;">${formatCurrency(parcela.valor)}</div>
                    </div>
                    <div style="font-size: 9px; color: #1976d2; margin-top: 5px;">
                        📲 Valor: ${formatCurrency(parcela.valor)}<br>
                        📅 Venc: ${formatDate(parcela.dataVencimento)}
                    </div>
                </div>
                ` : ''}
                
                ${parcela.pagamento ? `
                <div style="margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 5px; color: #155724; font-size: 12px;">
                    ✅ Pagamento confirmado em ${formatDate(parcela.pagamento.data_pagamento)}
                    ${parcela.pagamento.observacoes ? `<br>Obs: ${parcela.pagamento.observacoes}` : ''}
                </div>
                ` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    
    <button class="btn-imprimir" onclick="window.print()">
        🖨️ Imprimir Carnê Completo
    </button>
</body>
</html>`;
}