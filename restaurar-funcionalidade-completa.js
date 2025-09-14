/**
 * ================================================================
 * SCRIPT: Restaurar Funcionalidade Completa
 * ================================================================
 * 
 * VERSÃO: 2.0.3
 * DATA: 09/09/2025
 * FASE: 2 - MODULARIZAÇÃO
 * ETAPA: 2.5 - Restauração Completa
 * 
 * DESCRIÇÃO:
 * Restaura TODAS as funcionalidades do sistema com base no backup
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   RESTAURAÇÃO COMPLETA - SISTEMA v1.2.0           ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// Procurar pelo backup mais recente
const publicDir = path.join(__dirname, 'public');
const backupFiles = fs.readdirSync(publicDir).filter(f => f.startsWith('app.js.backup'));

if (backupFiles.length === 0) {
    console.error('❌ Nenhum backup encontrado! Não é possível restaurar.');
    process.exit(1);
}

// Usar o backup mais recente
const latestBackup = backupFiles.sort().pop();
const backupPath = path.join(publicDir, latestBackup);

console.log(`📦 Backup encontrado: ${latestBackup}`);
console.log(`📊 Tamanho: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB\n`);

// ================================================================
// 1. EXTRAIR FUNÇÕES ESSENCIAIS DO BACKUP
// ================================================================

console.log('1️⃣  Extraindo funções essenciais do backup...\n');

const backupContent = fs.readFileSync(backupPath, 'utf8');

// Função para extrair uma função específica do backup
function extractFunctionFromBackup(content, functionName) {
    // Tentar várias formas de declaração
    const patterns = [
        // function nome() {}
        new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*{`, 'g'),
        // const nome = function() {}
        new RegExp(`const\\s+${functionName}\\s*=\\s*(?:async\\s+)?function\\s*\\([^)]*\\)\\s*{`, 'g'),
        // const nome = async () => {}
        new RegExp(`const\\s+${functionName}\\s*=\\s*(?:async\\s+)?\\([^)]*\\)\\s*=>\\s*{`, 'g'),
        // window.nome = function() {}
        new RegExp(`window\\.${functionName}\\s*=\\s*(?:async\\s+)?function\\s*\\([^)]*\\)\\s*{`, 'g')
    ];
    
    for (const pattern of patterns) {
        const match = pattern.exec(content);
        if (match) {
            const startIndex = match.index;
            let braceCount = 0;
            let inString = false;
            let stringChar = null;
            
            for (let i = startIndex; i < content.length; i++) {
                const char = content[i];
                const prevChar = i > 0 ? content[i - 1] : '';
                
                if (!inString) {
                    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
                        inString = true;
                        stringChar = char;
                    } else if (char === '{') {
                        braceCount++;
                    } else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            return content.substring(startIndex, i + 1);
                        }
                    }
                } else {
                    if (char === stringChar && prevChar !== '\\') {
                        inString = false;
                    }
                }
            }
        }
    }
    return null;
}

// Lista de funções críticas que precisamos
const criticalFunctions = [
    'loadDonations',
    'renderDonations', 
    'saveDonation',
    'editDonation',
    'deleteDonation',
    'applyFilters',
    'showHistory',
    'generateCarne',
    'exportData',
    'buscarCEP',
    'formatCurrency',
    'formatDate',
    'formatPhone',
    'showNotification'
];

const extractedFunctions = {};

criticalFunctions.forEach(funcName => {
    const extracted = extractFunctionFromBackup(backupContent, funcName);
    if (extracted) {
        extractedFunctions[funcName] = extracted;
        console.log(`✅ Extraída: ${funcName}`);
    } else {
        console.log(`⚠️  Não encontrada: ${funcName}`);
    }
});

// ================================================================
// 2. CRIAR ARQUIVO FUNCTIONS.JS COMPLETO
// ================================================================

console.log('\n2️⃣  Criando arquivo functions.js com todas as funções...\n');

const functionsContent = `/**
 * ================================================================
 * MÓDULO: Funções Completas Restauradas
 * ================================================================
 * Arquivo: functions.js
 * Descrição: Todas as funções críticas restauradas do backup
 * Versão: 1.0.0 - Restaurado em 09/09/2025
 * ================================================================
 */

// Variáveis globais necessárias
if (!window.appState) {
    window.appState = {
        allDonations: [],
        currentEditingId: null,
        currentDonationId: null
    };
}

let allDonations = [];

// ========== FUNÇÕES PRINCIPAIS ==========

${extractedFunctions.loadDonations || `
// Função loadDonations restaurada
async function loadDonations() {
    console.log('📋 Carregando doações...');
    try {
        const response = await fetch('/api/doacoes');
        const data = await response.json();
        
        allDonations = data;
        window.appState.allDonations = data;
        
        console.log(\`✅ \${data.length} doações carregadas\`);
        
        // Renderizar
        if (typeof renderDonations === 'function') {
            renderDonations(data);
        }
        
        // Atualizar dashboard
        updateDashboard(data);
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao carregar doações:', error);
        return [];
    }
}
`}

${extractedFunctions.renderDonations || `
// Função renderDonations restaurada
function renderDonations(donations) {
    const tbody = document.getElementById('donations-tbody');
    if (!tbody) return;
    
    if (!donations || donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Nenhuma doação encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = donations.map(d => \`
        <tr class="hover:bg-gray-50 border-b">
            <td class="px-6 py-4">\${d.codigo_doador || '-'}</td>
            <td class="px-6 py-4 font-medium">\${d.nome_doador || 'Não informado'}</td>
            <td class="px-6 py-4">\${d.telefone1 || '-'}</td>
            <td class="px-6 py-4">\${formatCurrency(d.valor)}</td>
            <td class="px-6 py-4">\${d.tipo || 'Dinheiro'}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full \${d.recorrente ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                    \${d.recorrente ? 'Recorrente' : 'Única'}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="editDonation(\${d.id})" class="text-blue-600 hover:text-blue-900 mr-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button onclick="deleteDonation(\${d.id})" class="text-red-600 hover:text-red-900">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </td>
        </tr>
    \`).join('');
    
    console.log(\`✅ \${donations.length} doações renderizadas\`);
}
`}

// Função para atualizar dashboard
function updateDashboard(donations) {
    // Total de doações
    const totalEl = document.querySelector('.bg-white .text-2xl');
    if (totalEl) totalEl.textContent = donations.length;
    
    // Total arrecadado
    const total = donations.reduce((sum, d) => sum + (parseFloat(d.valor) || 0), 0);
    const totalValueEl = document.querySelectorAll('.bg-white .text-2xl')[1];
    if (totalValueEl) totalValueEl.textContent = formatCurrency(total);
    
    // Doações recorrentes
    const recurrent = donations.filter(d => d.recorrente === 1).length;
    const recurrentEl = document.querySelectorAll('.bg-white .text-2xl')[2];
    if (recurrentEl) recurrentEl.textContent = recurrent;
}

// Funções de formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3');
}

// Outras funções extraídas
${Object.entries(extractedFunctions)
    .filter(([name]) => !['loadDonations', 'renderDonations'].includes(name))
    .map(([name, func]) => func)
    .join('\n\n')}

// Tornar funções globais
window.loadDonations = loadDonations;
window.renderDonations = renderDonations;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatPhone = formatPhone;
window.allDonations = allDonations;

// Auto-executar ao carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadDonations, 100);
    });
} else {
    setTimeout(loadDonations, 100);
}

console.log('✅ Funções restauradas e prontas');
`;

const functionsPath = path.join(publicDir, 'js', 'functions.js');
fs.writeFileSync(functionsPath, functionsContent, 'utf8');
console.log('✅ Arquivo functions.js criado');

// ================================================================
// 3. ATUALIZAR HTML PARA INCLUIR FUNCTIONS.JS
// ================================================================

console.log('\n3️⃣  Atualizando HTML...\n');

const indexPath = path.join(publicDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Adicionar functions.js logo após init.js
if (!indexContent.includes('functions.js')) {
    indexContent = indexContent.replace(
        '<script src="js/init.js"></script>',
        '<script src="js/init.js"></script>\n    <script src="js/functions.js"></script>'
    );
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('✅ HTML atualizado com functions.js');
}

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 RESTAURAÇÃO COMPLETA:');
console.log('═'.repeat(56));
console.log(`✅ ${Object.keys(extractedFunctions).length} funções restauradas do backup`);
console.log('✅ Arquivo functions.js criado');
console.log('✅ HTML atualizado');

console.log('\n🔄 AÇÕES NECESSÁRIAS:');
console.log('═'.repeat(56));
console.log('1. Pare o servidor (Ctrl+C)');
console.log('2. Reinicie: npm start');
console.log('3. Force refresh no navegador (Ctrl+Shift+F5)');

console.log('\n💡 TESTE MANUAL:');
console.log('═'.repeat(56));
console.log('No console do navegador:');
console.log('   loadDonations()  // Deve carregar as doações');
console.log('   allDonations     // Deve mostrar o array');

console.log('\n✅ RESTAURAÇÃO CONCLUÍDA!');
console.log('═'.repeat(56));