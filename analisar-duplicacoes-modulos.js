/**
 * ================================================================
 * SCRIPT: Análise Simples de Duplicações - SEM ERROS
 * ================================================================
 * 
 * VERSÃO: 3.2.0
 * DATA: 12/09/2025
 * OBJETIVO: Mapear duplicações de forma SIMPLES e DIRETA
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('ANÁLISE DE DUPLICAÇÕES - SISTEMA DE DOAÇÕES');
console.log('============================================');
console.log(`Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// ================================================================
// 1. VERIFICAR ARQUIVOS EXISTENTES
// ================================================================

console.log('1. VERIFICANDO ARQUIVOS...\n');

const arquivos = {};

// Verificar app.js
if (fs.existsSync('./public/app.js')) {
    const content = fs.readFileSync('./public/app.js', 'utf8');
    arquivos.appJs = {
        existe: true,
        linhas: content.split('\n').length,
        tamanho: fs.statSync('./public/app.js').size,
        conteudo: content
    };
    console.log(`✅ app.js: ${arquivos.appJs.linhas} linhas, ${(arquivos.appJs.tamanho/1024).toFixed(1)}KB`);
} else {
    console.log('❌ app.js não encontrado!');
    process.exit(1);
}

// Verificar módulos
const modulos = ['core.js', 'loader.js', 'api-module.js'];
modulos.forEach(modulo => {
    const caminho = `./public/js/${modulo}`;
    if (fs.existsSync(caminho)) {
        const content = fs.readFileSync(caminho, 'utf8');
        arquivos[modulo] = {
            existe: true,
            linhas: content.split('\n').length,
            tamanho: fs.statSync(caminho).size,
            conteudo: content
        };
        console.log(`✅ ${modulo}: ${arquivos[modulo].linhas} linhas, ${(arquivos[modulo].tamanho/1024).toFixed(1)}KB`);
    } else {
        arquivos[modulo] = { existe: false };
        console.log(`⚠️ ${modulo}: não encontrado`);
    }
});

// ================================================================
// 2. EXTRAIR FUNÇÕES DE FORMA SIMPLES
// ================================================================

console.log('\n2. EXTRAINDO FUNÇÕES...\n');

function extrairFuncoesSimples(conteudo) {
    const funcoes = new Set();
    
    // Buscar padrões simples de funções
    const patterns = [
        /function\s+(\w+)/g,
        /(\w+)\s*=\s*function/g,
        /(\w+)\s*=\s*\([^)]*\)\s*=>/g,
        /window\.(\w+)\s*=/g
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(conteudo)) !== null) {
            const nome = match[1];
            if (nome && nome.length > 2 && !['var', 'let', 'const'].includes(nome)) {
                funcoes.add(nome);
            }
        }
    });
    
    return funcoes;
}

// Extrair funções do app.js
const funcoesApp = extrairFuncoesSimples(arquivos.appJs.conteudo);
console.log(`app.js: ${funcoesApp.size} funções encontradas`);

// Extrair funções dos módulos
const funcoesModulos = {};
let totalFuncoesModulos = 0;

modulos.forEach(modulo => {
    if (arquivos[modulo] && arquivos[modulo].existe) {
        funcoesModulos[modulo] = extrairFuncoesSimples(arquivos[modulo].conteudo);
        console.log(`${modulo}: ${funcoesModulos[modulo].size} funções`);
        totalFuncoesModulos += funcoesModulos[modulo].size;
    } else {
        funcoesModulos[modulo] = new Set();
    }
});

// ================================================================
// 3. IDENTIFICAR DUPLICAÇÕES
// ================================================================

console.log('\n3. IDENTIFICANDO DUPLICAÇÕES...\n');

const duplicadas = new Set();
const unicas = new Set();

// Comparar app.js com todos os módulos
funcoesApp.forEach(funcao => {
    let encontrada = false;
    
    modulos.forEach(modulo => {
        if (funcoesModulos[modulo] && funcoesModulos[modulo].has(funcao)) {
            duplicadas.add(funcao);
            encontrada = true;
        }
    });
    
    if (!encontrada) {
        unicas.add(funcao);
    }
});

console.log(`🔄 Funções DUPLICADAS (app.js + módulos): ${duplicadas.size}`);
if (duplicadas.size > 0) {
    Array.from(duplicadas).slice(0, 10).forEach(f => console.log(`   • ${f}`));
    if (duplicadas.size > 10) {
        console.log(`   ... e mais ${duplicadas.size - 10} funções duplicadas`);
    }
}

console.log(`\n🔒 Funções ÚNICAS (só no app.js): ${unicas.size}`);
if (unicas.size > 0) {
    Array.from(unicas).slice(0, 15).forEach(f => console.log(`   • ${f}`));
    if (unicas.size > 15) {
        console.log(`   ... e mais ${unicas.size - 15} funções únicas`);
    }
}

// ================================================================
// 4. CALCULAR REDUÇÃO POTENCIAL
// ================================================================

console.log('\n4. CALCULANDO POTENCIAL DE REDUÇÃO...\n');

const totalFuncoes = funcoesApp.size;
const funcoesDuplicadas = duplicadas.size;
const funcoesUnicas = unicas.size;
const percentualDuplicadas = totalFuncoes > 0 ? ((funcoesDuplicadas / totalFuncoes) * 100).toFixed(1) : 0;

const linhasAtuais = arquivos.appJs.linhas;
const reducaoEstimada = totalFuncoes > 0 ? Math.round((funcoesDuplicadas / totalFuncoes) * linhasAtuais) : 0;
const linhasFinais = linhasAtuais - reducaoEstimada;

console.log('📊 ESTATÍSTICAS:');
console.log(`   📏 Linhas do app.js: ${linhasAtuais}`);
console.log(`   🔧 Total de funções: ${totalFuncoes}`);
console.log(`   🔄 Funções duplicadas: ${funcoesDuplicadas} (${percentualDuplicadas}%)`);
console.log(`   🔒 Funções únicas: ${funcoesUnicas}`);
console.log(`   📉 Redução estimada: ${reducaoEstimada} linhas`);
console.log(`   📏 Tamanho final estimado: ${linhasFinais} linhas`);

// ================================================================
// 5. VERIFICAR MÓDULOS CARREGADOS
// ================================================================

console.log('\n5. VERIFICANDO CARREGAMENTO...\n');

if (fs.existsSync('./public/index.html')) {
    const indexContent = fs.readFileSync('./public/index.html', 'utf8');
    const scriptsCarregados = [];
    
    const scriptRegex = /<script[^>]*src\s*=\s*['"]([^'"]*(?:app\.js|core\.js|loader\.js|api-module\.js)[^'"]*)['"]/gi;
    let match;
    
    while ((match = scriptRegex.exec(indexContent)) !== null) {
        scriptsCarregados.push(match[1]);
    }
    
    console.log('📜 Scripts carregados no HTML:');
    scriptsCarregados.forEach((script, index) => {
        console.log(`   ${index + 1}. ${script}`);
    });
    
    if (scriptsCarregados.length === 0) {
        console.log('   ⚠️ Nenhum script modular encontrado no HTML');
    }
} else {
    console.log('⚠️ index.html não encontrado');
}

// ================================================================
// 6. ANÁLISE DE RISCOS
// ================================================================

console.log('\n6. ANÁLISE DE RISCOS...\n');

const riscos = [];

// Verificar event listeners
const eventListeners = (arquivos.appJs.conteudo.match(/addEventListener/g) || []).length;
if (eventListeners > 0) {
    console.log(`👂 Event listeners encontrados: ${eventListeners}`);
    riscos.push(`${eventListeners} event listeners podem ser perdidos`);
}

// Verificar funções window.*
const windowFunctions = [];
const windowRegex = /window\.(\w+)\s*=/g;
let match;
while ((match = windowRegex.exec(arquivos.appJs.conteudo)) !== null) {
    windowFunctions.push(match[1]);
}

if (windowFunctions.length > 0) {
    console.log(`🌐 Funções globais (window.*): ${windowFunctions.length}`);
    windowFunctions.slice(0, 5).forEach(f => console.log(`   • window.${f}`));
    if (windowFunctions.length > 5) {
        console.log(`   ... e mais ${windowFunctions.length - 5}`);
    }
    riscos.push(`${windowFunctions.length} funções globais podem ser perdidas`);
}

// Verificar DOMContentLoaded
const domReady = arquivos.appJs.conteudo.includes('DOMContentLoaded');
if (domReady) {
    console.log(`🚀 Sistema de inicialização: DOMContentLoaded detectado`);
    riscos.push('Sistema de inicialização pode ser afetado');
}

console.log(`\n⚠️ Total de riscos identificados: ${riscos.length}`);
riscos.forEach((risco, index) => {
    console.log(`   ${index + 1}. ${risco}`);
});

// ================================================================
// 7. RECOMENDAÇÕES
// ================================================================

console.log('\n7. RECOMENDAÇÕES...\n');

if (funcoesDuplicadas === 0) {
    console.log('✅ SISTEMA OTIMIZADO');
    console.log('   Nenhuma duplicação encontrada');
    console.log('   App.js já está no tamanho ideal para modularização atual');
} else if (funcoesDuplicadas < 5) {
    console.log('🟡 POUCAS DUPLICAÇÕES');
    console.log('   Duplicações mínimas detectadas');
    console.log('   Limpeza opcional - risco vs benefício baixo');
} else if (funcoesDuplicadas < 15) {
    console.log('🟠 DUPLICAÇÕES MODERADAS');
    console.log('   Vale a pena fazer limpeza cautelosa');
    console.log('   Remover funções duplicadas uma por vez');
    console.log('   Testar após cada remoção');
} else {
    console.log('🔴 MUITAS DUPLICAÇÕES');
    console.log('   Limpeza necessária para otimização');
    console.log('   Planejar estratégia de remoção gradual');
    console.log('   Fazer backup completo antes de começar');
}

console.log('\n📋 ESTRATÉGIA RECOMENDADA:');
console.log('   1. 💾 Criar backup do app.js atual');
console.log('   2. 🧪 Testar sistema 100% funcional');
console.log('   3. 🔍 Identificar funções menos críticas primeiro');
console.log('   4. ✂️ Remover UMA função duplicada por vez');
console.log('   5. ✅ Testar completamente após cada remoção');
console.log('   6. 🔄 Repetir até otimização completa');

// ================================================================
// 8. SALVAR RELATÓRIO
// ================================================================

console.log('\n8. SALVANDO RELATÓRIO...\n');

const relatorio = {
    data: new Date().toISOString(),
    arquivos: {
        appJs: {
            linhas: arquivos.appJs.linhas,
            funcoes: funcoesApp.size
        },
        modulos: Object.keys(funcoesModulos).map(m => ({
            nome: m,
            existe: arquivos[m] && arquivos[m].existe,
            funcoes: funcoesModulos[m] ? funcoesModulos[m].size : 0
        }))
    },
    analise: {
        totalFuncoes,
        funcoesDuplicadas,
        funcoesUnicas,
        percentualDuplicadas,
        reducaoEstimada,
        linhasFinais
    },
    duplicadas: Array.from(duplicadas),
    unicas: Array.from(unicas).slice(0, 50), // Limitar para não ficar muito grande
    riscos,
    recomendacao: funcoesDuplicadas === 0 ? 'otimizado' : 
                  funcoesDuplicadas < 5 ? 'poucas_duplicacoes' :
                  funcoesDuplicadas < 15 ? 'limpeza_moderada' : 'limpeza_necessaria'
};

try {
    const nomeArquivo = `relatorio_duplicacoes_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(relatorio, null, 2));
    console.log(`✅ Relatório salvo: ${nomeArquivo}`);
    
    // Relatório resumido em texto
    const resumo = `RELATÓRIO DE DUPLICAÇÕES - ${new Date().toLocaleString('pt-BR')}
=================================================================

ARQUIVOS ANALISADOS:
• app.js: ${arquivos.appJs.linhas} linhas, ${funcoesApp.size} funções
• Módulos: ${Object.values(funcoesModulos).reduce((acc, set) => acc + set.size, 0)} funções totais

RESULTADO:
• Funções duplicadas: ${funcoesDuplicadas} (${percentualDuplicadas}%)
• Funções únicas: ${funcoesUnicas}
• Redução estimada: ${reducaoEstimada} linhas

STATUS: ${funcoesDuplicadas === 0 ? 'SISTEMA OTIMIZADO' :
          funcoesDuplicadas < 5 ? 'POUCAS DUPLICAÇÕES' :
          funcoesDuplicadas < 15 ? 'LIMPEZA MODERADA RECOMENDADA' :
          'LIMPEZA NECESSÁRIA'}

PRÓXIMOS PASSOS:
${funcoesDuplicadas > 0 ? 
  '1. Fazer backup\n2. Testar sistema\n3. Remover duplicações gradualmente' :
  'Sistema já otimizado - nenhuma ação necessária'}
`;

    fs.writeFileSync('RESUMO_DUPLICACOES.txt', resumo);
    console.log('✅ Resumo salvo: RESUMO_DUPLICACOES.txt');
    
} catch (error) {
    console.log(`❌ Erro ao salvar: ${error.message}`);
}

console.log('\n' + '='.repeat(50));
console.log('ANÁLISE CONCLUÍDA COM SUCESSO!');
console.log('='.repeat(50));
console.log(`📊 Resumo: ${funcoesDuplicadas} duplicadas de ${totalFuncoes} funções`);
console.log(`🎯 Ação: ${funcoesDuplicadas > 0 ? 'Limpeza recomendada' : 'Sistema otimizado'}`);
console.log(`📁 Arquivos: relatorio_duplicacoes_*.json + RESUMO_DUPLICACOES.txt`);
