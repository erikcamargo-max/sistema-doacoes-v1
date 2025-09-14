/**
 * ================================================================
 * LOADER: Integrador de Módulos
 * ================================================================
 * 
 * VERSÃO: 1.2.1
 * DATA: 10/09/2025
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
                        console.warn(`[Loader] Erro no módulo API (${funcName}), usando fallback`);
                        if (originalFunctions[funcName]) {
                            return originalFunctions[funcName].apply(this, arguments);
                        }
                        throw error;
                    }
                };
                console.log(`[Loader] ✅ ${funcName} integrada com fallback`);
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
