/**
 * ================================================================
 * MÓDULO: Core do Sistema
 * ================================================================
 * 
 * VERSÃO: 1.2.2
 * DATA: 10/09/2025
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
        console.log(`[${type}] ${message}`);
        
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
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 99999;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            font-size: 14px;
            font-weight: 500;
        `;
        
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
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    };
    
    // ================================================================
    // CSS PARA ANIMAÇÕES
    // ================================================================
    
    if (!document.querySelector('#core-styles')) {
        const style = document.createElement('style');
        style.id = 'core-styles';
        style.textContent = `
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
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Módulo Core carregado - v1.2.2');
    
})(window.SistemaDoacao.core);
