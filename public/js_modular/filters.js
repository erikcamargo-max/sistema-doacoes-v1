/**
 * ================================================================
 * MÓDULO: Sistema de Filtros e Busca
 * ================================================================
 * Arquivo: filters.js
 * Descrição: Gerencia filtros e busca na aplicação
 * Versão: 1.0.0 - Criado em 09/09/2025
 * ================================================================
 */

// Aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('filter-type')?.value || 'all';
    const recurrentFilter = document.getElementById('filter-recurrent')?.value || 'all';
    
    let filtered = window.appState.allDonations || [];
    
    // Filtro de busca
    if (searchTerm) {
        filtered = filtered.filter(donation => {
            return (donation.nome_doador && donation.nome_doador.toLowerCase().includes(searchTerm)) ||
                   (donation.telefone1 && donation.telefone1.includes(searchTerm)) ||
                   (donation.codigo_doador && donation.codigo_doador.toLowerCase().includes(searchTerm));
        });
    }
    
    // Filtro de tipo
    if (typeFilter !== 'all') {
        filtered = filtered.filter(d => d.tipo === typeFilter);
    }
    
    // Filtro de recorrência
    if (recurrentFilter !== 'all') {
        const isRecurrent = recurrentFilter === 'true';
        filtered = filtered.filter(d => d.recorrente === (isRecurrent ? 1 : 0));
    }
    
    renderDonations(filtered);
}

// Configurar filtros
function setupFilters() {
    const filterElements = ['search-input', 'filter-type', 'filter-recurrent'];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
            if (id === 'search-input') {
                element.addEventListener('input', window.utils.debounce(applyFilters, 300));
            }
        }
    });
    
    console.log('✅ Filtros configurados');
}

// Limpar filtros
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-recurrent').value = 'all';
    applyFilters();
}

// Exportar funções
window.filterFunctions = {
    applyFilters,
    setupFilters,
    clearFilters
};
