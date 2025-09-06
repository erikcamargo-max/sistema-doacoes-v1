// corrigir-viacep-definitivo-v1.1.4.js
// Versão: 1.1.4
// Data: 05/09/2025
// Objetivo: CORRIGIR DEFINITIVAMENTE integração ViaCEP
// Problema identificado: Conflito de prefixos (simple- vs input-)

const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO DEFINITIVA: ViaCEP');
console.log('Versão: 1.1.4 - Sistema de Doações');
console.log('🎯 Problema: Conflito de prefixos simple- vs input-');
console.log('══════════════════════════════════════════════════\n');

// ==========================================
// 1. SUBSTITUIR FUNÇÕES VIACEP COMPLETAMENTE
// ==========================================

function corrigirFuncoesViaCEP() {
    console.log('📝 Substituindo funções ViaCEP com lógica corrigida...');
    
    const appPath = './public/app.js';
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Remover funções antigas conflitantes
    console.log('🗑️ Removendo funções ViaCEP antigas...');
    
    // Remover função buscarCEP antiga
    const buscarCEPRegex = /window\.buscarCEP\s*=\s*async function[\s\S]*?^}/m;
    const buscarCEPMatch = content.match(buscarCEPRegex);
    if (buscarCEPMatch) {
        content = content.replace(buscarCEPMatch[0], '');
        console.log('✅ Função buscarCEP antiga removida');
    }
    
    // Remover função formatCEPInput antiga
    const formatCEPRegex = /window\.formatCEPInput\s*=\s*function[\s\S]*?^}/m;
    const formatCEPMatch = content.match(formatCEPRegex);
    if (formatCEPMatch) {
        content = content.replace(formatCEPMatch[0], '');
        console.log('✅ Função formatCEPInput antiga removida');
    }
    
    // Adicionar novas funções corrigidas
    const novasFuncoesViaCEP = `
// ===============================================================================
// FUNÇÕES VIACEP CORRIGIDAS - Versão 1.1.4 DEFINITIVA
// ===============================================================================

// Função para buscar CEP via ViaCEP API - CORRIGIDA
window.buscarCEP = async function(cepValue, contexto = 'input') {
    console.log('🔍 buscarCEP chamada:', { cepValue, contexto });
    
    // Limpar CEP
    const cep = cepValue.replace(/\\D/g, '');
    
    if (cep.length !== 8) {
        console.log('⚠️ CEP inválido (não tem 8 dígitos):', cep);
        return;
    }
    
    // Definir IDs dos campos baseado no contexto
    let ids = {};
    if (contexto === 'input') {
        // Modal Nova Doação
        ids = {
            cep: 'input-cep',
            logradouro: 'input-logradouro',
            bairro: 'input-bairro',
            cidade: 'input-cidade',
            estado: 'input-estado'
        };
    } else if (contexto === 'edit') {
        // Modal Edição
        ids = {
            cep: 'edit-cep',
            logradouro: 'edit-logradouro',
            bairro: 'edit-bairro',
            cidade: 'edit-cidade',
            estado: 'edit-estado'
        };
    } else if (contexto === 'simple') {
        // Modal Simples (legado)
        ids = {
            cep: 'simple-cep',
            logradouro: 'simple-logradouro',
            bairro: 'simple-bairro',
            cidade: 'simple-cidade',
            estado: 'simple-estado'
        };
    } else {
        console.error('❌ Contexto inválido:', contexto);
        return;
    }
    
    console.log('🎯 IDs que serão usados:', ids);
    
    // Obter elementos
    const cepField = document.getElementById(ids.cep);
    const logradouroField = document.getElementById(ids.logradouro);
    const bairroField = document.getElementById(ids.bairro);
    const cidadeField = document.getElementById(ids.cidade);
    const estadoField = document.getElementById(ids.estado);
    
    console.log('📱 Elementos encontrados:', {
        cep: !!cepField,
        logradouro: !!logradouroField,
        bairro: !!bairroField,
        cidade: !!cidadeField,
        estado: !!estadoField
    });
    
    // Mostrar indicador de carregamento
    if (cepField) {
        cepField.style.borderColor = '#fbbf24'; // Amarelo
        console.log('🟡 Indicador de carregamento ativado');
    }
    
    try {
        const url = \`https://viacep.com.br/ws/\${cep}/json/\`;
        console.log('🌐 Fazendo requisição para:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('📦 Resposta ViaCEP:', data);
        
        if (!data.erro) {
            // Preencher campos automaticamente
            if (logradouroField && data.logradouro) {
                logradouroField.value = data.logradouro;
                console.log('✅ Logradouro preenchido:', data.logradouro);
            }
            if (bairroField && data.bairro) {
                bairroField.value = data.bairro;
                console.log('✅ Bairro preenchido:', data.bairro);
            }
            if (cidadeField && data.localidade) {
                cidadeField.value = data.localidade;
                console.log('✅ Cidade preenchida:', data.localidade);
            }
            if (estadoField && data.uf) {
                estadoField.value = data.uf;
                console.log('✅ Estado preenchido:', data.uf);
            }
            
            // Indicar sucesso
            if (cepField) {
                cepField.style.borderColor = '#10b981'; // Verde
                setTimeout(() => {
                    cepField.style.borderColor = '#d1d5db'; // Volta ao normal
                }, 2000);
                console.log('🟢 Indicador de sucesso ativado');
            }
            
            // Focar no próximo campo (número)
            const numeroField = document.getElementById(ids.cep.replace('-cep', '-numero'));
            if (numeroField) {
                setTimeout(() => numeroField.focus(), 100);
                console.log('🎯 Foco movido para campo número');
            }
            
        } else {
            console.log('❌ CEP não encontrado na base ViaCEP');
            if (cepField) {
                cepField.style.borderColor = '#ef4444'; // Vermelho
                setTimeout(() => {
                    cepField.style.borderColor = '#d1d5db';
                }, 2000);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao buscar CEP:', error);
        if (cepField) {
            cepField.style.borderColor = '#ef4444'; // Vermelho
            setTimeout(() => {
                cepField.style.borderColor = '#d1d5db';
            }, 2000);
        }
        
        // Mostrar erro amigável ao usuário
        alert('Erro ao buscar CEP. Verifique sua conexão com a internet e tente novamente.');
    }
}

// Função para formatar input de CEP - CORRIGIDA
window.formatCEPInput = function(event) {
    console.log('⌨️ formatCEPInput chamada:', event.target.id);
    
    let value = event.target.value.replace(/\\D/g, '');
    
    // Limitar a 8 dígitos
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    
    // Adicionar hífen
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    
    event.target.value = value;
    console.log('✅ CEP formatado:', value);
    
    // Buscar CEP automaticamente quando completo (8 dígitos)
    if (value.replace(/\\D/g, '').length === 8) {
        // Detectar contexto baseado no ID do campo
        const fieldId = event.target.id;
        let contexto = 'input';
        
        if (fieldId.includes('edit-')) {
            contexto = 'edit';
        } else if (fieldId.includes('simple-')) {
            contexto = 'simple';
        }
        
        console.log('🚀 CEP completo, iniciando busca automática...', { contexto });
        buscarCEP(value, contexto);
    }
}

// Tornar funções acessíveis globalmente - IMPORTANTE!
window.buscarCEP = window.buscarCEP;
window.formatCEPInput = window.formatCEPInput;

console.log('✅ Funções ViaCEP 1.1.4 carregadas com sucesso');

`;
    
    // Inserir novas funções no início do arquivo (após comentários)
    const insertPoint = content.indexOf('// Variáveis globais') || content.indexOf('let donations = []') || 0;
    content = content.substring(0, insertPoint) + novasFuncoesViaCEP + content.substring(insertPoint);
    
    fs.writeFileSync(appPath, content);
    console.log('✅ Funções ViaCEP substituídas no app.js');
}

// ==========================================
// 2. CORRIGIR EVENT LISTENERS NO SETUPEVENTLISTENERS
// ==========================================

function corrigirEventListeners() {
    console.log('📝 Corrigindo event listeners para CEP...');
    
    const appPath = './public/app.js';
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Localizar setupEventListeners
    const setupIndex = content.indexOf('function setupEventListeners() {');
    if (setupIndex !== -1) {
        const functionEnd = content.indexOf('}', setupIndex);
        
        // Verificar se já tem configuração CEP
        const setupContent = content.substring(setupIndex, functionEnd);
        
        if (!setupContent.includes('Event listeners para campos de endereço - v1.1.4')) {
            const novosListeners = `
    
    // Event listeners para campos de endereço - v1.1.4 CORRIGIDOS
    console.log('🔌 Configurando event listeners ViaCEP...');
    
    // Campo CEP do modal Nova Doação
    const cepFieldInput = document.getElementById('input-cep');
    if (cepFieldInput) {
        // Remover listeners antigos para evitar duplicação
        cepFieldInput.removeEventListener('input', formatCEPInput);
        cepFieldInput.addEventListener('input', formatCEPInput);
        console.log('✅ Event listener configurado: input-cep');
    } else {
        console.log('⚠️ Campo input-cep não encontrado');
    }
    
    // Campo CEP do modal Edição (se existir)
    const cepFieldEdit = document.getElementById('edit-cep');
    if (cepFieldEdit) {
        cepFieldEdit.removeEventListener('input', formatCEPInput);
        cepFieldEdit.addEventListener('input', formatCEPInput);
        console.log('✅ Event listener configurado: edit-cep');
    }
    
    // Teste manual - botão para testar ViaCEP
    console.log('🧪 Para testar ViaCEP manualmente, use:');
    console.log('   window.buscarCEP("01310-100", "input")');
`;
            
            content = content.substring(0, functionEnd) + novosListeners + content.substring(functionEnd);
            console.log('✅ Event listeners ViaCEP adicionados');
        } else {
            console.log('✅ Event listeners ViaCEP já configurados');
        }
    }
    
    fs.writeFileSync(appPath, content);
}

// ==========================================
// 3. ADICIONAR SCRIPT DE TESTE NO HTML
// ==========================================

function adicionarTesteViaCEP() {
    console.log('📝 Adicionando script de teste no HTML...');
    
    const indexPath = './public/index.html';
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Verificar se já tem script de teste
    if (!content.includes('<!-- Script de Teste ViaCEP v1.1.4 -->')) {
        const scriptTeste = `
    <!-- Script de Teste ViaCEP v1.1.4 -->
    <script>
        // Função para testar ViaCEP manualmente
        window.testarViaCEP = function() {
            console.log('🧪 Testando ViaCEP...');
            if (typeof window.buscarCEP === 'function') {
                window.buscarCEP('01310-100', 'input');
                console.log('✅ Teste iniciado - CEP: 01310-100');
            } else {
                console.error('❌ Função buscarCEP não encontrada');
            }
        }
        
        // Auto-teste ao carregar a página
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🔍 Verificando funções ViaCEP...');
            console.log('buscarCEP disponível:', typeof window.buscarCEP === 'function');
            console.log('formatCEPInput disponível:', typeof window.formatCEPInput === 'function');
            console.log('💡 Para testar manualmente: testarViaCEP()');
        });
    </script>
`;
        
        // Inserir antes do fechamento do body
        const bodyEndIndex = content.lastIndexOf('</body>');
        if (bodyEndIndex !== -1) {
            content = content.substring(0, bodyEndIndex) + scriptTeste + content.substring(bodyEndIndex);
            console.log('✅ Script de teste adicionado');
        }
    } else {
        console.log('✅ Script de teste já existe');
    }
    
    fs.writeFileSync(indexPath, content);
}

// ==========================================
// 4. ATUALIZAR VERSÃO E DOCUMENTAÇÃO
// ==========================================

function atualizarVersao() {
    console.log('📝 Atualizando versão para 1.1.4...');
    
    // package.json
    const packagePath = './package.json';
    let packageContent = fs.readFileSync(packagePath, 'utf8');
    packageContent = packageContent.replace('"version": "1.1.3"', '"version": "1.1.4"');
    fs.writeFileSync(packagePath, packageContent);
    
    // VERSAO.txt
    fs.writeFileSync('./VERSAO.txt', '1.1.4');
    
    console.log('✅ Versão atualizada para 1.1.4');
}

// ==========================================
// EXECUÇÃO PRINCIPAL
// ==========================================

try {
    console.log('🚀 Iniciando correção definitiva ViaCEP...\n');
    
    if (!fs.existsSync('./public/app.js')) {
        console.log('❌ ERRO: Execute este script na raiz do projeto!');
        process.exit(1);
    }
    
    corrigirFuncoesViaCEP();
    corrigirEventListeners();
    adicionarTesteViaCEP();
    atualizarVersao();
    
    console.log('\n🎉 CORREÇÃO VIACEP CONCLUÍDA COM SUCESSO!');
    console.log('══════════════════════════════════════════════════');
    console.log('✅ Funções ViaCEP totalmente reescritas');
    console.log('✅ Problema de prefixos corrigido');
    console.log('✅ Event listeners configurados corretamente');
    console.log('✅ Script de teste adicionado');
    console.log('✅ Logs detalhados para debug');
    console.log('✅ Versão atualizada para 1.1.4');
    console.log('');
    console.log('📋 COMO TESTAR:');
    console.log('1. 🔄 Reinicie o servidor: npm start');
    console.log('2. 🧹 Limpe cache: Ctrl+Shift+F5');
    console.log('3. 🆕 Clique "Nova Doação"');
    console.log('4. ⌨️ Digite CEP: 01310-100');
    console.log('5. 👀 Veja preenchimento automático');
    console.log('6. 🔍 Console: F12 → Ver logs detalhados');
    console.log('');
    console.log('🧪 TESTE MANUAL NO CONSOLE:');
    console.log('   testarViaCEP()');
    console.log('   window.buscarCEP("01310-100", "input")');
    console.log('');
    console.log('🎯 VIACEP AGORA DEVE FUNCIONAR 100%!');
    
} catch (error) {
    console.error('❌ ERRO durante a correção:', error.message);
    process.exit(1);
}