// ===============================================================================
// SISTEMA DE CONTROLE DE DOAÇÕES - APP.JS COMPLETO E LIMPO
// ===============================================================================

// Variáveis globais
let donations = [];
let filteredDonations = [];
let editingId = null;
let currentHistoryId = null;
let monthlyChart = null;
let typeChart = null;

// URLs da API
const API_BASE = '/api';

// Estado dos modais
let modalState = {
    donation: false,
    history: false
};

// Elementos DOM
const elements = {
    loading: document.getElementById('loading'),
    summary: document.getElementById('summary'),
    controls: document.getElementById('controls'),
    tableContainer: document.getElementById('table-container'),
    emptyState: document.getElementById('empty-state'),
    modal: document.getElementById('modal'),
    modalHistory: document.getElementById('modal-history'),
    chartsSection: document.getElementById('charts-section'),
    searchInput: document.getElementById('search-input'),
    filterType: document.getElementById('filter-type'),
    filterRecurring: document.getElementById('filter-recurring'),
    donationsTbody: document.getElementById('donations-tbody'),
    btnNovaDoacao: document.getElementById('btn-nova-doacao'),
    btnExport: document.getElementById('btn-export'),
    totalArrecadado: document.getElementById('total-arrecadado'),
    totalDoacoes: document.getElementById('total-doacoes'),
    doacoesRecorrentes: document.getElementById('doacoes-recorrentes'),
    totalPagamentos: document.getElementById('total-pagamentos')
};

// ===============================================================================
// INICIALIZAÇÃO
// ===============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema iniciado!');
    
    feather.replace();
    setupEventListeners();
    loadDonations();
    loadSummary();
});

// ===============================================================================
// EVENT LISTENERS
// ===============================================================================

function setupEventListeners() {
    if (elements.btnNovaDoacao) {
        elements.btnNovaDoacao.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
    
    if (elements.btnExport) {
        elements.btnExport.addEventListener('click', function(e) {
            e.preventDefault();
            exportData();
        });
    }
    
    if (elements.searchInput) elements.searchInput.addEventListener('input', filterDonations);
    if (elements.filterType) elements.filterType.addEventListener('change', filterDonations);
    if (elements.filterRecurring) elements.filterRecurring.addEventListener('change', filterDonations);
}

// ===============================================================================
// FUNÇÕES DE DADOS
// ===============================================================================

async function loadDonations() {
    try {
        const response = await fetch(`${API_BASE}/doacoes`);
        const data = await response.json();
        
        if (response.ok) {
            donations = data;
            console.log('✅ Doações carregadas:', donations.length);
            filterDonations();
            createCharts();
        } else {
            showError('Erro ao carregar doações: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar doações:', error);
        showError('Erro ao conectar com o servidor');
    } finally {
        if (elements.loading) elements.loading.style.display = 'none';
        if (elements.summary) elements.summary.style.display = 'grid';
        if (elements.controls) elements.controls.style.display = 'block';
        if (elements.chartsSection) elements.chartsSection.style.display = 'grid';
    }
}

async function loadSummary() {
    try {
        const response = await fetch(`${API_BASE}/relatorios/resumo`);
        const data = await response.json();
        
        if (response.ok) {
            if (elements.totalArrecadado) elements.totalArrecadado.textContent = `R$ ${(data.total_arrecadado || 0).toFixed(2).replace('.', ',')}`;
            if (elements.totalDoacoes) elements.totalDoacoes.textContent = data.total_doacoes || 0;
            if (elements.doacoesRecorrentes) elements.doacoesRecorrentes.textContent = data.doacoes_recorrentes || 0;
            if (elements.totalPagamentos) elements.totalPagamentos.textContent = `R$ ${(data.total_pagamentos || 0).toFixed(2).replace('.', ',')}`;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar resumo:', error);
    }
}

// ===============================================================================
// FILTROS E RENDERIZAÇÃO
// ===============================================================================

function filterDonations() {
    const searchTerm = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';
    const typeFilter = elements.filterType ? elements.filterType.value : '';
    const recurringFilter = elements.filterRecurring ? elements.filterRecurring.value : '';
    
    filteredDonations = donations.filter(donation => {
        const matchesSearch = donation.doador_nome.toLowerCase().includes(searchTerm) ||
                            donation.doador_telefone1.includes(searchTerm) ||
                            (donation.doador_telefone2 && donation.doador_telefone2.includes(searchTerm));
        
        const matchesType = !typeFilter || donation.tipo === typeFilter;
        const matchesRecurring = !recurringFilter || donation.recorrente.toString() === recurringFilter;
        
        return matchesSearch && matchesType && matchesRecurring;
    });
    
    renderDonations();
}

function renderDonations() {
    if (!elements.donationsTbody) return;
    
    if (filteredDonations.length === 0) {
        if (elements.tableContainer) elements.tableContainer.style.display = 'none';
        if (elements.emptyState) elements.emptyState.style.display = 'block';
        return;
    }
    
    if (elements.tableContainer) elements.tableContainer.style.display = 'block';
    if (elements.emptyState) elements.emptyState.style.display = 'none';
    
    elements.donationsTbody.innerHTML = filteredDonations.map(donation => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <i data-feather="user" class="h-5 w-5 text-gray-400 mr-3"></i>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                ${donation.codigo_doador || `D${donation.doador_id.toString().padStart(3, '0')}`}
                            </span>
                            <span class="text-sm font-medium text-gray-900">${donation.doador_nome}</span>
                        </div>
                        <div class="text-sm text-gray-500">${donation.doador_email || ''}</div>
                        ${donation.doador_cpf ? `<div class="text-xs text-gray-400">CPF: ${formatCPF(donation.doador_cpf)}</div>` : ''}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">R$ ${donation.valor.toFixed(2).replace('.', ',')}</div>
                ${donation.parcelas_totais > 1 ? `<div class="text-xs text-gray-500">${donation.parcelas_totais} parcelas</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(donation.tipo)}">
                    ${donation.tipo}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(donation.data_doacao)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-1">
                    <i data-feather="phone" class="h-3 w-3 text-gray-400"></i>
                    <span>${donation.doador_telefone1}</span>
                </div>
                ${donation.doador_telefone2 ? `
                <div class="flex items-center gap-1 text-gray-500">
                    <i data-feather="phone" class="h-3 w-3 text-gray-400"></i>
                    <span>${donation.doador_telefone2}</span>
                </div>
                ` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${donation.recorrente ? 
                    '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Sim</span>' :
                    '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Não</span>'
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <button class="history-btn text-blue-600 hover:text-blue-900 flex items-center gap-1 cursor-pointer" data-id="${donation.id}">
                    <i data-feather="clock" class="h-4 w-4"></i>
                    ${donation.historico_pagamentos ? donation.historico_pagamentos.length : 0} pagamentos
                </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="edit-btn text-blue-600 hover:text-blue-900" data-id="${donation.id}" title="Editar">
                        <i data-feather="edit" class="h-4 w-4"></i>
                    </button>
                    ${donation.recorrente && donation.parcelas_totais > 1 ? 
                        `<button class="carne-btn text-purple-600 hover:text-purple-900" data-id="${donation.id}" title="Gerar Carnê">
                            <i data-feather="file-text" class="h-4 w-4"></i>
                        </button>` : ''
                    }
                    <button class="delete-btn text-red-600 hover:text-red-900" data-id="${donation.id}" title="Excluir">
                        <i data-feather="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    feather.replace();
    attachTableEventListeners();
}

function attachTableEventListeners() {
    document.querySelectorAll('.history-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            showSimpleHistory(id);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            editDonation(id);
        });
    });
    
    document.querySelectorAll('.carne-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            generateCarne(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            deleteDonation(id);
        });
    });
}

// ===============================================================================
// MODAL DE DOAÇÃO COM VERIFICAÇÃO DE DUPLICATAS
// ===============================================================================

function openModal() {
    console.log('📝 Abrindo modal...');
    createSimpleModal();
}

function createSimpleModal() {
    let existingModal = document.getElementById('simple-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div id="simple-modal" style="
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            justify-content: center;
            align-items: center;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 900px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 id="simple-title" style="margin: 0; font-size: 24px; font-weight: bold;">Nova Doação</h2>
                    <button onclick="closeSimpleModal()" style="
                        background: none;
                        border: none;
                        font-size: 30px;
                        cursor: pointer;
                        color: #666;
                    ">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                            👤 Dados do Doador
                        </h3>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome Completo *</label>
                            <input type="text" id="simple-donor" placeholder="Digite o nome completo" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">CPF</label>
                            <input type="text" id="simple-cpf" placeholder="000.000.000-00" maxlength="14" 
                                   oninput="formatCPFInput(event)" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Principal *</label>
                            <input type="tel" id="simple-phone1" placeholder="(11) 99999-9999" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Alternativo</label>
                            <input type="tel" id="simple-phone2" placeholder="(11) 88888-8888" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">E-mail</label>
                            <input type="email" id="simple-email" placeholder="email@exemplo.com" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                            💰 Dados da Doação
                        </h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Valor (R$) *</label>
                                <input type="number" id="simple-amount" step="0.01" placeholder="0.00" style="
                                    width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                                ">
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo *</label>
                                <select id="simple-type" style="
                                    width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;
                                ">
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Produto">Produto</option>
                                    <option value="Serviço">Serviço</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Data da Doação *</label>
                            <input type="date" id="simple-date" style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                            ">
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; font-weight: bold;">
                                <input type="checkbox" id="simple-recurring" onchange="toggleRecurringFieldsSimple()" style="
                                    width: 18px; height: 18px; cursor: pointer;
                                ">
                                <span>Doação recorrente</span>
                            </label>
                        </div>
                        
                        <div id="simple-recurring-fields" style="display: none; background: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Quantas parcelas? *</label>
                                    <input type="number" id="simple-parcelas" min="2" max="60" placeholder="12" style="
                                        width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                    ">
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Próxima parcela em: *</label>
                                    <input type="date" id="simple-proxima-parcela" style="
                                        width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                    ">
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Observações</label>
                            <textarea id="simple-notes" rows="4" placeholder="Informações adicionais sobre a doação..." style="
                                width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; resize: vertical;
                            "></textarea>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">
                    <button onclick="closeSimpleModal()" style="
                        padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    ">Cancelar</button>
                    
                    <button onclick="saveSimpleModalWithDuplicateCheck()" style="
                        padding: 12px 25px; border: none; background: #3b82f6; color: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                    ">🔍 Verificar e Salvar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('simple-date').value = today;
    
    console.log('✅ Modal criado');
    document.getElementById('simple-donor').focus();
}

function closeSimpleModal() {
    const modal = document.getElementById('simple-modal');
    if (modal) {
        modal.remove();
    }
}

function toggleRecurringFieldsSimple() {
    const recurring = document.getElementById('simple-recurring');
    const fields = document.getElementById('simple-recurring-fields');
    const proximaParcela = document.getElementById('simple-proxima-parcela');
    
    if (recurring.checked) {
        fields.style.display = 'block';
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        proximaParcela.value = nextMonth.toISOString().split('T')[0];
    } else {
        fields.style.display = 'none';
    }
}

async function saveSimpleModalWithDuplicateCheck() {
    const formData = {
        donor: document.getElementById('simple-donor').value.trim(),
        amount: parseFloat(document.getElementById('simple-amount').value),
        type: document.getElementById('simple-type').value,
        date: document.getElementById('simple-date').value,
        phone1: document.getElementById('simple-phone1').value.trim(),
        phone2: document.getElementById('simple-phone2').value.trim(),
        contact: document.getElementById('simple-email').value.trim(),
        recurring: document.getElementById('simple-recurring').checked,
        notes: document.getElementById('simple-notes').value.trim(),
        cpf: document.getElementById('simple-cpf').value.trim()
    };
    
    if (!formData.donor || !formData.amount || !formData.date || !formData.phone1) {
        alert('❌ Preencha todos os campos obrigatórios');
        return;
    }
    
    if (formData.recurring) {
        const parcelas = parseInt(document.getElementById('simple-parcelas').value);
        const proximaParcela = document.getElementById('simple-proxima-parcela').value;
        
        if (!parcelas || parcelas < 2 || !proximaParcela) {
            alert('❌ Para doação recorrente, informe parcelas e próxima data');
            return;
        }
        
        formData.parcelas = parcelas;
        formData.proximaParcela = proximaParcela;
    }
    
    try {
        const response = await fetch(`${API_BASE}/doacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Doação criada com sucesso!');
            closeSimpleModal();
            loadDonations();
            loadSummary();
        } else {
            if (data.error === 'DUPLICATES_FOUND') {
                alert('⚠️ Foram encontrados doadores similares. Implementar modal de verificação aqui.');
            } else {
                alert('❌ Erro: ' + data.error);
            }
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ===============================================================================
// HISTÓRICO E OUTRAS FUNÇÕES
// ===============================================================================

async function showSimpleHistory(id) {
    alert('🚧 Histórico em desenvolvimento. ID: ' + id);
}

function editDonation(id) {
    alert('🚧 Edição em desenvolvimento. ID: ' + id);
}

async function deleteDonation(id) {
    if (!confirm('Tem certeza que deseja excluir esta doação?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/doacoes/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Doação excluída!');
            loadDonations();
            loadSummary();
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

async function generateCarne(id) {
    alert('🚧 Carnê em desenvolvimento. ID: ' + id);
}

function exportData() {
    alert('🚧 Exportação em desenvolvimento.');
}

function createCharts() {
    console.log('📊 Gráficos em desenvolvimento');
}

// ===============================================================================
// FUNÇÕES UTILITÁRIAS
// ===============================================================================

function formatCPF(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function getTypeColor(type) {
    const colors = {
        'Dinheiro': 'bg-green-100 text-green-800',
        'Produto': 'bg-blue-100 text-blue-800',
        'Serviço': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// ===============================================================================
// FUNÇÕES GLOBAIS
// ===============================================================================

window.closeSimpleModal = closeSimpleModal;
window.toggleRecurringFieldsSimple = toggleRecurringFieldsSimple;
window.saveSimpleModalWithDuplicateCheck = saveSimpleModalWithDuplicateCheck;
window.formatCPFInput = formatCPFInput;

console.log('🎉 Sistema completo carregado com sucesso!');ModalWithDuplicateCheck = saveSimple