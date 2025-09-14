/**
 * ================================================================
 * SCRIPT: Análise de Dependências para Modularização
 * ================================================================
 * 
 * VERSÃO: 2.0.0
 * DATA: 09/09/2025
 * FASE: 2 - MODULARIZAÇÃO
 * ETAPA: 2.1 - Análise de Dependências
 * 
 * DESCRIÇÃO:
 * Analisa o app.js identificando todas as funções e suas
 * interdependências para criar um mapa de modularização seguro.
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   ANÁLISE DE DEPENDÊNCIAS - SISTEMA v1.2.0        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// Configurações
const APP_JS_PATH = path.join(__dirname, 'public', 'app.js');
const REPORT_PATH = path.join(__dirname, 'docs', 'dependencias_mapa.json');
const DOCS_DIR = path.join(__dirname, 'docs');

// Verificar arquivo
if (!fs.existsSync(APP_JS_PATH)) {
    console.error('❌ Arquivo app.js não encontrado!');
    process.exit(1);
}

// Criar diretório docs se não existir
if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Ler conteúdo
const content = fs.readFileSync(APP_JS_PATH, 'utf8');
const lines = content.split('\n');

console.log(`📁 Analisando: ${APP_JS_PATH}`);
console.log(`📊 Total de ${lines.length} linhas\n`);

// ================================================================
// 1. IDENTIFICAR TODAS AS FUNÇÕES
// ================================================================

console.log('1️⃣  Identificando funções...\n');

const functions = new Map();
const globalVars = new Set();
const apiCalls = new Map();

// Patterns para identificar elementos
const patterns = {
    functionDecl: /function\s+(\w+)\s*\([^)]*\)/g,
    functionExpr: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function/g,
    arrowFunction: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
    globalVar: /(?:let|var)\s+(\w+)\s*=/g,
    fetchCall: /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
    domQuery: /document\.(getElementById|querySelector|querySelectorAll)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    eventListener: /addEventListener\s*\(\s*['"`](\w+)['"`]/g
};

// Coletar funções
let match;
while ((match = patterns.functionDecl.exec(content)) !== null) {
    const name = match[1];
    const startPos = match.index;
    const lineNum = content.substring(0, startPos).split('\n').length;
    
    functions.set(name, {
        name: name,
        type: 'function',
        line: lineNum,
        calls: [],
        calledBy: [],
        domAccess: [],
        apiCalls: [],
        category: null
    });
}

// Funções const/let/var
patterns.functionExpr.lastIndex = 0;
while ((match = patterns.functionExpr.exec(content)) !== null) {
    const name = match[1];
    const startPos = match.index;
    const lineNum = content.substring(0, startPos).split('\n').length;
    
    if (!functions.has(name)) {
        functions.set(name, {
            name: name,
            type: 'const/let',
            line: lineNum,
            calls: [],
            calledBy: [],
            domAccess: [],
            apiCalls: [],
            category: null
        });
    }
}

// Arrow functions
patterns.arrowFunction.lastIndex = 0;
while ((match = patterns.arrowFunction.exec(content)) !== null) {
    const name = match[1];
    const startPos = match.index;
    const lineNum = content.substring(0, startPos).split('\n').length;
    
    if (!functions.has(name)) {
        functions.set(name, {
            name: name,
            type: 'arrow',
            line: lineNum,
            calls: [],
            calledBy: [],
            domAccess: [],
            apiCalls: [],
            category: null
        });
    }
}

console.log(`✅ ${functions.size} funções identificadas`);

// ================================================================
// 2. ANALISAR DEPENDÊNCIAS
// ================================================================

console.log('\n2️⃣  Analisando dependências entre funções...\n');

// Para cada função, identificar o que ela chama
functions.forEach((funcData, funcName) => {
    // Encontrar o corpo da função
    const funcRegex = new RegExp(`(function\\s+${funcName}|${funcName}\\s*=)[^{]*{([^}]+function[^}]+)*[^}]+}`, 'gs');
    const funcMatch = funcRegex.exec(content);
    
    if (funcMatch) {
        const funcBody = funcMatch[0];
        
        // Verificar chamadas a outras funções
        functions.forEach((_, otherFunc) => {
            if (otherFunc !== funcName) {
                const callRegex = new RegExp(`\\b${otherFunc}\\s*\\(`, 'g');
                if (callRegex.test(funcBody)) {
                    funcData.calls.push(otherFunc);
                    functions.get(otherFunc).calledBy.push(funcName);
                }
            }
        });
        
        // Verificar chamadas de API
        patterns.fetchCall.lastIndex = 0;
        let apiMatch;
        while ((apiMatch = patterns.fetchCall.exec(funcBody)) !== null) {
            funcData.apiCalls.push(apiMatch[1]);
        }
        
        // Verificar acesso ao DOM
        patterns.domQuery.lastIndex = 0;
        let domMatch;
        while ((domMatch = patterns.domQuery.exec(funcBody)) !== null) {
            funcData.domAccess.push({
                method: domMatch[1],
                selector: domMatch[2]
            });
        }
    }
});

// ================================================================
// 3. CATEGORIZAR FUNÇÕES
// ================================================================

console.log('3️⃣  Categorizando funções por responsabilidade...\n');

functions.forEach((func) => {
    const name = func.name.toLowerCase();
    
    // Categorização baseada no nome e chamadas de API
    if (name.includes('load') || name.includes('fetch') || name.includes('get')) {
        func.category = 'api';
    } else if (name.includes('modal') || name.includes('open') || name.includes('close') || name.includes('show') || name.includes('hide')) {
        func.category = 'modals';
    } else if (name.includes('donor') || name.includes('doador')) {
        func.category = 'doadores';
    } else if (name.includes('donation') || name.includes('doacao')) {
        func.category = 'doacoes';
    } else if (name.includes('history') || name.includes('historico') || name.includes('payment')) {
        func.category = 'historico';
    } else if (name.includes('filter') || name.includes('search') || name.includes('busca')) {
        func.category = 'filters';
    } else if (name.includes('export') || name.includes('pdf') || name.includes('carne')) {
        func.category = 'exports';
    } else if (name.includes('format') || name.includes('validate') || name.includes('calc')) {
        func.category = 'utils';
    } else if (func.apiCalls.length > 0) {
        func.category = 'api';
    } else if (func.domAccess.length > 2) {
        func.category = 'modals';
    } else {
        func.category = 'utils';
    }
});

// Contar por categoria
const categories = {};
functions.forEach(func => {
    if (!categories[func.category]) {
        categories[func.category] = [];
    }
    categories[func.category].push(func.name);
});

console.log('📊 Distribuição por categoria:');
Object.entries(categories).forEach(([cat, funcs]) => {
    console.log(`   ${cat}: ${funcs.length} funções`);
});

// ================================================================
// 4. IDENTIFICAR VARIÁVEIS GLOBAIS
// ================================================================

console.log('\n4️⃣  Identificando variáveis globais...\n');

patterns.globalVar.lastIndex = 0;
while ((match = patterns.globalVar.exec(content)) !== null) {
    // Verificar se está no escopo global (não dentro de função)
    const beforeMatch = content.substring(0, match.index);
    const openBraces = (beforeMatch.match(/{/g) || []).length;
    const closeBraces = (beforeMatch.match(/}/g) || []).length;
    
    if (openBraces === closeBraces) {
        globalVars.add(match[1]);
    }
}

console.log(`📦 ${globalVars.size} variáveis globais identificadas`);

// ================================================================
// 5. CRIAR PLANO DE MODULARIZAÇÃO
// ================================================================

console.log('\n5️⃣  Criando plano de modularização...\n');

const modules = {
    'config.js': {
        description: 'Configurações e constantes globais',
        functions: [],
        globals: Array.from(globalVars).filter(v => v.includes('URL') || v.includes('CONFIG')),
        estimatedLines: 50
    },
    'api.js': {
        description: 'Chamadas à API e comunicação com backend',
        functions: categories.api || [],
        globals: [],
        estimatedLines: 300
    },
    'doadores.js': {
        description: 'Gestão de doadores',
        functions: categories.doadores || [],
        globals: ['allDonors'],
        estimatedLines: 400
    },
    'doacoes.js': {
        description: 'Gestão de doações',
        functions: categories.doacoes || [],
        globals: ['allDonations', 'currentDonationId'],
        estimatedLines: 600
    },
    'historico.js': {
        description: 'Histórico de pagamentos',
        functions: categories.historico || [],
        globals: [],
        estimatedLines: 300
    },
    'modals.js': {
        description: 'Gerenciamento de modais',
        functions: categories.modals || [],
        globals: ['currentEditingId', 'duplicateCheckModal'],
        estimatedLines: 500
    },
    'filters.js': {
        description: 'Sistema de filtros e busca',
        functions: categories.filters || [],
        globals: [],
        estimatedLines: 200
    },
    'exports.js': {
        description: 'Exportação e geração de documentos',
        functions: categories.exports || [],
        globals: [],
        estimatedLines: 400
    },
    'utils.js': {
        description: 'Funções utilitárias',
        functions: categories.utils || [],
        globals: [],
        estimatedLines: 150
    },
    'init.js': {
        description: 'Inicialização do sistema',
        functions: ['DOMContentLoaded', 'setupEventListeners'],
        globals: [],
        estimatedLines: 100
    }
};

// ================================================================
// 6. ANÁLISE DE COMPLEXIDADE
// ================================================================

console.log('6️⃣  Análise de complexidade das dependências...\n');

// Identificar funções com muitas dependências (complexas)
const complexFunctions = [];
functions.forEach(func => {
    const complexity = func.calls.length + func.calledBy.length;
    if (complexity > 5) {
        complexFunctions.push({
            name: func.name,
            complexity: complexity,
            calls: func.calls.length,
            calledBy: func.calledBy.length
        });
    }
});

if (complexFunctions.length > 0) {
    console.log('⚠️  Funções complexas (muitas dependências):');
    complexFunctions
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 5)
        .forEach(func => {
            console.log(`   - ${func.name}: ${func.complexity} conexões (chama ${func.calls}, chamada por ${func.calledBy})`);
        });
}

// ================================================================
// 7. GERAR RELATÓRIO
// ================================================================

console.log('\n7️⃣  Gerando relatório de dependências...\n');

const report = {
    timestamp: new Date().toISOString(),
    statistics: {
        totalLines: lines.length,
        totalFunctions: functions.size,
        totalGlobals: globalVars.size,
        categories: Object.keys(categories).length
    },
    modules: modules,
    dependencies: Object.fromEntries(functions),
    globalVariables: Array.from(globalVars),
    complexFunctions: complexFunctions,
    recommendations: []
};

// Adicionar recomendações
if (complexFunctions.length > 10) {
    report.recommendations.push('⚠️ Muitas funções complexas - considere refatoração adicional');
}

if (globalVars.size > 20) {
    report.recommendations.push('⚠️ Muitas variáveis globais - agrupe em objetos de configuração');
}

report.recommendations.push('✅ Estrutura modular proposta com 10 arquivos');
report.recommendations.push('✅ Estimativa de redução: 3041 → ~300 linhas por módulo');

// Salvar relatório
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('═'.repeat(56));
console.log('📊 RELATÓRIO DE ANÁLISE:');
console.log('═'.repeat(56));
console.log(`📝 Funções analisadas: ${functions.size}`);
console.log(`📦 Variáveis globais: ${globalVars.size}`);
console.log(`📁 Módulos propostos: ${Object.keys(modules).length}`);
console.log(`\n📊 DISTRIBUIÇÃO PROPOSTA:`);

let totalEstimated = 0;
Object.entries(modules).forEach(([file, data]) => {
    console.log(`\n   ${file} (~${data.estimatedLines} linhas)`);
    console.log(`   └─ ${data.functions.length} funções`);
    totalEstimated += data.estimatedLines;
});

console.log(`\n📉 REDUÇÃO ESPERADA:`);
console.log(`   De: ${lines.length} linhas (arquivo único)`);
console.log(`   Para: ~${totalEstimated} linhas (distribuídas)`);
console.log(`   Média: ~${Math.round(totalEstimated / Object.keys(modules).length)} linhas por módulo`);

console.log('\n📋 PRÓXIMOS PASSOS:');
console.log('═'.repeat(56));
console.log('1. Revisar o relatório em: docs/dependencias_mapa.json');
console.log('2. Executar: "criar-estrutura-modular.js"');
console.log('3. Executar: "modularizar-app.js"');

console.log('\n✅ ANÁLISE CONCLUÍDA!');
console.log(`📄 Relatório salvo em: ${REPORT_PATH}`);
console.log('═'.repeat(56));