// ============================================================================
// ANÁLISE SIMPLES DO PROBLEMA DAS PARCELAS RECORRENTES
// Data: 06/09/2025
// Versão simplificada sem regex complexas
// ============================================================================

const fs = require('fs');

console.log('🔍 ANÁLISE SIMPLES: PROBLEMA DAS PARCELAS');
console.log('═'.repeat(50));
console.log('📋 Verificação direta por busca de texto');
console.log('');

// ============================================================================
// 1. VERIFICAR MODAL (index.html)
// ============================================================================

function verificarModal() {
    console.log('1️⃣ VERIFICANDO MODAL DE NOVA DOAÇÃO...');
    
    try {
        const content = fs.readFileSync('./public/index.html', 'utf-8');
        
        const checks = [
            { nome: 'Checkbox Doação Recorrente', busca: 'input-recurrent' },
            { nome: 'Campo Quantas Parcelas', busca: 'input-parcelas' },
            { nome: 'Campo Próxima Parcela', busca: 'input-proxima-parcela' },
            { nome: 'Div Campos Recorrentes', busca: 'recurring-fields' },
            { nome: 'Função toggleRecurringFields', busca: 'toggleRecurringFields' },
            { nome: 'Label "Doação Recorrente"', busca: 'Doação Recorrente' },
            { nome: 'Label "Quantas parcelas"', busca: 'Quantas parcelas' }
        ];
        
        console.log('   📋 CAMPOS NO MODAL:');
        let encontrados = 0;
        
        checks.forEach(check => {
            const found = content.includes(check.busca);
            const status = found ? '✅' : '❌';
            console.log(`      ${status} ${check.nome}`);
            if (found) encontrados++;
        });
        
        console.log(`\n   📊 Resultado: ${encontrados}/${checks.length} campos encontrados`);
        
        if (encontrados < 5) {
            console.log('   🚨 PROBLEMA: Modal não tem campos de parcelas!');
        } else {
            console.log('   ✅ Modal parece ter campos de parcelas');
        }
        
        return encontrados >= 5;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 2. VERIFICAR FUNÇÃO addDonation (app.js)
// ============================================================================

function verificarAddDonation() {
    console.log('\n2️⃣ VERIFICANDO FUNÇÃO addDonation...');
    
    try {
        const content = fs.readFileSync('./public/app.js', 'utf-8');
        
        const checks = [
            { nome: 'Função addDonation existe', busca: 'function addDonation' },
            { nome: 'Coleta input-recurrent', busca: 'input-recurrent' },
            { nome: 'Coleta input-parcelas', busca: 'input-parcelas' },
            { nome: 'Coleta input-proxima-parcela', busca: 'input-proxima-parcela' },
            { nome: 'Envia para /api/doacoes', busca: '/api/doacoes' },
            { nome: 'Campo recorrente no objeto', busca: 'recorrente:' },
            { nome: 'Campo parcelas no objeto', busca: 'parcelas:' }
        ];
        
        console.log('   📋 VERIFICANDO FUNÇÃO addDonation:');
        let encontrados = 0;
        
        checks.forEach(check => {
            const found = content.includes(check.busca);
            const status = found ? '✅' : '❌';
            console.log(`      ${status} ${check.nome}`);
            if (found) encontrados++;
        });
        
        console.log(`\n   📊 Resultado: ${encontrados}/${checks.length} verificações passaram`);
        
        if (encontrados < 4) {
            console.log('   🚨 PROBLEMA: Função addDonation não coleta parcelas!');
        } else {
            console.log('   ✅ Função addDonation parece coletar parcelas');
        }
        
        return encontrados >= 4;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 3. VERIFICAR ROTA BACKEND (server.js)
// ============================================================================

function verificarBackend() {
    console.log('\n3️⃣ VERIFICANDO ROTA BACKEND...');
    
    try {
        const content = fs.readFileSync('./server.js', 'utf-8');
        
        const checks = [
            { nome: 'Rota POST /api/doacoes', busca: 'app.post(\'/api/doacoes\'' },
            { nome: 'Rota POST alternativa', busca: 'app.post("/api/doacoes"' },
            { nome: 'Processa req.body.recorrente', busca: 'req.body.recorrente' },
            { nome: 'Processa req.body.parcelas', busca: 'req.body.parcelas' },
            { nome: 'INSERT INTO doacoes', busca: 'INSERT INTO doacoes' },
            { nome: 'Campo recorrente no INSERT', busca: 'recorrente' },
            { nome: 'Campo parcelas no INSERT', busca: 'parcelas' }
        ];
        
        console.log('   📋 VERIFICANDO BACKEND:');
        let encontrados = 0;
        
        checks.forEach(check => {
            const found = content.includes(check.busca);
            const status = found ? '✅' : '❌';
            console.log(`      ${status} ${check.nome}`);
            if (found) encontrados++;
        });
        
        console.log(`\n   📊 Resultado: ${encontrados}/${checks.length} verificações passaram`);
        
        if (encontrados < 4) {
            console.log('   🚨 PROBLEMA: Backend não processa parcelas!');
        } else {
            console.log('   ✅ Backend parece processar parcelas');
        }
        
        return encontrados >= 4;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 4. VERIFICAR ESTRUTURA DO BANCO
// ============================================================================

function verificarBanco() {
    console.log('\n4️⃣ VERIFICANDO ESTRUTURA DO BANCO...');
    
    try {
        const content = fs.readFileSync('./server.js', 'utf-8');
        
        const checks = [
            { nome: 'CREATE TABLE doacoes', busca: 'CREATE TABLE IF NOT EXISTS doacoes' },
            { nome: 'Campo recorrente', busca: 'recorrente INTEGER' },
            { nome: 'Campo parcelas', busca: 'parcelas INTEGER' },
            { nome: 'Campo proxima_parcela', busca: 'proxima_parcela' }
        ];
        
        console.log('   📋 VERIFICANDO ESTRUTURA DO BANCO:');
        let encontrados = 0;
        
        checks.forEach(check => {
            const found = content.includes(check.busca);
            const status = found ? '✅' : '❌';
            console.log(`      ${status} ${check.nome}`);
            if (found) encontrados++;
        });
        
        console.log(`\n   📊 Resultado: ${encontrados}/${checks.length} campos encontrados`);
        
        if (encontrados < 3) {
            console.log('   🚨 PROBLEMA: Banco não tem campos para parcelas!');
        } else {
            console.log('   ✅ Banco tem campos para parcelas');
        }
        
        return encontrados >= 3;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 5. VERIFICAR FUNÇÃO generateCarne
// ============================================================================

function verificarCarne() {
    console.log('\n5️⃣ VERIFICANDO FUNÇÃO generateCarne...');
    
    try {
        const content = fs.readFileSync('./public/app.js', 'utf-8');
        
        const checks = [
            { nome: 'Função generateCarne existe', busca: 'function generateCarne' },
            { nome: 'Busca dados da doação', busca: '/api/doacoes/' },
            { nome: 'Usa doacao.parcelas', busca: 'doacao.parcelas' },
            { nome: 'Usa doacao.recorrente', busca: 'doacao.recorrente' },
            { nome: 'Loop para parcelas', busca: 'for(' },
            { nome: 'Calcula datas', busca: 'Date(' },
            { nome: 'setMonth para parcelas', busca: 'setMonth' }
        ];
        
        console.log('   📋 VERIFICANDO FUNÇÃO generateCarne:');
        let encontrados = 0;
        
        checks.forEach(check => {
            const found = content.includes(check.busca);
            const status = found ? '✅' : '❌';
            console.log(`      ${status} ${check.nome}`);
            if (found) encontrados++;
        });
        
        console.log(`\n   📊 Resultado: ${encontrados}/${checks.length} verificações passaram`);
        
        if (encontrados < 4) {
            console.log('   🚨 PROBLEMA: generateCarne não usa parcelas!');
        } else {
            console.log('   ✅ generateCarne parece usar parcelas');
        }
        
        return encontrados >= 4;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 6. INSTRUÇÕES DE TESTE MANUAL
// ============================================================================

function instruirTestesManual() {
    console.log('\n6️⃣ INSTRUÇÕES PARA TESTE MANUAL...');
    
    console.log('\n   🧪 TESTE NO NAVEGADOR:');
    console.log('      1. Execute: npm start');
    console.log('      2. Acesse: http://localhost:3001');
    console.log('      3. Clique em "Nova Doação"');
    console.log('      4. Marque "Doação Recorrente"');
    console.log('      5. Verifique se aparecem campos de parcelas');
    console.log('      6. Preencha e salve uma doação teste');
    console.log('      7. Gere o carnê dessa doação');
    console.log('      8. Verifique se mostra múltiplas parcelas');
    
    console.log('\n   🔍 VERIFICAR NO CONSOLE DO NAVEGADOR:');
    console.log('      1. Abra DevTools (F12) → Console');
    console.log('      2. Digite: toggleRecurringFields()');
    console.log('      3. Veja se a função existe e funciona');
    console.log('      4. Digite: fetch("/api/doacoes").then(r=>r.json()).then(console.log)');
    console.log('      5. Verifique se doações têm campos "parcelas" e "recorrente"');
    
    console.log('\n   📝 CRIAR DOAÇÃO TESTE:');
    console.log('      - Nome: João Teste');
    console.log('      - Valor: R$ 120,00');
    console.log('      - Marcar: Doação Recorrente');
    console.log('      - Parcelas: 12');
    console.log('      - Observar se salva e gera carnê com 12 parcelas');
}

// ============================================================================
// 7. GERAR DIAGNÓSTICO FINAL
// ============================================================================

function gerarDiagnostico(modal, addDonation, backend, banco, carne) {
    console.log('\n📊 DIAGNÓSTICO FINAL');
    console.log('═'.repeat(50));
    
    const problemas = [];
    const componentes = [
        { nome: 'Modal Frontend', ok: modal, desc: 'Campos de parcelas no modal' },
        { nome: 'Função addDonation', ok: addDonation, desc: 'Coleta dados das parcelas' },
        { nome: 'Backend/API', ok: backend, desc: 'Processa e salva parcelas' },
        { nome: 'Banco de Dados', ok: banco, desc: 'Estrutura para parcelas' },
        { nome: 'Função generateCarne', ok: carne, desc: 'Usa dados das parcelas' }
    ];
    
    console.log('\n🎯 COMPONENTES VERIFICADOS:');
    componentes.forEach(comp => {
        const status = comp.ok ? '✅' : '❌';
        console.log(`   ${status} ${comp.nome}: ${comp.desc}`);
        if (!comp.ok) problemas.push(comp.nome);
    });
    
    const funcionando = componentes.filter(c => c.ok).length;
    const percentual = Math.round((funcionando / componentes.length) * 100);
    
    console.log(`\n📈 FUNCIONAMENTO GERAL: ${funcionando}/${componentes.length} (${percentual}%)`);
    
    if (problemas.length === 0) {
        console.log('\n🎉 TODOS OS COMPONENTES PARECEM OK!');
        console.log('   💡 Problema pode ser:');
        console.log('      • JavaScript não executando');
        console.log('      • Evento onClick não funcionando');
        console.log('      • Cache do navegador');
        console.log('      • Dados específicos corrompidos');
        
    } else {
        console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
        problemas.forEach((problema, index) => {
            console.log(`   ${index + 1}. ${problema}`);
        });
        
        console.log('\n🔧 PRÓXIMOS PASSOS:');
        if (problemas.includes('Modal Frontend')) {
            console.log('   • Corrigir campos no index.html');
        }
        if (problemas.includes('Função addDonation')) {
            console.log('   • Atualizar função no app.js');
        }
        if (problemas.includes('Backend/API')) {
            console.log('   • Corrigir rota no server.js');
        }
        if (problemas.includes('Banco de Dados')) {
            console.log('   • Atualizar estrutura da tabela');
        }
        if (problemas.includes('Função generateCarne')) {
            console.log('   • Corrigir lógica do carnê');
        }
    }
    
    console.log('\n📋 EXECUTE O TESTE MANUAL PARA CONFIRMAR!');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando análise...\n');
    
    const modal = verificarModal();
    const addDonation = verificarAddDonation();
    const backend = verificarBackend();
    const banco = verificarBanco();
    const carne = verificarCarne();
    
    instruirTestesManual();
    gerarDiagnostico(modal, addDonation, backend, banco, carne);
    
    console.log('\n✨ ANÁLISE CONCLUÍDA!');
}

// Executar
main();