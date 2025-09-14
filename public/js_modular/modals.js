/**
 * ================================================================
 * MÓDULO: Gerenciamento de Modais
 * ================================================================
 * Arquivo: modals.js
 * Descrição: Controla abertura, fechamento e interação com modais
 * Versão: 1.0.0 - Modularizado em 09/09/2025
 * ================================================================
 */

// Abrir modal
function openModal(modalId = 'donation-modal', editId = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    window.appState.currentEditingId = editId;
    
    if (editId) {
        loadDonationForEdit(editId);
    } else {
        resetModalForm();
    }
}

// Fechar modal
function fecharModal(modalId = 'donation-modal') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    
    window.appState.currentEditingId = null;
    resetModalForm();
}

// Resetar formulário do modal
function resetModalForm() {
    const form = document.querySelector('#donation-modal form');
    if (form) {
        form.reset();
    }
    
    // Limpar campos específicos
    const inputs = ['input-donor', 'input-phone1', 'input-amount', 'input-date'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
}

// Carregar doação para edição
async function loadDonationForEdit(id) {
    try {
        const response = await fetch(`/api/doacoes/${id}`);
        const donation = await response.json();
        
        // Preencher campos do modal
        if (donation) {
            document.getElementById('input-donor').value = donation.nome_doador || '';
            document.getElementById('input-phone1').value = donation.telefone1 || '';
            document.getElementById('input-amount').value = donation.valor || '';
            document.getElementById('input-type').value = donation.tipo || 'Dinheiro';
            document.getElementById('input-date').value = donation.data_doacao || '';
            document.getElementById('input-recurrent').checked = donation.recorrente === 1;
        }
    } catch (error) {
        console.error('Erro ao carregar doação:', error);
        showNotification('Erro ao carregar dados da doação', 'error');
    }
}

// Mostrar modal de histórico
function showHistory(donationId) {
    window.appState.currentDonationId = donationId;
    
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.style.display = 'flex';
        loadHistoryData(donationId);
    }
}

// Configurar event listeners dos modais
function setupModalListeners() {
    // Fechar ao clicar no X
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            fecharModal();
        });
    });
    
    // Fechar ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
            }
        });
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === 'flex') {
                    fecharModal(modal.id);
                }
            });
        }
    });
}

// Exportar funções para uso global
window.modalFunctions = {
    openModal,
    fecharModal,
    showHistory,
    setupModalListeners
};
