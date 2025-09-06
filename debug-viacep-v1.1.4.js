// debug-viacep-v1.1.4.js
// Versão: 1.1.4
// Data: 05/09/2025
// Objetivo: Diagnosticar e corrigir integração ViaCEP que não está funcionando

const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUG: Integração ViaCEP');
console.log('Versão: 1.1.4 - Sistema de Doações');
console.log('══════════════════════════════════════════════════\n');

// ==========================================
// 1. ANALISAR FUNÇÕES VIACEP NO APP.JS
// ==========================================

function analisarFuncoesViaCEP() {
    console.log('📝 Analisando funções ViaCEP no app.js...');
    
    const appPath = './public/app.js';
    const content = fs.readFileSync(appPath, 'utf8');
    
    console.log('\n🔍 PROCURANDO FUNÇÕES VIACEP:');
    
    // Verificar funções principais
    const funcoesEsperadas = [
        'buscarCEP',
        'formatCEPInput',
        'window.buscarCEP',
        'window.formatCEPInput',
        'viacep.com.br'
    ];
    
    funcoesEsperadas.forEach(funcao => {
        const matches = content.match(new RegExp(funcao, 'gi'));
        if (matches) {
            console.log(`   ✅ ${funcao} - ${matches.length} ocorrência(s)`);
        } else {
            console.log(`   ❌ ${funcao} - AUSENTE`);
        }
    });
    
    // Extrair função buscarCEP se existir
    const buscarCEPMatch = content.match(/(?:window\.)?buscarCEP.*?=.*?function.*?{[\s\S]*?^}/m);
    if (buscarCEPMatch) {
        console.log('\n📋 FUNÇÃO BUSCARCEP ENCONTRADA:');
        console.log('─'.repeat(50));
        console.log(buscarCEPMatch[0].substring(0, 500) + '...');
        console.log('─'.repeat(50));
        
        // Salvar função para análise
        fs.writeFileSync('./debug-buscarcep-atual.js', buscarCEPMatch[0]);
        console.log('💾 Função salva em: debug-buscarcep-atual.js');
    } else {
        console.log('\n❌ FUNÇÃO BUSCARCEP NÃO ENCONTRADA');
    }
    
    // Extrair função formatCEPInput se existir
    const formatCEPMatch = content.match(/(?:window\.)?formatCEPInput.*?=.*?function.*?{[\s\S]*?^}/m);
    if (formatCEPMatch) {
        console.log('\n📋 FUNÇÃO FORMATCEPINPUT ENCONTRADA');
    } else {
        console.log('\n❌ FUNÇÃO FORMATCEPINPUT NÃO ENCONTRADA');
    }
}

// ==========================================
// 2. VERIFICAR CAMPOS CEP NO HTML
// ==========================================

function verificarCamposCEP() {
    console.log('\n📝 Verificando campos CEP no HTML...');
    
    const indexPath = './public/index.html';
    const content = fs.readFileSync(indexPath, 'utf8');
    
    console.log('\n🔍 PROCURANDO CAMPOS CEP:');
    
    const camposCEP = [
        'input-cep',
        'formatCEPInput',
        'oninput="formatCEPInput'
    ];
    
    camposCEP.forEach(campo => {
        const matches = content.match(new RegExp(campo, 'gi'));
        if (matches) {
            console.log(`   ✅ ${campo} - ${matches.length} ocorrência(s)`);
        } else {
            console.log(`   ❌ ${campo} - AUSENTE`);
        }
    });
    
    // Extrair campo CEP do modal
    const cepFieldMatch = content.match(/<input[^>]*id="input-cep"[^>]*>/);
    if (cepFieldMatch) {
        console.log('\n📋 CAMPO CEP ENCONTRADO:');
        console.log('─'.repeat(50));
        console.log(cepFieldMatch[0]);
        console.log('─'.repeat(50));
        
        // Verificar se tem oninput
        if (cepFieldMatch[0].includes('oninput')) {
            console.log('✅ Campo CEP tem evento oninput configurado');
        } else {
            console.log('❌ Campo CEP NÃO tem evento oninput');
        }
    } else {
        console.log('\n❌ CAMPO input-cep NÃO ENCONTRADO');
    }
}

// ==========================================
// 3. VERIFICAR EVENT LISTENERS
// ==========================================

function verificarEventListeners() {
    console.log('\n📝 Verificando event listeners para CEP...');
    
    const appPath = './public/app.js';
    const content = fs.readFileSync(appPath, 'utf8');
    
    console.log('\n🔍 PROCURANDO EVENT LISTENERS CEP:');
    
    // Procurar por addEventListener relacionado a CEP
    const eventListenerMatches = content.match(/getElementById\(['"]input-cep['"]\)[\s\S]*?addEventListener/g);
    if (eventListenerMatches) {
        console.log(`   ✅ Event listeners para input-cep - ${eventListenerMatches.length} encontrado(s)`);
        eventListenerMatches.forEach((match, index) => {
            console.log(`      ${index + 1}. ${match}`);
        });
    } else {
        console.log('   ❌ Nenhum event listener para input-cep encontrado');
    }
    
    // Verificar se setupEventListeners tem configuração CEP
    const setupEventListenersMatch = content.match(/function setupEventListeners\(\)[^}]*{[\s\S]*?^}/m);
    if (setupEventListenersMatch) {
        const setupContent = setupEventListenersMatch[0];
        if (setupContent.includes('input-cep')) {
            console.log('   ✅ setupEventListeners tem configuração para CEP');
        } else {
            console.log('   ❌ setupEventListeners NÃO tem configuração para CEP');
        }
    }
}

// ==========================================
// 4. TESTAR CONECTIVIDADE VIACEP
// ==========================================

async function testarViaCEP() {
    console.log('\n📝 Testando conectividade com ViaCEP...');
    
    try {
        console.log('🌐 Tentando acessar ViaCEP API...');
        
        // Testar com CEP válido
        const testeCEP = '01310-100'; // Av. Paulista, São Paulo
        const url = `https://viacep.com.br/ws/${testeCEP.replace(/\D/g, '')}/json/`;
        
        console.log(`📡 URL de teste: ${url}`);
        
        // Simular fetch (Node.js não tem fetch nativo, mas podemos verificar a URL)
        console.log('⚠️ Teste real precisa ser feito no navegador');
        console.log('💡 Copie esta URL no navegador para testar:');
        console.log(`   ${url}`);
        
        return true;
    } catch (error) {
        console.log('❌ Erro ao testar ViaCEP:', error.message);
        return false;
    }
}

// ==========================================
// 5. GERAR RELATÓRIO DE PROBLEMAS
// ==========================================

function gerarRelatorioProblemas() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 POSSÍVEIS PROBLEMAS VIACEP IDENTIFICADOS');
    console.log('='.repeat(60));
    
    console.log('\n🔍 POSSÍVEIS CAUSAS:');
    console.log('');
    console.log('1. 🚫 FUNÇÕES NÃO DEFINIDAS:');
    console.log('   - buscarCEP() pode não existir ou estar mal definida');
    console.log('   - formatCEPInput() pode não estar funcionando');
    console.log('   - Funções podem não estar como window.function');
    console.log('');
    console.log('2. 🔌 EVENT LISTENERS AUSENTES:');
    console.log('   - Campo input-cep pode não ter oninput configurado');
    console.log('   - addEventListener pode não estar funcionando');
    console.log('   - setupEventListeners pode não ter configuração CEP');
    console.log('');
    console.log('3. 🌐 PROBLEMA DE CONECTIVIDADE:');
    console.log('   - CORS pode estar bloqueando ViaCEP');
    console.log('   - URL da API pode estar incorreta');
    console.log('   - Fetch pode não estar funcionando');
    console.log('');
    console.log('4. 🎯 PROBLEMA DE PREFIXOS:');
    console.log('   - Função buscarCEP() pode estar procurando IDs errados');
    console.log('   - Prefixos (input-, edit-, simple-) podem estar confusos');
    console.log('');
    console.log('5. 📱 ERRO DE JAVASCRIPT:');
    console.log('   - Console do navegador pode mostrar erros');
    console.log('   - Funções podem estar sendo chamadas antes de serem definidas');
    console.log('');
    
    console.log('📋 SOLUÇÕES RECOMENDADAS:');
    console.log('1. 🔧 Recriar funções ViaCEP do zero');
    console.log('2. 🔌 Configurar event listeners corretamente');
    console.log('3. 🧪 Adicionar logs para debug');
    console.log('4. 🎯 Simplificar lógica de prefixos');
    console.log('5. 📱 Verificar console do navegador');
}

// ==========================================
// EXECUÇÃO PRINCIPAL
// ==========================================

try {
    console.log('🔍 Iniciando debug ViaCEP...\n');
    
    if (!fs.existsSync('./public/app.js')) {
        console.log('❌ ERRO: Execute este script na raiz do projeto!');
        process.exit(1);
    }
    
    analisarFuncoesViaCEP();
    verificarCamposCEP();
    verificarEventListeners();
    testarViaCEP();
    gerarRelatorioProblemas();
    
    console.log('\n🎯 DEBUG VIACEP CONCLUÍDO!');
    console.log('Verifique os arquivos debug-*.js gerados para análise.');
    
} catch (error) {
    console.error('\n❌ ERRO durante o debug:', error.message);
    process.exit(1);
}