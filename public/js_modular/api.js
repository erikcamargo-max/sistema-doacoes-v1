/**
 * ================================================================
 * MÓDULO: API e Comunicação com Backend
 * ================================================================
 * Arquivo: api.js
 * Descrição: Centraliza todas as chamadas à API
 * Versão: 1.0.0 - Modularizado em 09/09/2025
 * ================================================================
 */

// Função genérica para chamadas à API
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${window.appConfig.API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}


// Carregar doações
async function loadDonations() {
    console.log('📋 Carregando doações...');
    try {
        const response = await fetch('/api/doacoes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const donations = await response.json();
        console.log(`✅ ${donations.length} doações carregadas`);
        
        window.appState.allDonations = donations;
        
        // Renderizar doações
        if (window.renderFunctions && window.renderFunctions.renderDonations) {
            window.renderFunctions.renderDonations(donations);
        } else if (typeof renderDonations === 'function') {
            renderDonations(donations);
        }
        
        // Atualizar cards do dashboard
        updateDashboardCards(donations);
        
        return donations;
    } catch (error) {
        console.error('❌ Erro ao carregar doações:', error);
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Erro ao carregar doações', 'error');
        }
        return [];
    }
}

// Atualizar cards do dashboard
function updateDashboardCards(donations) {
    // Total de doações
    const totalElement = document.getElementById('total-donations');
    if (totalElement) {
        totalElement.textContent = donations.length;
    }
    
    // Total arrecadado
    const totalValue = donations.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    const totalValueElement = document.getElementById('total-value');
    if (totalValueElement) {
        totalValueElement.textContent = window.utils ? 
            window.utils.formatCurrency(totalValue) : 
            'R$ ' + totalValue.toFixed(2);
    }
    
    // Doações recorrentes
    const recurrentCount = donations.filter(d => d.recorrente === 1).length;
    const recurrentElement = document.getElementById('recurrent-count');
    if (recurrentElement) {
        recurrentElement.textContent = recurrentCount;
    }
    
    // Doadores únicos
    const uniqueDonors = new Set(donations.map(d => d.doador_id)).size;
    const donorsElement = document.getElementById('unique-donors');
    if (donorsElement) {
        donorsElement.textContent = uniqueDonors;
    }
}

// Tornar global
window.loadDonations = loadDonations;

async function loadDonations() {
    try {
        const donations = await apiCall('/doacoes');
        window.appState.allDonations = donations;
        if (typeof renderDonations === 'function') {
            renderDonations(donations);
        }
        return donations;
    } catch (error) {
        console.error('Erro ao carregar doações:', error);
        showNotification('Erro ao carregar doações', 'error');
    }
}

// Buscar CEP
async function buscarCEP(cep) {
    const cleanCEP = cep.replace(/D/g, '');
    if (cleanCEP.length !== 8) {
        return null;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            return {
                logradouro: data.logradouro,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf
            };
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
    }
    return null;
}

// Adicionar doação
async function addDonation(donationData) {
    try {
        const response = await apiCall('/doacoes', {
            method: 'POST',
            body: JSON.stringify(donationData)
        });
        
        await loadDonations();
        showNotification('Doação adicionada com sucesso!', 'success');
        return response;
    } catch (error) {
        console.error('Erro ao adicionar doação:', error);
        showNotification('Erro ao adicionar doação', 'error');
    }
}

// Atualizar doação
async function updateDonation(id, donationData) {
    try {
        const response = await apiCall(`/doacoes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(donationData)
        });
        
        await loadDonations();
        showNotification('Doação atualizada com sucesso!', 'success');
        return response;
    } catch (error) {
        console.error('Erro ao atualizar doação:', error);
        showNotification('Erro ao atualizar doação', 'error');
    }
}

// Deletar doação
async function deleteDonation(id) {
    if (!confirm('Confirma a exclusão desta doação?')) {
        return;
    }
    
    try {
        await apiCall(`/doacoes/${id}`, {
            method: 'DELETE'
        });
        
        await loadDonations();
        showNotification('Doação excluída com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir doação:', error);
        showNotification('Erro ao excluir doação', 'error');
    }
}
