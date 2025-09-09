/**
 * ================================================================
 * SCRIPT: Diagnóstico de Erros de Sintaxe
 * ================================================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 08/09/2025
 * FASE: 1 - ESTABILIZAÇÃO
 * ETAPA: 1.2 - Identificar Erros de Sintaxe
 * 
 * DESCRIÇÃO:
 * Analisa profundamente o app.js identificando todos os possíveis
 * erros de sintaxe, funções duplicadas, variáveis não declaradas
 * e outros problemas estruturais SEM fazer alterações.
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║      DIAGNÓSTICO DE ERROS - SISTEMA v1.1.5        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// Caminho do arquivo
const APP_JS_PATH = path.join(__dirname, 'public', 'app.js');

// Verificar se arquivo existe
if (!fs.existsSync(APP_JS_PATH)) {
    console.error('❌ Arquivo app.js não encontrado!');
    process.exit(1);
}

// Ler conteúdo do arquivo
const content = fs.readFileSync(APP_JS_PATH, 'utf8');
const lines = content.split('\n');

console.log(`📁 Analisando: ${APP_JS_PATH}`);
console.log(`📊 Total de ${lines.length} linhas\n`);

// ================================================================
// 1. ANÁLISE DE ESTRUTURA
// ================================================================

console.log('═══════════════════════════════════════════════════════');
console.log('1️⃣  ANÁLISE DE ESTRUTURA');
console.log('═══════════════════════════════════════════════════════\n');

// Contar elementos estruturais
const analysis = {
    functions: [],
    variables: [],
    duplicateFunctions: [],
    undeclaredVars: [],
    syntaxErrors: [],
    consoleLogs: [],
    todos: [],
    debugComments: []
};

// Regex patterns
const patterns = {
    function: /function\s+(\w+)\s*\(/g,
    constFunction: /const\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*)?\(/g,
    letFunction: /let\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*)?\(/g,
    variable: /(?:const|let|var)\s+(\w+)/g,
    consoleLog: /console\.(log|error|warn|info|debug)/g,
    todo: /\/\/\s*(?:TODO|FIXME|HACK|BUG|XXX)[:|\s]/gi,
    debugComment: /\/\/\s*(?:DEBUG|TESTE|TEST|TEMP)[:|\s]/gi
};

// Encontrar todas as funções
let match;
const functionNames = new Set();
const functionDeclarations = new Map();

// Funções tradicionais
while ((match = patterns.function.exec(content)) !== null) {
    const funcName = match[1];
    if (functionNames.has(funcName)) {
        analysis.duplicateFunctions.push(funcName);
    }
    functionNames.add(funcName);
    
    // Encontrar linha
    const position = match.index;
    const lineNumber = content.substring(0, position).split('\n').length;
    
    if (!functionDeclarations.has(funcName)) {
        functionDeclarations.set(funcName, []);
    }
    functionDeclarations.get(funcName).push(lineNumber);
}

// Funções const
patterns.constFunction.lastIndex = 0;
while ((match = patterns.constFunction.exec(content)) !== null) {
    const funcName = match[1];
    if (functionNames.has(funcName)) {
        analysis.duplicateFunctions.push(funcName);
    }
    functionNames.add(funcName);
    
    const position = match.index;
    const lineNumber = content.substring(0, position).split('\n').length;
    
    if (!functionDeclarations.has(funcName)) {
        functionDeclarations.set(funcName, []);
    }
    functionDeclarations.get(funcName).push(lineNumber);
}

console.log(`🔧 Funções encontradas: ${functionNames.size}`);
console.log(`⚠️  Funções duplicadas: ${analysis.duplicateFunctions.length}`);

if (analysis.duplicateFunctions.length > 0) {
    console.log('\n   Duplicatas encontradas:');
    [...new Set(analysis.duplicateFunctions)].forEach(func => {
        const lines = functionDeclarations.get(func);
        console.log(`   - ${func} (linhas: ${lines.join(', ')})`);
    });
}

// ================================================================
// 2. ANÁLISE DE VARIÁVEIS
// ================================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('2️⃣  ANÁLISE DE VARIÁVEIS');
console.log('═══════════════════════════════════════════════════════\n');

// Encontrar variáveis declaradas
const declaredVars = new Set();
patterns.variable.lastIndex = 0;
while ((match = patterns.variable.exec(content)) !== null) {
    declaredVars.add(match[1]);
}

console.log(`📦 Variáveis declaradas: ${declaredVars.size}`);

// Verificar variáveis globais esperadas
const expectedGlobals = [
    'allDonations',
    'allDonors', 
    'currentEditingId',
    'currentDonationId',
    'duplicateCheckModal'
];

const missingGlobals = expectedGlobals.filter(v => !declaredVars.has(v));
if (missingGlobals.length > 0) {
    console.log(`⚠️  Variáveis globais possivelmente faltando:`);
    missingGlobals.forEach(v => console.log(`   - ${v}`));
}

// ================================================================
// 3. ANÁLISE DE PROBLEMAS
// ================================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('3️⃣  ANÁLISE DE PROBLEMAS');
console.log('═══════════════════════════════════════════════════════\n');

// Contar console.logs
patterns.consoleLog.lastIndex = 0;
let consoleCount = 0;
while ((match = patterns.consoleLog.exec(content)) !== null) {
    consoleCount++;
    const position = match.index;
    const lineNumber = content.substring(0, position).split('\n').length;
    analysis.consoleLogs.push({ type: match[1], line: lineNumber });
}

console.log(`🔍 Console.logs encontrados: ${consoleCount}`);

// Buscar TODOs e comentários de debug
patterns.todo.lastIndex = 0;
while ((match = patterns.todo.exec(content)) !== null) {
    const position = match.index;
    const lineNumber = content.substring(0, position).split('\n').length;
    analysis.todos.push({ text: match[0], line: lineNumber });
}

patterns.debugComment.lastIndex = 0;
while ((match = patterns.debugComment.exec(content)) !== null) {
    const position = match.index;
    const lineNumber = content.substring(0, position).split('\n').length;
    analysis.debugComments.push({ text: match[0], line: lineNumber });
}

console.log(`📝 TODOs/FIXMEs: ${analysis.todos.length}`);
console.log(`🐛 Comentários debug: ${analysis.debugComments.length}`);

// ================================================================
// 4. ANÁLISE DE SINTAXE LINHA A LINHA
// ================================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('4️⃣  ANÁLISE DE SINTAXE DETALHADA');
console.log('═══════════════════════════════════════════════════════\n');

let openBraces = 0;
let openParens = 0;
let openBrackets = 0;
let inString = false;
let stringChar = null;
let inComment = false;
let inMultilineComment = false;
const syntaxIssues = [];

lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Pular linhas vazias
    if (trimmedLine === '') return;
    
    // Detectar comentários
    if (trimmedLine.startsWith('//')) {
        return;
    }
    
    if (trimmedLine.startsWith('/*')) {
        inMultilineComment = true;
    }
    
    if (inMultilineComment) {
        if (trimmedLine.includes('*/')) {
            inMultilineComment = false;
        }
        return;
    }
    
    // Verificar linha incompleta
    if (trimmedLine.endsWith('=') && !trimmedLine.includes('==') && !trimmedLine.includes('!=') && !trimmedLine.includes('>=') && !trimmedLine.includes('<=')) {
        syntaxIssues.push({
            line: lineNum,
            issue: 'Linha possivelmente incompleta (termina com =)',
            content: trimmedLine.substring(0, 50) + '...'
        });
    }
    
    // Verificar ponto e vírgula duplo
    if (trimmedLine.includes(';;')) {
        syntaxIssues.push({
            line: lineNum,
            issue: 'Ponto e vírgula duplo encontrado',
            content: trimmedLine.substring(0, 50) + '...'
        });
    }
    
    // Verificar vírgula no final de objeto/array incorreta
    if (trimmedLine.match(/,\s*[}\]]/)) {
        syntaxIssues.push({
            line: lineNum,
            issue: 'Vírgula desnecessária antes de fechamento',
            content: trimmedLine.substring(0, 50) + '...'
        });
    }
});

console.log(`⚠️  Problemas de sintaxe encontrados: ${syntaxIssues.length}`);

if (syntaxIssues.length > 0) {
    console.log('\n   Primeiros 10 problemas:');
    syntaxIssues.slice(0, 10).forEach(issue => {
        console.log(`   Linha ${issue.line}: ${issue.issue}`);
        console.log(`   → ${issue.content}`);
    });
}

// ================================================================
// 5. ANÁLISE DE FUNÇÕES PRINCIPAIS
// ================================================================

console.log('\n═══════════════════════════════════════════════════════');
console.log('5️⃣  VERIFICAÇÃO DE FUNÇÕES ESSENCIAIS');
console.log('═══════════════════════════════════════════════════════\n');

const essentialFunctions = [
    'loadDonations',
    'loadDonors',
    'saveDonation',
    'editDonation',
    'deleteDonation',
    'generateCarne',
    'exportData',
    'showHistory',
    'applyFilters',
    'openModal',
    'closeModal'
];

const missingFunctions = essentialFunctions.filter(func => !functionNames.has(func));
const foundFunctions = essentialFunctions.filter(func => functionNames.has(func));

console.log(`✅ Funções essenciais encontradas: ${foundFunctions.length}/${essentialFunctions.length}`);

if (missingFunctions.length > 0) {
    console.log(`❌ Funções essenciais faltando:`);
    missingFunctions.forEach(func => console.log(`   - ${func}`));
}

// ================================================================
// 6. GERAR RELATÓRIO
// ================================================================

const report = {
    timestamp: new Date().toISOString(),
    file: APP_JS_PATH,
    statistics: {
        total_lines: lines.length,
        total_functions: functionNames.size,
        duplicate_functions: analysis.duplicateFunctions.length,
        console_logs: consoleCount,
        todos: analysis.todos.length,
        debug_comments: analysis.debugComments.length,
        syntax_issues: syntaxIssues.length
    },
    duplicates: [...new Set(analysis.duplicateFunctions)],
    missing_globals: missingGlobals,
    missing_functions: missingFunctions,
    syntax_issues: syntaxIssues.slice(0, 20),
    recommendation: {
        needs_refactoring: lines.length > 1000,
        needs_modularization: lines.length > 2000,
        needs_cleanup: consoleCount > 10,
        critical_issues: syntaxIssues.length > 0 || missingFunctions.length > 0
    }
};

// Salvar relatório
const reportPath = path.join(__dirname, 'diagnostico_sintaxe_report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// ================================================================
// RESUMO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 RESUMO DO DIAGNÓSTICO:');
console.log('═'.repeat(56));
console.log(`📝 Total de linhas: ${lines.length} ${lines.length > 2000 ? '⚠️ (MUITO GRANDE!)' : ''}`);
console.log(`🔧 Funções: ${functionNames.size}`);
console.log(`⚠️  Duplicatas: ${analysis.duplicateFunctions.length}`);
console.log(`🔍 Console.logs: ${consoleCount}`);
console.log(`📌 TODOs: ${analysis.todos.length}`);
console.log(`🐛 Debug comments: ${analysis.debugComments.length}`);
console.log(`❌ Problemas de sintaxe: ${syntaxIssues.length}`);

console.log('\n📋 RECOMENDAÇÕES:');
console.log('═'.repeat(56));

if (lines.length > 2000) {
    console.log('🔴 CRÍTICO: Arquivo precisa ser modularizado urgentemente!');
}

if (analysis.duplicateFunctions.length > 0) {
    console.log('🟡 IMPORTANTE: Remover funções duplicadas');
}

if (consoleCount > 10) {
    console.log('🟡 IMPORTANTE: Remover console.logs de produção');
}

if (syntaxIssues.length > 0) {
    console.log('🔴 CRÍTICO: Corrigir problemas de sintaxe identificados');
}

if (missingFunctions.length > 0) {
    console.log('🔴 CRÍTICO: Implementar funções essenciais faltando');
}

console.log('\n✅ DIAGNÓSTICO COMPLETO!');
console.log(`📄 Relatório salvo em: ${reportPath}`);
console.log('\n📝 Próximo passo: Execute "corrigir-erros-sintaxe.js"');
console.log('═'.repeat(56));