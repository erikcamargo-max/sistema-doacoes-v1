// debug-modal-nova-doacao.js
// Versão: 1.1.2-debug
// Data: 05/09/2025
// Objetivo: Diagnosticar exatamente o que está acontecendo com o modal

const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUG: Investigando Modal Nova Doação');
console.log('══════════════════════════════════════════════════\n');

// ==========================================
// ANALISAR INDEX.HTML EM DETALHES
// ==========================================

function analisarIndexHTML() {
    console.log('📝 Analisando index.html em detalhes...');
    
    const indexPath = './public/index.html';
    const content = fs.readFileSync(indexPath, 'utf8');
    
    console.log('\n🔍 PROCURANDO MODAIS:');
    
    // Procurar todos os modais
    const modalMatches = content.match(/<div[^>]*id="[^"]*modal[^"]*"/g);
    if (modalMatches) {
        modalMatches.forEach((match, index) => {
            console.log(`   ${index + 1}. ${match}`);
        });
    } else {
        console.log('   ❌ Nenhum modal encontrado!');
    }
    
    console.log('\n🔍 VERIFICANDO MODAL PRINCIPAL (id="modal"):');
    const modalMainIndex = content.indexOf('<div id="modal"');
    if (modalMainIndex !== -1) {
        const modalEnd = content.indexOf('</div>', content.lastIndexOf('</div>', modalMainIndex + 2000)) + 6;
        const modalContent = content.substring(modalMainIndex, modalEnd);
        
        console.log(`   ✅ Modal principal encontrado na posição ${modalMainIndex}`);
        console.log(`   📏 Tamanho do modal: ${modalContent.length} caracteres`);
        
        // Verificar campos específicos
        const camposEnderecoModal = [
            'input-cep',
            'input-logradouro',
            'input-numero',
            'input-complemento',
            'input-bairro',
            'input-cidade',
            'input-estado'
        ];
        
        console.log('\n🔍 CAMPOS DE ENDEREÇO NO MODAL PRINCIPAL:');
        camposEnderecoModal.forEach(campo => {
            if (modalContent.includes(campo)) {
                console.log(`   ✅ ${campo} - ENCONTRADO`);
            } else {
                console.log(`   ❌ ${campo} - AUSENTE`);
            }
        });
        
        // Verificar campos de recorrência
        console.log('\n🔍 CAMPOS DE RECORRÊNCIA NO MODAL PRINCIPAL:');
        const camposRecorrencia = [
            'input-recurrent',
            'recurring-fields',
            'input-parcelas',
            'input-proxima-parcela',
            'toggleRecurringFields'
        ];
        
        camposRecorrencia.forEach(campo => {
            if (modalContent.includes(campo)) {
                console.log(`   ✅ ${campo} - ENCONTRADO`);
            } else {
                console.log(`   ❌ ${campo} - AUSENTE`);
            }
        });
        
        // Salvar modal atual para análise
        fs.writeFileSync('./debug-modal-atual.html', modalContent);
        console.log('\n💾 Modal atual salvo em: debug-modal-atual.html');
        
    } else {
        console.log('   ❌ Modal principal NÃO encontrado!');
    }
    
    // Procurar outros modais que podem estar interferindo
    console.log('\n🔍 VERIFICANDO OUTROS MODAIS:');
    const outrosModais = [
        'simple-modal',
        'edit-modal',
        'history-modal',
        'modal-history'
    ];
    
    outrosModais.forEach(modal => {
        if (content.includes(modal)) {
            console.log(`   ⚠️ ${modal} - ENCONTRADO (pode estar interferindo)`);
        } else {
            console.log(`   ✅ ${modal} - Não encontrado`);
        }
    });
}

// ==========================================
// ANALISAR APP.JS EM DETALHES
// ==========================================

function analisarAppJS() {
    console.log('\n📝 Analisando app.js em detalhes...');
    
    const appPath = './public/app.js';
    const content = fs.readFileSync(appPath, 'utf8');
    
    console.log('\n🔍 PROCURANDO FUNÇÕES DE MODAL:');
    
    const funcoes = [
        'openModal',
        'createSimpleModal',
        'toggleRecurringFields',
        'setupEventListeners'
    ];
    
    funcoes.forEach(funcao => {
        if (content.includes(`function ${funcao}`) || content.includes(`${funcao} =`) || content.includes(`${funcao}(`)) {
            console.log(`   ✅ ${funcao} - ENCONTRADA`);
        } else {
            console.log(`   ❌ ${funcao} - AUSENTE`);
        }
    });
    
    console.log('\n🔍 VERIFICANDO QUAL MODAL ESTÁ SENDO USADO:');
    
    // Verificar se openModal usa o modal do HTML ou cria um novo
    const openModalMatch = content.match(/function openModal\(\)[^}]*{[^}]*}/s);
    if (openModalMatch) {
        const openModalCode = openModalMatch[0];
        console.log('\n📋 Código da função openModal:');
        console.log('─'.repeat(50));
        console.log(openModalCode.substring(0, 300) + '...');
        console.log('─'.repeat(50));
        
        if (openModalCode.includes('createSimpleModal')) {
            console.log('   ⚠️ openModal() chama createSimpleModal() - IGNORA modal do HTML!');
        } else if (openModalCode.includes('getElementById(\'modal\')')) {
            console.log('   ✅ openModal() usa modal do HTML');
        } else {
            console.log('   ❓ openModal() faz algo diferente');
        }
    }
    
    console.log('\n🔍 PROCURANDO EVENT LISTENERS:');
    const eventListeners = [
        'btn-nova-doacao',
        'btn-new-donation',
        'addEventListener'
    ];
    
    eventListeners.forEach(listener => {
        const matches = content.match(new RegExp(listener, 'g'));
        if (matches) {
            console.log(`   ✅ ${listener} - ${matches.length} ocorrência(s)`);
        } else {
            console.log(`   ❌ ${listener} - Não encontrado`);
        }
    });
}

// ==========================================
// VERIFICAR BOTÃO NOVA DOAÇÃO NO HTML
// ==========================================

function verificarBotaoNovaDoacao() {
    console.log('\n📝 Verificando botão Nova Doação no HTML...');
    
    const indexPath = './public/index.html';
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const possiveisBotoes = [
        'btn-nova-doacao',
        'btn-new-donation',
        'Nova Doação',
        'button'
    ];
    
    console.log('\n🔍 PROCURANDO BOTÕES:');
    possiveisBotoes.forEach(botao => {
        const matches = content.match(new RegExp(botao, 'gi'));
        if (matches) {
            console.log(`   ✅ ${botao} - ${matches.length} ocorrência(s)`);
        } else {
            console.log(`   ❌ ${botao} - Não encontrado`);
        }
    });
    
    // Extrair todos os botões
    const botoesMatches = content.match(/<button[^>]*>[^<]*<\/button>/gi);
    if (botoesMatches) {
        console.log('\n📋 TODOS OS BOTÕES ENCONTRADOS:');
        botoesMatches.forEach((botao, index) => {
            console.log(`   ${index + 1}. ${botao}`);
        });
    }
}

// ==========================================
// GERAR RELATÓRIO DE PROBLEMAS
// ==========================================

function gerarRelatorioProblemas() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RELATÓRIO DE PROBLEMAS IDENTIFICADOS');
    console.log('='.repeat(60));
    
    console.log('\n🔍 POSSÍVEIS CAUSAS DO PROBLEMA:');
    console.log('');
    console.log('1. 🎭 CONFLITO DE MODAIS:');
    console.log('   - Função openModal() pode estar criando modal dinâmico');
    console.log('   - Modal dinâmico sobrescreve modal do HTML');
    console.log('   - Solução: Forçar uso do modal HTML ou corrigir função');
    console.log('');
    console.log('2. 🔌 EVENT LISTENERS INCORRETOS:');
    console.log('   - Botão pode ter ID diferente do esperado');
    console.log('   - Event listener pode não estar funcionando');
    console.log('   - Solução: Verificar e corrigir event listeners');
    console.log('');
    console.log('3. 📱 CACHE DO NAVEGADOR:');
    console.log('   - Navegador pode estar usando versão em cache');
    console.log('   - Solução: Ctrl+F5 ou limpar cache');
    console.log('');
    console.log('4. 🔄 SERVIDOR NÃO REINICIADO:');
    console.log('   - Mudanças só aparecem após reiniciar servidor');
    console.log('   - Solução: npm start (novo terminal)');
    console.log('');
    
    console.log('📋 PRÓXIMOS PASSOS SUGERIDOS:');
    console.log('1. Verificar arquivo debug-modal-atual.html');
    console.log('2. Reiniciar servidor completamente');
    console.log('3. Limpar cache do navegador (Ctrl+Shift+Del)');
    console.log('4. Executar script de correção forçada');
}

// ==========================================
// EXECUÇÃO PRINCIPAL
// ==========================================

try {
    console.log('🔍 Iniciando debug completo...\n');
    
    // Verificar se estamos no diretório correto
    if (!fs.existsSync('./public/index.html')) {
        console.log('❌ ERRO: Execute este script na raiz do projeto!');
        process.exit(1);
    }
    
    analisarIndexHTML();
    analisarAppJS();
    verificarBotaoNovaDoacao();
    gerarRelatorioProblemas();
    
    console.log('\n🎯 DEBUG CONCLUÍDO!');
    console.log('Verifique o arquivo debug-modal-atual.html para análise detalhada.');
    
} catch (error) {
    console.error('\n❌ ERRO durante o debug:', error.message);
    process.exit(1);
}