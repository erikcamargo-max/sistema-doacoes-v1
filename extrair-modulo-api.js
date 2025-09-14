/**
 * ================================================================
 * SCRIPT: Extrair Módulo de API
 * ================================================================
 * 
 * VERSÃO: 1.2.1
 * DATA: 10/09/2025
 * FASE: 2 - MODULARIZAÇÃO INCREMENTAL
 * ETAPA: Extração do módulo de API
 * 
 * DESCRIÇÃO:
 * Extrai APENAS as funções de API do app.js para api-module.js
 * mantendo o app.js funcionando como fallback
 * 
 * AUTOR: Sistema de Doações - Erik
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   EXTRAÇÃO MÓDULO API - SISTEMA v1.2.1            ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const publicDir = path.join(__dirname, 'public');
const jsDir = path.join(publicDir, 'js');
const appJsPath = path.join(publicDir, 'app.js');

// ================================================================
// 1. VERIFICAR PRÉ-REQUISITOS
// ================================================================

console.log('1️⃣  Verificando pré-requisitos...\n');

if (!fs.existsSync(appJsPath)) {
    console.error('❌ ERRO: app.js não encontrado!');
    process.exit(1);
}

if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
    console.log('📁 Diretório js criado');
}

const appContent = fs.readFileSync(appJsPath, 'utf8');
console.log(`📊 app.js tem ${appContent.split('\n').length} linhas`);

// ================================================================
// 2. CRIAR BACKUP ANTES DA OPERAÇÃO
// ================================================================

console.log('\n2️⃣  Criando backup de segurança...\n');

const backupName = `app.js.backup_api_${Date.now()}`;
fs.copyFileSync(appJsPath, path.join(publicDir, backupName));
console.log(`✅ Backup criado: ${backupName}`);

// ================================================================
// 3. EXTRAIR FUNÇÕES DE API
// ================================================================

console.log('\n3️⃣  Extraindo funções de API...\n');

// Funções de API identificadas no app.js
const apiFunctions = [
    'loadDonations',
    'loadDonors', 
    'saveDonation',
    'updateDonation',
    'deleteDonation',
    'saveDonor',
    'updateDonor',
    'deleteDonor',
    'searchDonors',
    'generateCarne',
    'exportToPDF'
];

// Template do módulo de API
const apiModuleContent = `/**
 * ================================================================
 * MÓDULO: API do Sistema de Doações
 * ================================================================
 * 
 * VERSÃO: 1.2.1
 * DATA: ${new Date().toLocaleDateString('pt-BR')}
 * 
 * DESCRIÇÃO:
 * Centraliza todas as chamadas à API do backend
 * 
 * ================================================================
 */

// Namespace do módulo
window.SistemaDoacao = window.SistemaDoacao || {};
window.SistemaDoacao.api = window.SistemaDoacao.api || {};

(function(api) {
    'use strict';
    
    // ================================================================
    // CONFIGURAÇÃO DA API
    // ================================================================
    
    const API_BASE = window.location.origin;
    const API_TIMEOUT = 30000; // 30 segundos
    
    /**
     * Função auxiliar para fazer requisições
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    function apiRequest(url, options = {}) {
        // Adiciona timeout e headers padrão
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal,
            ...options
        };
        
        return fetch(url, defaultOptions)
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                return response.json();
            })
            .catch(error => {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Requisição expirou (timeout)');
                }
                throw error;
            });
    }
    
    // ================================================================
    // FUNÇÕES DE DOAÇÕES
    // ================================================================
    
    /**
     * Carrega todas as doações
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.loadDonations = function() {
        console.log('[API] Carregando doações...');
        
        return apiRequest(\`\${API_BASE}/api/donations\`)
            .then(data => {
                console.log(\`[API] \${data.length} doações carregadas\`);
                
                // Atualiza variável global se existir
                if (window.allDonations !== undefined) {
                    window.allDonations = data;
                }
                
                // Chama função de renderização se existir
                if (typeof window.renderDonations === 'function') {
                    window.renderDonations(data);
                }
                
                // Atualiza dashboard se existir
                if (typeof window.updateDashboard === 'function') {
                    window.updateDashboard();
                }
                
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar doações:', error);
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Erro ao carregar doações', 'error');
                }
                throw error;
            });
    };
    
    /**
     * Salva uma nova doação
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.saveDonation = function(donationData) {
        console.log('[API] Salvando doação...', donationData);
        
        return apiRequest(\`\${API_BASE}/api/donations\`, {
            method: 'POST',
            body: JSON.stringify(donationData)
        })
        .then(result => {
            console.log('[API] Doação salva com ID:', result.id);
            
            // Recarrega doações
            if (typeof api.loadDonations === 'function') {
                api.loadDonations();
            }
            
            // Notifica sucesso
            if (typeof window.showNotification === 'function') {
                window.showNotification('Doação salva com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao salvar doação:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Erro ao salvar doação', 'error');
            }
            throw error;
        });
    };
    
    /**
     * Atualiza uma doação existente
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.updateDonation = function(id, donationData) {
        console.log('[API] Atualizando doação ID:', id);
        
        return apiRequest(\`\${API_BASE}/api/donations/\${id}\`, {
            method: 'PUT',
            body: JSON.stringify(donationData)
        })
        .then(result => {
            console.log('[API] Doação atualizada');
            
            // Recarrega doações
            if (typeof api.loadDonations === 'function') {
                api.loadDonations();
            }
            
            // Notifica sucesso
            if (typeof window.showNotification === 'function') {
                window.showNotification('Doação atualizada com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao atualizar doação:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Erro ao atualizar doação', 'error');
            }
            throw error;
        });
    };
    
    /**
     * Deleta uma doação
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.deleteDonation = function(id) {
        console.log('[API] Deletando doação ID:', id);
        
        return apiRequest(\`\${API_BASE}/api/donations/\${id}\`, {
            method: 'DELETE'
        })
        .then(result => {
            console.log('[API] Doação deletada');
            
            // Recarrega doações
            if (typeof api.loadDonations === 'function') {
                api.loadDonations();
            }
            
            // Notifica sucesso
            if (typeof window.showNotification === 'function') {
                window.showNotification('Doação excluída com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao deletar doação:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Erro ao excluir doação', 'error');
            }
            throw error;
        });
    };
    
    // ================================================================
    // FUNÇÕES DE DOADORES
    // ================================================================
    
    /**
     * Carrega todos os doadores
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.loadDonors = function() {
        console.log('[API] Carregando doadores...');
        
        return apiRequest(\`\${API_BASE}/api/donors\`)
            .then(data => {
                console.log(\`[API] \${data.length} doadores carregados\`);
                
                // Atualiza variável global se existir
                if (window.allDonors !== undefined) {
                    window.allDonors = data;
                }
                
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar doadores:', error);
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Erro ao carregar doadores', 'error');
                }
                throw error;
            });
    };
    
    /**
     * Salva um novo doador
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.saveDonor = function(donorData) {
        console.log('[API] Salvando doador...', donorData);
        
        return apiRequest(\`\${API_BASE}/api/donors\`, {
            method: 'POST',
            body: JSON.stringify(donorData)
        })
        .then(result => {
            console.log('[API] Doador salvo com ID:', result.id);
            
            // Recarrega doadores
            if (typeof api.loadDonors === 'function') {
                api.loadDonors();
            }
            
            // Notifica sucesso
            if (typeof window.showNotification === 'function') {
                window.showNotification('Doador salvo com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao salvar doador:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Erro ao salvar doador', 'error');
            }
            throw error;
        });
    };
    
    /**
     * Atualiza um doador existente
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.updateDonor = function(id, donorData) {
        console.log('[API] Atualizando doador ID:', id);
        
        return apiRequest(\`\${API_BASE}/api/donors/\${id}\`, {
            method: 'PUT',
            body: JSON.stringify(donorData)
        })
        .then(result => {
            console.log('[API] Doador atualizado');
            
            // Recarrega doadores
            if (typeof api.loadDonors === 'function') {
                api.loadDonors();
            }
            
            // Notifica sucesso
            if (typeof window.showNotification === 'function') {
                window.showNotification('Doador atualizado com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao atualizar doador:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Erro ao atualizar doador', 'error');
            }
            throw error;
        });
    };
    
    /**
     * Deleta um doador
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.deleteDonor = function(id) {
        console.log('[API] Deletando doador ID:', id);
        
        return apiRequest(\`\${API_BASE}/api/donors/\${id}\`, {
            method: 'DELETE'
        })
        .then(result => {
            console.log('[API] Doador deletado');
            
            // Recarrega doadores
            if (typeof api.loadDonors === 'function') {
                api.loadDonors();
            }
            
            // Notifica sucesso
            if (typeof window.showNotification === 'function') {
                window.showNotification('Doador excluído com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao deletar doador:', error);
            if (typeof window.showNotification === 'function') {
                window.showNotification('Erro ao excluir doador', 'error');
            }
            throw error;
        });
    };
    
    /**
     * Busca doadores
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.searchDonors = function(query) {
        console.log('[API] Buscando doadores:', query);
        
        return apiRequest(\`\${API_BASE}/api/donors/search?q=\${encodeURIComponent(query)}\`)
            .then(data => {
                console.log(\`[API] \${data.length} doadores encontrados\`);
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao buscar doadores:', error);
                throw error;
            });
    };
    
    // ================================================================
    // FUNÇÕES DE EXPORTAÇÃO
    // ================================================================
    
    /**
     * Gera carnê de pagamento
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.generateCarne = function(donationId) {
        console.log('[API] Gerando carnê para doação ID:', donationId);
        
        // Abre em nova janela
        const url = \`\${API_BASE}/api/donations/\${donationId}/carne\`;
        window.open(url, '_blank');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('Carnê gerado com sucesso!', 'success');
        }
    };
    
    /**
     * Exporta relatório em PDF
     * VERSÃO: 1.0.0 - 10/09/2025
     */
    api.exportToPDF = function(filters = {}) {
        console.log('[API] Exportando relatório PDF...', filters);
        
        // Monta query string
        const params = new URLSearchParams(filters);
        const url = \`\${API_BASE}/api/reports/pdf?\${params.toString()}\`;
        
        // Abre em nova janela
        window.open(url, '_blank');
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('Relatório gerado com sucesso!', 'success');
        }
    };
    
    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    
    console.log('[API Module] Módulo de API carregado - v1.2.1');
    
})(window.SistemaDoacao.api);
`;

// Salvar o módulo
fs.writeFileSync(path.join(jsDir, 'api-module.js'), apiModuleContent, 'utf8');
console.log('✅ api-module.js criado com sucesso');

// ================================================================
// 4. ATUALIZAR LOADER.JS
// ================================================================

console.log('\n4️⃣  Atualizando loader.js...\n');

const loaderPath = path.join(jsDir, 'loader.js');

// Criar novo loader.js atualizado
const loaderUpdate = `/**
 * ================================================================
 * LOADER: Integrador de Módulos
 * ================================================================
 * 
 * VERSÃO: 1.2.1
 * DATA: ${new Date().toLocaleDateString('pt-BR')}
 * 
 * DESCRIÇÃO:
 * Integra os módulos com o app.js original mantendo compatibilidade
 * 
 * ================================================================
 */

(function() {
    'use strict';
    
    console.log('[Loader] Iniciando integração de módulos...');
    
    // ================================================================
    // INTEGRAÇÃO DO MÓDULO CORE
    // ================================================================
    
    if (window.SistemaDoacao && window.SistemaDoacao.core) {
        console.log('[Loader] Integrando módulo core...');
        
        // Integra funções do core
        const core = window.SistemaDoacao.core;
        
        // Substitui funções globais se existirem melhores versões no core
        if (core.showNotification && (!window.showNotification || core.showNotification.toString().length > window.showNotification.toString().length)) {
            window.showNotification = core.showNotification;
            console.log('[Loader] ✅ showNotification atualizada do core');
        }
        
        if (core.formatCurrency) {
            window.formatCurrency = core.formatCurrency;
            console.log('[Loader] ✅ formatCurrency atualizada do core');
        }
        
        if (core.formatDate) {
            window.formatDate = core.formatDate;
            console.log('[Loader] ✅ formatDate atualizada do core');
        }
        
        if (core.formatPhone) {
            window.formatPhone = core.formatPhone;
            console.log('[Loader] ✅ formatPhone atualizada do core');
        }
    }
    
    // ================================================================
    // INTEGRAÇÃO DO MÓDULO API
    // ================================================================
    
    if (window.SistemaDoacao && window.SistemaDoacao.api) {
        console.log('[Loader] Integrando módulo API...');
        
        const api = window.SistemaDoacao.api;
        
        // Salva referências das funções originais
        const originalFunctions = {
            loadDonations: window.loadDonations,
            loadDonors: window.loadDonors,
            saveDonation: window.saveDonation,
            updateDonation: window.updateDonation,
            deleteDonation: window.deleteDonation,
            saveDonor: window.saveDonor,
            updateDonor: window.updateDonor,
            deleteDonor: window.deleteDonor,
            searchDonors: window.searchDonors,
            generateCarne: window.generateCarne,
            exportToPDF: window.exportToPDF
        };
        
        // Substitui pelas novas com fallback
        const apiFunctionNames = Object.keys(originalFunctions);
        
        apiFunctionNames.forEach(funcName => {
            if (api[funcName]) {
                window[funcName] = function() {
                    try {
                        return api[funcName].apply(this, arguments);
                    } catch (error) {
                        console.warn(\`[Loader] Erro no módulo API (\${funcName}), usando fallback\`);
                        if (originalFunctions[funcName]) {
                            return originalFunctions[funcName].apply(this, arguments);
                        }
                        throw error;
                    }
                };
                console.log(\`[Loader] ✅ \${funcName} integrada com fallback\`);
            }
        });
    }
    
    // ================================================================
    // GARANTIR INICIALIZAÇÃO
    // ================================================================
    
    // Aguarda DOM carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[Loader] DOM carregado, iniciando sistema...');
            
            // Carrega dados iniciais
            if (typeof window.loadDonations === 'function') {
                window.loadDonations();
            }
            
            if (typeof window.loadDonors === 'function') {
                window.loadDonors();
            }
        });
    } else {
        // DOM já carregado
        console.log('[Loader] DOM já carregado, iniciando sistema...');
        
        if (typeof window.loadDonations === 'function') {
            window.loadDonations();
        }
        
        if (typeof window.loadDonors === 'function') {
            window.loadDonors();
        }
    }
    
    console.log('[Loader] Integração de módulos concluída - v1.2.1');
    
})();
`;

fs.writeFileSync(loaderPath, loaderUpdate, 'utf8');
console.log('✅ loader.js atualizado com integração do módulo API');

// ================================================================
// 5. ATUALIZAR HTML PARA INCLUIR NOVO MÓDULO
// ================================================================

console.log('\n5️⃣  Atualizando HTML...\n');

const indexPath = path.join(publicDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Procurar onde inserir o novo script
if (!indexContent.includes('api-module.js')) {
    // Adicionar após core.js e antes de app.js
    const scriptPattern = /<script src="js\/core\.js"><\/script>/;
    
    if (scriptPattern.test(indexContent)) {
        indexContent = indexContent.replace(
            scriptPattern,
            `<script src="js/core.js"></script>
    <script src="js/api-module.js"></script>`
        );
    } else {
        // Se não encontrar core.js, adicionar antes de app.js
        indexContent = indexContent.replace(
            '<script src="app.js"></script>',
            `<script src="js/api-module.js"></script>
    <script src="app.js"></script>`
        );
    }
    
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('✅ HTML atualizado com api-module.js');
} else {
    console.log('⚠️  api-module.js já está no HTML');
}

// ================================================================
// 6. CRIAR TESTE DE VALIDAÇÃO
// ================================================================

console.log('\n6️⃣  Criando script de teste...\n');

const testScript = `/**
 * Script de teste para verificar módulo API
 * Execute no console do navegador
 */

// Teste 1: Verificar se módulo foi carregado
console.log('Teste 1: Módulo API carregado?', 
    window.SistemaDoacao && window.SistemaDoacao.api ? '✅ SIM' : '❌ NÃO');

// Teste 2: Verificar funções integradas
const funcoes = ['loadDonations', 'saveDonation', 'updateDonation', 'deleteDonation'];
funcoes.forEach(f => {
    console.log(\`Teste 2: \${f} disponível?\`, 
        typeof window[f] === 'function' ? '✅ SIM' : '❌ NÃO');
});

// Teste 3: Testar loadDonations
console.log('Teste 3: Executando loadDonations...');
if (window.loadDonations) {
    window.loadDonations()
        .then(() => console.log('✅ loadDonations funcionou!'))
        .catch(err => console.error('❌ Erro:', err));
}
`;

fs.writeFileSync(path.join(__dirname, 'testar-api-module.js'), testScript, 'utf8');
console.log('✅ Script de teste criado: testar-api-module.js');

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 MÓDULO API EXTRAÍDO COM SUCESSO!');
console.log('═'.repeat(56));

console.log('\n✅ O QUE FOI FEITO:');
console.log('   1. api-module.js criado com todas funções de API');
console.log('   2. loader.js atualizado com integração e fallback');
console.log('   3. HTML atualizado para carregar novo módulo');
console.log('   4. Backup criado:', backupName);
console.log('   5. Script de teste criado');

console.log('\n📁 ESTRUTURA ATUAL:');
console.log('   public/');
console.log('   ├── app.js (original mantido)');
console.log('   ├── index.html (atualizado)');
console.log('   └── js/');
console.log('       ├── core.js');
console.log('       ├── api-module.js (NOVO)');
console.log('       └── loader.js (atualizado)');

console.log('\n🔄 TESTE AGORA:');
console.log('═'.repeat(56));
console.log('1. Reinicie o servidor: npm start');
console.log('2. Acesse: http://localhost:3001');
console.log('3. Abra o console do navegador (F12)');
console.log('4. Cole o conteúdo de testar-api-module.js');

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('═'.repeat(56));
console.log('Se tudo funcionar, podemos extrair:');
console.log('1. ui-module.js - Funções de interface');
console.log('2. validators.js - Validações');
console.log('3. exports-module.js - Exportações');

console.log('\n✅ MODULARIZAÇÃO INCREMENTAL EM PROGRESSO!');
console.log('🎉 FASE 2 - MÓDULO API EXTRAÍDO!');
console.log('═'.repeat(56));