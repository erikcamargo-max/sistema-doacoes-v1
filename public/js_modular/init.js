/**
 * ================================================================
 * MÓDULO: Inicialização do Sistema
 * ================================================================
 * Arquivo: init.js
 * Descrição: Inicializa o sistema e configura event listeners
 * Versão: 1.0.0 - Modularizado em 09/09/2025
 * ================================================================
 */

// Inicialização principal
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Sistema de Doações v1.2.0 - Inicializando...');
    console.log('📁 Módulos carregados com sucesso');
    
    try {
    console.log('🔍 Verificando funções disponíveis:');
    console.log('   loadDonations:', typeof window.loadDonations);
    console.log('   renderDonations:', typeof window.renderFunctions?.renderDonations);
    console.log('   appState:', window.appState);

        // Configurar event listeners
        setupEventListeners();
        
        // Configurar modais
        if (window.modalFunctions) {
            window.modalFunctions.setupModalListeners();
        }
        
        // Carregar dados iniciais
        await loadDonations();
        
        // Configurar filtros
        if (window.filterFunctions) {
            window.filterFunctions.setupFilters();
        }
        
        console.log('✅ Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
});

// Configurar event listeners principais
function setupEventListeners() {
    // Botão novo doador
    const btnNew = document.getElementById('btn-new-donation');
    if (btnNew) {
        btnNew.addEventListener('click', () => {
            if (window.modalFunctions) {
                window.modalFunctions.openModal('donation-modal');
            }
        });
    }
    
    // Botão salvar doação
    const btnSave = document.getElementById('btn-save-donation');
    if (btnSave) {
        btnSave.addEventListener('click', saveDonation);
    }
    
    // Busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', window.utils.debounce(() => {
            applyFilters();
        }, 300));
    }
    
    // Filtros
    const filterInputs = ['filter-type', 'filter-recurrent'];
    filterInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
        }
    });
    
    console.log('✅ Event listeners configurados');
}

// Tornar funções globais para compatibilidade
window.openModal = window.modalFunctions?.openModal;
window.fecharModal = window.modalFunctions?.fecharModal;
window.showHistory = window.modalFunctions?.showHistory;
window.showNotification = window.utils?.showNotification;
window.formatCurrency = window.utils?.formatCurrency;
window.formatDate = window.utils?.formatDate;

// Garantir compatibilidade global
window.applyFilters = window.filterFunctions?.applyFilters;
window.renderDonations = window.renderFunctions?.renderDonations;
window.loadHistoryData = window.donationFunctions?.loadHistoryData;
