
// ================================================================
// ADICIONAR ESTE JAVASCRIPT NO SEU index.html ou app.js
// ================================================================

// Variáveis globais de doadores
let allDonors = [];
let editingDonorId = null;

// Configurar sistema de abas
function setupDonorTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remover active de todos
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Adicionar active ao clicado
            button.classList.add('active');
            document.getElementById('tab-' + targetTab).classList.add('active');
            
            // Substituir ícones
            feather.replace();
            
            // Carregar dados da aba
            if (targetTab === 'doadores') {
                loadDonors();
            }
        });
    });
}

// Carregar doadores
async function loadDonors() {
    try {
        const response = await fetch('/api/doadores');
        if (!response.ok) throw new Error('Erro ao carregar doadores');
        
        allDonors = await response.json();
        renderDonors(allDonors);
    } catch (error) {
        console.error('Erro ao carregar doadores:', error);
        showNotification('Erro ao carregar doadores', 'error');
    }
}

// Renderizar doadores na tabela
function renderDonors(donors) {
    const tbody = document.getElementById('doadores-tbody');
    const emptyState = document.getElementById('empty-doadores');
    
    if (!donors || donors.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = donors.map(donor => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">${donor.codigo_doador || 'N/A'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${donor.nome}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${formatCPF(donor.cpf) || 'N/A'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${formatPhone(donor.telefone1) || 'N/A'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${donor.email || 'N/A'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">R$ ${calculateDonorTotal(donor.id)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editDonor(${donor.id})" class="text-blue-600 hover:text-blue-900 mr-2">
                    <i data-feather="edit-2" class="h-4 w-4 inline"></i>
                </button>
                <button onclick="viewDonorHistory(${donor.id})" class="text-green-600 hover:text-green-900 mr-2">
                    <i data-feather="eye" class="h-4 w-4 inline"></i>
                </button>
                <button onclick="deleteDonor(${donor.id})" class="text-red-600 hover:text-red-900">
                    <i data-feather="trash-2" class="h-4 w-4 inline"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    feather.replace();
}

// Calcular total doado por doador
function calculateDonorTotal(donorId) {
    if (typeof allDonations === 'undefined') return '0,00';
    const total = allDonations
        .filter(d => d.doador_id === donorId)
        .reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    return total.toFixed(2).replace('.', ',');
}

// Formatar CPF
function formatCPF(cpf) {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar telefone
function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

// Deletar doador
async function deleteDonor(id) {
    if (!confirm('Tem certeza que deseja excluir este doador?')) return;
    
    try {
        const response = await fetch(`/api/doadores/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao excluir doador');
        }
        
        showNotification(result.message || 'Doador excluído com sucesso!', 'success');
        loadDonors();
        
    } catch (error) {
        console.error('Erro ao excluir doador:', error);
        showNotification(error.message || 'Erro ao excluir doador', 'error');
    }
}

// Inicializar sistema de doadores
document.addEventListener('DOMContentLoaded', function() {
    setupDonorTabs();
});
