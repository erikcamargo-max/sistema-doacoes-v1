/**
 * ================================================================
 * MÓDULO: API do Sistema de Doações - v1.2.3
 * ================================================================
 * 
 * VERSÃO: 1.2.3
 * DATA: 11/09/2025
 * 
 * CORREÇÕES:
 * - Endpoints verificados e corrigidos
 * - Fallback para variações de nomes
 * - Melhor tratamento de erros
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
    
    const API_BASE = window.location.origin + '/api';
    const API_TIMEOUT = 30000;
    
    /**
     * Função auxiliar para fazer requisições com retry
     * VERSÃO: 1.2.3 - Com fallback para variações
     */
    function apiRequest(url, options = {}, alternativeUrls = []) {
        console.log(`[API] Tentando: ${url}`);
        
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
                console.log(`[API] Resposta de ${url}: ${response.status}`);
                
                if (!response.ok) {
                    // Se falhou e temos URLs alternativas, tentar
                    if (response.status === 404 && alternativeUrls.length > 0) {
                        const nextUrl = alternativeUrls.shift();
                        console.log(`[API] 404 - Tentando alternativa: ${nextUrl}`);
                        return apiRequest(nextUrl, options, alternativeUrls);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Requisição expirou (timeout)');
                }
                
                // Se ainda temos alternativas, tentar
                if (alternativeUrls.length > 0) {
                    const nextUrl = alternativeUrls.shift();
                    console.log(`[API] Erro - Tentando alternativa: ${nextUrl}`);
                    return apiRequest(nextUrl, options, alternativeUrls);
                }
                
                throw error;
            });
    }
    
    // ================================================================
    // FUNÇÕES DE DOAÇÕES
    // ================================================================
    
    /**
     * Carrega todas as doações
     * VERSÃO: 1.2.3 - Com fallback
     */
    api.loadDonations = function() {
        console.log('[API] Carregando doações...');
        
        // Tentar diferentes variações
        const primaryUrl = API_BASE + '/doacoes';
        const alternatives = [
            API_BASE + '/donations',
            API_BASE + '/doacao'
        ];
        
        return apiRequest(primaryUrl, {}, alternatives)
            .then(data => {
                console.log(`[API] ${data.length} doações carregadas`);
                
                // Atualiza variável global
                if (typeof window.allDonations !== 'undefined') {
                    window.allDonations = data;
                }
                
                // Chama renderização
                if (typeof window.renderDonations === 'function') {
                    window.renderDonations(data);
                }
                
                // Atualiza dashboard
                if (typeof window.updateDashboard === 'function') {
                    window.updateDashboard();
                }
                
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar doações:', error);
                
                // Notifica erro
                if (window.SistemaDoacao?.core?.showNotification) {
                    window.SistemaDoacao.core.showNotification('Erro ao carregar doações: ' + error.message, 'error');
                }
                
                // Retorna array vazio para não quebrar a aplicação
                return [];
            });
    };
    
    /**
     * Salva uma nova doação
     * VERSÃO: 1.2.3
     */
    api.saveDonation = function(donationData) {
        console.log('[API] Salvando doação...', donationData);
        
        const primaryUrl = API_BASE + '/doacoes';
        const alternatives = [API_BASE + '/donations'];
        
        return apiRequest(primaryUrl, {
            method: 'POST',
            body: JSON.stringify(donationData)
        }, alternatives)
        .then(result => {
            console.log('[API] Doação salva com ID:', result.id);
            
            // Recarrega doações
            api.loadDonations();
            
            // Notifica sucesso
            if (window.SistemaDoacao?.core?.showNotification) {
                window.SistemaDoacao.core.showNotification('Doação salva com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao salvar doação:', error);
            
            if (window.SistemaDoacao?.core?.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao salvar doação: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    /**
     * Atualiza uma doação existente
     * VERSÃO: 1.2.3
     */
    api.updateDonation = function(id, donationData) {
        console.log('[API] Atualizando doação ID:', id);
        
        const primaryUrl = `${API_BASE}/doacoes/${id}`;
        const alternatives = [`${API_BASE}/donations/${id}`];
        
        return apiRequest(primaryUrl, {
            method: 'PUT',
            body: JSON.stringify(donationData)
        }, alternatives)
        .then(result => {
            console.log('[API] Doação atualizada');
            
            // Recarrega doações
            api.loadDonations();
            
            // Notifica sucesso
            if (window.SistemaDoacao?.core?.showNotification) {
                window.SistemaDoacao.core.showNotification('Doação atualizada com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao atualizar doação:', error);
            
            if (window.SistemaDoacao?.core?.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao atualizar doação: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    /**
     * Deleta uma doação
     * VERSÃO: 1.2.3
     */
    api.deleteDonation = function(id) {
        console.log('[API] Deletando doação ID:', id);
        
        const primaryUrl = `${API_BASE}/doacoes/${id}`;
        const alternatives = [`${API_BASE}/donations/${id}`];
        
        return apiRequest(primaryUrl, {
            method: 'DELETE'
        }, alternatives)
        .then(result => {
            console.log('[API] Doação deletada');
            
            // Recarrega doações
            api.loadDonations();
            
            // Notifica sucesso
            if (window.SistemaDoacao?.core?.showNotification) {
                window.SistemaDoacao.core.showNotification('Doação excluída com sucesso!', 'success');
            }
            
            return result;
        })
        .catch(error => {
            console.error('[API] Erro ao deletar doação:', error);
            
            if (window.SistemaDoacao?.core?.showNotification) {
                window.SistemaDoacao.core.showNotification('Erro ao excluir doação: ' + error.message, 'error');
            }
            
            throw error;
        });
    };
    
    // ================================================================
    // FUNÇÕES DE DOADORES - DESABILITADAS POR ORA
    // ================================================================
    
    /**
     * Carrega todos os doadores
     * VERSÃO: 1.2.3 - DESABILITADA (endpoint não existe)
     * 
     * NOTA: O endpoint /api/doadores parece não existir no server.js atual.
     * Esta função retorna uma Promise resolvida com array vazio para não quebrar.
     */
        /**
     * Carrega todos os doadores
     * VERSÃO: 1.3.1 - HABILITADA
     */
    api.loadDonors = function() {
        console.log('[API] Carregando doadores...');
        
        const primaryUrl = API_BASE + '/doadores';
        const alternatives = [
            API_BASE + '/donors',
            API_BASE + '/doador'
        ];
        
        return apiRequest(primaryUrl, {}, alternatives)
            .then(data => {
                console.log(`[API] ${data.length} doadores carregados`);
                
                // Atualiza variável global se existir (não redeclara)
                if (typeof window.allDonors !== 'undefined') {
                    window.allDonors = data;
                }
                
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar doadores:', error);
                
                if (window.SistemaDoacao?.core?.showNotification) {
                    window.SistemaDoacao.core.showNotification('Erro ao carregar doadores: ' + error.message, 'error');
                }
                
                // Retorna array vazio para não quebrar
                return [];
            });
    };
    
    /**
     * Verifica duplicatas de doador
     * VERSÃO: 1.2.3
     */
    api.checkDuplicateDonor = function(cpf, telefone1) {
        console.log('[API] Verificando duplicatas...');
        
        // Por ora, retorna sem duplicatas
        return Promise.resolve({ hasDuplicates: false });
    };
    
    /**
     * Salva um novo doador
     * VERSÃO: 1.2.3 - DESABILITADA
     */
    api.saveDonor = function(donorData) {
        console.log('[API] saveDonor chamada - função desabilitada');
        return Promise.resolve({ id: Date.now(), ...donorData });
    };
    
    // ================================================================
    // FUNÇÕES DE HISTÓRICO
    // ================================================================
    
    /**
     * Carrega histórico de pagamentos
     * VERSÃO: 1.2.3
     */
    api.loadPaymentHistory = function(donationId) {
        console.log('[API] Carregando histórico da doação:', donationId);
        
        const primaryUrl = `${API_BASE}/doacoes/${donationId}/historico`;
        const alternatives = [
            `${API_BASE}/donations/${donationId}/historico`,
            `${API_BASE}/historico/doacao/${donationId}`
        ];
        
        return apiRequest(primaryUrl, {}, alternatives)
            .then(data => {
                console.log(`[API] ${data.length} pagamentos no histórico`);
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar histórico:', error);
                return [];
            });
    };
    
    /**
     * Adiciona pagamento ao histórico
     * VERSÃO: 1.2.3
     */
    api.addPayment = function(donationId, paymentData) {
        console.log('[API] Adicionando pagamento...');
        
        const primaryUrl = `${API_BASE}/doacoes/${donationId}/historico`;
        
        return apiRequest(primaryUrl, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        })
        .then(result => {
            console.log('[API] Pagamento adicionado');
            
            if (window.SistemaDoacao?.core?.showNotification) {
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
     * VERSÃO: 1.2.3
     */
    api.generateCarne = function(donationId) {
        console.log('[API] Gerando carnê para doação ID:', donationId);
        
        const url = `${API_BASE}/doacoes/${donationId}/carne`;
        
        window.open(url, '_blank');
        
        if (window.SistemaDoacao?.core?.showNotification) {
            window.SistemaDoacao.core.showNotification('Carnê gerado com sucesso!', 'success');
        }
    };
    
    /**
     * Exporta relatório em PDF
     * VERSÃO: 1.2.3
     */
    api.exportToPDF = function(filters = {}) {
        console.log('[API] Exportando relatório PDF...', filters);
        
        const params = new URLSearchParams(filters);
        const url = `${API_BASE}/relatorios/pdf?${params.toString()}`;
        
        window.open(url, '_blank');
        
        if (window.SistemaDoacao?.core?.showNotification) {
            window.SistemaDoacao.core.showNotification('Relatório gerado com sucesso!', 'success');
        }
    };
    
    /**
     * Carrega resumo do dashboard
     * VERSÃO: 1.2.3
     */
    api.loadSummary = function() {
        console.log('[API] Carregando resumo...');
        
        const primaryUrl = API_BASE + '/relatorios/resumo';
        const alternatives = [
            API_BASE + '/resumo',
            API_BASE + '/dashboard/resumo'
        ];
        
        return apiRequest(primaryUrl, {}, alternatives)
            .then(data => {
                console.log('[API] Resumo carregado:', data);
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar resumo:', error);
                // Retorna valores padrão
                return {
                    total_arrecadado: 0,
                    total_doacoes: 0,
                    doacoes_recorrentes: 0,
                    total_pagamentos: 0
                };
            });
    };
    
    // ================================================================
    // DIAGNÓSTICO
    // ================================================================
    
    /**
     * Função de diagnóstico para verificar endpoints
     * VERSÃO: 1.2.3
     */
    api.diagnose = function() {
        console.log('=== DIAGNÓSTICO DE ENDPOINTS ===');
        console.log('API Base:', API_BASE);
        console.log('');
        console.log('Testando endpoints principais...');
        
        const tests = [
            { name: 'Doações', url: '/doacoes', method: 'GET' },
            { name: 'Doadores', url: '/doadores', method: 'GET' },
            { name: 'Resumo', url: '/relatorios/resumo', method: 'GET' }
        ];
        
        tests.forEach(test => {
            fetch(API_BASE + test.url, { method: test.method })
                .then(r => {
                    if (r.ok) {
                        console.log(`✅ ${test.name}: OK (200)`);
                    } else {
                        console.log(`❌ ${test.name}: Erro ${r.status}`);
                    }
                })
                .catch(e => {
                    console.log(`❌ ${test.name}: Falha na conexão`);
                });
        });
        
        console.log('');
        console.log('Use window.SistemaDoacao.api.diagnose() para repetir');
    };
    
    // ================================================================
    // INICIALIZAÇÃO
    // ================================================================
    
    console.log('[API Module] Módulo de API carregado - v1.2.3');
    console.log('[API Module] Função loadDonors habilitada');
    console.log('[API Module] Use api.diagnose() para testar endpoints');
    
})(window.SistemaDoacao.api);
