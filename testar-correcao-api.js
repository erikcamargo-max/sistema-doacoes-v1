/**
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
    console.log(`4. ${f} disponível?`, 
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
