/**
 * ================================================================
 * MÓDULO: Configurações e Variáveis Globais
 * ================================================================
 * Arquivo: config.js
 * Descrição: Centraliza todas as configurações e variáveis globais
 * Versão: 1.0.0 - Modularizado em 09/09/2025
 * ================================================================
 */

// Variáveis globais do sistema
let allDonations = [];
let allDonors = [];
let currentEditingId = null;
let currentDonationId = null;
let duplicateCheckModal = null;

// Configurações da aplicação
const CONFIG = {
    API_URL: '/api',
    ITEMS_PER_PAGE: 10,
    CURRENCY: 'BRL',
    LOCALE: 'pt-BR',
    DATE_FORMAT: 'DD/MM/YYYY',
    NOTIFICATION_DURATION: 3000
};

// Exportar para uso global
window.appConfig = CONFIG;
window.appState = {
    allDonations,
    allDonors,
    currentEditingId,
    currentDonationId,
    duplicateCheckModal
};
