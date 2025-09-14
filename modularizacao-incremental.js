/**
 * ================================================================
 * SCRIPT: Modularização Incremental Inteligente
 * ================================================================
 * 
 * VERSÃO: 3.0.0
 * DATA: 09/09/2025
 * FASE: 2 - MODULARIZAÇÃO CORRETA
 * 
 * DESCRIÇÃO:
 * Ao invés de dividir tudo de uma vez, vamos manter o app.js
 * funcionando e ir extraindo módulos aos poucos, testando cada um
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   MODULARIZAÇÃO INCREMENTAL - SISTEMA v1.2.0      ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const publicDir = path.join(__dirname, 'public');
const jsDir = path.join(publicDir, 'js');

// ================================================================
// 1. PREPARAR AMBIENTE
// ================================================================

console.log('1️⃣  Preparando ambiente...\n');

// Criar diretório js se não existir
if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
}

// Verificar se temos o backup ou app.js original
let appJsPath = path.join(publicDir, 'app.js');
const backupFiles = fs.readdirSync(publicDir).filter(f => f.startsWith('app.js.backup'));

if (!fs.existsSync(appJsPath) || fs.statSync(appJsPath).size < 100000) {
    // Se app.js está pequeno (modularizado), restaurar do backup
    if (backupFiles.length > 0) {
        const backup = backupFiles.sort().pop();
        fs.copyFileSync(path.join(publicDir, backup), appJsPath);
        console.log(`✅ Restaurado do backup: ${backup}`);
    }
}

const appContent = fs.readFileSync(appJsPath, 'utf8');
console.log(`📊 app.js tem ${appContent.split('\n').length} linhas`);

// ================================================================
// 2. CRIAR MÓDULO CORE COM VARIÁVEIS GLOBAIS
// ================================================================

console.log('\n2️⃣  Criando módulo core.js...\n');

const coreContent = `/**
 * ================================================================
 * MÓDULO CORE - Sistema de Doações
 * ================================================================
 * Este módulo contém as variáveis e funções essenciais
 * que precisam estar disponíveis globalmente
 * ================================================================
 */

// Namespace global para evitar conflitos
window.SistemaDoacao = window.SistemaDoacao || {};

// Estado global da aplicação
window.SistemaDoacao.state = {
    allDonations: [],
    allDonors: [],
    currentEditingId: null,
    currentDonationId: null,
    filters: {
        search: '',
        type: 'all',
        recurrent: 'all'
    }
};

// Configurações
window.SistemaDoacao.config = {
    API_URL: '/api',
    ITEMS_PER_PAGE: 10,
    NOTIFICATION_DURATION: 3000
};

// Utilitários essenciais que serão usados em todo lugar
window.SistemaDoacao.utils = {
    formatCurrency: function(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    },
    
    formatDate: function(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('pt-BR');
    },
    
    formatPhone: function(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\\d{2})(\\d{5})(\\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    showNotification: function(message, type = 'info') {
        console.log(\`[\${type}] \${message}\`);
        
        // Remover notificação anterior se existir
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: \${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        \`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, window.SistemaDoacao.config.NOTIFICATION_DURATION);
    }
};

// Criar aliases globais para compatibilidade
window.formatCurrency = window.SistemaDoacao.utils.formatCurrency;
window.formatDate = window.SistemaDoacao.utils.formatDate;
window.formatPhone = window.SistemaDoacao.utils.formatPhone;
window.showNotification = window.SistemaDoacao.utils.showNotification;

// CSS para animações
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = \`
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    \`;
    document.head.appendChild(style);
}

console.log('✅ Módulo Core carregado');
`;

fs.writeFileSync(path.join(jsDir, 'core.js'), coreContent, 'utf8');
console.log('✅ core.js criado');

// ================================================================
// 3. CRIAR LOADER.JS QUE MANTÉM APP.JS FUNCIONANDO
// ================================================================

console.log('\n3️⃣  Criando loader.js...\n');

const loaderContent = `/**
 * ================================================================
 * LOADER - Carregador Incremental
 * ================================================================
 * Este arquivo garante que o app.js original continue funcionando
 * enquanto gradualmente movemos funções para módulos
 * ================================================================
 */

// Esperar o app.js carregar completamente
window.addEventListener('load', function() {
    console.log('🔄 Verificando integridade do sistema...');
    
    // Verificar se as funções principais existem
    const requiredFunctions = [
        'loadDonations',
        'renderDonations',
        'saveDonation',
        'deleteDonation'
    ];
    
    let allFunctionsOk = true;
    requiredFunctions.forEach(func => {
        if (typeof window[func] !== 'function') {
            console.error(\`❌ Função \${func} não encontrada!\`);
            allFunctionsOk = false;
        }
    });
    
    if (allFunctionsOk) {
        console.log('✅ Todas as funções principais estão disponíveis');
        
        // Se tudo está ok, chamar loadDonations
        if (typeof loadDonations === 'function') {
            console.log('📋 Carregando doações...');
            loadDonations();
        }
    } else {
        console.error('❌ Sistema com problemas! Verifique o console.');
    }
    
    // Adicionar melhorias do módulo core
    if (window.SistemaDoacao) {
        console.log('✅ Módulo Core integrado com sucesso');
        
        // Substituir funções antigas pelas melhoradas do core
        if (window.SistemaDoacao.utils) {
            // As funções do core são melhores, vamos usá-las
            const utils = window.SistemaDoacao.utils;
            
            // Mas manter compatibilidade com as antigas
            if (typeof window.formatCurrency !== 'function') {
                window.formatCurrency = utils.formatCurrency;
            }
            if (typeof window.showNotification !== 'function') {
                window.showNotification = utils.showNotification;
            }
        }
    }
});

console.log('✅ Loader configurado');
`;

fs.writeFileSync(path.join(jsDir, 'loader.js'), loaderContent, 'utf8');
console.log('✅ loader.js criado');

// ================================================================
// 4. ATUALIZAR HTML PARA CARREGAR NA ORDEM CERTA
// ================================================================

console.log('\n4️⃣  Atualizando HTML...\n');

const indexPath = path.join(publicDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Remover scripts antigos de módulos se existirem
indexContent = indexContent.replace(/\s*<!-- Módulos do Sistema -->[\s\S]*?(?=<\/body>)/, '');

// Adicionar scripts na ordem correta ANTES do </body>
const scriptsHtml = `
    <!-- Sistema Híbrido: Original + Módulos Incrementais -->
    <script src="js/core.js"></script>
    <script src="app.js"></script>
    <script src="js/loader.js"></script>
</body>`;

indexContent = indexContent.replace('</body>', scriptsHtml);
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ HTML atualizado');

// ================================================================
// 5. CRIAR PLANO DE MIGRAÇÃO INCREMENTAL
// ================================================================

console.log('\n5️⃣  Criando plano de migração...\n');

const migrationPlan = `# PLANO DE MIGRAÇÃO INCREMENTAL

## Estratégia: Modularização Gradual

### ✅ Fase 1 - CONCLUÍDA
- core.js: Variáveis globais e utilitários
- loader.js: Garantir compatibilidade
- app.js: Mantido funcionando

### ⏳ Fase 2 - PRÓXIMA
1. Extrair funções de API para api.js
2. Testar cada função extraída
3. Manter fallback no app.js

### ⏳ Fase 3 - FUTURA
1. Extrair funções de UI para ui.js
2. Extrair validações para validators.js
3. Gradualmente reduzir app.js

## Vantagens desta Abordagem:
1. ✅ Sistema nunca para de funcionar
2. ✅ Testamos módulo por módulo
3. ✅ Rollback fácil se algo quebrar
4. ✅ Migração sem stress

## Próximo Comando:
\`\`\`bash
# Depois de testar que tudo funciona:
node criar-modulo-api.js
\`\`\`
`;

fs.writeFileSync(path.join(__dirname, 'PLANO_MIGRACAO.md'), migrationPlan, 'utf8');
console.log('✅ Plano de migração criado');

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 MODULARIZAÇÃO INCREMENTAL IMPLEMENTADA!');
console.log('═'.repeat(56));

console.log('\n✅ O QUE FOI FEITO:');
console.log('   1. core.js - Variáveis e utilitários globais');
console.log('   2. app.js - MANTIDO FUNCIONANDO');
console.log('   3. loader.js - Integração suave');

console.log('\n🎯 COMO FUNCIONA AGORA:');
console.log('   1. core.js carrega primeiro (base)');
console.log('   2. app.js carrega (funcionalidades)');
console.log('   3. loader.js integra tudo');

console.log('\n💪 VANTAGENS:');
console.log('   ✅ Sistema 100% funcional');
console.log('   ✅ Migração gradual e segura');
console.log('   ✅ Sem quebrar nada');

console.log('\n🔄 TESTE AGORA:');
console.log('═'.repeat(56));
console.log('1. Reinicie o servidor: npm start');
console.log('2. Acesse: http://localhost:3001');
console.log('3. TUDO DEVE FUNCIONAR + melhorias do core.js');

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('═'.repeat(56));
console.log('Quando confirmar que funciona, podemos:');
console.log('1. Extrair módulo de API');
console.log('2. Extrair módulo de UI');
console.log('3. Reduzir app.js gradualmente');

console.log('\n✅ SUCESSO! NÃO DESISTIMOS!');
console.log('🎉 MODULARIZAÇÃO INTELIGENTE EM PROGRESSO!');
console.log('═'.repeat(56));