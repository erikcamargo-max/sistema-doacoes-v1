
// ===============================================================================
// SISTEMA DE NOTIFICAÇÕES - Versão 1.1.5
// Data: 05/09/2025
// ===============================================================================

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


// ===============================================================================
// FUNÇÃO DE BUSCA DE CEP
// ===============================================================================

// Função para buscar CEP via ViaCEP




// ===============================================================================
// SISTEMA DE CONTROLE DE DOAÇÕES - APP.JS CORRIGIDO v1.1.1
// ===============================================================================


// ===============================================================================
// FUNÇÃO PARA CAMPOS RECORRENTES - Versão 1.1.2
// ===============================================================================

function toggleRecurringFields() {
    const checkbox = document.getElementById('input-recurrent');
    const fields = document.getElementById('recurring-fields');
    const proximaParcelaField = document.getElementById('input-proxima-parcela');
    
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.style.display = 'block';
            
            // Calcular próxima parcela (30 dias à frente)
            if (proximaParcelaField) {
                const hoje = new Date();
                const proximaData = new Date(hoje);
                proximaData.setDate(proximaData.getDate() + 30);
                
                const dataFormatada = proximaData.toISOString().substring(0, 10);
                proximaParcelaField.value = dataFormatada;
            }
            
            console.log('🔄 Campos de recorrência ativados');
        } else {
            fields.style.display = 'none';
            console.log('🔄 Campos de recorrência desativados');
        }
    }
}

// Tornar função global
window.toggleRecurringFields = toggleRecurringFields;


// ===============================================================================
// FUNÇÕES VIACEP CORRIGIDAS - Versão 1.1.4 DEFINITIVA
// ===============================================================================

// Função para buscar CEP via ViaCEP API - CORRIGIDA
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

// Função para formatar input de CEP - CORRIGIDA
window.formatCEPInput = function(event) {
    console.log('⌨️ formatCEPInput chamada:', event.target.id);
    
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
    console.log('✅ CEP formatado:', value);
    
    // Buscar CEP automaticamente quando completo (8 dígitos)
    if (value.replace(/\D/g, '').length === 8) {
        // Detectar contexto baseado no ID do campo
        const fieldId = event.target.id;
        let contexto = 'input';
        
        if (fieldId.includes('edit-')) {
            contexto = 'edit';
        } else if (fieldId.includes('simple-')) {
            contexto = 'simple';
        }
        
        console.log('🚀 CEP completo, iniciando busca automática...', { contexto });
        buscarCEP(value, contexto);
    }
}

// Tornar funções acessíveis globalmente - IMPORTANTE!
window.buscarCEP = window.buscarCEP;
window.formatCEPInput = window.formatCEPInput;

console.log('✅ Funções ViaCEP 1.1.4 carregadas com sucesso');

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


        
        console.log('📊 Dados coletados:', formData);
        
        // Validações obrigatórias
        if (!formData.donor) {
            alert('❌ Nome do doador é obrigatório');
            document.getElementById('input-donor')?.focus();
            return;
        }
        
        if (!formData.phone1) {
            alert('❌ Telefone é obrigatório');
            document.getElementById('input-phone1')?.focus();
            return;
        }
        
        if (!formData.amount || formData.amount <= 0) {
            alert('❌ Valor deve ser maior que zero');
            document.getElementById('input-amount')?.focus();
            return;
        }
        
        if (!formData.date) {
            alert('❌ Data é obrigatória');
            document.getElementById('input-date')?.focus();
            return;
        }
        
        // Mostrar loading
        const saveButton = document.querySelector('[onclick*="addDonation"]');
        const originalText = saveButton?.textContent;
        if (saveButton) {
            saveButton.textContent = '⏳ Salvando...';
            saveButton.disabled = true;
        }
        
        // Enviar para o servidor
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Doação salva com sucesso:', result);
            
            // Fechar modal
            closeModal();
            
            // Atualizar dashboard
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
            
            // Notificação de sucesso
            if (typeof showNotification === 'function') {
                showNotification('✅ Doação salva com sucesso!', 'success');
            } else {
                alert('✅ Doação salva com sucesso!');
            }
            
        } else {
            throw new Error(result.error || 'Erro ao salvar doação');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar doação:', error);
        
        if (typeof showNotification === 'function') {
            showNotification('❌ Erro ao salvar: ' + error.message, 'error');
        } else {
            alert('❌ Erro ao salvar: ' + error.message);
        }
    } finally {
        // Restaurar botão
        const saveButton = document.querySelector('[onclick*="addDonation"]');
        if (saveButton) {
            saveButton.textContent = originalText || '💾 Salvar';
            saveButton.disabled = false;
        }
    }
};



// ===============================================================================
// FUNÇÃO PARA FECHAR MODAL - Versão 1.1.5
// ===============================================================================



/**
 * Limpa todos os campos do modal
 * Versão: 1.1.5
 */
function clearModalFields() {
    const fieldIds = [
        'input-donor', 'input-cpf', 'input-phone1', 'input-phone2', 
        'input-contact', 'input-amount', 'input-type', 'input-date',
        'input-recurrent', 'input-notes', 'input-cep', 'input-logradouro',
        'input-numero', 'input-complemento', 'input-bairro', 'input-cidade', 'input-estado'
    ];
    
    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = false;
            } else {
                field.value = '';
            }
        }
    });
    
    // Ocultar campos de recorrência
    const recurringFields = document.getElementById('recurring-fields');
    if (recurringFields) {
        recurringFields.style.display = 'none';
    }
    
    console.log('🧹 Campos do modal limpos');
}



// ===============================================================================
// SISTEMA COMPLETO DE MODAL NOVA DOAÇÃO - V1.1.5
// Implementação robusta, otimizada e 100% funcional
// Data: 06/09/2025
// ===============================================================================

/**
 * Abre o modal de nova doação
 * Versão: 1.1.5 - Implementação completa e robusta
 */
window.openModal = function() {
    try {
        console.log('📝 Abrindo modal Nova Doação - v1.1.5');
        
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        
        if (!modal) {
            console.error('❌ Modal não encontrado no DOM');
            if (typeof showNotification === 'function') {
                showNotification('Erro: Modal não encontrado', 'error');
            }
            return;
        }
        
        // Configurar título
        if (modalTitle) {
            modalTitle.textContent = 'Nova Doação';
        }
        
        // Limpar todos os campos
        clearModalFields();
        
        // Definir valores padrão
        setDefaultValues();
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Focar no primeiro campo
        setTimeout(() => {
            const firstInput = document.getElementById('input-donor');
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }, 150);
        
        console.log('✅ Modal aberto com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao abrir modal:', error);
        if (typeof showNotification === 'function') {
            showNotification('Erro ao abrir modal: ' + error.message, 'error');
        }
    }
};

/**
 * Adiciona nova doação - Função principal de salvamento
 * Versão: 1.1.5 - Implementação completa
 */
window.addDonation = async function() {
    try {
        console.log('💾 Iniciando processo de salvamento...');
        
        // Mostrar loading no botão
        const saveButton = document.querySelector('button[onclick*="addDonation"]') || 
                          document.getElementById('btn-save-donation');
        const originalText = saveButton?.textContent || '💾 Salvar';
        
        if (saveButton) {
            saveButton.textContent = '⏳ Salvando...';
            saveButton.disabled = true;
        }
        
        // Coletar dados do formulário
        const formData = collectFormData();
        
        // Validações obrigatórias
        const validationResult = validateFormData(formData);
        if (!validationResult.isValid) {
            showValidationError(validationResult.field, validationResult.message);
            return;
        }
        
        console.log('📊 Dados validados:', formData);
        
        // Enviar dados para o servidor
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || 'Erro HTTP: ' + response.status);
        }
        
        const result = await response.json();
        console.log('✅ Doação salva com sucesso:', result);
        
        // Fechar modal
        closeModal();
        
        // Atualizar dashboard
        if (typeof loadDashboard === 'function') {
            await loadDashboard();
        }
        
        // Notificação de sucesso
        if (typeof showNotification === 'function') {
            showNotification('✅ Doação de ' + formData.donor + ' salva com sucesso!', 'success');
        } else {
            alert('✅ Doação salva com sucesso!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar doação:', error);
        
        if (typeof showNotification === 'function') {
            showNotification('❌ Erro ao salvar: ' + error.message, 'error');
        } else {
            alert('❌ Erro ao salvar: ' + error.message);
        }
        
    } finally {
        // Restaurar botão
        const saveButton = document.querySelector('button[onclick*="addDonation"]') || 
                          document.getElementById('btn-save-donation');
        if (saveButton) {
            saveButton.textContent = originalText;
            saveButton.disabled = false;
        }
    }
};

/**
 * Fecha o modal de nova doação
 * Versão: 1.1.5 - Implementação com limpeza completa
 */
window.closeModal = function() {
    try {
        console.log('❌ Fechando modal de nova doação...');
        
        const modal = document.getElementById('modal');
        if (!modal) {
            console.log('⚠️ Modal não encontrado');
            return;
        }
        
        // Fechar modal
        modal.style.display = 'none';
        
        // Limpar campos
        clearModalFields();
        
        console.log('✅ Modal fechado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao fechar modal:', error);
        // Fechar forçado
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
    }
};

// ===============================================================================
// FUNÇÕES AUXILIARES DO MODAL - V1.1.5
// ===============================================================================

/**
 * Coleta dados do formulário
 * Versão: 1.1.5
 */
function collectFormData() {
    const getData = (id, defaultValue = '') => {
        const element = document.getElementById(id);
        if (!element) return defaultValue;
        
        if (element.type === 'checkbox') return element.checked;
        if (element.type === 'number') return parseFloat(element.value) || 0;
        
        return element.value?.trim() || defaultValue;
    };
    
    return {
        // Dados pessoais
        donor: getData('input-donor'),
        cpf: getData('input-cpf'),
        phone1: getData('input-phone1'),
        phone2: getData('input-phone2'),
        contact: getData('input-contact'),
        
        // Dados da doação
        amount: getData('input-amount', 0),
        type: getData('input-type', 'DINHEIRO'),
        date: getData('input-date'),
        recurring: getData('input-recurrent', false),
        notes: getData('input-notes'),
        
        // Endereço completo
        cep: getData('input-cep'),
        logradouro: getData('input-logradouro'),
        numero: getData('input-numero'),
        complemento: getData('input-complemento'),
        bairro: getData('input-bairro'),
        cidade: getData('input-cidade'),
        estado: getData('input-estado')
    };
}

/**
 * Valida dados do formulário
 * Versão: 1.1.5
 */
function validateFormData(data) {
    // Nome obrigatório
    if (!data.donor || data.donor.length < 2) {
        return {
            isValid: false,
            field: 'input-donor',
            message: 'Nome do doador é obrigatório (mín. 2 caracteres)'
        };
    }
    
    // Telefone obrigatório
    if (!data.phone1 || data.phone1.length < 10) {
        return {
            isValid: false,
            field: 'input-phone1',
            message: 'Telefone é obrigatório (mín. 10 dígitos)'
        };
    }
    
    // Valor obrigatório e positivo
    if (!data.amount || data.amount <= 0) {
        return {
            isValid: false,
            field: 'input-amount',
            message: 'Valor deve ser maior que zero'
        };
    }
    
    // Data obrigatória
    if (!data.date) {
        return {
            isValid: false,
            field: 'input-date',
            message: 'Data é obrigatória'
        };
    }
    
    return { isValid: true };
}

/**
 * Mostra erro de validação específico
 * Versão: 1.1.5
 */
function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.focus();
        field.select();
        
        // Destacar campo com erro
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 5px rgba(239, 68, 68, 0.3)';
        
        // Remover destaque após 3 segundos
        setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }, 3000);
    }
    
    if (typeof showNotification === 'function') {
        showNotification('❌ ' + message, 'error');
    } else {
        alert('❌ ' + message);
    }
}

/**
 * Define valores padrão do formulário
 * Versão: 1.1.5
 */
function setDefaultValues() {
    // Data padrão como hoje
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('input-date');
    if (dateField && !dateField.value) {
        dateField.value = today;
    }
    
    // Tipo padrão como DINHEIRO
    const typeField = document.getElementById('input-type');
    if (typeField && !typeField.value) {
        typeField.value = 'DINHEIRO';
    }
    
    // Garantir que campos de recorrência estejam ocultos
    const recurringFields = document.getElementById('recurring-fields');
    if (recurringFields) {
        recurringFields.style.display = 'none';
    }
}

/**
 * Limpa todos os campos do modal
 * Versão: 1.1.5
 */
function clearModalFields() {
    const fieldIds = [
        'input-donor', 'input-cpf', 'input-phone1', 'input-phone2', 
        'input-contact', 'input-amount', 'input-notes',
        'input-cep', 'input-logradouro', 'input-numero', 
        'input-complemento', 'input-bairro', 'input-cidade', 'input-estado'
    ];
    
    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.value = '';
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }
    });
    
    // Limpar checkbox de recorrência
    const recurringCheck = document.getElementById('input-recurrent');
    if (recurringCheck) {
        recurringCheck.checked = false;
    }
    
    // Ocultar campos de recorrência
    const recurringFields = document.getElementById('recurring-fields');
    if (recurringFields) {
        recurringFields.style.display = 'none';
    }
    
    console.log('🧹 Campos do modal limpos');
}

// ===============================================================================
// TOGGLE PARA CAMPOS RECORRENTES - V1.1.5
// ===============================================================================

/**
 * Controla exibição dos campos de recorrência
 * Versão: 1.1.5
 */
window.toggleRecurringFields = function() {
    try {
        const checkbox = document.getElementById('input-recurrent');
        const fields = document.getElementById('recurring-fields');
        
        if (checkbox && fields) {
            if (checkbox.checked) {
                fields.style.display = 'block';
                console.log('🔄 Campos de recorrência ativados');
            } else {
                fields.style.display = 'none';
                console.log('🔄 Campos de recorrência desativados');
            }
        }
    } catch (error) {
        console.error('❌ Erro no toggle de recorrência:', error);
    }
};

console.log('✅ Sistema completo de modal implementado - v1.1.5');


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
// Função editDonation será substituída

/**
 * Gerar carnê
 * Versão: 1.1.1
 */
// Função generateCarne será substituída

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
// Função exportData será substituída

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


// ===============================================================================
// FUNÇÃO DE EDIÇÃO DE DOAÇÃO - RESTAURADA v1.1.2
// ===============================================================================

/**
 * Editar doação existente
 * Versão: 1.1.2 - Função completa restaurada
 */
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

/**
 * Fecha modal de edição
 * Versão: 1.1.2
 */
window.closeEditModal = function() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.remove();
        console.log('❌ Modal de edição fechado');
    }
}

/**
 * Salva alterações da doação editada
 * Versão: 1.1.2
 */
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
        const response = await fetch(API_BASE + '/doacoes/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Doação atualizada com sucesso!');
            closeEditModal();
            loadDashboard();
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ===============================================================================
// FUNÇÃO DE GERAÇÃO DE CARNÊ - RESTAURADA v1.1.2
// ===============================================================================

/**
 * Gerar carnê de pagamento com canhoto
 * Versão: 1.1.2 - Função completa restaurada
 */
window.generateCarne = async function(doacaoId) {
    try {
        console.log('📄 Gerando carnê da doação ' + doacaoId);
        
        // Buscar dados da doação
        const doacaoResponse = await fetch(API_BASE + '/doacoes/' + doacaoId);
        if (!doacaoResponse.ok) throw new Error('Erro ao buscar doação');
        const doacao = await doacaoResponse.json();
        
        // Buscar dados do doador
        const doadorResponse = await fetch(API_BASE + '/doadores/' + doacao.doador_id);
        if (!doadorResponse.ok) throw new Error('Erro ao buscar doador');
        const doador = await doadorResponse.json();
        
        // Buscar histórico de pagamentos
        const historicoResponse = await fetch(API_BASE + '/doacoes/' + doacaoId + '/historico');
        const historico = await historicoResponse.json();
        
        // Criar janela temporária para geração do PDF
        const printWindow = window.open('', '_blank');
        
        // HTML do carnê
        const carneHTML = '' +
'<!DOCTYPE html>' +
'<html lang="pt-BR">' +
'<head>' +
'    <meta charset="UTF-8">' +
'    <title>Carnê - ' + doador.nome + '</title>' +
'    <style>' +
'        @media print {' +
'            body { margin: 0; }' +
'            .parcela-wrapper { page-break-inside: avoid; }' +
'            .no-print { display: none !important; }' +
'        }' +
'        body {' +
'            font-family: Arial, sans-serif;' +
'            margin: 20px;' +
'            color: #333;' +
'        }' +
'        .header {' +
'            text-align: center;' +
'            margin-bottom: 30px;' +
'            padding: 20px;' +
'            background: #f5f5f5;' +
'            border: 2px solid #333;' +
'        }' +
'        .parcela-wrapper {' +
'            margin-bottom: 30px;' +
'            page-break-inside: avoid;' +
'        }' +
'        .parcela-container {' +
'            display: flex;' +
'            border: 2px solid #333;' +
'            min-height: 200px;' +
'        }' +
'        .canhoto {' +
'            width: 40%;' +
'            padding: 15px;' +
'            border-right: 2px dashed #666;' +
'            background: #f9f9f9;' +
'        }' +
'        .recibo {' +
'            width: 60%;' +
'            padding: 15px;' +
'        }' +
'        .titulo {' +
'            font-size: 16px;' +
'            font-weight: bold;' +
'            margin-bottom: 15px;' +
'            padding-bottom: 5px;' +
'            border-bottom: 1px solid #ccc;' +
'        }' +
'        .campo {' +
'            margin: 10px 0;' +
'            font-size: 14px;' +
'        }' +
'        .campo strong {' +
'            display: inline-block;' +
'            min-width: 120px;' +
'        }' +
'        .valor {' +
'            color: #d32f2f;' +
'            font-size: 18px;' +
'            font-weight: bold;' +
'        }' +
'        .status-pago {' +
'            background: #4caf50;' +
'            color: white;' +
'            padding: 2px 8px;' +
'            border-radius: 3px;' +
'            font-size: 12px;' +
'        }' +
'        .status-pendente {' +
'            background: #ff9800;' +
'            color: white;' +
'            padding: 2px 8px;' +
'            border-radius: 3px;' +
'            font-size: 12px;' +
'        }' +
'        .confirmacao {' +
'            margin-top: 15px;' +
'            padding: 10px;' +
'            background: #e8f5e9;' +
'            border-radius: 3px;' +
'            color: #2e7d32;' +
'            font-size: 12px;' +
'        }' +
'        @page {' +
'            size: A4;' +
'            margin: 10mm;' +
'        }' +
'    </style>' +
'</head>' +
'<body>' +
'    <div class="header">' +
'        <h1>CARNÊ DE PAGAMENTO</h1>' +
'        <h2>' + doador.nome.toUpperCase() + '</h2>' +
'        <div style="margin-top: 10px; font-size: 14px;">' +
'            <strong>Código:</strong> ' + (doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')) +
            (doador.cpf ? ' | <strong>CPF:</strong> ' + formatCPFDisplay(doador.cpf) : '') +
'        </div>' +
'    </div>';
        
        // Gerar parcelas
        const valorParcela = doacao.valor;
        const totalParcelas = doacao.parcelas_totais || (doacao.recorrente ? 12 : 1);
        let htmlParcelas = '';
        
        for (let i = 1; i <= totalParcelas; i++) {
            const dataVencimento = calcularVencimento(doacao.data_doacao, i - 1, doacao.recorrente);
            const pagamento = buscarPagamentoHistorico(historico, dataVencimento);
            const isPago = !!pagamento;
            
            htmlParcelas += '' +
'    <div class="parcela-wrapper">' +
'        <div class="parcela-container">' +
'            <!-- Canhoto Controle -->' +
'            <div class="canhoto">' +
'                <div class="titulo">CANHOTO - CONTROLE</div>' +
'                <div class="campo">' +
'                    <strong>Cód. Contribuinte:</strong>' +
'                    <span style="color: #0066cc; font-weight: bold;">' +
                        (doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')) +
'                    </span>' +
'                </div>' +
'                <div class="campo">' +
'                    <strong>Valor Parcela:</strong>' +
'                    <span class="valor">R$ ' + valorParcela.toFixed(2).replace('.', ',') + '</span>' +
'                </div>' +
'                <div class="campo">' +
'                    <strong>Vencimento:</strong> ' + formatDate(dataVencimento) +
'                </div>' +
'                <div class="campo">' +
'                    <strong>Status:</strong>' +
'                    <span class="' + (isPago ? 'status-pago' : 'status-pendente') + '">' +
                        (isPago ? 'PAGO' : 'PENDENTE') +
'                    </span>' +
'                </div>' +
                (isPago ? 
'                <div class="campo">' +
'                    <strong>Data Pgto:</strong> ' + formatDate(pagamento.data_pagamento) +
'                </div>'
                : '') +
'            </div>' +
'            ' +
'            <!-- Recibo de Pagamento -->' +
'            <div class="recibo">' +
'                <div class="titulo">' +
'                    RECIBO DE PAGAMENTO' +
'                    <span style="float: right; font-size: 14px; font-weight: normal;">' +
'                        Parcela: ' + String(i).padStart(2, '0') + '/' + String(totalParcelas).padStart(2, '0') +
'                    </span>' +
'                </div>' +
'                <div class="campo">' +
'                    <strong>Recebemos de:</strong> ' + doador.nome.toUpperCase() +
'                </div>' +
'                <div class="campo">' +
'                    <strong>A importância de:</strong>' +
'                    <span class="valor">R$ ' + valorParcela.toFixed(2).replace('.', ',') + '</span>' +
'                </div>' +
'                <div class="campo">' +
'                    <strong>Data Pagamento:</strong>' +
                    (isPago ? formatDate(pagamento.data_pagamento) : '___/___/_____') +
'                </div>' +
'                <div class="campo">' +
'                    <strong>Vencimento:</strong> ' + formatDate(dataVencimento) +
'                </div>' +
'                <div class="campo" style="font-size: 12px; color: #666;">' +
'                    <strong>Endereço:</strong>' +
                    montarEndereco(doador) +
'                </div>' +
'                <div class="campo" style="font-size: 12px; color: #666;">' +
'                    <strong>Telefone:</strong> ' + doador.telefone1 +
                    (doador.telefone2 ? ' / ' + doador.telefone2 : '') +
'                </div>' +
                (isPago ? 
'                <div class="confirmacao">' +
'                    ✓ Pagamento confirmado em ' + formatDate(pagamento.data_pagamento) +
'                </div>'
                : '') +
'            </div>' +
'        </div>' +
'    </div>';
        }
        
        const finalHTML = carneHTML + htmlParcelas + '' +
'    <div class="no-print" style="text-align: center; margin: 30px;">' +
'        <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">' +
'            Imprimir Carnê' +
'        </button>' +
'    </div>' +
'</body>' +
'</html>';
        
        // Escrever HTML na nova janela
        printWindow?.document?.write(finalHTML);
        printWindow?.document?.close();
        
        alert('✅ Carnê gerado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao gerar carnê:', error);
        alert('❌ Erro ao gerar carnê: ' + error.message);
    }
}

// ===============================================================================
// FUNÇÃO DE EXPORTAÇÃO PDF - RESTAURADA v1.1.2
// ===============================================================================

/**
 * Exportar dados em PDF
 * Versão: 1.1.2 - Função completa restaurada
 */
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
        printWindow?.document?.write(finalHTML);
        printWindow?.document?.close();
        
        alert('✅ Relatório PDF gerado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao exportar dados:', error);
        alert('❌ Erro ao gerar relatório PDF: ' + error.message);
    }
}

// ===============================================================================
// FUNÇÕES AUXILIARES PARA CARNÊ E RELATÓRIOS - RESTAURADAS v1.1.2

// ===============================================================================
// GERAÇÃO DE CARNÊ PROFISSIONAL - Versão 1.1.5 FINAL
// Data: 05/09/2025
// ===============================================================================



function criarHTMLCarne(doacao, doador, historico) {
    const agora = new Date();
    const dataGeracao = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
    const numeroDocumento = `CRN-${doacao.id.toString().padStart(6, '0')}`;
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Carnê - ${doador.nome}</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
            background: #f8f9fa;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
        }
        .content {
            padding: 40px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .info-card {
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            border-left: 5px solid #3b82f6;
        }
        .info-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #374151;
        }
        .info-item {
            margin: 10px 0;
            font-size: 14px;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            min-width: 100px;
        }
        .valor-destaque {
            text-align: center;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }
        .valor-destaque .valor {
            font-size: 32px;
            font-weight: bold;
        }
        .qr-section {
            text-align: center;
            background: #f0f9ff;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border: 2px dashed #3b82f6;
        }
        .parcelas-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .parcelas-table th {
            background: #374151;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .parcelas-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e5e7eb;
        }
        .parcelas-table tr:nth-child(even) {
            background: #f9fafb;
        }
        .status-pago {
            background: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-pendente {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .btn-print {
            background: #3b82f6;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: block;
            margin: 30px auto;
        }
        @media print {
            .btn-print { display: none; }
            body { background: white; margin: 0; }
        }
        @media (max-width: 768px) {
            .info-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 CARNÊ DE DOAÇÃO</h1>
            <p>Sistema de Controle de Doações</p>
            <p>Documento: ${numeroDocumento} | ${dataGeracao}</p>
        </div>
        
        <div class="content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-title">👤 Dados do Doador</div>
                    <div class="info-item">
                        <span class="info-label">Nome:</span>
                        ${doador.nome}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Código:</span>
                        ${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}
                    </div>
                    ${doador.cpf ? `<div class="info-item">
                        <span class="info-label">CPF:</span>
                        ${formatarCPF(doador.cpf)}
                    </div>` : ''}
                    <div class="info-item">
                        <span class="info-label">Telefone:</span>
                        ${doador.telefone1}${doador.telefone2 ? ' / ' + doador.telefone2 : ''}
                    </div>
                </div>
                
                <div class="info-card">
                    <div class="info-title">💰 Dados da Doação</div>
                    <div class="info-item">
                        <span class="info-label">Tipo:</span>
                        ${doacao.tipo}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data:</span>
                        ${formatarData(doacao.data_doacao)}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Recorrente:</span>
                        ${doacao.recorrente ? 'Sim' : 'Não'}
                    </div>
                </div>
            </div>
            
            <div class="valor-destaque">
                <div class="valor">R$ ${doacao.valor.toFixed(2).replace('.', ',')}</div>
                <div>Valor da Doação</div>
            </div>
            
            <div class="qr-section">
                <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
                <h3>QR Code PIX</h3>
                <p><strong>PIX:</strong> pix@organizacao.org.br</p>
                <p><strong>Valor:</strong> R$ ${doacao.valor.toFixed(2).replace('.', ',')}</p>
            </div>
            
            <h2 style="margin: 30px 0 20px 0;">📋 Parcelas de Pagamento</h2>
            
            <table class="parcelas-table">
                <thead>
                    <tr>
                        <th>Parcela</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Data Pagamento</th>
                    </tr>
                </thead>
                <tbody>
                    ${gerarParcelasHTML(doacao, historico)}
                </tbody>
            </table>
        </div>
        
        <button class="btn-print" onclick="window.print()">
            🖨️ Imprimir Carnê
        </button>
    </div>
    
    <script>
        function formatarCPF(cpf) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        
        function formatarData(data) {
            return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
        }
        
        function gerarParcelasHTML(doacao, historico) {
            const parcelas = doacao.parcelas_totais || (doacao.recorrente ? 12 : 1);
            let html = '';
            
            for (let i = 1; i <= parcelas; i++) {
                const dataVenc = calcularVencimento(doacao.data_doacao, i - 1);
                const pagamento = buscarPagamento(historico, dataVenc);
                const pago = !!pagamento;
                
                html += \`
                    <tr>
                        <td><strong>\${i.toString().padStart(2, '0')}/\${parcelas.toString().padStart(2, '0')}</strong></td>
                        <td>\${formatarData(dataVenc)}</td>
                        <td style="font-weight: bold; color: #059669;">R$ \${doacao.valor.toFixed(2).replace('.', ',')}</td>
                        <td>
                            <span class="\${pago ? 'status-pago' : 'status-pendente'}">
                                \${pago ? '✅ PAGO' : '⏳ PENDENTE'}
                            </span>
                        </td>
                        <td>\${pago ? formatarData(pagamento.data_pagamento) : '-'}</td>
                    </tr>
                \`;
            }
            
            return html;
        }
        
        function calcularVencimento(dataInicial, meses) {
            const data = new Date(dataInicial + 'T00:00:00');
            if (meses > 0) {
                data.setMonth(data.getMonth() + meses);
            }
            return data.toISOString().substring(0, 10);
        }
        
        function buscarPagamento(historico, dataVenc) {
            if (!historico || !Array.isArray(historico)) return null;
            
            const vencimento = new Date(dataVenc);
            for (let pgto of historico) {
                const dataPgto = new Date(pgto.data_pagamento);
                const diff = Math.abs((dataPgto - vencimento) / (1000 * 60 * 60 * 24));
                if (diff <= 7) return pgto;
            }
            return null;
        }
    </script>
</body>
</html>`;
}




// ===============================================================================
// EXPORTAÇÃO DE DADOS PROFISSIONAL - Versão 1.1.5
// Data: 05/09/2025
// ===============================================================================



function mostrarModalExportacao() {
    // Remover modal existente
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
                max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">
                        📊 Exportar Dados
                    </h2>
                    <button onclick="fecharModalExportacao()" style="
                        background: none; border: none; font-size: 32px; cursor: pointer;
                        color: #666; border-radius: 8px; padding: 8px;
                    ">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">
                    <button onclick="exportarPDF()" style="
                        padding: 20px 15px; border: 2px solid #dc2626; background: #fef2f2;
                        color: #dc2626; border-radius: 12px; cursor: pointer;
                        font-size: 14px; font-weight: bold; text-align: center;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fef2f2'">
                        <div style="font-size: 24px; margin-bottom: 8px;">📄</div>
                        <div>Relatório PDF</div>
                    </button>
                    
                    <button onclick="exportarCSV()" style="
                        padding: 20px 15px; border: 2px solid #059669; background: #f0fdf4;
                        color: #059669; border-radius: 12px; cursor: pointer;
                        font-size: 14px; font-weight: bold; text-align: center;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">
                        <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                        <div>Planilha CSV</div>
                    </button>
                    
                    <button onclick="exportarJSON()" style="
                        padding: 20px 15px; border: 2px solid #2563eb; background: #eff6ff;
                        color: #2563eb; border-radius: 12px; cursor: pointer;
                        font-size: 14px; font-weight: bold; text-align: center;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
                        <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
                        <div>Dados JSON</div>
                    </button>
                </div>
                
                <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <h4 style="margin: 0 0 15px 0;">📈 Estatísticas</h4>
                    <div id="export-stats">Carregando...</div>
                </div>
                
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="fecharModalExportacao()" style="
                        padding: 12px 25px; border: 2px solid #d1d5db; background: white;
                        color: #374151; border-radius: 8px; cursor: pointer; font-weight: bold;
                    ">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    carregarEstatisticas();
}

async function carregarEstatisticas() {
    try {
        const [resumoResponse, doacoesResponse] = await Promise.all([
            fetch('/api/relatorios/resumo'),
            fetch('/api/doacoes')
        ]);
        
        const resumo = await resumoResponse.json();
        const doacoes = await doacoesResponse.json();
        
        document.getElementById('export-stats').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <div style="font-size: 24px; font-weight: bold;">R$ ${(resumo.total_arrecadado || 0).toFixed(2).replace('.', ',')}</div>
                    <div>Total Arrecadado</div>
                </div>
                <div>
                    <div style="font-size: 24px; font-weight: bold;">${resumo.total_doacoes || 0}</div>
                    <div>Doações</div>
                </div>
            </div>
            <div style="margin-top: 10px; font-size: 13px; opacity: 0.8;">
                ${doacoes.length || 0} registros disponíveis
            </div>
        `;
    } catch (error) {
        document.getElementById('export-stats').innerHTML = 'Erro ao carregar';
    }
}

function fecharModalExportacao() {
    const modal = document.getElementById('export-modal');
    if (modal) modal.remove();
}

async function exportarPDF() {
    try {
        showNotification('Gerando PDF...', 'info');
        
        const [resumoResponse, doacoesResponse] = await Promise.all([
            fetch('/api/relatorios/resumo'),
            fetch('/api/doacoes')
        ]);
        
        const resumo = await resumoResponse.json();
        const doacoes = await doacoesResponse.json();
        
        const printWindow = window.open('', '_blank');
        
        // Verificação robusta da janela
        if (!printWindow) {
            throw new Error('Popup bloqueado! Permita popups para este site.');
        }
        
        // Aguardar um pouco para garantir que a janela está pronta
        setTimeout(() => {
            try {
                if (printWindow && !printWindow.closed && printWindow.document) {
                    printWindow?.document?.write(criarRelatorioPDF(resumo, doacoes));
                    printWindow?.document?.close();
                    printWindow?.focus?.();
                    
                    fecharModalExportacao();
                    showNotification('PDF gerado com sucesso!', 'success');
                } else {
                    throw new Error('Janela de impressão foi fechada ou não pôde ser acessada');
                }
            } catch (windowError) {
                console.error('Erro ao manipular janela de impressão:', windowError);
                showNotification('Erro: ' + windowError.message, 'error');
                if (printWindow && !printWindow.closed) {
                    printWindow.close();
                }
            }
        }, 100);
        
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        showNotification('Erro ao gerar PDF: ' + error.message, 'error');
    }
}

async function exportarCSV() {
    try {
        showNotification('Gerando CSV...', 'info');
        
        const response = await fetch('/api/doacoes');
        const doacoes = await response.json();
        
        const csvContent = criarCSV(doacoes);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `doacoes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        fecharModalExportacao();
        showNotification('CSV baixado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar CSV: ' + error.message, 'error');
    }
}

async function exportarJSON() {
    try {
        showNotification('Gerando JSON...', 'info');
        
        const [resumoResponse, doacoesResponse] = await Promise.all([
            fetch('/api/relatorios/resumo'),
            fetch('/api/doacoes')
        ]);
        
        const resumo = await resumoResponse.json();
        const doacoes = await doacoesResponse.json();
        
        const jsonContent = JSON.stringify({
            metadata: {
                exportado_em: new Date().toISOString(),
                total_registros: doacoes.length,
                sistema: 'Sistema de Doações v1.1.5'
            },
            resumo,
            doacoes
        }, null, 2);
        
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `doacoes_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        fecharModalExportacao();
        showNotification('JSON baixado com sucesso!', 'success');
        
    } catch (error) {
        showNotification('Erro ao gerar JSON: ' + error.message, 'error');
    }
}

function criarRelatorioPDF(resumo, doacoes) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Doações</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #6b7280; font-size: 14px; }
        .summary-card .value { font-size: 28px; font-weight: bold; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #374151; color: white; padding: 15px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .btn-print { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; display: block; margin: 30px auto; }
        @media print { .btn-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 RELATÓRIO DE DOAÇÕES</h1>
        <p>Sistema de Controle de Doações v1.1.5</p>
        <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
    </div>
    
    <div class="summary-grid">
        <div class="summary-card">
            <h3>💰 Total Arrecadado</h3>
            <div class="value">R$ ${(resumo.total_arrecadado || 0).toFixed(2).replace('.', ',')}</div>
        </div>
        <div class="summary-card">
            <h3>📊 Total de Doações</h3>
            <div class="value">${resumo.total_doacoes || 0}</div>
        </div>
        <div class="summary-card">
            <h3>🔄 Doações Recorrentes</h3>
            <div class="value">${resumo.doacoes_recorrentes || 0}</div>
        </div>
    </div>
    
    <h2>📋 Detalhamento das Doações</h2>
    
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
                    <td style="font-weight: bold; color: #059669;">R$ ${d.valor.toFixed(2).replace('.', ',')}</td>
                    <td>${d.tipo}</td>
                    <td>${new Date(d.data_doacao + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>${d.recorrente ? 'Sim' : 'Não'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    ` : '<p style="text-align: center; padding: 40px;">Nenhuma doação encontrada.</p>'}
    
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir PDF</button>
</body>
</html>`;
}

function criarCSV(doacoes) {
    const headers = ['Código', 'Doador', 'Valor', 'Tipo', 'Data', 'Recorrente', 'Telefone', 'Observações'];
    const rows = [headers.join(',')];
    
    doacoes.forEach(d => {
        const row = [
            `"${d.codigo_doador || 'D' + String(d.doador_id).padStart(3, '0')}"`,
            `"${d.nome_doador || ''}"`,
            `"${d.valor.toFixed(2).replace('.', ',')}"`,
            `"${d.tipo}"`,
            `"${new Date(d.data_doacao + 'T00:00:00').toLocaleDateString('pt-BR')}"`,
            `"${d.recorrente ? 'Sim' : 'Não'}"`,
            `"${d.telefone1 || ''}"`,
            `"${(d.observacoes || '').replace(/"/g, '""')}"`
        ];
        rows.push(row.join(','));
    });
    
    return '\uFEFF' + rows.join('\n');
}




// ===============================================================================
// GERAÇÃO DE CARNÊ PROFISSIONAL - Versão 1.1.5 FINAL
// Data: 05/09/2025
// ===============================================================================

async function generateCarne(doacaoId) {
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

// ===============================================================================

/**
 * Calcular data de vencimento para parcelas
 * Versão: 1.1.2
 */
function calcularVencimento(dataInicial, mesesAdicionais, recorrente) {
    const data = new Date(dataInicial);
    if (recorrente) {
        data.setMonth(data.getMonth() + mesesAdicionais);
    }
    return data.toISOString().substring(0, 10);
}

/**
 * Buscar pagamento no histórico por data próxima
 * Versão: 1.1.2
 */
function buscarPagamentoHistorico(historico, dataVencimento) {
    const vencimento = new Date(dataVencimento);
    
    for (let i = 0; i < historico.length; i++) {
        const pgto = historico[i];
        const dataPgto = new Date(pgto.data_pagamento);
        const diff = Math.abs((dataPgto - vencimento) / (1000 * 60 * 60 * 24));
        if (diff <= 5) { // Tolerância de 5 dias
            return pgto;
        }
    }
    return null;
}

/**
 * Montar endereço completo do doador
 * Versão: 1.1.2
 */
function montarEndereco(doador) {
    const parts = [];
    if (doador.logradouro) parts.push(doador.logradouro);
    if (doador.numero) parts.push(doador.numero);
    if (doador.complemento) parts.push(doador.complemento);
    if (doador.bairro) parts.push(doador.bairro);
    if (doador.cidade) parts.push(doador.cidade);
    if (doador.estado) parts.push(doador.estado);
    if (doador.cep) parts.push('CEP: ' + doador.cep);
    
    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
}

/**
 * Formatar CPF para exibição
 * Versão: 1.1.2
 */
function formatCPFDisplay(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

console.log('✅ Funções de Edição e Carnê restauradas - v1.1.2');


// ============================================================================
// FUNÇÃO DE FALLBACK PARA EXPORTAÇÃO PDF
// Versão: 1.1.5 - Fallback seguro
// ============================================================================

async function exportarPDFSeguro() {
    try {
        showNotification('Preparando PDF alternativo...', 'info');
        
        const [resumoResponse, doacoesResponse] = await Promise.all([
            fetch('/api/relatorios/resumo'),
            fetch('/api/doacoes')
        ]);
        
        const resumo = await resumoResponse.json();
        const doacoes = await doacoesResponse.json();
        
        // Criar elemento temporário para gerar o HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = criarRelatorioPDF(resumo, doacoes);
        
        // Tentar abrir em nova aba com blob
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Relatório de Doações</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    ${tempDiv.innerHTML}
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_doacoes_${new Date().toISOString().split('T')[0]}.html`;
        link.target = '_blank';
        link.click();
        
        // Limpar URL após 5 segundos
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        
        fecharModalExportacao();
        showNotification('Relatório HTML gerado! Abra o arquivo e use Ctrl+P para imprimir', 'success');
        
    } catch (error) {
        console.error('Erro no fallback:', error);
        showNotification('Erro ao gerar relatório: ' + error.message, 'error');
    }
}

// ===============================================================================
// EVENT LISTENERS PARA MODAL NOVA DOAÇÃO - V1.1.5
// Configuração completa e robusta dos botões
// ===============================================================================

// Aguardar DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔌 Configurando event listeners do modal Nova Doação...');
    
    // Configurar botão Nova Doação
    setupNovaDoacao();
    
    // Configurar botões do modal (com retry)
    setupModalButtons();
    
    // Tentar novamente após 500ms se não encontrar elementos
    setTimeout(setupModalButtons, 500);
    
    // Configurar teclas globais
    setupGlobalKeys();
});

/**
 * Configura botão Nova Doação
 * Versão: 1.1.5
 */
function setupNovaDoacao() {
    const selectors = [
        '#btn-nova-doacao',
        'button[onclick*="openModal"]',
        'button:contains("Nova Doação")',
        '.btn-primary:contains("Nova")'
    ];
    
    let btnFound = false;
    
    selectors.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn && !btnFound) {
            // Limpar onclick existente
            btn.removeAttribute('onclick');
            
            // Adicionar event listener
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ Clique em Nova Doação detectado');
                
                if (typeof openModal === 'function') {
                    openModal();
                } else {
                    console.error('❌ Função openModal não encontrada');
                    alert('❌ Erro: Função openModal não encontrada');
                }
            });
            
            console.log('✅ Event listener Nova Doação configurado:', selector);
            btnFound = true;
        }
    });
    
    if (!btnFound) {
        console.log('⚠️ Botão Nova Doação não encontrado');
    }
}

/**
 * Configura botões específicos do modal
 * Versão: 1.1.5
 */
function setupModalButtons() {
    console.log('🔘 Configurando botões do modal...');
    
    // Configurar botão Salvar
    const saveSelectors = [
        '#btn-save-donation',
        'button[onclick*="addDonation"]',
        '#modal button:contains("Salvar")',
        '#modal .btn-primary'
    ];
    
    let saveFound = false;
    saveSelectors.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn && !saveFound) {
            // Limpar onclick existente
            btn.removeAttribute('onclick');
            
            // Adicionar event listener
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ Clique em Salvar detectado');
                
                if (typeof addDonation === 'function') {
                    addDonation();
                } else {
                    console.error('❌ Função addDonation não encontrada');
                    alert('❌ Erro: Função addDonation não encontrada');
                }
            });
            
            console.log('✅ Event listener Salvar configurado:', selector);
            saveFound = true;
        }
    });
    
    // Configurar botão Fechar/Cancelar
    const closeSelectors = [
        '#btn-close-modal',
        'button[onclick*="closeModal"]',
        '#modal button:contains("Fechar")',
        '#modal button:contains("Cancelar")',
        '#modal .btn-secondary'
    ];
    
    let closeFound = false;
    closeSelectors.forEach(selector => {
        const btn = document.querySelector(selector);
        if (btn && !closeFound) {
            // Limpar onclick existente
            btn.removeAttribute('onclick');
            
            // Adicionar event listener
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ Clique em Fechar detectado');
                
                if (typeof closeModal === 'function') {
                    closeModal();
                } else {
                    console.log('⚠️ Função closeModal não encontrada, fechando forçado');
                    const modal = document.getElementById('modal');
                    if (modal) modal.style.display = 'none';
                }
            });
            
            console.log('✅ Event listener Fechar configurado:', selector);
            closeFound = true;
        }
    });
    
    // Configurar fechar ao clicar fora
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('🖱️ Clique fora do modal detectado');
                if (typeof closeModal === 'function') {
                    closeModal();
                }
            }
        });
        console.log('✅ Event listener fechar ao clicar fora configurado');
    }
    
    // Configurar campos especiais
    setupSpecialFields();
}

/**
 * Configura teclas globais
 * Versão: 1.1.5
 */
function setupGlobalKeys() {
    document.addEventListener('keydown', function(e) {
        // ESC fecha modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal');
            if (modal && modal.style.display !== 'none' && modal.style.display !== '') {
                e.preventDefault();
                console.log('⌨️ Tecla ESC detectada');
                if (typeof closeModal === 'function') {
                    closeModal();
                }
            }
        }
        
        // Ctrl+N abre modal (atalho rápido)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            console.log('⌨️ Atalho Ctrl+N detectado');
            if (typeof openModal === 'function') {
                openModal();
            }
        }
    });
    
    console.log('✅ Teclas globais configuradas (ESC, Ctrl+N)');
}

/**
 * Configura campos especiais do modal
 * Versão: 1.1.5
 */
function setupSpecialFields() {
    // Campo CEP com formatação automática
    const cepField = document.getElementById('input-cep');
    if (cepField) {
        cepField.addEventListener('input', function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            
            // Formatação automática
            if (cep.length <= 8) {
                e.target.value = cep.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            // Busca automática quando completo
            if (cep.length === 8) {
                if (typeof buscarCEP === 'function') {
                    buscarCEP(cep, 'input');
                }
            }
        });
        console.log('✅ Campo CEP configurado');
    }
    
    // Checkbox de recorrência
    const recurringCheck = document.getElementById('input-recurrent');
    if (recurringCheck) {
        recurringCheck.addEventListener('change', function() {
            if (typeof toggleRecurringFields === 'function') {
                toggleRecurringFields();
            }
        });
        console.log('✅ Checkbox recorrência configurado');
    }
    
    // Formatação de CPF
    const cpfField = document.getElementById('input-cpf');
    if (cpfField) {
        cpfField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
        console.log('✅ Formatação CPF configurada');
    }
    
    // Formatação de telefones
    const phoneFields = ['input-phone1', 'input-phone2'];
    phoneFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });
            console.log('✅ Formatação telefone configurada:', id);
        }
    });
}

// ===============================================================================
// FUNÇÃO PARA FORÇAR RECONFIGURAÇÃO (CASO NECESSÁRIO)
// ===============================================================================

/**
 * Força reconfiguração dos event listeners
 * Pode ser chamada manualmente no console se necessário
 */
window.forceSetupModalListeners = function() {
    console.log('🔄 Forçando reconfiguração dos event listeners...');
    setupNovaDoacao();
    setupModalButtons();
    console.log('✅ Reconfiguração concluída');
};

console.log('✅ Event listeners do modal configurados - v1.1.5');

