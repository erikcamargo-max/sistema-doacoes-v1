
// ===============================================================================
// FUNÇÃO DE BUSCA DE CEP
// ===============================================================================

// Função para buscar CEP via ViaCEP
window.buscarCEP = async function(cepValue, prefix = 'simple-') {
    // Remove formatação do CEP
    const cep = cepValue.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    // Mostrar indicador de carregamento
    const cepField = document.getElementById(prefix + 'cep');
    if (cepField) {
        cepField.style.borderColor = '#fbbf24'; // Amarelo durante busca
    }
    
    try {
        const response = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
        const data = await response.json();
        
        if (!data.erro) {
            // Preencher campos automaticamente
            const logradouroField = document.getElementById(prefix + 'logradouro');
            const bairroField = document.getElementById(prefix + 'bairro');
            const cidadeField = document.getElementById(prefix + 'cidade');
            const estadoField = document.getElementById(prefix + 'estado');
            
            if (logradouroField) logradouroField.value = data.logradouro || '';
            if (bairroField) bairroField.value = data.bairro || '';
            if (cidadeField) cidadeField.value = data.localidade || '';
            if (estadoField) estadoField.value = data.uf || '';
            
            // Indicar sucesso
            if (cepField) {
                cepField.style.borderColor = '#10b981'; // Verde sucesso
                setTimeout(() => {
                    cepField.style.borderColor = '#ddd';
                }, 2000);
            }
            
            // Focar no campo número
            const numeroField = document.getElementById(prefix + 'numero');
            if (numeroField) {
                numeroField.focus();
            }
        } else {
            if (cepField) {
                cepField.style.borderColor = '#ef4444'; // Vermelho erro
                setTimeout(() => {
                    cepField.style.borderColor = '#ddd';
                }, 2000);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao buscar CEP:', error);
        if (cepField) {
            cepField.style.borderColor = '#ef4444'; // Vermelho erro
            setTimeout(() => {
                cepField.style.borderColor = '#ddd';
            }, 2000);
        }
    }
}

window.formatCEPInput = function(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    // Limitar a 8 dígitos
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    // Adicionar hífen
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    
    event.target.value = value;
    
    // Buscar CEP automaticamente quando completo (8 dígitos)
    if (value.replace(/\D/g, '').length === 8) {
        // Detectar o prefixo baseado no ID do campo
        const fieldId = event.target.id;
        let prefix = 'simple-';
        
        if (fieldId.includes('edit-')) {
            prefix = 'edit-';
        }
        
        buscarCEP(value, prefix);
    }
}

// ===============================================================================
// SISTEMA DE CONTROLE DE DOAÇÕES - APP.JS CORRIGIDO v1.1.1
// ===============================================================================

// Variáveis globais - CORREÇÃO: Declaração adequada
let allDonations = []; // Array principal de doações
let filteredDonations = []; // Array filtrado
let editingId = null;
let currentHistoryId = null;

// URLs da API
const API_BASE = '/api';

// Estado dos modais
let modalState = {
    donation: false,
    history: false
};

// Elementos DOM
const elements = {
    loading: null,
    summary: null,
    controls: null,
    tableContainer: null,
    emptyState: null,
    modal: null,
    modalHistory: null,
    searchInput: null,
    filterType: null,
    filterRecurring: null,
    donationsTbody: null,
    btnNovaDoacao: null,
    btnExport: null,
    totalArrecadado: null,
    totalDoacoes: null,
    doacoesRecorrentes: null,
    totalPagamentos: null
};

// ===============================================================================
// INICIALIZAÇÃO - CORREÇÃO: Ordem correta de inicialização
// ===============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Sistema de Doações v1.1.1');
    
    // Inicializar elementos DOM
    initializeElements();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Substituir ícones do Feather
    feather.replace();
    
    // Carregar dados
    loadDashboard();
    
    console.log('✅ Sistema inicializado com sucesso');
});

// ===============================================================================
// FUNÇÕES DE INICIALIZAÇÃO
// ===============================================================================

/**
 * Inicializa referencias dos elementos DOM
 * Versão: 1.1.1 - Correção de elementos não encontrados
 */
function initializeElements() {
    elements.loading = document.getElementById('loading');
    elements.summary = document.getElementById('summary');
    elements.tableContainer = document.getElementById('table-container');
    elements.emptyState = document.getElementById('empty-state');
    elements.modal = document.getElementById('modal');
    elements.modalHistory = document.getElementById('modal-history');
    elements.searchInput = document.getElementById('search-input');
    elements.filterType = document.getElementById('filter-type');
    elements.filterRecurring = document.getElementById('filter-recurrent');
    elements.donationsTbody = document.getElementById('donations-tbody');
    elements.btnNovaDoacao = document.getElementById('btn-new-donation');
    elements.btnExport = document.getElementById('btn-export');
    elements.totalArrecadado = document.getElementById('total-arrecadado');
    elements.totalDoacoes = document.getElementById('total-doacoes');
    elements.doacoesRecorrentes = document.getElementById('doacoes-recorrentes');
    elements.totalPagamentos = document.getElementById('total-pagamentos');
    
    console.log('📋 Elementos DOM inicializados');
}

/**
 * Configura event listeners do sistema
 * Versão: 1.1.1 - Correção de listeners duplicados
 */
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
    
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', applyFilters);
    }
    
    if (elements.filterType) {
        elements.filterType.addEventListener('change', applyFilters);
    }
    
    if (elements.filterRecurring) {
        elements.filterRecurring.addEventListener('change', applyFilters);
    }
    
    console.log('🔗 Event listeners configurados');
}

// ===============================================================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// ===============================================================================

/**
 * Carrega dashboard completo
 * Versão: 1.1.1 - Ordem correta de carregamento
 */
async function loadDashboard() {
    try {
        console.log('📊 Carregando dashboard...');
        
        // Mostrar loading
        if (elements.loading) elements.loading.style.display = 'block';
        if (elements.summary) elements.summary.style.display = 'none';
        
        // Carregar dados em paralelo
        await Promise.all([
            loadSummary(),
            loadDonations()
        ]);
        
        // Esconder loading e mostrar dashboard
        if (elements.loading) elements.loading.style.display = 'none';
        if (elements.summary) elements.summary.style.display = 'grid';
        
        console.log('✅ Dashboard carregado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
        showError('Erro ao carregar dashboard: ' + error.message);
    }
}

/**
 * Carrega resumo financeiro
 * Versão: 1.1.1 - Tratamento de erro melhorado
 */
async function loadSummary() {
    try {
        const response = await fetch(API_BASE + '/relatorios/resumo');
        
        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        
        const data = await response.json();
        
        // Atualizar cards do resumo
        if (elements.totalArrecadado) {
            elements.totalArrecadado.textContent = 'R$ ' + (data.total_arrecadado || 0).toFixed(2).replace('.', ',');
        }
        if (elements.totalDoacoes) {
            elements.totalDoacoes.textContent = data.total_doacoes || 0;
        }
        if (elements.doacoesRecorrentes) {
            elements.doacoesRecorrentes.textContent = data.doacoes_recorrentes || 0;
        }
        if (elements.totalPagamentos) {
            elements.totalPagamentos.textContent = data.total_pagamentos || 0;
        }
        
        console.log('💰 Resumo carregado:', data);
        
    } catch (error) {
        console.error('❌ Erro ao carregar resumo:', error);
        throw error;
    }
}

/**
 * Carrega lista de doações
 * Versão: 1.1.1 - CORREÇÃO: Variável allDonations declarada
 */
async function loadDonations() {
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

// ===============================================================================
// FUNÇÕES DE FILTROS E RENDERIZAÇÃO
// ===============================================================================

/**
 * Aplica filtros nas doações
 * Versão: 1.1.1 - CORREÇÃO: Função simplificada
 */
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

/**
 * Renderiza tabela de doações
 * Versão: 1.1.1 - CORREÇÃO: Tratamento de dados nulos
 */
function renderDonationsTable(donations) {
    if (!elements.donationsTbody || !elements.tableContainer || !elements.emptyState) {
        console.error('❌ Elementos da tabela não encontrados');
        return;
    }
    
    if (!donations || donations.length === 0) {
        elements.tableContainer.style.display = 'none';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.tableContainer.style.display = 'block';
    elements.emptyState.style.display = 'none';
    
    elements.donationsTbody.innerHTML = donations.map(donation => {
        // Garantir que todos os campos existem com valores padrão
        const nome = donation.nome_doador || 'Doador não identificado';
        const codigo = donation.codigo_doador || ('D' + String(donation.doador_id || 0).padStart(3, '0'));
        const valor = (donation.valor || 0).toFixed(2).replace('.', ',');
        const tipo = donation.tipo || 'N/A';
        const data = formatDate(donation.data_doacao || new Date().toISOString());
        const telefone1 = donation.telefone1 || 'Não informado';
        const telefone2 = donation.telefone2 || '';
        const recorrente = donation.recorrente ? 'Sim' : 'Não';
        
        return '<tr class="hover:bg-gray-50 transition-colors">' +
                '<td class="px-6 py-4">' +
                    '<div class="text-sm">' +
                        '<div class="font-medium text-gray-900">' + nome + '</div>' +
                        '<div class="text-gray-500">' + codigo + '</div>' +
                    '</div>' +
                '</td>' +
                '<td class="px-6 py-4">' +
                    '<div class="text-sm font-semibold text-green-600">' +
                        'R$ ' + valor +
                    '</div>' +
                '</td>' +
                '<td class="px-6 py-4">' +
                    '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ' + getTypeColor(tipo) + '">' +
                        tipo +
                    '</span>' +
                '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-500">' +
                    data +
                '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-500">' +
                    '<div>' + telefone1 + '</div>' +
                    (telefone2 ? '<div class="text-xs">' + telefone2 + '</div>' : '') +
                '</td>' +
                '<td class="px-6 py-4">' +
                    '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ' +
                        (donation.recorrente ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800') + '">' +
                        recorrente +
                    '</span>' +
                '</td>' +
                '<td class="px-6 py-4 text-center">' +
                    '<button onclick="viewHistory(' + donation.id + ')" ' +
                        'class="text-indigo-600 hover:text-indigo-900 transition-colors" ' +
                        'title="Ver histórico">' +
                        '<i data-feather="clock" class="h-4 w-4"></i>' +
                    '</button>' +
                '</td>' +
                '<td class="px-6 py-4 text-sm font-medium">' +
                    '<div class="flex gap-2">' +
                        '<button onclick="editDonation(' + donation.id + ')" ' +
                            'class="text-blue-600 hover:text-blue-900 transition-colors" ' +
                            'title="Editar">' +
                            '<i data-feather="edit" class="h-4 w-4"></i>' +
                        '</button>' +
                        '<button onclick="generateCarne(' + donation.id + ')" ' +
                            'class="text-green-600 hover:text-green-900 transition-colors" ' +
                            'title="Gerar carnê">' +
                            '<i data-feather="file-text" class="h-4 w-4"></i>' +
                        '</button>' +
                        '<button onclick="deleteDonation(' + donation.id + ')" ' +
                            'class="text-red-600 hover:text-red-900 transition-colors" ' +
                            'title="Excluir">' +
                            '<i data-feather="trash-2" class="h-4 w-4"></i>' +
                        '</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
    }).join('');
    
    // Re-renderizar ícones do Feather
    feather.replace();
    
    console.log('📋 Tabela renderizada com ' + donations.length + ' itens');
}

// ===============================================================================
// FUNÇÕES DE MODAL E FORMULÁRIOS
// ===============================================================================

/**
 * Abre modal de nova doação
 * Versão: 1.1.1 - Modal simplificado
 */
function openModal() {
    console.log('📝 Abrindo modal de nova doação');
    createSimpleModal();
}

/**
 * Cria modal simplificado de doação
 * Versão: 1.1.1 - Versão simplificada e funcional
 */
function createSimpleModal() {
    let existingModal = document.getElementById('simple-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = '<div id="simple-modal" style="' +
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
                    '<h2 id="simple-title" style="margin: 0; font-size: 24px; font-weight: bold;">Nova Doação</h2>' +
                    '<button onclick="closeSimpleModal()" style="' +
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
                            '<input type="text" id="simple-donor" placeholder="Digite o nome completo" style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                            '">' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; font-weight: bold;">CPF</label>' +
                            '<input type="text" id="simple-cpf" placeholder="000.000.000-00" maxlength="14" ' +
                                   'oninput="formatCPFInput(event)" style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                            '">' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Principal *</label>' +
                            '<input type="tel" id="simple-phone1" placeholder="(11) 99999-9999" style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                            '">' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Alternativo</label>' +
                            '<input type="tel" id="simple-phone2" placeholder="(11) 88888-8888" style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                            '">' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; font-weight: bold;">E-mail</label>' +
                            '<input type="email" id="simple-email" placeholder="email@exemplo.com" style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                            '">' +
                        '</div>' +
                    '</div>' +
                    
                    '<div>' +
                        '<h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">' +
                            '💰 Dados da Doação' +
                        '</h3>' +
                        
                        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">' +
                            '<div>' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Valor (R$) *</label>' +
                                '<input type="number" id="simple-amount" step="0.01" placeholder="0.00" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                                '">' +
                            '</div>' +
                            
                            '<div>' +
                                '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo *</label>' +
                                '<select id="simple-type" style="' +
                                    'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;' +
                                '">' +
                                    '<option value="Dinheiro">Dinheiro</option>' +
                                    '<option value="PIX">PIX</option>' +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 15px;">' +
                            '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Data da Doação *</label>' +
                            '<input type="date" id="simple-date" style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;' +
                            '">' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 15px;">' +
                            '<label style="display: flex; align-items: center; gap: 10px; font-weight: bold;">' +
                                '<input type="checkbox" id="simple-recurring" style="' +
                                    'width: 18px; height: 18px; cursor: pointer;' +
                                '">' +
                                '<span>Doação recorrente</span>' +
                            '</label>' +
                        '</div>' +
                        
                        '<div style="margin-bottom: 20px;">' +
                            '<label style="display: block; margin-bottom: 5px; font-weight: bold;">Observações</label>' +
                            '<textarea id="simple-notes" rows="4" placeholder="Informações adicionais sobre a doação..." style="' +
                                'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; resize: vertical;' +
                            '"></textarea>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                '<div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">' +
                    '<button onclick="closeSimpleModal()" style="' +
                        'padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                    '">Cancelar</button>' +
                    
                    '<button onclick="saveSimpleDonation()" style="' +
                        'padding: 12px 25px; border: none; background: #3b82f6; color: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                    '">💾 Salvar Doação</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Definir data atual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('simple-date').value = today;
    
    // Focar no primeiro campo
    document.getElementById('simple-donor').focus();
    
    console.log('✅ Modal criado e exibido');
}

// ===============================================================================
// FUNÇÕES GLOBAIS EXPOSTAS
// ===============================================================================

/**
 * Fecha modal simples
 * Versão: 1.1.1
 */
window.closeSimpleModal = function() {
    const modal = document.getElementById('simple-modal');
    if (modal) {
        modal.remove();
        console.log('❌ Modal fechado');
    }
}

/**
 * Salva doação do modal simples
 * Versão: 1.1.1
 */
window.saveSimpleDonation = async function() {
    console.log('💾 Salvando doação...');
    
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
    
    // Validação básica
    if (!formData.donor || !formData.amount || !formData.date || !formData.phone1) {
        alert('❌ Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const response = await fetch(API_BASE + '/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Doação criada com sucesso!');
            closeSimpleModal();
            loadDashboard(); // Recarregar dashboard completo
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

/**
 * Visualizar histórico de pagamentos
 * Versão: 1.1.1
 */
window.viewHistory = async function(id) {
    console.log('📋 Carregando histórico da doação ' + id);
    
    try {
        // Buscar doação
        const donationResponse = await fetch(API_BASE + '/doacoes/' + id);
        const donation = await donationResponse.json();
        
        if (!donationResponse.ok) {
            throw new Error('Doação não encontrada');
        }
        
        // Buscar histórico
        const historyResponse = await fetch(API_BASE + '/doacoes/' + id + '/historico');
        const payments = await historyResponse.json();
        
        showHistoryModal(donation, payments);
        
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        alert('❌ Erro ao carregar histórico: ' + error.message);
    }
}

/**
 * Mostra modal de histórico
 * Versão: 1.1.1
 */
function showHistoryModal(donation, payments) {
    let existingModal = document.getElementById('history-modal-simple');
    if (existingModal) {
        existingModal.remove();
    }
    
    const totalPago = payments.reduce(function(sum, p) { return sum + (p.valor || 0); }, 0);
    
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
                        '📋 Histórico de Pagamentos' +
                    '</h2>' +
                    '<button onclick="closeHistoryModal()" style="' +
                        'background: none;' +
                        'border: none;' +
                        'font-size: 30px;' +
                        'cursor: pointer;' +
                        'color: #666;' +
                    '">&times;</button>' +
                '</div>' +
                
                '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">' +
                    '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">' +
                        '<div>' +
                            '<p style="margin: 0; color: #666; font-size: 14px;">Doador</p>' +
                            '<p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px;">' +
                                (donation.codigo_doador || 'D' + donation.doador_id) + ' - ' + (donation.nome_doador || donation.doador_nome) +
                            '</p>' +
                        '</div>' +
                        '<div>' +
                            '<p style="margin: 0; color: #666; font-size: 14px;">Valor da Doação</p>' +
                            '<p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #3b82f6;">' +
                                'R$ ' + (donation.valor || 0).toFixed(2).replace('.', ',') +
                            '</p>' +
                        '</div>' +
                        '<div>' +
                            '<p style="margin: 0; color: #666; font-size: 14px;">Total Pago</p>' +
                            '<p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #10b981;">' +
                                'R$ ' + totalPago.toFixed(2).replace('.', ',') +
                            '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                '<h3 style="margin: 20px 0 15px 0; font-size: 18px; font-weight: bold;">' +
                    '💳 Pagamentos Realizados (' + payments.length + ')' +
                '</h3>' +
                
                (payments.length > 0 ? 
                '<div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">' +
                    '<table style="width: 100%; border-collapse: collapse;">' +
                        '<thead style="background: #f3f4f6;">' +
                            '<tr>' +
                                '<th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Data</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Valor</th>' +
                                '<th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Status</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            payments.map(function(p) {
                                return '<tr style="border-top: 1px solid #e5e7eb;">' +
                                    '<td style="padding: 12px;">' +
                                        formatDate(p.data_pagamento) +
                                    '</td>' +
                                    '<td style="padding: 12px; font-weight: bold; color: #059669;">' +
                                        'R$ ' + (p.valor || 0).toFixed(2).replace('.', ',') +
                                    '</td>' +
                                    '<td style="padding: 12px;">' +
                                        '<span style="' +
                                            'padding: 4px 12px;' +
                                            'border-radius: 9999px;' +
                                            'font-size: 12px;' +
                                            'font-weight: bold;' +
                                            'background: #10b981;' +
                                            'color: white;' +
                                        '">' + (p.status || 'Pago') + '</span>' +
                                    '</td>' +
                                '</tr>';
                            }).join('') +
                        '</tbody>' +
                    '</table>' +
                '</div>'
                : 
                '<div style="text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px;">' +
                    '<p style="color: #6b7280; margin: 0;">Nenhum pagamento registrado ainda</p>' +
                '</div>'
                ) +
                
                '<div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">' +
                    '<button onclick="closeHistoryModal()" style="' +
                        'padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;' +
                    '">Fechar</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Fecha modal de histórico
 * Versão: 1.1.1
 */
window.closeHistoryModal = function() {
    const modal = document.getElementById('history-modal-simple');
    if (modal) {
        modal.remove();
        console.log('❌ Modal de histórico fechado');
    }
}

/**
 * Editar doação
 * Versão: 1.1.1
 */
window.editDonation = function(id) {
    console.log('✏️ Editando doação ' + id);
    alert('🚧 Função de edição em desenvolvimento');
}

/**
 * Gerar carnê
 * Versão: 1.1.1
 */
window.generateCarne = function(id) {
    console.log('📄 Gerando carnê da doação ' + id);
    alert('🚧 Função de geração de carnê em desenvolvimento');
}

/**
 * Deletar doação
 * Versão: 1.1.1
 */
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

/**
 * Exportar dados
 * Versão: 1.1.1
 */
window.exportData = function() {
    console.log('📤 Exportando dados...');
    alert('🚧 Função de exportação em desenvolvimento');
}

// ===============================================================================
// FUNÇÕES UTILITÁRIAS
// ===============================================================================

/**
 * Formatar data para exibição
 * Versão: 1.1.1
 */
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

/**
 * Obter cor do tipo de doação
 * Versão: 1.1.1
 */
function getTypeColor(type) {
    const colors = {
        'Dinheiro': 'bg-green-100 text-green-800',
        'PIX': 'bg-blue-100 text-blue-800',
        'Produto': 'bg-yellow-100 text-yellow-800',
        'Serviço': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

/**
 * Formatar entrada de CPF
 * Versão: 1.1.1
 */
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

/**
 * Mostrar estado de erro
 * Versão: 1.1.1
 */
function showErrorState(message) {
    if (elements.tableContainer) elements.tableContainer.style.display = 'none';
    if (elements.emptyState) {
        elements.emptyState.style.display = 'block';
        elements.emptyState.innerHTML = '<i data-feather="alert-circle" class="mx-auto h-12 w-12 text-red-400"></i>' +
            '<h3 class="mt-2 text-sm font-medium text-gray-900">Erro ao carregar dados</h3>' +
            '<p class="mt-1 text-sm text-gray-500">' + message + '</p>' +
            '<button onclick="loadDashboard()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">' +
                'Tentar Novamente' +
            '</button>';
        feather.replace();
    }
}

/**
 * Mostrar notificação de erro
 * Versão: 1.1.1
 */
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    console.error('❌ ERRO:', message);
}

// ===============================================================================
// FUNÇÕES GLOBAIS EXPOSTAS - Compatibilidade
// ===============================================================================
window.formatCPFInput = formatCPFInput;
window.loadDashboard = loadDashboard;

console.log('🎯 Sistema de Doações v1.1.1 - Arquivo app.js carregado com sucesso');
