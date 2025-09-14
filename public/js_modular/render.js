/**
 * ================================================================
 * MÓDULO: Renderização de Dados
 * ================================================================
 * Arquivo: render.js
 * Descrição: Renderiza dados na interface
 * Versão: 1.0.0 - Criado em 09/09/2025
 * ================================================================
 */

// Renderizar doações na tabela
function renderDonations(donations) {
    const tbody = document.getElementById('donations-tbody');
    if (!tbody) return;
    
    if (!donations || donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Nenhuma doação encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = donations.map(donation => {
        const statusClass = donation.recorrente ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
        const statusText = donation.recorrente ? 'Recorrente' : 'Única';
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">${donation.codigo_doador || '-'}</td>
                <td class="px-6 py-4 font-medium">${donation.nome_doador || 'Não informado'}</td>
                <td class="px-6 py-4">${window.utils.formatPhone(donation.telefone1)}</td>
                <td class="px-6 py-4">${window.utils.formatCurrency(donation.valor)}</td>
                <td class="px-6 py-4">${donation.tipo || 'Dinheiro'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="editDonation(${donation.id})" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i data-feather="edit-2" class="h-4 w-4"></i>
                    </button>
                    <button onclick="deleteDonation(${donation.id})" class="text-red-600 hover:text-red-900 mr-2">
                        <i data-feather="trash-2" class="h-4 w-4"></i>
                    </button>
                    ${donation.recorrente ? `
                    <button onclick="showHistory(${donation.id})" class="text-green-600 hover:text-green-900">
                        <i data-feather="clock" class="h-4 w-4"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
    
    // Reinicializar ícones Feather
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Atualizar contador
    updateDonationCount(donations.length);
}

// Atualizar contador de doações
function updateDonationCount(count) {
    const countElement = document.getElementById('donation-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Renderizar histórico
function renderHistory(history) {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    if (!history || history.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Nenhum pagamento registrado</p>';
        return;
    }
    
    container.innerHTML = history.map(payment => `
        <div class="border-b pb-2 mb-2">
            <div class="flex justify-between">
                <span>${window.utils.formatDate(payment.data_pagamento)}</span>
                <span class="font-medium">${window.utils.formatCurrency(payment.valor)}</span>
            </div>
            <div class="text-sm text-gray-600">
                Status: ${payment.status || 'Pago'}
            </div>
        </div>
    `).join('');
}

// Exportar funções
window.renderFunctions = {
    renderDonations,
    updateDonationCount,
    renderHistory
};


// Função de renderização de emergência (fallback)
if (!window.renderDonations) {
    window.renderDonations = function(donations) {
        console.log('🎨 Renderizando doações (fallback)...');
        const tbody = document.getElementById('donations-tbody');
        if (!tbody) {
            console.error('❌ Elemento donations-tbody não encontrado');
            return;
        }
        
        if (!donations || donations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Nenhuma doação encontrada</td></tr>';
            return;
        }
        
        tbody.innerHTML = donations.map(d => `
            <tr class="hover:bg-gray-50 border-b">
                <td class="px-6 py-4 text-sm">${d.codigo_doador || '-'}</td>
                <td class="px-6 py-4 font-medium">${d.nome_doador || 'Não informado'}</td>
                <td class="px-6 py-4 text-sm">${d.telefone1 || '-'}</td>
                <td class="px-6 py-4">R$ ${parseFloat(d.valor || 0).toFixed(2)}</td>
                <td class="px-6 py-4">${d.tipo || 'Dinheiro'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${d.recorrente ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                        ${d.recorrente ? 'Recorrente' : 'Única'}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="if(window.modalFunctions) window.modalFunctions.openModal('donation-modal', ${d.id})" 
                            class="text-blue-600 hover:text-blue-900 mr-2" title="Editar">
                        ✏️
                    </button>
                    <button onclick="if(confirm('Confirma exclusão?')) deleteDonation(${d.id})" 
                            class="text-red-600 hover:text-red-900" title="Excluir">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
        
        console.log(`✅ ${donations.length} doações renderizadas`);
    };
}