/**
 * ================================================================
 * SCRIPT: Corrigir Carregamento de Doações
 * ================================================================
 * 
 * VERSÃO: 2.0.2
 * DATA: 09/09/2025
 * FASE: 2 - MODULARIZAÇÃO
 * ETAPA: 2.4 - Correção de Carregamento
 * 
 * DESCRIÇÃO:
 * Corrige o problema de carregamento das doações após modularização
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   CORREÇÃO DE CARREGAMENTO - SISTEMA v1.2.0       ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const JS_DIR = path.join(__dirname, 'public', 'js');

// ================================================================
// 1. CORRIGIR API.JS
// ================================================================

console.log('1️⃣  Corrigindo api.js...\n');

const apiPath = path.join(JS_DIR, 'api.js');
let apiContent = fs.readFileSync(apiPath, 'utf8');

// Corrigir a função loadDonations
const newLoadDonations = `
// Carregar doações
async function loadDonations() {
    console.log('📋 Carregando doações...');
    try {
        const response = await fetch('/api/doacoes');
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const donations = await response.json();
        console.log(\`✅ \${donations.length} doações carregadas\`);
        
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
window.loadDonations = loadDonations;`;

// Substituir a função loadDonations existente
apiContent = apiContent.replace(/\/\/ Carregar doações[\s\S]*?(?=\/\/ Buscar CEP|\/\/ Adicionar|$)/m, newLoadDonations + '\n');

fs.writeFileSync(apiPath, apiContent, 'utf8');
console.log('✅ api.js corrigido');

// ================================================================
// 2. CORRIGIR INIT.JS
// ================================================================

console.log('\n2️⃣  Corrigindo init.js...\n');

const initPath = path.join(JS_DIR, 'init.js');
let initContent = fs.readFileSync(initPath, 'utf8');

// Garantir que loadDonations seja chamado
if (!initContent.includes('await loadDonations()')) {
    initContent = initContent.replace(
        '// Carregar dados iniciais\n        await loadDonations();',
        `// Carregar dados iniciais
        if (window.loadDonations) {
            await window.loadDonations();
        } else if (typeof loadDonations === 'function') {
            await loadDonations();
        } else {
            console.error('❌ Função loadDonations não encontrada');
        }`
    );
}

// Adicionar log de debug
const debugInit = `
    console.log('🔍 Verificando funções disponíveis:');
    console.log('   loadDonations:', typeof window.loadDonations);
    console.log('   renderDonations:', typeof window.renderFunctions?.renderDonations);
    console.log('   appState:', window.appState);
`;

if (!initContent.includes('Verificando funções disponíveis')) {
    initContent = initContent.replace(
        'try {',
        'try {' + debugInit
    );
}

fs.writeFileSync(initPath, initContent, 'utf8');
console.log('✅ init.js corrigido');

// ================================================================
// 3. ADICIONAR FUNÇÃO RENDER SIMPLIFICADA
// ================================================================

console.log('\n3️⃣  Adicionando renderização de emergência...\n');

const renderPath = path.join(JS_DIR, 'render.js');
let renderContent = fs.readFileSync(renderPath, 'utf8');

// Adicionar função de fallback no final
const fallbackRender = `

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
        
        tbody.innerHTML = donations.map(d => \`
            <tr class="hover:bg-gray-50 border-b">
                <td class="px-6 py-4 text-sm">\${d.codigo_doador || '-'}</td>
                <td class="px-6 py-4 font-medium">\${d.nome_doador || 'Não informado'}</td>
                <td class="px-6 py-4 text-sm">\${d.telefone1 || '-'}</td>
                <td class="px-6 py-4">R$ \${parseFloat(d.valor || 0).toFixed(2)}</td>
                <td class="px-6 py-4">\${d.tipo || 'Dinheiro'}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full \${d.recorrente ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                        \${d.recorrente ? 'Recorrente' : 'Única'}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="if(window.modalFunctions) window.modalFunctions.openModal('donation-modal', \${d.id})" 
                            class="text-blue-600 hover:text-blue-900 mr-2" title="Editar">
                        ✏️
                    </button>
                    <button onclick="if(confirm('Confirma exclusão?')) deleteDonation(\${d.id})" 
                            class="text-red-600 hover:text-red-900" title="Excluir">
                        🗑️
                    </button>
                </td>
            </tr>
        \`).join('');
        
        console.log(\`✅ \${donations.length} doações renderizadas\`);
    };
}`;

if (!renderContent.includes('renderização de emergência')) {
    renderContent += fallbackRender;
}

fs.writeFileSync(renderPath, renderContent, 'utf8');
console.log('✅ render.js atualizado com fallback');

// ================================================================
// 4. VERIFICAR ORDEM DOS SCRIPTS NO HTML
// ================================================================

console.log('\n4️⃣  Verificando ordem dos scripts no HTML...\n');

const indexPath = path.join(__dirname, 'public', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Ordem correta dos scripts
const correctScriptOrder = `    <!-- Módulos do Sistema -->
    <script src="js/config.js"></script>
    <script src="js/utils.js"></script>
    <script src="js/api.js"></script>
    <script src="js/render.js"></script>
    <script src="js/modals.js"></script>
    <script src="js/filters.js"></script>
    <script src="js/donations.js"></script>
    <script src="js/init.js"></script>
    <script src="app.js"></script>`;

// Remover scripts existentes e adicionar na ordem correta
const scriptRegex = /<!-- Módulos do Sistema -->[\s\S]*?<script src="app\.js"><\/script>/;
if (scriptRegex.test(indexContent)) {
    indexContent = indexContent.replace(scriptRegex, correctScriptOrder);
} else {
    // Se não encontrar, adicionar antes do </body>
    indexContent = indexContent.replace('</body>', correctScriptOrder + '\n</body>');
}

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ Ordem dos scripts corrigida no HTML');

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 CORREÇÕES APLICADAS:');
console.log('═'.repeat(56));
console.log('✅ api.js - Função loadDonations corrigida');
console.log('✅ init.js - Chamada de loadDonations garantida');
console.log('✅ render.js - Função de fallback adicionada');
console.log('✅ index.html - Ordem dos scripts corrigida');

console.log('\n🧪 TESTE AGORA:');
console.log('═'.repeat(56));
console.log('1. Pare o servidor (Ctrl+C)');
console.log('2. Reinicie: npm start');
console.log('3. Limpe o cache do navegador (Ctrl+F5)');
console.log('4. Verifique se as doações aparecem');

console.log('\n💡 DEBUGGING:');
console.log('═'.repeat(56));
console.log('No console do navegador, digite:');
console.log('   loadDonations()  // Para forçar carregamento');
console.log('   window.appState  // Para ver o estado');

console.log('\n✅ CORREÇÃO CONCLUÍDA!');
console.log('═'.repeat(56));