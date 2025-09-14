/**
 * ================================================================
 * MÓDULO: Funções Utilitárias
 * ================================================================
 * Arquivo: utils.js
 * Descrição: Funções auxiliares de formatação e validação
 * Versão: 1.0.0 - Modularizado em 09/09/2025
 * ================================================================
 */

// Formatar moeda
function formatCurrency(value) {
    return parseFloat(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Formatar data
function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
}

// Formatar telefone
function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/D/g, '');
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(d{2})(d{5})(d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(d{2})(d{4})(d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

// Formatar CPF
function formatCPF(cpf) {
    if (!cpf) return '';
    const cleaned = cpf.replace(/D/g, '');
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(d{3})(d{3})(d{3})(d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
}

// Validar email
function validateEmail(email) {
    const re = /^[^s@]+@[^s@]+.[^s@]+$/;
    return re.test(email);
}

// Validar CPF
function validateCPF(cpf) {
    const cleaned = cpf.replace(/D/g, '');
    return cleaned.length === 11;
}

// Calcular vencimento
function calcularVencimento(dataInicial, parcela) {
    const data = new Date(dataInicial);
    data.setMonth(data.getMonth() + parcela);
    return data.toISOString().split('T')[0];
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Criar notificação visual
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, window.appConfig.NOTIFICATION_DURATION);
}

// Debounce para otimização
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar funções
window.utils = {
    formatCurrency,
    formatDate,
    formatPhone,
    formatCPF,
    validateEmail,
    validateCPF,
    calcularVencimento,
    showNotification,
    debounce
};
