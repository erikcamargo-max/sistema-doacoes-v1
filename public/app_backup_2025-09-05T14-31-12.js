// ===============================================================================
// SISTEMA DE CONTROLE DE DOAÇÕES - APP.JS VERSÃO 1.1.3
// ===============================================================================
// Criado: Agosto/2025
// Última atualização: 05/Setembro/2025
// Versão: 1.1.3 - Correção completa de duplicatas e bugs
// ===============================================================================

// ===============================================================================
// FUNÇÃO DE BUSCA DE CEP VIA VIACEP
// ===============================================================================

window.buscarCEP = async function(cepValue, prefix = 'simple-') {
    const cep = cepValue.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    const cepField = document.getElementById(prefix + 'cep');
    if (cepField) {
        cepField.style.borderColor = '#fbbf24'; // Amarelo durante busca
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
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
        console.error('Erro ao buscar CEP:', error);
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
    
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    
    event.target.value = value;
    
    if (value.replace(/\D/g, '').length === 8) {
        const fieldId = event.target.id;
        let prefix = 'simple-';
        
        if (fieldId.includes('edit-')) {
            prefix = 'edit-';
        }
        
        buscarCEP(value, prefix);
    }
}

// ===============================================================================
// VARIÁVEIS GLOBAIS - DECLARAÇÃO ÚNICA
// ===============================================================================

let allDonations = []; // Lista completa de doações carregadas do servidor
let donations = [];    // Lista filtrada para exibição na tabela
let editingId = null;  // ID da doação sendo editada atualmente
let currentHistoryId = null; // ID da doação com histórico aberto

// Constantes da API
const API_BASE = '/api';

// Estado dos modais
const modalState = {
    donation: false,
    history: false
};

// ===============================================================================
// INICIALIZAÇÃO DO SISTEMA
// ===============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Doações v1.1.3 - Inicializando...');
    
    try {
        // Substituir ícones Feather
        feather.replace();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Carregar dados iniciais
        loadDonations();
        loadSummary();
        
        console.log('✅ Sistema inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showErrorState('Erro ao inicializar o sistema: ' + error.message);
    }
});

// ===============================================================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ===============================================================================

function setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    // Botão Nova Doação
    const btnNovaDoacao = document.getElementById('btn-new-donation');
    if (btnNovaDoacao) {
        btnNovaDoacao.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('➕ Nova doação clicada');
            openModal();
        });
        console.log('✅ Listener Nova Doação configurado');
    } else {
        console.warn('⚠️ Botão Nova Doação não encontrado');
    }
    
    // Botão Exportar
    const btnExport = document.getElementById('btn-export');
    if (btnExport) {
        btnExport.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📤 Exportar clicado');
            exportData();
        });
        console.log('✅ Listener Exportar configurado');
    }
    
    // Filtros
    const searchInput = document.getElementById('search-input');
    const filterType = document.getElementById('filter-type');
    const filterRecurrent = document.getElementById('filter-recurrent');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterDonations);
        console.log('✅ Listener busca configurado');
    }
    
    if (filterType) {
        filterType.addEventListener('change', filterDonations);
        console.log('✅ Listener filtro tipo configurado');
    }
    
    if (filterRecurrent) {
        filterRecurrent.addEventListener('change', filterDonations);
        console.log('✅ Listener filtro recorrente configurado');
    }
    
    console.log('🎯 Event listeners configurados com sucesso');
}

// ===============================================================================
// CARREGAMENTO DE DADOS
// ===============================================================================

async function loadDonations() {
    try {
        // Mostrar loading
        const loading = document.getElementById('loading');
        const tableContainer = document.getElementById('table-container');
        const emptyState = document.getElementById('empty-state');
        
        if (loading) loading.style.display = 'block';
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        
        console.log('🔄 Carregando doações...');
        
        const response = await fetch('/api/doacoes');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Doações carregadas:', data.length, 'registros');
        
        // Garantir que data é um array
        allDonations = Array.isArray(data) ? data : [];
        
        // Aplicar filtros
        filterDonations();
        
        // Esconder loading
        if (loading) loading.style.display = 'none';
        
    } catch (error) {
        console.error('❌ Erro ao carregar doações:', error);
        
        // Esconder loading
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        
        // Mostrar erro
        showErrorState('Erro ao carregar doações: ' + error.message);
    }
}

async function loadSummary() {
    try {
        const response = await fetch(`${API_BASE}/relatorios/resumo`);
        const data = await response.json();
        
        if (response.ok) {
            const totalArrecadado = document.getElementById('total-arrecadado');
            const totalDoacoes = document.getElementById('total-doacoes');
            const doacoesRecorrentes = document.getElementById('doacoes-recorrentes');
            const totalPagamentos = document.getElementById('total-pagamentos');
            
            if (totalArrecadado) totalArrecadado.textContent = `R$ ${(data.total_arrecadado || 0).toFixed(2).replace('.', ',')}`;
            if (totalDoacoes) totalDoacoes.textContent = data.total_doacoes || 0;
            if (doacoesRecorrentes) doacoesRecorrentes.textContent = data.doacoes_recorrentes || 0;
            if (totalPagamentos) totalPagamentos.textContent = `R$ ${(data.total_pagamentos || 0).toFixed(2).replace('.', ',')}`;
            
            // Mostrar seção de resumo
            const summary = document.getElementById('summary');
            if (summary) summary.style.display = 'grid';
        }
    } catch (error) {
        console.error('❌ Erro ao carregar resumo:', error);
    }
}

// ===============================================================================
// FILTROS E RENDERIZAÇÃO
// ===============================================================================

function filterDonations() {
    const searchInput = document.getElementById('search-input');
    const filterType = document.getElementById('filter-type');
    const filterRecurrent = document.getElementById('filter-recurrent');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const typeFilter = filterType ? filterType.value : '';
    const recurrentFilter = filterRecurrent ? filterRecurrent.value : '';
    
    console.log('🔍 Aplicando filtros:', { searchTerm, typeFilter, recurrentFilter });
    
    donations = allDonations.filter(donation => {
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
        const matchType = !typeFilter || donation.tipo === typeFilter;
        
        // Filtro de recorrência
        const matchRecurrent = recurrentFilter === '' || 
            donation.recorrente === parseInt(recurrentFilter);
        
        return matchSearch && matchType && matchRecurrent;
    });
    
    console.log('✅ Filtros aplicados:', donations.length, 'doações encontradas');
    
    renderDonationsTable(donations);
}

function renderDonationsTable(donations) {
    const tbody = document.getElementById('donations-tbody');
    const tableContainer = document.getElementById('table-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!donations || donations.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (tableContainer) tableContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    if (!tbody) {
        console.error('❌ Elemento tbody não encontrado');
        return;
    }
    
    tbody.innerHTML = donations.map(donation => {
        // Garantir que todos os campos existem com valores padrão
        const nome = donation.nome_doador || 'Doador não identificado';
        const codigo = donation.codigo_doador || `D${String(donation.doador_id || 0).padStart(3, '0')}`;
        const valor = (donation.valor || 0).toFixed(2).replace('.', ',');
        const tipo = donation.tipo || 'N/A';
        const data = formatDate(donation.data_doacao || new Date().toISOString());
        const telefone1 = donation.telefone1 || 'Não informado';
        const telefone2 = donation.telefone2 || '';
        const recorrente = donation.recorrente ? 'Sim' : 'Não';
        
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="text-sm">
                        <div class="font-medium text-gray-900">${nome}</div>
                        <div class="text-gray-500">${codigo}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-semibold text-green-600">
                        R$ ${valor}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${tipo === 'Dinheiro' ? 'bg-green-100 text-green-800' : 
                          tipo === 'PIX' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}">
                        ${tipo}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${data}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    <div>${telefone1}</div>
                    ${telefone2 ? `<div class="text-xs">${telefone2}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${donation.recorrente ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                        ${recorrente}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="viewHistory(${donation.id})" 
                        class="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Ver histórico">
                        <i data-feather="clock" class="h-4 w-4"></i>
                    </button>
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                    <div class="flex gap-2">
                        <button onclick="editDonation(${donation.id})" 
                            class="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar">
                            <i data-feather="edit" class="h-4 w-4"></i>
                        </button>
                        <button onclick="generateCarne(${donation.id})" 
                            class="text-green-600 hover:text-green-900 transition-colors"
                            title="Gerar carnê">
                            <i data-feather="file-text" class="h-4 w-4"></i>
                        </button>
                        <button onclick="deleteDonation(${donation.id})" 
                            class="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir">
                            <i data-feather="trash-2" class="h-4 w-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Re-renderizar ícones do Feather
    feather.replace();
}

// ===============================================================================
// FUNÇÕES AUXILIARES E NOTIFICAÇÕES
// ===============================================================================

function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-full`;
    
    // Cores baseadas no tipo
    switch(type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-white';
            break;
        default:
            notification.className += ' bg-blue-500 text-white';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function showErrorState(message) {
    const tableContainer = document.getElementById('table-container');
    const emptyState = document.getElementById('empty-state');
    
    if (tableContainer) tableContainer.style.display = 'none';
    if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <i data-feather="alert-circle" class="mx-auto h-12 w-12 text-red-400"></i>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Erro no Sistema</h3>
            <p class="mt-1 text-sm text-gray-500">${message}</p>
            <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Recarregar Página
            </button>
        `;
        feather.replace();
    }
}

// ===============================================================================
// MODAL DE NOVA DOAÇÃO
// ===============================================================================

function openModal() {
    console.log('📝 Abrindo modal de nova doação...');
    editingId = null;
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
                        
                        <h4 style="margin: 20px 0 15px 0; font-size: 16px; font-weight: bold; color: #555; border-top: 1px solid #eee; padding-top: 15px;">
                            📍 Endereço
                        </h4>
                        
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">CEP</label>
                                <input type="text" id="simple-cep" placeholder="00000-000" maxlength="9" 
                                       oninput="formatCEPInput(event)" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Logradouro</label>
                                <input type="text" id="simple-logradouro" placeholder="Rua, Avenida..." style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Número</label>
                                <input type="text" id="simple-numero" placeholder="123" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Complemento</label>
                                <input type="text" id="simple-complemento" placeholder="Apto, Bloco, Sala..." style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Bairro</label>
                            <input type="text" id="simple-bairro" placeholder="Nome do bairro" style="
                                width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                            ">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Cidade</label>
                                <input type="text" id="simple-cidade" placeholder="Nome da cidade" style="
                                    width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: bold; font-size: 14px;">Estado</label>
                                <input type="text" id="simple-estado" placeholder="UF" maxlength="2" style="
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
                                    <option value="PIX">PIX</option>
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
        cpf: document.getElementById('simple-cpf').value.trim(),
        // Campos de endereço
        cep: document.getElementById('simple-cep').value.trim(),
        logradouro: document.getElementById('simple-logradouro').value.trim(),
        numero: document.getElementById('simple-numero').value.trim(),
        complemento: document.getElementById('simple-complemento').value.trim(),
        bairro: document.getElementById('simple-bairro').value.trim(),
        cidade: document.getElementById('simple-cidade').value.trim(),
        estado: document.getElementById('simple-estado').value.trim()
    };
    
    if (!formData.donor || !formData.amount || !formData.date || !formData.phone1) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    if (formData.recurring) {
        const parcelas = parseInt(document.getElementById('simple-parcelas').value);
        const proximaParcela = document.getElementById('simple-proxima-parcela').value;
        
        if (!parcelas || parcelas < 2 || !proximaParcela) {
            showNotification('Para doação recorrente, informe parcelas e próxima data', 'error');
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
            showNotification('Doação criada com sucesso!', 'success');
            closeSimpleModal();
            loadDonations();
            loadSummary();
        } else {
            if (data.error === 'DUPLICATES_FOUND') {
                showNotification('Foram encontrados doadores similares. Implementar modal de verificação aqui.', 'warning');
            } else {
                showNotification('Erro: ' + data.error, 'error');
            }
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

// ===============================================================================
// FUNÇÕES DE HISTÓRICO DE PAGAMENTOS
// ===============================================================================

async function showSimpleHistory(id) {
    // Buscar doação e seu histórico
    const donation = allDonations.find(d => d.id === id);
    if (!donation) {
        showNotification('Doação não encontrada!', 'error');
        return;
    }
    
    try {
        // Buscar histórico de pagamentos
        const response = await fetch(`${API_BASE}/doacoes/${id}/historico`);
        const pagamentos = response.ok ? await response.json() : [];
        
        const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
        
        // Criar modal de histórico
        let existingModal = document.getElementById('history-modal-simple');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="history-modal-simple" style="
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
                    max-width: 800px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h2 style="margin: 0; font-size: 24px; font-weight: bold;">
                            📋 Histórico de Pagamentos
                        </h2>
                        <button onclick="closeHistoryModal()" style="
                            background: none;
                            border: none;
                            font-size: 30px;
                            cursor: pointer;
                            color: #666;
                        ">&times;</button>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                            <div>
                                <p style="margin: 0; color: #666; font-size: 14px;">Doador</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px;">
                                    ${donation.codigo_doador || 'D' + donation.doador_id} - ${donation.nome_doador}
                                </p>
                            </div>
                            <div>
                                <p style="margin: 0; color: #666; font-size: 14px;">Valor da Doação</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #3b82f6;">
                                    R$ ${donation.valor.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                            <div>
                                <p style="margin: 0; color: #666; font-size: 14px;">Total Pago</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 18px; color: #10b981;">
                                    R$ ${totalPago.toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                        </div>
                        ${donation.recorrente ? `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                Doação Recorrente - ${donation.parcelas_totais || 1} parcelas
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    
                    <h3 style="margin: 20px 0 15px 0; font-size: 18px; font-weight: bold;">
                        💳 Pagamentos Realizados (${pagamentos.length})
                    </h3>
                    
                    ${pagamentos.length > 0 ? `
                    <div style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead style="background: #f3f4f6;">
                                <tr>
                                    <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Data</th>
                                    <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Valor</th>
                                    <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Status</th>
                                    <th style="padding: 12px; text-align: center; font-weight: bold; color: #374151;">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pagamentos.map((p, index) => `
                                <tr style="border-top: 1px solid #e5e7eb;">
                                    <td style="padding: 12px;">
                                        ${formatDate(p.data_pagamento)}
                                    </td>
                                    <td style="padding: 12px; font-weight: bold; color: #059669;">
                                        R$ ${p.valor.toFixed(2).replace('.', ',')}
                                    </td>
                                    <td style="padding: 12px;">
                                        <span style="
                                            padding: 4px 12px;
                                            border-radius: 9999px;
                                            font-size: 12px;
                                            font-weight: bold;
                                            background: #10b981;
                                            color: white;
                                        ">${p.status || 'Pago'}</span>
                                    </td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button onclick="deletePagamento(${p.id}, ${id})" style="
                                            padding: 4px 8px;
                                            background: #ef4444;
                                            color: white;
                                            border: none;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 12px;
                                        ">🗑️ Excluir</button>
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
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">
                        <button onclick="closeEditModal()" style="
                            padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                        ">Cancelar</button>
                        
                        <button onclick="saveEditedDonation(${id})" style="
                            padding: 12px 25px; border: none; background: #3b82f6; color: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                        ">💾 Salvar Alterações</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Erro ao buscar dados da doação:', error);
        showNotification('Erro ao carregar dados da doação', 'error');
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) modal.remove();
}

async function saveEditedDonation(id) {
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
        // Campos de endereço
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
        const response = await fetch(`${API_BASE}/doacoes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Doação atualizada com sucesso!', 'success');
            closeEditModal();
            loadDonations();
            loadSummary();
        } else {
            showNotification('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

// ===============================================================================
// FUNÇÕES DE AÇÕES (DELETAR, GERAR CARNÊ, EXPORTAR)
// ===============================================================================

async function deleteDonation(id) {
    if (!confirm('Tem certeza que deseja excluir esta doação?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/doacoes/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Doação excluída!', 'success');
            loadDonations();
            loadSummary();
        } else {
            showNotification('Erro: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

async function generateCarne(doacaoId) {
    try {
        showNotification('Gerando carnê...', 'info');
        
        // Buscar dados da doação
        const doacaoResponse = await fetch(`/api/doacoes/${doacaoId}`);
        if (!doacaoResponse.ok) throw new Error('Erro ao buscar doação');
        const doacao = await doacaoResponse.json();
        
        // Buscar dados do doador
        const doadorResponse = await fetch(`/api/doadores/${doacao.doador_id}`);
        if (!doadorResponse.ok) throw new Error('Erro ao buscar doador');
        const doador = await doadorResponse.json();
        
        // Buscar histórico de pagamentos
        const historicoResponse = await fetch(`/api/doacoes/${doacaoId}/historico`);
        const historico = historicoResponse.ok ? await historicoResponse.json() : [];
        
        // Criar janela temporária para geração do PDF
        const printWindow = window.open('', '_blank');
        
        // HTML do carnê
        const carneHTML = generateCarneHTML(doador, doacao, historico);
        
        // Escrever HTML na nova janela
        printWindow.document.write(carneHTML);
        printWindow.document.close();
        
        showNotification('Carnê gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar carnê:', error);
        showNotification('Erro ao gerar carnê: ' + error.message, 'error');
    }
}

function generateCarneHTML(doador, doacao, historico) {
    const valorParcela = doacao.valor;
    const totalParcelas = doacao.parcelas_totais || (doacao.recorrente ? 12 : 1);
    let htmlParcelas = '';
    
    for (let i = 1; i <= totalParcelas; i++) {
        const dataVencimento = calcularVencimento(doacao.data_doacao, i - 1, doacao.recorrente);
        const pagamento = buscarPagamentoHistorico(historico, dataVencimento);
        const isPago = !!pagamento;
        
        htmlParcelas += `
    <div class="parcela-wrapper">
        <div class="parcela-container">
            <div class="canhoto">
                <div class="titulo">CANHOTO - CONTROLE</div>
                <div class="campo">
                    <strong>Cód. Contribuinte:</strong> 
                    <span style="color: #0066cc; font-weight: bold;">
                        ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
                    </span>
                </div>
                <div class="campo">
                    <strong>Valor Parcela:</strong> 
                    <span class="valor">R$ ${valorParcela.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="campo">
                    <strong>Vencimento:</strong> ${formatDate(dataVencimento)}
                </div>
                <div class="campo">
                    <strong>Status:</strong> 
                    <span class="${isPago ? 'status-pago' : 'status-pendente'}">
                        ${isPago ? 'PAGO' : 'PENDENTE'}
                    </span>
                </div>
                ${isPago ? `
                <div class="campo">
                    <strong>Data Pgto:</strong> ${formatDate(pagamento.data_pagamento)}
                </div>
                ` : ''}
            </div>
            
            <div class="recibo">
                <div class="titulo">
                    RECIBO DE PAGAMENTO
                    <span style="float: right; font-size: 14px; font-weight: normal;">
                        Parcela: ${String(i).padStart(2, '0')}/${String(totalParcelas).padStart(2, '0')}
                    </span>
                </div>
                <div class="campo">
                    <strong>Recebemos de:</strong> ${doador.nome.toUpperCase()}
                </div>
                <div class="campo">
                    <strong>A importância de:</strong> 
                    <span class="valor">R$ ${valorParcela.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="campo">
                    <strong>Data Pagamento:</strong> 
                    ${isPago ? formatDate(pagamento.data_pagamento) : '___/___/_____'}
                </div>
                <div class="campo">
                    <strong>Vencimento:</strong> ${formatDate(dataVencimento)}
                </div>
                <div class="campo" style="font-size: 12px; color: #666;">
                    <strong>Endereço:</strong> 
                    ${montarEndereco(doador)}
                </div>
                <div class="campo" style="font-size: 12px; color: #666;">
                    <strong>Telefone:</strong> ${doador.telefone1}
                    ${doador.telefone2 ? ' / ' + doador.telefone2 : ''}
                </div>
                ${isPago ? `
                <div class="confirmacao">
                    ✓ Pagamento confirmado em ${formatDate(pagamento.data_pagamento)}
                </div>
                ` : ''}
            </div>
        </div>
    </div>
`;
    }
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Carnê - ${doador.nome}</title>
    <style>
        @media print {
            body { margin: 0; }
            .parcela-wrapper { page-break-inside: avoid; }
            .no-print { display: none !important; }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border: 2px solid #333;
        }
        .parcela-wrapper {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .parcela-container {
            display: flex;
            border: 2px solid #333;
            min-height: 200px;
        }
        .canhoto {
            width: 40%;
            padding: 15px;
            border-right: 2px dashed #666;
            background: #f9f9f9;
        }
        .recibo {
            width: 60%;
            padding: 15px;
        }
        .titulo {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ccc;
        }
        .campo {
            margin: 10px 0;
            font-size: 14px;
        }
        .campo strong {
            display: inline-block;
            min-width: 120px;
        }
        .valor {
            color: #d32f2f;
            font-size: 18px;
            font-weight: bold;
        }
        .status-pago {
            background: #4caf50;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
        }
        .status-pendente {
            background: #ff9800;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
        }
        .confirmacao {
            margin-top: 15px;
            padding: 10px;
            background: #e8f5e9;
            border-radius: 3px;
            color: #2e7d32;
            font-size: 12px;
        }
        @page {
            size: A4;
            margin: 10mm;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CARNÊ DE PAGAMENTO</h1>
        <h2>${doador.nome.toUpperCase()}</h2>
        <div style="margin-top: 10px; font-size: 14px;">
            <strong>Código:</strong> ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
            ${doador.cpf ? ' | <strong>CPF:</strong> ' + formatCPF(doador.cpf) : ''}
        </div>
    </div>
    ${htmlParcelas}
    <div class="no-print" style="text-align: center; margin: 30px;">
        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir Carnê
        </button>
    </div>
</body>
</html>`;
}

async function exportData() {
    try {
        showNotification('Gerando relatório PDF...', 'info');
        
        // Buscar dados do resumo
        const resumoResponse = await fetch('/api/relatorios/resumo');
        const resumo = await resumoResponse.json();
        
        // Buscar lista de doações
        const doacoesResponse = await fetch('/api/doacoes');
        const doacoes = await doacoesResponse.json();
        
        // Criar janela para PDF
        const printWindow = window.open('', '_blank');
        
        // HTML do relatório
        const relatorioHTML = generateRelatorioHTML(resumo, doacoes);
        
        // Escrever HTML na nova janela
        printWindow.document.write(relatorioHTML);
        printWindow.document.close();
        
        showNotification('Relatório PDF gerado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showNotification('Erro ao gerar relatório PDF: ' + error.message, 'error');
    }
}

function generateRelatorioHTML(resumo, doacoes) {
    // Adicionar linhas da tabela
    let tabelaRows = '';
    doacoes.forEach(doacao => {
        tabelaRows += `
            <tr>
                <td>${doacao.codigo_doador || 'D' + String(doacao.doador_id).padStart(3, '0')}</td>
                <td>${doacao.nome_doador || 'N/A'}</td>
                <td>R$ ${doacao.valor.toFixed(2).replace('.', ',')}</td>
                <td>${doacao.tipo}</td>
                <td>${formatDate(doacao.data_doacao)}</td>
                <td>${doacao.recorrente ? 'Sim' : 'Não'}</td>
                <td>${doacao.telefone1 || 'N/A'}</td>
            </tr>`;
    });
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Doações - ${new Date().toLocaleDateString('pt-BR')}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-after: always; }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: #f5f5f5;
            border: 2px solid #333;
        }
        .header h1 {
            margin: 0;
            color: #333;
        }
        .section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #333;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .summary-card {
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #555;
            font-size: 14px;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #333;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 14px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            font-size: 13px;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        @page {
            size: A4;
            margin: 15mm;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RELATÓRIO DE DOAÇÕES</h1>
        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    </div>
    
    <div class="section">
        <div class="section-title">RESUMO GERAL</div>
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Arrecadado</h3>
                <div class="value">R$ ${(resumo.total_arrecadado || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
                <h3>Total de Doações</h3>
                <div class="value">${resumo.total_doacoes || 0}</div>
            </div>
            <div class="summary-card">
                <h3>Doações Recorrentes</h3>
                <div class="value">${resumo.doacoes_recorrentes || 0}</div>
            </div>
            <div class="summary-card">
                <h3>Total de Pagamentos</h3>
                <div class="value">${resumo.total_pagamentos || 0}</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">DETALHAMENTO DAS DOAÇÕES</div>
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Doador</th>
                    <th>Valor</th>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Recorrente</th>
                    <th>Telefone</th>
                </tr>
            </thead>
            <tbody>
                ${tabelaRows}
            </tbody>
        </table>
    </div>
    
    <div class="footer">
        <p>Sistema de Controle de Doações - Relatório Oficial</p>
        <p>Este documento foi gerado automaticamente e contém informações confidenciais.</p>
    </div>
    
    <div class="no-print" style="text-align: center; margin: 30px;">
        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir Relatório
        </button>
    </div>
</body>
</html>`;
}

// ===============================================================================
// FUNÇÕES AUXILIARES E UTILITÁRIAS
// ===============================================================================

function calcularVencimento(dataInicial, mesesAdicionais, recorrente) {
    const data = new Date(dataInicial);
    if (recorrente) {
        data.setMonth(data.getMonth() + mesesAdicionais);
    }
    return data.toISOString().substring(0, 10);
}

function buscarPagamentoHistorico(historico, dataVencimento) {
    const vencimento = new Date(dataVencimento);
    
    for (let pgto of historico) {
        const dataPgto = new Date(pgto.data_pagamento);
        const diff = Math.abs((dataPgto - vencimento) / (1000 * 60 * 60 * 24));
        if (diff <= 5) { // Tolerância de 5 dias
            return pgto;
        }
    }
    return null;
}

function montarEndereco(doador) {
    const parts = [];
    if (doador.logradouro) parts.push(doador.logradouro);
    if (doador.numero) parts.push(doador.numero);
    if (doador.complemento) parts.push(doador.complemento);
    if (doador.bairro) parts.push(doador.bairro);
    if (doador.cidade) parts.push(doador.cidade);
    if (doador.estado) parts.push(doador.estado);
    if (doador.cep) parts.push(`CEP: ${doador.cep}`);
    
    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
}

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
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        return dateString;
    }
}

// ===============================================================================
// FUNÇÕES GLOBAIS PARA ONCLICK DOS BOTÕES
// ===============================================================================

// Expor funções para uso global nos botões onclick
window.viewHistory = function(id) {
    console.log('Abrindo histórico para doação:', id);
    
    const donation = allDonations.find(d => d.id === id);
    if (!donation) {
        showNotification('Doação não encontrada!', 'error');
        return;
    }
    
    showSimpleHistory(id);
}

window.editDonation = function(id) {
    console.log('Editando doação:', id);
    
    const donation = allDonations.find(d => d.id === id);
    if (!donation) {
        showNotification('Doação não encontrada!', 'error');
        return;
    }
    
    editDonation(id);
}

window.generateCarne = function(id) {
    console.log('Gerando carnê para doação:', id);
    
    const donation = allDonations.find(d => d.id === id);
    if (!donation) {
        showNotification('Doação não encontrada!', 'error');
        return;
    }
    
    generateCarne(id);
}

window.deleteDonation = function(id) {
    console.log('Solicitando exclusão da doação:', id);
    
    if (!confirm('Tem certeza que deseja excluir esta doação?')) {
        return;
    }
    
    deleteDonation(id);
}

// Funções do modal
window.closeSimpleModal = closeSimpleModal;
window.toggleRecurringFieldsSimple = toggleRecurringFieldsSimple;
window.saveSimpleModalWithDuplicateCheck = saveSimpleModalWithDuplicateCheck;
window.closeHistoryModal = closeHistoryModal;
window.addPagamento = addPagamento;
window.deletePagamento = deletePagamento;
window.closeEditModal = closeEditModal;
window.saveEditedDonation = saveEditedDonation;

// ===============================================================================
// FIM DO ARQUIVO - VERSÃO 1.1.3 COMPLETA
// ===============================================================================15px; justify-content: flex-end; margin-top: 25px; padding-top: 20px; border-top: 2px solid #eee;">
                        <button onclick="closeHistoryModal()" style="
                            padding: 12px 25px; border: 2px solid #ccc; background: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                        ">Fechar</button>
                        
                        <button onclick="addPagamento(${id})" style="
                            padding: 12px 25px; border: none; background: #10b981; color: white; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;
                        ">➕ Adicionar Pagamento</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        showNotification('Erro ao carregar histórico', 'error');
    }
}

function closeHistoryModal() {
    const modal = document.getElementById('history-modal-simple');
    if (modal) modal.remove();
}

async function addPagamento(doacaoId) {
    const date = prompt('Data do pagamento (DD/MM/AAAA):');
    if (!date) return;
    
    const valor = prompt('Valor do pagamento (R$):');
    if (!valor) return;
    
    try {
        // Converter data para formato ISO
        const [dia, mes, ano] = date.split('/');
        const dataISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        
        const response = await fetch(`${API_BASE}/doacoes/${doacaoId}/historico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data_pagamento: dataISO,
                valor: parseFloat(valor.replace(',', '.')),
                status: 'Pago'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Pagamento adicionado!', 'success');
            closeHistoryModal();
            loadDonations();
            loadSummary();
        } else {
            showNotification('Erro ao adicionar pagamento', 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

async function deletePagamento(pagamentoId, doacaoId) {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/historico/${pagamentoId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Pagamento excluído!', 'success');
            closeHistoryModal();
            loadDonations();
            loadSummary();
        } else {
            showNotification('Erro ao excluir pagamento', 'error');
        }
    } catch (error) {
        showNotification('Erro: ' + error.message, 'error');
    }
}

// ===============================================================================
// FUNÇÕES DE EDIÇÃO DE DOAÇÕES
// ===============================================================================

async function editDonation(id) {
    console.log('Editando doação:', id);
    
    try {
        // Buscar dados completos da doação
        const response = await fetch(`${API_BASE}/doacoes/${id}`);
        if (!response.ok) {
            throw new Error('Erro ao buscar dados da doação');
        }
        
        const donation = await response.json();
        editingId = id;
        
        // Criar modal de edição
        let existingModal = document.getElementById('edit-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="edit-modal" style="
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
                        <h2 style="margin: 0; font-size: 24px; font-weight: bold;">
                            Editar Doação - ${donation.codigo_doador || 'D' + donation.doador_id}
                        </h2>
                        <button onclick="closeEditModal()" style="
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
                                <input type="text" id="edit-donor" value="${donation.doador_nome || ''}" style="
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
                                <input type="tel" id="edit-phone1" value="${donation.doador_telefone1 || ''}" style="
                                    width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;
                                ">
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Telefone Alternativo</label>
                                <input type="tel" id="edit-phone2" value="${donation.doador_telefone2 || ''}" style="
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
                                    <input type="text" id="edit-complemento" value="${donation.doador_complemento || ''}" placeholder="Apto, Bloco, Sala..." style="
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
                            
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
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
                                        <option value="Dinheiro" ${donation.tipo === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                                        <option value="PIX" ${donation.tipo === 'PIX' ? 'selected' : ''}>PIX</option>
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
                                    <input type="checkbox" id="edit-recurring" ${donation.recorrente ? 'checked' : ''} style="
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
                    
                    <div style="display: flex; gap: 