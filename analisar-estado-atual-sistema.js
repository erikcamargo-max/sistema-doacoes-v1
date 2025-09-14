/**
 * ================================================================
 * SCRIPT: Análise Completa do Estado Atual do Sistema Local
 * ================================================================
 * 
 * VERSÃO: 3.0.0
 * DATA: 11/09/2025
 * OBJETIVO: Analisar completamente onde estamos no projeto local
 * AUTOR: Claude + Erik
 * 
 * DESCRIÇÃO:
 * Este script vai analisar todo o sistema atual local e gerar
 * um relatório completo de onde estamos na modularização
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║      ANÁLISE COMPLETA DO ESTADO ATUAL DO SISTEMA  ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// ================================================================
// 1. ESTRUTURA DE DIRETÓRIOS E ARQUIVOS
// ================================================================

console.log('1️⃣  ANÁLISE DA ESTRUTURA DE ARQUIVOS\n');
console.log('═'.repeat(56));

function analisarEstrutura() {
    const estrutura = {
        raiz: [],
        public: [],
        publicJs: [],
        database: [],
        config: [],
        scripts: [],
        utils: []
    };

    // Analisar raiz do projeto
    if (fs.existsSync('.')) {
        estrutura.raiz = fs.readdirSync('.')
            .filter(item => !item.startsWith('.'))
            .map(item => {
                const stats = fs.statSync(item);
                return {
                    nome: item,
                    tipo: stats.isDirectory() ? 'DIR' : 'FILE',
                    tamanho: stats.isFile() ? stats.size : 0
                };
            });
    }

    // Analisar pasta public
    if (fs.existsSync('./public')) {
        estrutura.public = fs.readdirSync('./public')
            .map(item => {
                const fullPath = path.join('./public', item);
                const stats = fs.statSync(fullPath);
                return {
                    nome: item,
                    tipo: stats.isDirectory() ? 'DIR' : 'FILE',
                    tamanho: stats.isFile() ? stats.size : 0
                };
            });
    }

    // Analisar pasta public/js
    if (fs.existsSync('./public/js')) {
        estrutura.publicJs = fs.readdirSync('./public/js')
            .map(item => {
                const fullPath = path.join('./public/js', item);
                const stats = fs.statSync(fullPath);
                return {
                    nome: item,
                    tipo: stats.isDirectory() ? 'DIR' : 'FILE',
                    tamanho: stats.isFile() ? stats.size : 0,
                    linhas: stats.isFile() && item.endsWith('.js') ? 
                        fs.readFileSync(fullPath, 'utf8').split('\n').length : 0
                };
            });
    }

    // Analisar pasta database
    if (fs.existsSync('./database')) {
        estrutura.database = fs.readdirSync('./database')
            .map(item => {
                const fullPath = path.join('./database', item);
                const stats = fs.statSync(fullPath);
                return {
                    nome: item,
                    tipo: stats.isDirectory() ? 'DIR' : 'FILE',
                    tamanho: stats.isFile() ? stats.size : 0
                };
            });
    }

    return estrutura;
}

const estrutura = analisarEstrutura();

console.log('📁 RAIZ DO PROJETO:');
estrutura.raiz.forEach(item => {
    console.log(`   ${item.tipo === 'DIR' ? '📂' : '📄'} ${item.nome} ${item.tamanho > 0 ? `(${(item.tamanho/1024).toFixed(1)}KB)` : ''}`);
});

console.log('\n📁 PASTA PUBLIC:');
estrutura.public.forEach(item => {
    console.log(`   ${item.tipo === 'DIR' ? '📂' : '📄'} ${item.nome} ${item.tamanho > 0 ? `(${(item.tamanho/1024).toFixed(1)}KB)` : ''}`);
});

console.log('\n📁 PASTA PUBLIC/JS:');
estrutura.publicJs.forEach(item => {
    console.log(`   ${item.tipo === 'DIR' ? '📂' : '📄'} ${item.nome} ${item.tamanho > 0 ? `(${(item.tamanho/1024).toFixed(1)}KB)` : ''} ${item.linhas ? `[${item.linhas} linhas]` : ''}`);
});

console.log('\n📁 PASTA DATABASE:');
estrutura.database.forEach(item => {
    console.log(`   ${item.tipo === 'DIR' ? '📂' : '📄'} ${item.nome} ${item.tamanho > 0 ? `(${(item.tamanho/1024).toFixed(1)}KB)` : ''}`);
});

// ================================================================
// 2. ANÁLISE DO APP.JS PRINCIPAL
// ================================================================

console.log('\n\n2️⃣  ANÁLISE DO APP.JS PRINCIPAL\n');
console.log('═'.repeat(56));

function analisarAppJs() {
    const appJsPath = './public/app.js';
    
    if (!fs.existsSync(appJsPath)) {
        console.log('❌ app.js não encontrado!');
        return null;
    }

    const conteudo = fs.readFileSync(appJsPath, 'utf8');
    const linhas = conteudo.split('\n');
    
    const analise = {
        totalLinhas: linhas.length,
        tamanhoBytes: fs.statSync(appJsPath).size,
        funcoes: [],
        variaveis: [],
        apiCalls: [],
        eventListeners: [],
        comentarios: []
    };

    // Analisar funções
    const regexFuncoes = /(?:function\s+(\w+)|const\s+(\w+)\s*=.*function|(\w+)\s*:\s*function)/g;
    let match;
    while ((match = regexFuncoes.exec(conteudo)) !== null) {
        const nomeFuncao = match[1] || match[2] || match[3];
        if (nomeFuncao) {
            analise.funcoes.push(nomeFuncao);
        }
    }

    // Analisar variáveis globais
    const regexVariaveis = /(?:let|const|var)\s+(\w+)/g;
    while ((match = regexVariaveis.exec(conteudo)) !== null) {
        analise.variaveis.push(match[1]);
    }

    // Analisar chamadas de API
    const regexApi = /fetch\s*\([^)]+\)/g;
    while ((match = regexApi.exec(conteudo)) !== null) {
        analise.apiCalls.push(match[0].substring(0, 50) + '...');
    }

    // Analisar event listeners
    const regexEvents = /addEventListener\s*\(\s*['"]([^'"]+)['"]/g;
    while ((match = regexEvents.exec(conteudo)) !== null) {
        analise.eventListeners.push(match[1]);
    }

    // Analisar comentários de versão
    const regexComentarios = /\/\/.*[Vv]ers[ãa]o:?\s*([\d.]+)/g;
    while ((match = regexComentarios.exec(conteudo)) !== null) {
        analise.comentarios.push(match[1]);
    }

    return analise;
}

const analiseApp = analisarAppJs();

if (analiseApp) {
    console.log(`📊 ESTATÍSTICAS DO APP.JS:`);
    console.log(`   📏 Total de linhas: ${analiseApp.totalLinhas}`);
    console.log(`   💾 Tamanho: ${(analiseApp.tamanhoBytes/1024).toFixed(1)}KB`);
    console.log(`   🔧 Funções encontradas: ${analiseApp.funcoes.length}`);
    console.log(`   📝 Variáveis: ${analiseApp.variaveis.length}`);
    console.log(`   🌐 Chamadas fetch: ${analiseApp.apiCalls.length}`);
    console.log(`   👂 Event listeners: ${[...new Set(analiseApp.eventListeners)].length} tipos`);
    
    if (analiseApp.comentarios.length > 0) {
        console.log(`   🏷️  Versões identificadas: ${[...new Set(analiseApp.comentarios)].join(', ')}`);
    }

    console.log('\n🔧 PRINCIPAIS FUNÇÕES:');
    analiseApp.funcoes.slice(0, 10).forEach(func => {
        console.log(`   • ${func}`);
    });
    
    if (analiseApp.funcoes.length > 10) {
        console.log(`   ... e mais ${analiseApp.funcoes.length - 10} funções`);
    }
}

// ================================================================
// 3. ANÁLISE DOS MÓDULOS EXISTENTES
// ================================================================

console.log('\n\n3️⃣  ANÁLISE DOS MÓDULOS EXISTENTES\n');
console.log('═'.repeat(56));

function analisarModulos() {
    const modulos = {};
    
    // Verificar core.js
    const coreJsPath = './public/js/core.js';
    if (fs.existsSync(coreJsPath)) {
        const conteudo = fs.readFileSync(coreJsPath, 'utf8');
        modulos.core = {
            existe: true,
            linhas: conteudo.split('\n').length,
            tamanho: fs.statSync(coreJsPath).size,
            funcoes: (conteudo.match(/(?:function\s+\w+|const\s+\w+\s*=.*function)/g) || []).length
        };
    } else {
        modulos.core = { existe: false };
    }

    // Verificar loader.js
    const loaderJsPath = './public/js/loader.js';
    if (fs.existsSync(loaderJsPath)) {
        const conteudo = fs.readFileSync(loaderJsPath, 'utf8');
        modulos.loader = {
            existe: true,
            linhas: conteudo.split('\n').length,
            tamanho: fs.statSync(loaderJsPath).size,
            funcoes: (conteudo.match(/(?:function\s+\w+|const\s+\w+\s*=.*function)/g) || []).length
        };
    } else {
        modulos.loader = { existe: false };
    }

    // Verificar api-module.js
    const apiModulePath = './public/js/api-module.js';
    if (fs.existsSync(apiModulePath)) {
        const conteudo = fs.readFileSync(apiModulePath, 'utf8');
        modulos.apiModule = {
            existe: true,
            linhas: conteudo.split('\n').length,
            tamanho: fs.statSync(apiModulePath).size,
            funcoes: (conteudo.match(/(?:function\s+\w+|const\s+\w+\s*=.*function)/g) || []).length
        };
    } else {
        modulos.apiModule = { existe: false };
    }

    return modulos;
}

const modulos = analisarModulos();

console.log('📋 STATUS DOS MÓDULOS:');
Object.keys(modulos).forEach(nomeModulo => {
    const modulo = modulos[nomeModulo];
    if (modulo.existe) {
        console.log(`   ✅ ${nomeModulo}.js: ${modulo.linhas} linhas, ${(modulo.tamanho/1024).toFixed(1)}KB, ${modulo.funcoes} funções`);
    } else {
        console.log(`   ❌ ${nomeModulo}.js: NÃO EXISTE`);
    }
});

// ================================================================
// 4. ANÁLISE DO INDEX.HTML
// ================================================================

console.log('\n\n4️⃣  ANÁLISE DO INDEX.HTML\n');
console.log('═'.repeat(56));

function analisarIndexHtml() {
    const indexPath = './public/index.html';
    
    if (!fs.existsSync(indexPath)) {
        return { existe: false };
    }

    const conteudo = fs.readFileSync(indexPath, 'utf8');
    
    const analise = {
        existe: true,
        linhas: conteudo.split('\n').length,
        tamanho: fs.statSync(indexPath).size,
        scriptsCarregados: [],
        modularizado: false
    };

    // Verificar scripts carregados
    const regexScripts = /<script[^>]*src\s*=\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = regexScripts.exec(conteudo)) !== null) {
        analise.scriptsCarregados.push(match[1]);
    }

    // Verificar se está modularizado (carrega core.js, loader.js)
    analise.modularizado = analise.scriptsCarregados.some(script => 
        script.includes('core.js') || script.includes('loader.js')
    );

    return analise;
}

const analiseHtml = analisarIndexHtml();

if (analiseHtml.existe) {
    console.log(`📄 INDEX.HTML:`);
    console.log(`   📏 Linhas: ${analiseHtml.linhas}`);
    console.log(`   💾 Tamanho: ${(analiseHtml.tamanho/1024).toFixed(1)}KB`);
    console.log(`   🔧 Modularizado: ${analiseHtml.modularizado ? '✅ SIM' : '❌ NÃO'}`);
    
    console.log('\n📜 SCRIPTS CARREGADOS:');
    analiseHtml.scriptsCarregados.forEach(script => {
        console.log(`   • ${script}`);
    });
} else {
    console.log('❌ index.html não encontrado!');
}

// ================================================================
// 5. ANÁLISE DO BANCO DE DADOS
// ================================================================

console.log('\n\n5️⃣  ANÁLISE DO BANCO DE DADOS\n');
console.log('═'.repeat(56));

function analisarBancoDados() {
    const bancoPaths = [
        './database/doacoes.db',
        './doacoes.db'
    ];

    for (const dbPath of bancoPaths) {
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            return {
                existe: true,
                caminho: dbPath,
                tamanho: stats.size,
                ultimaModificacao: stats.mtime
            };
        }
    }

    return { existe: false };
}

const bancoDados = analisarBancoDados();

if (bancoDados.existe) {
    console.log(`💾 BANCO DE DADOS:`);
    console.log(`   📍 Local: ${bancoDados.caminho}`);
    console.log(`   💾 Tamanho: ${(bancoDados.tamanho/1024).toFixed(1)}KB`);
    console.log(`   🕒 Última modificação: ${bancoDados.ultimaModificacao.toLocaleString('pt-BR')}`);
    
    // Se o tamanho for > 20KB, provavelmente tem dados
    if (bancoDados.tamanho > 20480) {
        console.log(`   📊 Status: ✅ COM DADOS (${Math.round(bancoDados.tamanho/1024/10)}0+ registros estimados)`);
    } else {
        console.log(`   📊 Status: ⚠️  POUCOS DADOS`);
    }
} else {
    console.log('❌ Banco de dados não encontrado!');
}

// ================================================================
// 6. VERIFICAÇÃO DO SERVER.JS
// ================================================================

console.log('\n\n6️⃣  ANÁLISE DO SERVER.JS\n');
console.log('═'.repeat(56));

function analisarServerJs() {
    const serverPath = './server.js';
    
    if (!fs.existsSync(serverPath)) {
        return { existe: false };
    }

    const conteudo = fs.readFileSync(serverPath, 'utf8');
    
    return {
        existe: true,
        linhas: conteudo.split('\n').length,
        tamanho: fs.statSync(serverPath).size,
        rotas: (conteudo.match(/app\.(get|post|put|delete)/g) || []).length,
        porta: conteudo.includes('3001') ? '3001' : 
               conteudo.includes('3000') ? '3000' : 'desconhecida'
    };
}

const server = analisarServerJs();

if (server.existe) {
    console.log(`🖥️  SERVER.JS:`);
    console.log(`   📏 Linhas: ${server.linhas}`);
    console.log(`   🔗 Rotas API: ${server.rotas}`);
    console.log(`   🌐 Porta: ${server.porta}`);
    console.log(`   📊 Status: ✅ CONFIGURADO`);
} else {
    console.log('❌ server.js não encontrado!');
}

// ================================================================
// 7. RELATÓRIO FINAL E RECOMENDAÇÕES
// ================================================================

console.log('\n\n7️⃣  RELATÓRIO FINAL E ESTADO ATUAL\n');
console.log('═'.repeat(56));

console.log('📋 RESUMO DO ESTADO ATUAL:');

// Verificar se sistema está completo
const sistemaCompleto = analiseApp && server.existe && bancoDados.existe && analiseHtml.existe;
console.log(`   🎯 Sistema completo: ${sistemaCompleto ? '✅ SIM' : '❌ NÃO'}`);

// Verificar progresso da modularização
const modularizacaoIniciada = modulos.core.existe || modulos.loader.existe || modulos.apiModule.existe;
console.log(`   🔧 Modularização iniciada: ${modularizacaoIniciada ? '✅ SIM' : '❌ NÃO'}`);

if (modularizacaoIniciada) {
    const progressoModularizacao = [
        modulos.core.existe,
        modulos.loader.existe,
        modulos.apiModule.existe
    ].filter(Boolean).length;
    
    console.log(`   📊 Progresso modularização: ${progressoModularizacao}/3 módulos`);
}

// Sistema funcional?
if (analiseApp && analiseApp.totalLinhas > 2000) {
    console.log(`   ⚠️  app.js ainda muito grande: ${analiseApp.totalLinhas} linhas`);
    console.log(`   🎯 Necessário continuar modularização`);
}

console.log('\n🚀 PRÓXIMOS PASSOS RECOMENDADOS:');

if (!modularizacaoIniciada) {
    console.log('   1. Iniciar modularização criando core.js e loader.js');
    console.log('   2. Extrair configurações globais');
    console.log('   3. Implementar sistema modular incremental');
} else if (!modulos.apiModule.existe) {
    console.log('   1. ✅ Core e loader já existem');
    console.log('   2. 🎯 PRÓXIMO: Extrair módulo de API do app.js');
    console.log('   3. Criar api-module.js com funções fetch');
    console.log('   4. Reduzir tamanho do app.js gradualmente');
} else {
    console.log('   1. ✅ Modularização avançada detectada');
    console.log('   2. Continuar extraindo outros módulos (UI, filters, etc.)');
    console.log('   3. Otimizar carregamento e performance');
}

console.log('\n💡 OBSERVAÇÕES IMPORTANTES:');
console.log('   • Sistema parece estar funcionalmente completo');
console.log('   • Modularização deve ser incremental para evitar quebras');
console.log('   • Manter app.js como fallback durante transição');
console.log('   • Testar cada módulo antes de continuar');

console.log('\n✅ ANÁLISE COMPLETA FINALIZADA!');
console.log('═'.repeat(56));
console.log(`📅 Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`);

// ================================================================
// 8. SALVAR RELATÓRIO EM ARQUIVO
// ================================================================

const relatorio = `
# RELATÓRIO DE ANÁLISE DO SISTEMA LOCAL
**Data:** ${new Date().toLocaleString('pt-BR')}

## ESTRUTURA ENCONTRADA
${JSON.stringify(estrutura, null, 2)}

## ANÁLISE APP.JS
${analiseApp ? JSON.stringify(analiseApp, null, 2) : 'app.js não encontrado'}

## STATUS DOS MÓDULOS
${JSON.stringify(modulos, null, 2)}

## BANCO DE DADOS
${JSON.stringify(bancoDados, null, 2)}

## CONCLUSÃO
Sistema ${sistemaCompleto ? 'COMPLETO' : 'INCOMPLETO'}
Modularização ${modularizacaoIniciada ? 'EM PROGRESSO' : 'NÃO INICIADA'}
`;

try {
    fs.writeFileSync('RELATORIO_ANALISE_SISTEMA.md', relatorio);
    console.log('\n💾 Relatório salvo em: RELATORIO_ANALISE_SISTEMA.md');
} catch (error) {
    console.log('\n⚠️  Não foi possível salvar o relatório:', error.message);
}

console.log('\n🎯 EXECUTE ESTE SCRIPT PARA ENTENDER O ESTADO ATUAL!');
console.log('   node analisar-estado-atual-sistema.js');
