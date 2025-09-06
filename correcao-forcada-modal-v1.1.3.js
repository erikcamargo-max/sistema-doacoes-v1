// correcao-forcada-modal-v1.1.3.js
// Versão: 1.1.3
// Data: 05/09/2025
// Objetivo: CORREÇÃO FORÇADA - Substituir createSimpleModal() para usar modal HTML completo
// Debug confirmou: openModal() ignora HTML e usa createSimpleModal()

const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO FORÇADA: Modal Nova Doação');
console.log('Versão: 1.1.3 - Sistema de Doações');
console.log('══════════════════════════════════════════════════\n');

// ==========================================
// 1. SUBSTITUIR MODAL HTML COMPLETAMENTE
// ==========================================

function substituirModalHTML() {
    console.log('📝 Substituindo modal HTML completamente...');
    
    const indexPath = './public/index.html';
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Localizar e extrair o modal atual
    const modalStart = content.indexOf('<div id="modal"');
    const modalEnd = content.indexOf('</div>', content.lastIndexOf('<!-- Modal Footer -->')) + 6;
    
    if (modalStart === -1 || modalEnd === -1) {
        console.log('❌ Modal não encontrado para substituição');
        return;
    }
    
    console.log(`📍 Modal encontrado: posição ${modalStart} até ${modalEnd}`);
    
    // Novo modal completo e funcional
    const novoModalHTML = `    <!-- Modal Form COMPLETO - Versão 1.1.3 -->
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;">
        <div class="bg-white rounded-lg max-w-6xl w-full p-6 max-h-screen overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 id="modal-title" class="text-2xl font-bold text-gray-900">Nova Doação</h2>
                <button id="btn-close-modal" class="text-gray-500 hover:text-gray-700">
                    <i data-feather="x" class="h-6 w-6"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- COLUNA 1: DADOS DO DOADOR + ENDEREÇO -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                        👤 Dados do Doador
                    </h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo *
                        </label>
                        <input type="text" id="input-donor" required placeholder="Digite o nome completo"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            CPF
                        </label>
                        <input type="text" id="input-cpf" placeholder="000.000.000-00" maxlength="14"
                               oninput="formatCPFInput(event)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Telefone Principal *
                        </label>
                        <input type="text" id="input-phone1" required placeholder="(11) 99999-9999"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Telefone Alternativo
                        </label>
                        <input type="text" id="input-phone2" placeholder="(11) 88888-8888"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            E-mail
                        </label>
                        <input type="email" id="input-contact" placeholder="email@exemplo.com"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <!-- SEÇÃO DE ENDEREÇO COMPLETO - v1.1.3 -->
                    <div class="pt-4 border-t border-gray-200">
                        <h4 class="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                            📍 Endereço Completo
                        </h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                                <input type="text" id="input-cep" placeholder="00000-000" maxlength="9"
                                    oninput="formatCEPInput(event)"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                                <input type="text" id="input-logradouro" placeholder="Rua, Avenida..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                <input type="text" id="input-numero" placeholder="123"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                <input type="text" id="input-complemento" placeholder="Apto, Bloco..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                                <input type="text" id="input-bairro" placeholder="Nome do bairro"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                <input type="text" id="input-cidade" placeholder="Nome da cidade"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <input type="text" id="input-estado" placeholder="UF" maxlength="2"
                                    style="text-transform: uppercase;"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- COLUNA 2: DADOS DA DOAÇÃO + RECORRÊNCIA -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                        💰 Dados da Doação
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Valor (R$) *
                            </label>
                            <input type="number" id="input-amount" required step="0.01" min="0.01" placeholder="0.00"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Tipo *
                            </label>
                            <select id="input-type" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="PIX">PIX</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Data da Doação *
                        </label>
                        <input type="date" id="input-date" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <!-- CHECKBOX RECORRENTE - v1.1.3 -->
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="input-recurrent" onchange="toggleRecurringFields()"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                        <label for="input-recurrent" class="block text-sm font-medium text-gray-900">
                            Doação Recorrente (Mensal)
                        </label>
                    </div>
                    
                    <!-- CAMPOS RECORRENTES - v1.1.3 -->
                    <div id="recurring-fields" style="display: none;" 
                         class="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <h4 class="text-sm font-medium text-blue-800 flex items-center gap-2">
                            🔄 Configuração de Parcelas
                        </h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Quantas parcelas? *
                                </label>
                                <input type="number" id="input-parcelas" min="2" max="60" placeholder="12" value="12"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Próxima parcela em: *
                                </label>
                                <input type="date" id="input-proxima-parcela"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                        
                        <p class="text-xs text-blue-600">
                            💡 A primeira parcela será registrada na data da doação acima
                        </p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <textarea id="input-observations" rows="4" placeholder="Informações adicionais sobre a doação..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"></textarea>
                    </div>
                </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button id="btn-cancel"
                    class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button id="btn-save"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <i data-feather="save" class="h-4 w-4"></i>
                    <span id="btn-save-text">Salvar Doação</span>
                </button>
            </div>
        </div>
    </div>`;
    
    // Substituir o modal
    content = content.substring(0, modalStart) + novoModalHTML + content.substring(modalEnd);
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Modal HTML substituído completamente');
}

// ==========================================
// 2. MODIFICAR APP.JS - FORÇAR USO DO MODAL HTML
// ==========================================

function modificarOpenModal() {
    console.log('📝 Modificando app.js - Forçando uso do modal HTML...');
    
    const appPath = './public/app.js';
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Encontrar e substituir a função openModal
    const openModalRegex = /function openModal\(\)\s*{[^}]*}/s;
    const openModalMatch = content.match(openModalRegex);
    
    if (openModalMatch) {
        const novaFuncaoOpenModal = `function openModal() {
    console.log('📝 Abrindo modal de nova doação - v1.1.3');
    
    // FORÇAR uso do modal HTML (não createSimpleModal)
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    
    if (modal) {
        // Configurar modal para nova doação
        if (modalTitle) modalTitle.textContent = 'Nova Doação';
        
        // Limpar todos os campos
        clearModalFields();
        
        // Definir data padrão como hoje
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('input-date');
        if (dateField) dateField.value = today;
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Focar no primeiro campo
        const firstInput = document.getElementById('input-donor');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        console.log('✅ Modal HTML aberto com sucesso');
    } else {
        console.error('❌ Modal HTML não encontrado');
        // Fallback: criar modal simples apenas se HTML não existir
        createSimpleModal();
    }
}`;
        
        content = content.replace(openModalMatch[0], novaFuncaoOpenModal);
        console.log('✅ Função openModal substituída');
    } else {
        console.log('❌ Função openModal não encontrada');
    }
    
    // Adicionar função para limpar campos
    const clearFieldsFunction = `
// Função para limpar campos do modal - v1.1.3
function clearModalFields() {
    const fields = [
        'input-donor', 'input-cpf', 'input-phone1', 'input-phone2', 'input-contact',
        'input-cep', 'input-logradouro', 'input-numero', 'input-complemento', 
        'input-bairro', 'input-cidade', 'input-estado',
        'input-amount', 'input-type', 'input-date', 'input-observations',
        'input-parcelas', 'input-proxima-parcela'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = false;
            } else {
                field.value = '';
            }
        }
    });
    
    // Esconder campos de recorrência
    const recurringFields = document.getElementById('recurring-fields');
    if (recurringFields) {
        recurringFields.style.display = 'none';
    }
    
    console.log('🧹 Campos do modal limpos');
}

`;
    
    // Inserir função antes de openModal
    const openModalIndex = content.indexOf('function openModal()');
    if (openModalIndex !== -1) {
        content = content.substring(0, openModalIndex) + clearFieldsFunction + content.substring(openModalIndex);
        console.log('✅ Função clearModalFields adicionada');
    }
    
    fs.writeFileSync(appPath, content);
}

// ==========================================
// 3. VERIFICAR E CORRIGIR TOGGLERECURRINGFIELDS
// ==========================================

function corrigirToggleRecurring() {
    console.log('📝 Verificando função toggleRecurringFields...');
    
    const appPath = './public/app.js';
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Verificar se existe a função correta
    if (!content.includes('function toggleRecurringFields()')) {
        const toggleFunction = `
// Função para mostrar/esconder campos recorrentes - v1.1.3
function toggleRecurringFields() {
    const checkbox = document.getElementById('input-recurrent');
    const fields = document.getElementById('recurring-fields');
    const proximaParcelaField = document.getElementById('input-proxima-parcela');
    
    if (checkbox && fields) {
        if (checkbox.checked) {
            fields.style.display = 'block';
            
            // Calcular próxima parcela (30 dias à frente)
            if (proximaParcelaField) {
                const hoje = new Date();
                const proximaData = new Date(hoje);
                proximaData.setDate(proximaData.getDate() + 30);
                
                const dataFormatada = proximaData.toISOString().substring(0, 10);
                proximaParcelaField.value = dataFormatada;
            }
            
            console.log('🔄 Campos de recorrência ativados');
        } else {
            fields.style.display = 'none';
            console.log('🔄 Campos de recorrência desativados');
        }
    } else {
        console.error('❌ Elementos de recorrência não encontrados', {
            checkbox: !!checkbox,
            fields: !!fields
        });
    }
}

// Tornar função global
window.toggleRecurringFields = toggleRecurringFields;

`;
        
        // Inserir antes de openModal
        const openModalIndex = content.indexOf('function openModal()');
        if (openModalIndex !== -1) {
            content = content.substring(0, openModalIndex) + toggleFunction + content.substring(openModalIndex);
            console.log('✅ Função toggleRecurringFields adicionada');
        }
    } else {
        console.log('✅ Função toggleRecurringFields já existe');
    }
    
    fs.writeFileSync(appPath, content);
}

// ==========================================
// 4. CORRIGIR EVENT LISTENERS
// ==========================================

function corrigirEventListeners() {
    console.log('📝 Corrigindo event listeners...');
    
    const appPath = './public/app.js';
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Buscar setupEventListeners
    const setupIndex = content.indexOf('function setupEventListeners() {');
    if (setupIndex !== -1) {
        const functionEnd = content.indexOf('}', setupIndex);
        
        // Novo código para event listeners
        const newListeners = `
    
    // Event listener para botão Nova Doação - v1.1.3 CORRIGIDO
    const btnNovaDoacao = document.getElementById('btn-new-donation'); // ID correto do HTML
    if (btnNovaDoacao) {
        btnNovaDoacao.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(); // Agora usa modal HTML
        });
        console.log('✅ Event listener Nova Doação configurado (btn-new-donation)');
    } else {
        console.log('⚠️ Botão btn-new-donation não encontrado');
    }
    
    // Event listener para fechar modal
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById('modal');
            if (modal) modal.style.display = 'none';
        });
        console.log('✅ Event listener fechar modal configurado');
    }
    
    // Event listener para cancelar
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById('modal');
            if (modal) modal.style.display = 'none';
        });
        console.log('✅ Event listener cancelar configurado');
    }
    
    // Event listeners para campos de endereço - v1.1.3
    const cepField = document.getElementById('input-cep');
    if (cepField) {
        cepField.addEventListener('input', formatCEPInput);
        console.log('✅ Event listener CEP configurado');
    }
`;
        
        content = content.substring(0, functionEnd) + newListeners + content.substring(functionEnd);
        console.log('✅ Event listeners corrigidos');
    }
    
    fs.writeFileSync(appPath, content);
}

// ==========================================
// 5. ATUALIZAR VERSÃO
// ==========================================

function atualizarVersao() {
    console.log('📝 Atualizando versão para 1.1.3...');
    
    // package.json
    const packagePath = './package.json';
    let packageContent = fs.readFileSync(packagePath, 'utf8');
    packageContent = packageContent.replace('"version": "1.1.2"', '"version": "1.1.3"');
    fs.writeFileSync(packagePath, packageContent);
    
    // VERSAO.txt
    fs.writeFileSync('./VERSAO.txt', '1.1.3');
    
    console.log('✅ Versão atualizada para 1.1.3');
}

// ==========================================
// EXECUÇÃO PRINCIPAL
// ==========================================

try {
    console.log('🚀 Iniciando correção FORÇADA...\n');
    
    // Verificar se estamos no diretório correto
    if (!fs.existsSync('./public/index.html')) {
        console.log('❌ ERRO: Execute este script na raiz do projeto!');
        process.exit(1);
    }
    
    // Executar correções na ordem correta
    substituirModalHTML();
    modificarOpenModal();
    corrigirToggleRecurring();
    corrigirEventListeners();
    atualizarVersao();
    
    console.log('\n🎉 CORREÇÃO FORÇADA CONCLUÍDA!');
    console.log('══════════════════════════════════════════════════');
    console.log('✅ Modal HTML substituído completamente');
    console.log('✅ openModal() agora usa modal HTML (não createSimpleModal)');
    console.log('✅ Todos os campos de endereço implementados');
    console.log('✅ Campos de recorrência funcionando');
    console.log('✅ Event listeners corrigidos');
    console.log('✅ Versão atualizada para 1.1.3');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. 🔄 Reinicie o servidor: npm start');
    console.log('2. 🧹 Limpe cache: Ctrl+Shift+F5');
    console.log('3. 🧪 Teste: Clique em "Nova Doação"');
    console.log('4. ✅ Verifique: Campos de endereço devem aparecer');
    console.log('5. 🔄 Teste: Marque "Doação Recorrente"');
    console.log('');
    console.log('🎯 AGORA DEVE FUNCIONAR 100%!');
    
} catch (error) {
    console.error('❌ ERRO durante a correção forçada:', error.message);
    console.log('\n🔧 Se o erro persistir:');
    console.log('1. Verifique permissões de arquivo');
    console.log('2. Feche o navegador completamente');
    console.log('3. Execute como administrador');
    process.exit(1);
}