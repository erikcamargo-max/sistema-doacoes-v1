/**
 * ================================================================
 * MÓDULO: Gestão de Doações
 * ================================================================
 * Arquivo: donations.js
 * Descrição: Funções específicas para gerenciar doações
 * Versão: 1.0.0 - Criado em 09/09/2025
 * ================================================================
 */

// Salvar doação
async function saveDonation() {
    const formData = {
        donor: document.getElementById('input-donor')?.value,
        phone1: document.getElementById('input-phone1')?.value,
        phone2: document.getElementById('input-phone2')?.value,
        cpf: document.getElementById('input-cpf')?.value,
        email: document.getElementById('input-email')?.value,
        amount: document.getElementById('input-amount')?.value,
        type: document.getElementById('input-type')?.value,
        date: document.getElementById('input-date')?.value,
        recurrent: document.getElementById('input-recurrent')?.checked,
        observations: document.getElementById('input-observations')?.value,
        cep: document.getElementById('input-cep')?.value,
        logradouro: document.getElementById('input-logradouro')?.value,
        numero: document.getElementById('input-numero')?.value,
        complemento: document.getElementById('input-complemento')?.value,
        bairro: document.getElementById('input-bairro')?.value,
        cidade: document.getElementById('input-cidade')?.value,
        estado: document.getElementById('input-estado')?.value
    };
    
    // Validações
    if (!formData.donor || !formData.amount) {
        window.utils.showNotification('Preencha os campos obrigatórios', 'error');
        return;
    }
    
    try {
        if (window.appState.currentEditingId) {
            await updateDonation(window.appState.currentEditingId, formData);
        } else {
            await addDonation(formData);
        }
        
        window.modalFunctions.fecharModal();
        await loadDonations();
    } catch (error) {
        console.error('Erro ao salvar doação:', error);
        window.utils.showNotification('Erro ao salvar doação', 'error');
    }
}

// Editar doação
function editDonation(id) {
    window.modalFunctions.openModal('donation-modal', id);
}

// Carregar histórico
async function loadHistoryData(donationId) {
    try {
        const response = await fetch(`/api/doacoes/${donationId}/historico`);
        const history = await response.json();
        window.renderFunctions.renderHistory(history);
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Exportar funções
window.donationFunctions = {
    saveDonation,
    editDonation,
    loadHistoryData
};

// Tornar globais para compatibilidade
window.saveDonation = saveDonation;
window.editDonation = editDonation;
window.deleteDonation = deleteDonation;
