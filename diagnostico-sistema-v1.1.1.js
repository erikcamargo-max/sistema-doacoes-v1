// diagnostico-sistema-v1.1.1.js
// Versão: 1.1.1
// Data: 05/09/2025
// Objetivo: Diagnosticar se todas as funcionalidades estão corretamente implementadas

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO: Sistema de Doações v1.1.1');
console.log('══════════════════════════════════════════════════\n');

// ==========================================
// VERIFICAR ARQUIVOS ESSENCIAIS
// ==========================================

function verificarArquivos() {
    console.log('📁 Verificando arquivos essenciais...');
    
    const arquivos = [
        './public/index.html',
        './public/app.js',
        './server.js',
        './package.json',
        './VERSAO.txt',
        './CONTROLE_VERSAO.md'
    ];
    
    let tudoOk = true;
    
    arquivos.forEach(arquivo => {
        if (fs.existsSync(arquivo)) {
            const stats = fs.statSync(arquivo);
            console.log(`✅ ${arquivo} - ${(stats.size / 1024).toFixed(2)} KB`);
        } else {
            console.log(`❌ ${arquivo} - AUSENTE`);
            tudoOk = false;
        }
    });
    
    return tudoOk;
}

// ==========================================
// VERIFICAR CAMPOS DE ENDEREÇO NO INDEX.HTML
// ==========================================

function verificarCamposEndereco() {
    console.log('\n📝 Verificando campos de endereço no index.html...');
    
    const indexPath = './public/index.html';
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const camposEsperados = [
        'input-cep',
        'input-logradouro', 
        'input-numero',
        'input-complemento',
        'input-bairro',
        'input-cidade',
        'input-estado'
    ];
    
    let camposEncontrados = 0;
    
    camposEsperados.forEach(campo => {
        if (content.includes(campo)) {
            console.log(`✅ Campo ${campo} encontrado`);
            camposEncontrados++;
        } else {
            console.log(`❌ Campo ${campo} AUSENTE`);
        }
    });
    
    console.log(`\n📊 Resultado: ${camposEncontrados}/${camposEsperados.length} campos de endereço encontrados`);
    return camposEncontrados === camposEsperados.length;
}

// ==========================================
// VERIFICAR FUNÇÕES DE CEP NO APP.JS
// ==========================================

function verificarFuncoesCEP() {
    console.log('\n🔧 Verificando funções de CEP no app.js...');
    
    const appPath = './public/app.js';
    const content = fs.readFileSync(appPath, 'utf8');
    
    const funcoesEsperadas = [
        'window.buscarCEP',
        'window.formatCEPInput',
        'formatCEPInput(event)',
        'viacep.com.br'
    ];
    
    let funcoesEncontradas = 0;
    
    funcoesEsperadas.forEach(funcao => {
        if (content.includes(funcao)) {
            console.log(`✅ Função/referência ${funcao} encontrada`);
            funcoesEncontradas++;
        } else {
            console.log(`❌ Função/referência ${funcao} AUSENTE`);
        }
    });
    
    console.log(`\n📊 Resultado: ${funcoesEncontradas}/${funcoesEsperadas.length} funções CEP encontradas`);
    return funcoesEncontradas === funcoesEsperadas.length;
}

// ==========================================
// VERIFICAR ROTA DE DUPLICATAS NO SERVER.JS
// ==========================================

function verificarRotaDuplicatas() {
    console.log('\n🛣️ Verificando rota de duplicatas no server.js...');
    
    const serverPath = './server.js';
    const content = fs.readFileSync(serverPath, 'utf8');
    
    const itensEsperados = [
        '/api/doadores/check-duplicates',
        'checkPossibleDuplicates',
        'app.post',
        'req.body'
    ];
    
    let itensEncontrados = 0;
    
    itensEsperados.forEach(item => {
        if (content.includes(item)) {
            console.log(`✅ Item ${item} encontrado`);
            itensEncontrados++;
        } else {
            console.log(`❌ Item ${item} AUSENTE`);
        }
    });
    
    console.log(`\n📊 Resultado: ${itensEncontrados}/${itensEsperados.length} itens da rota encontrados`);
    return itensEncontrados === itensEsperados.length;
}

// ==========================================
// VERIFICAR VERSÃO DO SISTEMA
// ==========================================

function verificarVersao() {
    console.log('\n📌 Verificando versão do sistema...');
    
    try {
        // Verificar package.json
        const packageContent = fs.readFileSync('./package.json', 'utf8');
        const packageData = JSON.parse(packageContent);
        console.log(`📦 package.json: v${packageData.version}`);
        
        // Verificar VERSAO.txt
        const versaoTxt = fs.readFileSync('./VERSAO.txt', 'utf8').trim();
        console.log(`📄 VERSAO.txt: v${versaoTxt}`);
        
        // Verificar se são iguais
        if (packageData.version === versaoTxt) {
            console.log('✅ Versões consistentes');
            return true;
        } else {
            console.log('❌ Versões inconsistentes');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro ao verificar versões:', error.message);
        return false;
    }
}

// ==========================================
// VERIFICAR BANCO DE DADOS
// ==========================================

function verificarBancoDados() {
    console.log('\n🗃️ Verificando banco de dados...');
    
    const dbPath = './database/doacoes.db';
    
    if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`✅ Banco de dados encontrado - ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Verificar se não está vazio
        if (stats.size > 1024) { // Mais de 1KB
            console.log('✅ Banco de dados contém dados');
            return true;
        } else {
            console.log('⚠️ Banco de dados muito pequeno - pode estar vazio');
            return false;
        }
    } else {
        console.log('❌ Banco de dados NÃO encontrado');
        return false;
    }
}

// ==========================================
// VERIFICAR CONFIGURAÇÃO DO SERVIDOR
// ==========================================

function verificarConfigServidor() {
    console.log('\n⚙️ Verificando configuração do servidor...');
    
    const serverPath = './server.js';
    const content = fs.readFileSync(serverPath, 'utf8');
    
    const configEsperadas = [
        'const PORT = 3001',
        'app.use(cors())',
        'app.use(express.static(\'public\'))',
        'new sqlite3.Database'
    ];
    
    let configEncontradas = 0;
    
    configEsperadas.forEach(config => {
        if (content.includes(config)) {
            console.log(`✅ Configuração ${config} encontrada`);
            configEncontradas++;
        } else {
            console.log(`❌ Configuração ${config} AUSENTE`);
        }
    });
    
    console.log(`\n📊 Resultado: ${configEncontradas}/${configEsperadas.length} configurações encontradas`);
    return configEncontradas === configEsperadas.length;
}

// ==========================================
// RELATÓRIO FINAL
// ==========================================

function gerarRelatorioFinal(resultados) {
    console.log('\n' + '='.repeat(50));
    console.log('📋 RELATÓRIO FINAL DO DIAGNÓSTICO');
    console.log('='.repeat(50));
    
    const total = Object.keys(resultados).length;
    const passou = Object.values(resultados).filter(Boolean).length;
    const percentual = ((passou / total) * 100).toFixed(1);
    
    console.log(`\n📊 Pontuação Geral: ${passou}/${total} (${percentual}%)`);
    
    console.log('\n📋 Detalhamento:');
    Object.entries(resultados).forEach(([teste, passou]) => {
        const status = passou ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`   ${status} - ${teste}`);
    });
    
    console.log('\n🎯 Status do Sistema:');
    if (percentual >= 90) {
        console.log('✅ SISTEMA TOTALMENTE OPERACIONAL');
        console.log('🚀 Pronto para uso em produção!');
    } else if (percentual >= 70) {
        console.log('⚠️ SISTEMA PARCIALMENTE OPERACIONAL');
        console.log('🔧 Algumas correções necessárias');
    } else {
        console.log('❌ SISTEMA PRECISA DE CORREÇÕES');
        console.log('🛠️ Execute as correções necessárias');
    }
    
    console.log('\n📞 COMANDOS ÚTEIS:');
    console.log('   npm start        - Iniciar servidor');
    console.log('   npm run dev      - Modo desenvolvimento');
    console.log('   npm run init-db  - Inicializar banco');
    
    return percentual >= 90;
}

// ==========================================
// EXECUÇÃO PRINCIPAL
// ==========================================

try {
    console.log('🔍 Iniciando diagnóstico completo...\n');
    
    const resultados = {
        'Arquivos Essenciais': verificarArquivos(),
        'Campos de Endereço': verificarCamposEndereco(),
        'Funções de CEP': verificarFuncoesCEP(),
        'Rota de Duplicatas': verificarRotaDuplicatas(),
        'Versão do Sistema': verificarVersao(),
        'Banco de Dados': verificarBancoDados(),
        'Configuração Servidor': verificarConfigServidor()
    };
    
    const sistemaOk = gerarRelatorioFinal(resultados);
    
    if (sistemaOk) {
        console.log('\n🎉 DIAGNÓSTICO CONCLUÍDO COM SUCESSO!');
        process.exit(0);
    } else {
        console.log('\n⚠️ DIAGNÓSTICO IDENTIFICOU PROBLEMAS!');
        process.exit(1);
    }
    
} catch (error) {
    console.error('\n❌ ERRO durante o diagnóstico:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se está na pasta correta do projeto');
    console.log('2. Execute: npm install');
    console.log('3. Execute: npm run init-db');
    process.exit(1);
}