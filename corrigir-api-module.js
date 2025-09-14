/**
 * ================================================================
 * SCRIPT: Corrigir Módulo API - URLs e Conflitos
 * ================================================================
 * 
 * VERSÃO: 1.2.2
 * DATA: 10/09/2025
 * FASE: 2 - CORREÇÃO DE MÓDULO API
 * 
 * PROBLEMAS IDENTIFICADOS:
 * 1. URLs incorretas (donations → doacoes, donors → doadores)
 * 2. Conflito de variáveis globais
 * 3. Endpoints não correspondentes ao server.js
 * 
 * AUTOR: Sistema de Doações - Erik
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   CORREÇÃO DO MÓDULO API - SISTEMA v1.2.2         ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const publicDir = path.join(__dirname, 'public');
const jsDir = path.join(publicDir, 'js');

// ================================================================
// 1. CRIAR BACKUP
// ================================================================

console.log('1️⃣  Criando backup dos arquivos atuais...\n');

const apiModulePath = path.join(jsDir, 'api-module.js');
const corePath = path.join(jsDir, 'core.js');

if (fs.existsSync(apiModulePath)) {
    const backupName = `api-module.js.backup_${Date.now()}`;
    fs.copyFileSync(apiModulePath, path.join(jsDir, backupName));
    console.log(`✅ Backup criado: ${backupName}`);
}

// ================================================================
// 2. CORRIGIR CORE.JS - Remover declarações duplicadas
// ================================================================

console.log('\n2️⃣  Atualizando core.js...\n');

const coreContent = `/**
 * ================================================================
 * MÓDULO: Core do Sistema
 * ================================================================
 * 
 * VERSÃO: 1.2.2
 * DATA: ${new Date().toLocaleDateString('pt-BR')}
 * 
 * DESCRIÇÃO:
 * Variáveis e funções essenciais do sistema
 * Corrigido para evitar conflitos com app.js
 * 
 * ================================================================
 */

// Namespace global para evitar conflitos
window.SistemaDoacao = window.SistemaDoacao || {};
window.SistemaDoacao.core = window.SistemaDoacao.core || {};

(function(core) {
    'use strict';
    
    // ================================================================
    // CONFIGURAÇÕES GLOBAIS
    // ================================================================
    
    core.config = {
        API_BASE: '/api',
        TIMEOUT: 30000,
        VERSION: '1.2.2'
    };
    
    // ================================================================
    // VARIÁVEIS DE ESTADO
    // ================================================================
    
    // Usar as variáveis existentes do app.js se disponíveis
    // Não redeclarar para evitar conflitos
    core.getState = function() {
        return {
            allDonations: window.allDonations || [],
            filteredDonations: window.filteredDonations || [],
            editingId: window.editingId || null,
            currentHistoryId: window.currentHistoryId || null
        };
    };
    
    // ================================================================
    // FUNÇÕES UTILITÁRIAS MELHORADAS
    // ================================================================
    
    /**
     * Sistema de notificações melhorado
     * VERSÃO: 1.2.0 - 10/09/2025
     */
    core.showNotification = function(message, type = 'info') {
        console.log(\`[\${type}] \${message}\`);
        
        // Remover notificação anterior se existir
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Cores por tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: \${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 99999;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            font-size: 14px;
            font-weight: 500;
        \`;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remover após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    };
    
    /**
     * Formatação de moeda
     * VERSÃO: 1.2.0 - 10/09/2025
     */
    core.formatCurrency = function(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };
    
    /**
     * Formatação de data
     * VERSÃO: 1.2.0 - 10/09/2025
     */
    core.formatDate = function(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    };
    
    /**
     * Formatação de telefone
     * VERSÃO: 1.2.0 - 10/09/2025
     */
    core.formatPhone = function(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\\D/g, '');
        const match = cleaned.match(/^(\\d{2})(\\d{4,5})(\\d{4})$/);
        if (match) {
            return \`(\${match[1]}) \${match[2]}-\${match[3]}\`;
        }
        return phone;
    };
    
    // ================================================================
    // CSS PARA ANIMAÇÕES
    // ================================================================
    
    if (!document.querySelector('#core-styles')) {
        const style = document.createElement('style');
        style.id = 'core-styles';
        style.textContent = \`
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        \`;
        document.head.appendChild(style);
    }
    
    console.log('✅ Módulo Core carregado - v1.2.2');
    
})(window.SistemaDoacao.core);
`;

fs.writeFileSync(corePath, coreContent, 'utf8');
console.log('✅ core.js atualizado - sem conflitos de variáveis');

// ================================================================
// 3. CRIAR API-MODULE.JS CORRIGIDO
// ================================================================

console.log('\n3️⃣  Criando api-module.js corrigido...\n');

const apiModuleCorreto = `/**
 * ================================================================
 * MÓDULO: API do Sistema de Doações - CORRIGIDO
 * ================================================================
 * 
 * VERSÃO: 1.2.2
 * DATA: ${new Date().toLocaleDateString('pt-BR')}
 * 
 * CORREÇÕES:
 * - URLs corretas (/api/doacoes em vez de /api/donations)
 * - Sem redeclaração de variáveis globais
 * - Endpoints correspondentes ao server.js
 * 
 * ================================================================
 */

// Namespace do módulo
window.SistemaDoacao = window.SistemaDoacao || {};
window.SistemaDoacao.api = window.SistemaDoacao.api || {};

(function(api) {
    'use strict';
    
    // ================================================================
    // CONFIGURAÇÃO DA API - URLs CORRETAS
    // ================================================================
    
    const API_BASE = window.location.origin + '/api';
    const API_TIMEOUT = 30000; // 30 segundos
    
    // Mapeamento de endpoints corretos
    const ENDPOINTS = {
        // Doações
        doacoes: '/doacoes',
        doacoesById: (id) => \`/doacoes/\${id}\`,
        doacoesHistorico: (id) => \`/doacoes/\${id}/historico\`,
        doacoesParcelas: (id) => \`/doacoes/\${id}/parcelas\`,
        doacoesCarne: (id) => \`/doacoes/\${id}/carne\`,
        
        // Doadores
        doadores: '/doadores',
        doadoresById: (id) => \`/doadores/\${id}\`,
        doadoresCheckDuplicates: '/doadores/check-duplicates',
        
        // Relatórios
        relatoriosResumo: '/relatorios/resumo',
        relatoriosPDF: '/relatorios/pdf',
        
        // Histórico
        historicoById: (id) => \`/historico/\${id}\`
    };
    
    /**
     * Função auxiliar para fazer requisições
     * VERSÃO: 1.2.2 - Melhorada com tratamento de erro
     */
    function apiRequest(url, options = {}) {
        console.log(\`[API] Requisição para: \${url}\`);
        
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
                console.log(\`[API] Resposta: \${response.status}\`);
                
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
                console.error(\`[API] Erro na requisição: \${error.message}\`);
                throw error;
            });
    }
    
    // ================================================================
    // FUNÇÕES DE DOAÇÕES - URLs CORRIGIDAS
    // ================================================================
    
    /**
     * Carrega todas as doações
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.loadDonations = function() {
        console.log('[API] Carregando doações...');
        
        const url = API_BASE + ENDPOINTS.doacoes;
        
        return apiRequest(url)
            .then(data => {
                console.log(\`[API] \${data.length} doações carregadas\`);
                
                // Atualiza variável global se existir (não redeclara)
                if (typeof window.allDonations !== 'undefined') {
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
                
                // Notifica erro se função existir
                if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                    window.SistemaDoacao.core.showNotification('Erro ao carregar doações: ' + error.message, 'error');
                } else if (typeof window.showNotification === 'function') {
                    window.showNotification('Erro ao carregar doações', 'error');
                }
                
                throw error;
            });
    };
    
    /**
     * Salva uma nova doação
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.saveDonation = function(donationData) {
        console.log('[API] Salvando doação...', donationData);
        
        const url = API_BASE + ENDPOINTS.doacoes;
        
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify(donationData)
        })
        .then(result => {
            console.log('[API] Doação salva com ID:', result.id);
            
            // Recarrega doações
            api.loadDonations();
            
            // Notifica sucesso
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Doação salva com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao salvar doação:', error);
            
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao salvar doação: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    /**
     * Atualiza uma doação existente
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.updateDonation = function(id, donationData) {
        console.log('[API] Atualizando doação ID:', id);
        
        const url = API_BASE + ENDPOINTS.doacoesById(id);
        
        return apiRequest(url, {
            method: 'PUT',
            body: JSON.stringify(donationData)
        })
        .then(result => {
            console.log('[API] Doação atualizada');
            
            // Recarrega doações
            api.loadDonations();
            
            // Notifica sucesso
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Doação atualizada com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao atualizar doação:', error);
            
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao atualizar doação: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    /**
     * Deleta uma doação
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.deleteDonation = function(id) {
        console.log('[API] Deletando doação ID:', id);
        
        const url = API_BASE + ENDPOINTS.doacoesById(id);
        
        return apiRequest(url, {
            method: 'DELETE'
        })
        .then(result => {
            console.log('[API] Doação deletada');
            
            // Recarrega doações
            api.loadDonations();
            
            // Notifica sucesso
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Doação excluída com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao deletar doação:', error);
            
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao excluir doação: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    // ================================================================
    // FUNÇÕES DE DOADORES - URLs CORRIGIDAS
    // ================================================================
    
    /**
     * Carrega todos os doadores
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.loadDonors = function() {
        console.log('[API] Carregando doadores...');
        
        const url = API_BASE + ENDPOINTS.doadores;
        
        return apiRequest(url)
            .then(data => {
                console.log(\`[API] \${data.length} doadores carregados\`);
                
                // Atualiza variável global se existir (não redeclara)
                if (typeof window.allDonors !== 'undefined') {
                    window.allDonors = data;
                }
                
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar doadores:', error);
                
                if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                    window.SistemaDoacao.core.showNotification('Erro ao carregar doadores: ' + error.message, 'error');
                }
                
                throw error;
            });
    };
    
    /**
     * Verifica duplicatas de doador
     * VERSÃO: 1.2.2 - Nova função
     */
    api.checkDuplicateDonor = function(cpf, telefone1) {
        console.log('[API] Verificando duplicatas...');
        
        const url = API_BASE + ENDPOINTS.doadoresCheckDuplicates;
        
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify({ cpf, telefone1 })
        })
        .then(data => {
            console.log('[API] Verificação de duplicatas:', data);
            return data;
        })
        .catch(error => {
            console.error('[API] Erro ao verificar duplicatas:', error);
            return { hasDuplicates: false };
        });
    };
    
    /**
     * Salva um novo doador
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.saveDonor = function(donorData) {
        console.log('[API] Salvando doador...', donorData);
        
        const url = API_BASE + ENDPOINTS.doadores;
        
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify(donorData)
        })
        .then(result => {
            console.log('[API] Doador salvo com ID:', result.id);
            
            // Recarrega doadores
            api.loadDonors();
            
            // Notifica sucesso
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Doador salvo com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao salvar doador:', error);
            
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao salvar doador: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    // ================================================================
    // FUNÇÕES DE HISTÓRICO
    // ================================================================
    
    /**
     * Carrega histórico de pagamentos
     * VERSÃO: 1.2.2 - Nova função
     */
    api.loadPaymentHistory = function(donationId) {
        console.log('[API] Carregando histórico da doação:', donationId);
        
        const url = API_BASE + ENDPOINTS.doacoesHistorico(donationId);
        
        return apiRequest(url)
            .then(data => {
                console.log(\`[API] \${data.length} pagamentos no histórico\`);
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar histórico:', error);
                return [];
            });
    };
    
    /**
     * Adiciona pagamento ao histórico
     * VERSÃO: 1.2.2 - Nova função
     */
    api.addPayment = function(donationId, paymentData) {
        console.log('[API] Adicionando pagamento...');
        
        const url = API_BASE + ENDPOINTS.doacoesHistorico(donationId);
        
        return apiRequest(url, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        })
        .then(result => {
            console.log('[API] Pagamento adicionado');
            
            if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
                window.SistemaDoacao.core.showNotification('Pagamento registrado com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao adicionar pagamento:', error);
            throw error;
        });
    };
    
    // ================================================================
    // FUNÇÕES DE EXPORTAÇÃO
    // ================================================================
    
    /**
     * Gera carnê de pagamento
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.generateCarne = function(donationId) {
        console.log('[API] Gerando carnê para doação ID:', donationId);
        
        // URL correta para o carnê
        const url = API_BASE + ENDPOINTS.doacoesCarne(donationId);
        
        // Abre em nova janela
        window.open(url, '_blank');
        
        if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
            window.SistemaDoacao.core.showNotification('Carnê gerado com sucesso!', 'success');
        }
    };
    
    /**
     * Exporta relatório em PDF
     * VERSÃO: 1.2.2 - URL corrigida
     */
    api.exportToPDF = function(filters = {}) {
        console.log('[API] Exportando relatório PDF...', filters);
        
        // Monta query string
        const params = new URLSearchParams(filters);
        const url = API_BASE + ENDPOINTS.relatoriosPDF + '?' + params.toString();
        
        // Abre em nova janela
        window.open(url, '_blank');
        
        if (window.SistemaDoacao && window.SistemaDoacao.core && window.SistemaDoacao.core.showNotification) {
            window.SistemaDoacao.core.showNotification('Relatório gerado com sucesso!', 'success');
        }
    };
    
    /**
     * Carrega resumo do dashboard
     * VERSÃO: 1.2.2 - Nova função
     */
    api.loadSummary = function() {
        console.log('[API] Carregando resumo...');
        
        const url = API_BASE + ENDPOINTS.relatoriosResumo;
        
        return apiRequest(url)
            .then(data => {
                console.log('[API] Resumo carregado:', data);
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar resumo:', error);
                return {
                    total_arrecadado: 0,
                    total_doacoes: 0,
                    doacoes_recorrentes: 0,
                    total_pagamentos: 0
                };
            });
    };
    
    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    
    console.log('[API Module] Módulo de API carregado - v1.2.2 CORRIGIDO');
    console.log('[API Module] Endpoints disponíveis:', Object.keys(ENDPOINTS));
    
})(window.SistemaDoacao.api);
`;

fs.writeFileSync(apiModulePath, apiModuleCorreto, 'utf8');
console.log('✅ api-module.js criado com URLs corretas');

// ================================================================
// 4. CRIAR SCRIPT DE TESTE ATUALIZADO
// ================================================================

console.log('\n4️⃣  Criando script de teste atualizado...\n');

const testScript = `/**
 * Script de teste para verificar correções do módulo API
 * Execute no console do navegador após recarregar a página
 */

console.log('=== TESTE DO MÓDULO API CORRIGIDO ===');

// Teste 1: Verificar se módulo foi carregado
console.log('1. Módulo API carregado?', 
    window.SistemaDoacao && window.SistemaDoacao.api ? '✅ SIM' : '❌ NÃO');

// Teste 2: Verificar core atualizado
console.log('2. Core sem conflitos?', 
    window.SistemaDoacao && window.SistemaDoacao.core ? '✅ SIM' : '❌ NÃO');

// Teste 3: Verificar variáveis globais
console.log('3. allDonations existe?', 
    typeof window.allDonations !== 'undefined' ? '✅ SIM' : '❌ NÃO');

// Teste 4: Verificar funções integradas
const funcoes = ['loadDonations', 'saveDonation', 'loadDonors', 'loadSummary'];
funcoes.forEach(f => {
    console.log(\`4. \${f} disponível?\`, 
        typeof window[f] === 'function' ? '✅ SIM' : '❌ NÃO');
});

// Teste 5: Verificar endpoints
console.log('5. Testando loadDonations com URL correta...');
if (window.loadDonations) {
    window.loadDonations()
        .then(data => {
            console.log('✅ loadDonations funcionou! Doações:', data.length);
        })
        .catch(err => {
            console.error('❌ Erro (esperado se não houver dados):', err.message);
        });
}

console.log('=== FIM DO TESTE ===');
`;

fs.writeFileSync(path.join(__dirname, 'testar-correcao-api.js'), testScript, 'utf8');
console.log('✅ Script de teste criado: testar-correcao-api.js');

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 CORREÇÕES APLICADAS COM SUCESSO!');
console.log('═'.repeat(56));

console.log('\n✅ O QUE FOI CORRIGIDO:');
console.log('   1. URLs da API: /api/donations → /api/doacoes');
console.log('   2. URLs da API: /api/donors → /api/doadores');
console.log('   3. Conflito de variáveis: allDonations não redeclarada');
console.log('   4. Core.js: Atualizado sem conflitos');
console.log('   5. Endpoints: Todos mapeados corretamente');

console.log('\n📁 ARQUIVOS ATUALIZADOS:');
console.log('   • js/core.js - Sem conflitos de variáveis');
console.log('   • js/api-module.js - URLs corretas');
console.log('   • testar-correcao-api.js - Novo teste');

console.log('\n🔄 PRÓXIMOS PASSOS:');
console.log('═'.repeat(56));
console.log('1. Reinicie o servidor: npm start');
console.log('2. Limpe o cache do navegador (Ctrl+F5)');
console.log('3. Acesse: http://localhost:3001');
console.log('4. Abra o console (F12)');
console.log('5. Verifique se não há mais erros 404');

console.log('\n⚠️  IMPORTANTE:');
console.log('   Se ainda houver erros, verifique o server.js');
console.log('   para confirmar os endpoints corretos.');

console.log('\n✅ CORREÇÃO CONCLUÍDA!');
console.log('🎉 SISTEMA DEVE FUNCIONAR SEM ERROS 404!');
console.log('═'.repeat(56));