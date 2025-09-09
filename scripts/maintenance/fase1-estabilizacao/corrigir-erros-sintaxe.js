/**
 * ================================================================
 * SCRIPT: Correção de Erros de Sintaxe
 * ================================================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 08/09/2025
 * FASE: 1 - ESTABILIZAÇÃO
 * ETAPA: 1.2b - Corrigir Erros Identificados
 * 
 * DESCRIÇÃO:
 * Corrige os problemas identificados no diagnóstico:
 * - Remove função duplicada
 * - Adiciona variáveis globais faltando
 * - Mapeia funções com nomes diferentes
 * - Remove console.logs de produção (opcional)
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║      CORREÇÃO DE ERROS - SISTEMA v1.1.5           ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// Caminhos
const APP_JS_PATH = path.join(__dirname, 'public', 'app.js');
const BACKUP_PATH = path.join(__dirname, 'public', `app.js.backup_${Date.now()}`);

// Verificar arquivo
if (!fs.existsSync(APP_JS_PATH)) {
    console.error('❌ Arquivo app.js não encontrado!');
    process.exit(1);
}

// Fazer backup
console.log('📦 Criando backup do app.js...');
fs.copyFileSync(APP_JS_PATH, BACKUP_PATH);
console.log(`✅ Backup salvo: ${BACKUP_PATH}\n`);

// Ler conteúdo
let content = fs.readFileSync(APP_JS_PATH, 'utf8');
const originalLines = content.split('\n').length;
let modifications = [];

console.log('🔧 Iniciando correções...\n');

// ================================================================
// 1. REMOVER FUNÇÃO DUPLICADA calcularVencimento
// ================================================================

console.log('1️⃣  Removendo função duplicada "calcularVencimento"...');

// Encontrar as duas ocorrências
const regex1 = /function calcularVencimento\([^)]*\)\s*{[^}]*}/g;
const matches = content.match(regex1);

if (matches && matches.length > 1) {
    // Manter apenas a primeira ocorrência (linha 2389)
    // Remover a segunda (linha 2893)
    const lines = content.split('\n');
    
    // Encontrar início da segunda função (aproximadamente linha 2893)
    let startLine = -1;
    let endLine = -1;
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = 2890; i < lines.length && i < 2950; i++) {
        const line = lines[i];
        
        if (line.includes('function calcularVencimento')) {
            startLine = i;
            inFunction = true;
            braceCount = 0;
        }
        
        if (inFunction) {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            
            if (braceCount === 0 && line.includes('}')) {
                endLine = i;
                break;
            }
        }
    }
    
    if (startLine > 0 && endLine > 0) {
        lines.splice(startLine, endLine - startLine + 1);
        content = lines.join('\n');
        modifications.push('Removida função duplicada calcularVencimento (segunda ocorrência)');
        console.log('✅ Função duplicada removida');
    } else {
        console.log('⚠️  Não foi possível localizar exatamente a função duplicada');
    }
} else {
    console.log('ℹ️  Função duplicada não encontrada (pode já ter sido corrigida)');
}

// ================================================================
// 2. ADICIONAR VARIÁVEIS GLOBAIS FALTANDO
// ================================================================

console.log('\n2️⃣  Adicionando variáveis globais faltando...');

// Verificar se já existe a seção de variáveis globais
const hasGlobalSection = content.includes('// Variáveis globais') || 
                        content.includes('// VARIÁVEIS GLOBAIS') ||
                        content.includes('// Global variables');

// Variáveis que precisam ser adicionadas
const missingVars = [
    'let allDonors = [];',
    'let currentEditingId = null;',
    'let currentDonationId = null;',
    'let duplicateCheckModal = null;'
];

// Verificar quais realmente estão faltando
const varsToAdd = [];
missingVars.forEach(varDecl => {
    const varName = varDecl.match(/let (\w+)/)[1];
    const regex = new RegExp(`(let|const|var)\\s+${varName}\\s*=`, 'g');
    if (!content.match(regex)) {
        varsToAdd.push(varDecl);
    }
});

if (varsToAdd.length > 0) {
    // Encontrar onde inserir (após allDonations se existir)
    const allDonationsMatch = content.match(/(let|const|var)\s+allDonations\s*=\s*\[\];?/);
    
    if (allDonationsMatch) {
        const insertPosition = allDonationsMatch.index + allDonationsMatch[0].length;
        const before = content.substring(0, insertPosition);
        const after = content.substring(insertPosition);
        
        content = before + '\n' + varsToAdd.join('\n') + after;
        modifications.push(`Adicionadas ${varsToAdd.length} variáveis globais`);
        console.log(`✅ Adicionadas ${varsToAdd.length} variáveis globais`);
    } else {
        // Adicionar no início após os comentários iniciais
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Pular comentários iniciais
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].trim().startsWith('//') && !lines[i].trim().startsWith('/*') && lines[i].trim() !== '') {
                insertIndex = i;
                break;
            }
        }
        
        lines.splice(insertIndex, 0, '\n// Variáveis globais adicionadas\nlet allDonations = [];');
        lines.splice(insertIndex + 2, 0, ...varsToAdd);
        content = lines.join('\n');
        modifications.push(`Adicionadas ${varsToAdd.length + 1} variáveis globais`);
        console.log(`✅ Adicionadas ${varsToAdd.length + 1} variáveis globais no início`);
    }
} else {
    console.log('ℹ️  Todas as variáveis globais já existem');
}

// ================================================================
// 3. MAPEAR FUNÇÕES COM NOMES DIFERENTES
// ================================================================

console.log('\n3️⃣  Mapeando funções essenciais...');

// Mapear possíveis equivalências
const functionMapping = {
    'loadDonors': ['carregarDoadores', 'fetchDonors', 'getDoadores'],
    'saveDonation': ['salvarDoacao', 'saveNewDonation', 'createDonation'],
    'editDonation': ['editarDoacao', 'updateDonation', 'modificarDoacao'],
    'deleteDonation': ['excluirDoacao', 'removerDoacao', 'apagarDoacao'],
    'exportData': ['exportarDados', 'exportToPDF', 'generatePDF'],
    'showHistory': ['mostrarHistorico', 'viewHistory', 'abrirHistorico'],
    'closeModal': ['fecharModal', 'hideModal', 'fechaModal']
};

const foundMappings = [];
for (const [essential, alternatives] of Object.entries(functionMapping)) {
    for (const alt of alternatives) {
        if (content.includes(`function ${alt}`) || content.includes(`const ${alt}`) || content.includes(`let ${alt}`)) {
            foundMappings.push(`${essential} → ${alt}`);
            break;
        }
    }
}

if (foundMappings.length > 0) {
    console.log('✅ Funções equivalentes encontradas:');
    foundMappings.forEach(map => console.log(`   - ${map}`));
    modifications.push(`Mapeadas ${foundMappings.length} funções equivalentes`);
} else {
    console.log('ℹ️  Nenhuma função equivalente encontrada');
}

// ================================================================
// 4. REMOVER CONSOLE.LOGS (OPCIONAL)
// ================================================================

console.log('\n4️⃣  Tratamento de console.logs...');

// Contar console.logs
const consoleCount = (content.match(/console\.(log|error|warn|info|debug)/g) || []).length;

if (consoleCount > 0) {
    console.log(`📊 Total de console.logs: ${consoleCount}`);
    console.log('ℹ️  Mantendo console.logs por enquanto (podem ser úteis para debug)');
    console.log('   Para remover, execute: "limpar-console-logs.js"');
} else {
    console.log('✅ Nenhum console.log encontrado');
}

// ================================================================
// 5. VERIFICAÇÃO ADICIONAL
// ================================================================

console.log('\n5️⃣  Verificações adicionais...');

// Verificar se existe DOMContentLoaded
if (!content.includes('DOMContentLoaded')) {
    console.log('⚠️  AVISO: Não há listener para DOMContentLoaded');
    
    // Adicionar se não existir
    const initCode = `
// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Doações v1.1.5 - Inicializando...');
    
    // Carregar dados iniciais
    if (typeof loadDonations === 'function') {
        loadDonations();
    }
    
    // Configurar event listeners
    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
    
    console.log('Sistema inicializado com sucesso!');
});`;
    
    content += '\n' + initCode;
    modifications.push('Adicionado listener DOMContentLoaded');
    console.log('✅ Adicionado listener DOMContentLoaded');
} else {
    console.log('✅ DOMContentLoaded já existe');
}

// ================================================================
// 6. SALVAR ARQUIVO CORRIGIDO
// ================================================================

console.log('\n6️⃣  Salvando arquivo corrigido...');

fs.writeFileSync(APP_JS_PATH, content, 'utf8');

const newLines = content.split('\n').length;
const linesDiff = newLines - originalLines;

console.log('✅ Arquivo salvo com sucesso!');

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 RELATÓRIO DE CORREÇÕES:');
console.log('═'.repeat(56));
console.log(`📝 Linhas originais: ${originalLines}`);
console.log(`📝 Linhas após correção: ${newLines} (${linesDiff > 0 ? '+' : ''}${linesDiff})`);
console.log(`\n🔧 Modificações realizadas: ${modifications.length}`);

if (modifications.length > 0) {
    modifications.forEach((mod, index) => {
        console.log(`   ${index + 1}. ${mod}`);
    });
}

console.log('\n📋 RECOMENDAÇÕES:');
console.log('═'.repeat(56));
console.log('1. Teste o sistema para verificar se tudo funciona');
console.log('2. Se houver erros, restaure o backup:');
console.log(`   cp ${BACKUP_PATH} ${APP_JS_PATH}`);
console.log('3. Prossiga para: "unificar-banco-dados.js"');

console.log('\n✅ CORREÇÃO CONCLUÍDA!');
console.log('📝 Próximo passo: Teste o sistema ou execute "unificar-banco-dados.js"');
console.log('═'.repeat(56));