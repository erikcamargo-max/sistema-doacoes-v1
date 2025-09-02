
// ===============================================================================
// FUNÇÃO DE BUSCA DE CEP
// ===============================================================================

// Função para buscar CEP via ViaCEP
window.buscarCEP = async function(cepValue, prefix = 'simple-') {
    console.log('🔍 Buscando CEP:', cepValue, 'Prefix:', prefix);
    
    // Remove formatação do CEP
    const cep = cepValue.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        console.log('CEP incompleto:', cep);
        return;
    }
    
    // Mostrar indicador de carregamento
    const cepField = document.getElementById(prefix + 'cep');
    if (cepField) {
        cepField.style.borderColor = '#fbbf24'; // Amarelo durante busca
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        console.log('Resposta ViaCEP:', data);
        
        if (!data.erro) {
            // Preencher campos automaticamente
            const logradouroField = document.getElementById(prefix + 'logradouro');
            const bairroField = document.getElementById(prefix + 'bairro');
            const cidadeField = document.getElementById(prefix + 'cidade');
            const estadoField = document.getElementById(prefix + 'estado');
            
            if (logradouroField) {
                logradouroField.value = data.logradouro || '';
                console.log('Logradouro preenchido:', data.logradouro);
            }
            if (bairroField) {
                bairroField.value = data.bairro || '';
                console.log('Bairro preenchido:', data.bairro);
            }
            if (cidadeField) {
                cidadeField.value = data.localidade || '';
                console.log('Cidade preenchida:', data.localidade);
            }
            if (estadoField) {
                estadoField.value = data.uf || '';
                console.log('Estado preenchido:', data.uf);
            }
            
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
            
            console.log('✅ Endereço encontrado e preenchido!');
        } else {
            console.log('⚠️ CEP não encontrado');
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
        
        console.log('CEP completo, iniciando busca. Prefix:', prefix);
        buscarCEP(value, prefix);
    }
}
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
        cpf: document.getElementById('simple-cpf').value.trim(),
        // Novos campos de endereço
        cep: document.getElementById('simple-cep').value.trim(),
        logradouro: document.getElementById('simple-logradouro').value.trim(),
        numero: document.getElementById('simple-numero').value.trim(),
        complemento: document.getElementById('simple-complemento').value.trim(),
        bairro: document.getElementById('simple-bairro').value.trim(),
        cidade: document.getElementById('simple-cidade').value.trim(),
        estado: document.getElementById('simple-estado').value.trim()
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
    console.log('📊 Exibindo histórico da doação ID:', id);
    
    // Buscar doação e seu histórico
    const donation = donations.find(d => d.id === id);
    if (!donation) {
        alert('❌ Doação não encontrada!');
        return;
    }
    
    // Criar modal de histórico
    let existingModal = document.getElementById('history-modal-simple');
    if (existingModal) {
        existingModal.remove();
    }
    
    const pagamentos = donation.historico_pagamentos || [];
    const totalPago = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    
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
                                ${donation.codigo_doador || 'D' + donation.doador_id} - ${donation.doador_nome}
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
                                    ${new Date(p.data_pagamento + 'T00:00:00').toLocaleDateString('pt-BR')}
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
}

window.closeHistoryModal = function() {
    const modal = document.getElementById('history-modal-simple');
    if (modal) modal.remove();
}

window.addPagamento = function(doacaoId) {
    const date = prompt('Data do pagamento (DD/MM/AAAA):');
    if (!date) return;
    
    const valor = prompt('Valor do pagamento (R$):');
    if (!valor) return;
    
    // Converter data para formato ISO
    const [dia, mes, ano] = date.split('/');
    const dataISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    
    fetch(`${API_BASE}/doacoes/${doacaoId}/pagamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data_pagamento: dataISO,
            valor: parseFloat(valor.replace(',', '.')),
            status: 'Pago'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('✅ Pagamento adicionado!');
            closeHistoryModal();
            loadDonations();
            loadSummary();
        } else {
            alert('❌ Erro ao adicionar pagamento');
        }
    })
    .catch(error => {
        alert('❌ Erro: ' + error.message);
    });
}

window.deletePagamento = function(pagamentoId, doacaoId) {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;
    
    fetch(`${API_BASE}/pagamentos/${pagamentoId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('✅ Pagamento excluído!');
            closeHistoryModal();
            loadDonations();
            loadSummary();
        } else {
            alert('❌ Erro ao excluir pagamento');
        }
    })
    .catch(error => {
        alert('❌ Erro: ' + error.message);
    });
}

function editDonation(id) {
    console.log('📝 Editando doação ID:', id);
    
    // Buscar dados da doação
    const donation = donations.find(d => d.id === id);
    if (!donation) {
        alert('❌ Doação não encontrada!');
        return;
    }
    
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
                            <input type="text" id="edit-donor" value="${donation.doador_nome}" style="
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
                            <input type="tel" id="edit-phone1" value="${donation.doador_telefone1}" style="
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
                                    <option value="Produto" ${donation.tipo === 'Produto' ? 'selected' : ''}>Produto</option>
                                    <option value="Serviço" ${donation.tipo === 'Serviço' ? 'selected' : ''}>Serviço</option>
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
        alert('❌ Preencha todos os campos obrigatórios');
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
            alert('✅ Doação atualizada com sucesso!');
            closeEditModal();
            loadDonations();
            loadSummary();
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
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
        'PIX': 'bg-blue-100 text-blue-800'
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

