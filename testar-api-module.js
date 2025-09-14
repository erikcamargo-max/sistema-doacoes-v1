/**
 * Script de teste para verificar módulo API
 * Execute no console do navegador
 */

// Teste 1: Verificar se módulo foi carregado
console.log('Teste 1: Módulo API carregado?', 
    window.SistemaDoacao && window.SistemaDoacao.api ? '✅ SIM' : '❌ NÃO');

// Teste 2: Verificar funções integradas
const funcoes = ['loadDonations', 'saveDonation', 'updateDonation', 'deleteDonation'];
funcoes.forEach(f => {
    console.log(`Teste 2: ${f} disponível?`, 
        typeof window[f] === 'function' ? '✅ SIM' : '❌ NÃO');
});

// Teste 3: Testar loadDonations
console.log('Teste 3: Executando loadDonations...');
if (window.loadDonations) {
    window.loadDonations()
        .then(() => console.log('✅ loadDonations funcionou!'))
        .catch(err => console.error('❌ Erro:', err));
}
