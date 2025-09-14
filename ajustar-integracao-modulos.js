/**
 * ================================================================
 * SCRIPT: Ajustar Integração dos Módulos
 * ================================================================
 * 
 * VERSÃO: 2.0.1
 * DATA: 09/09/2025
 * FASE: 2 - MODULARIZAÇÃO
 * ETAPA: 2.3 - Ajustes de Integração
 * 
 * DESCRIÇÃO:
 * Adiciona as funções faltantes e corrige a integração entre módulos
 * para garantir 100% de funcionalidade.
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   AJUSTE DE INTEGRAÇÃO - SISTEMA v1.2.0           ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// ================================================================
// 1. ADICIONAR FUNÇÕES FALTANTES
// ================================================================

console.log('1️⃣  Adicionando funções faltantes aos módulos...\n');

// FILTERS.JS - Criar módulo de filtros que estava faltando
const filtersContent = `/**
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
`;

// RENDER.JS - Criar módulo de renderização
const renderContent = `/**
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
        
        return \`
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">\${donation.codigo_doador || '-'}</td>
                <td class="px-6 py-4 font-medium">\${donation.nome_doador || 'Não informado'}</td>
                <td class="px-6 py-4">\${window.utils.formatPhone(donation.telefone1)}</td>
                <td class="px-6 py-4">\${window.utils.formatCurrency(donation.valor)}</td>
                <td class="px-6 py-4">\${donation.tipo || 'Dinheiro'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full \${statusClass}">
                        \${statusText}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <button onclick="editDonation(\${donation.id})" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i data-feather="edit-2" class="h-4 w-4"></i>
                    </button>
                    <button onclick="deleteDonation(\${donation.id})" class="text-red-600 hover:text-red-900 mr-2">
                        <i data-feather="trash-2" class="h-4 w-4"></i>
                    </button>
                    \${donation.recorrente ? \`
                    <button onclick="showHistory(\${donation.id})" class="text-green-600 hover:text-green-900">
                        <i data-feather="clock" class="h-4 w-4"></i>
                    </button>
                    \` : ''}
                </td>
            </tr>
        \`;
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
    
    container.innerHTML = history.map(payment => \`
        <div class="border-b pb-2 mb-2">
            <div class="flex justify-between">
                <span>\${window.utils.formatDate(payment.data_pagamento)}</span>
                <span class="font-medium">\${window.utils.formatCurrency(payment.valor)}</span>
            </div>
            <div class="text-sm text-gray-600">
                Status: \${payment.status || 'Pago'}
            </div>
        </div>
    \`).join('');
}

// Exportar funções
window.renderFunctions = {
    renderDonations,
    updateDonationCount,
    renderHistory
};
`;

// DONATIONS.JS - Criar módulo de doações completo
const donationsContent = `/**
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
        const response = await fetch(\`/api/doacoes/\${donationId}/historico\`);
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
`;

// ================================================================
// 2. SALVAR NOVOS MÓDULOS
// ================================================================

console.log('2️⃣  Salvando novos módulos...\n');

const JS_DIR = path.join(__dirname, 'public', 'js');

const newModules = [
    { name: 'filters.js', content: filtersContent },
    { name: 'render.js', content: renderContent },
    { name: 'donations.js', content: donationsContent }
];

newModules.forEach(module => {
    const modulePath = path.join(JS_DIR, module.name);
    fs.writeFileSync(modulePath, module.content, 'utf8');
    console.log(`✅ Criado: js/${module.name}`);
});

// ================================================================
// 3. ATUALIZAR INDEX.HTML
// ================================================================

console.log('\n3️⃣  Atualizando index.html com novos módulos...\n');

const indexPath = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Procurar pelos scripts existentes
    const existingScripts = '<script src="js/init.js"></script>';
    
    if (indexContent.includes(existingScripts)) {
        // Adicionar novos scripts antes do init.js
        const newScripts = `<script src="js/filters.js"></script>
    <script src="js/render.js"></script>
    <script src="js/donations.js"></script>
    <script src="js/init.js"></script>`;
        
        indexContent = indexContent.replace(existingScripts, newScripts);
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log('✅ index.html atualizado com novos módulos');
    }
}

// ================================================================
// 4. ATUALIZAR INIT.JS
// ================================================================

console.log('4️⃣  Atualizando init.js...\n');

const initPath = path.join(JS_DIR, 'init.js');
if (fs.existsSync(initPath)) {
    let initContent = fs.readFileSync(initPath, 'utf8');
    
    // Adicionar chamada para setupFilters se não existir
    if (!initContent.includes('window.filterFunctions')) {
        initContent = initContent.replace(
            '// Configurar filtros\n        setupFilters();',
            '// Configurar filtros\n        if (window.filterFunctions) {\n            window.filterFunctions.setupFilters();\n        }'
        );
    }
    
    // Adicionar compatibilidade global
    const globalCompat = `
// Garantir compatibilidade global
window.applyFilters = window.filterFunctions?.applyFilters;
window.renderDonations = window.renderFunctions?.renderDonations;
window.loadHistoryData = window.donationFunctions?.loadHistoryData;
`;
    
    if (!initContent.includes('window.applyFilters')) {
        initContent += globalCompat;
    }
    
    fs.writeFileSync(initPath, initContent, 'utf8');
    console.log('✅ init.js atualizado');
}

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 RELATÓRIO DE AJUSTES:');
console.log('═'.repeat(56));
console.log('\n✅ NOVOS MÓDULOS CRIADOS:');
newModules.forEach(module => {
    const size = fs.statSync(path.join(JS_DIR, module.name)).size;
    console.log(`   ${module.name}: ${(size / 1024).toFixed(2)} KB`);
});

console.log('\n📁 ESTRUTURA FINAL:');
console.log('   public/js/');
console.log('   ├── config.js     (variáveis globais)');
console.log('   ├── utils.js      (funções auxiliares)');
console.log('   ├── api.js        (chamadas à API)');
console.log('   ├── modals.js     (gerenciamento de modais)');
console.log('   ├── filters.js    (sistema de filtros)');
console.log('   ├── render.js     (renderização de dados)');
console.log('   ├── donations.js  (gestão de doações)');
console.log('   └── init.js       (inicialização)');

console.log('\n⚠️  TESTE AGORA:');
console.log('═'.repeat(56));
console.log('1. Reinicie o servidor: npm start');
console.log('2. Teste todas as funcionalidades');
console.log('3. Verifique o console do navegador');

console.log('\n✅ AJUSTES CONCLUÍDOS!');
console.log('🎉 SISTEMA TOTALMENTE MODULARIZADO!');
console.log('═'.repeat(56));