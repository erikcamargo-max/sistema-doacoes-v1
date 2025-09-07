// ============================================================================
// ANÁLISE DO PROBLEMA DAS PARCELAS RECORRENTES
// Data: 06/09/2025
// Problema: Parcelas não aparecem no modal e não geram no carnê
// Objetivo: Analisar o fluxo completo: Modal → Backend → Banco → Carnê
// ============================================================================

const fs = require('fs');

console.log('🔍 ANÁLISE: PROBLEMA DAS PARCELAS RECORRENTES');
console.log('═'.repeat(60));
console.log('📋 Investigando fluxo: Modal → Backend → Banco → Carnê');
console.log('');

// ============================================================================
// 1. ANALISAR MODAL DE NOVA DOAÇÃO (Frontend)
// ============================================================================

function analisarModalFrontend() {
    console.log('1️⃣ ANALISANDO MODAL DE NOVA DOAÇÃO (Frontend)...');
    
    try {
        const indexContent = fs.readFileSync('./public/index.html', 'utf-8');
        
        // Verificar se existem campos de parcelas
        const verificacoes = [
            { nome: 'Checkbox "Doação Recorrente"', busca: 'input-recurrent' },
            { nome: 'Campo "Quantas parcelas"', busca: 'input-parcelas' },
            { nome: 'Campo "Próxima parcela"', busca: 'input-proxima-parcela' },
            { nome: 'Div campos recorrentes', busca: 'recurring-fields' },
            { nome: 'Função toggleRecurringFields', busca: 'toggleRecurringFields' }
        ];
        
        console.log('   📋 VERIFICANDO CAMPOS NO MODAL:');
        verificacoes.forEach(v => {
            const encontrado = indexContent.includes(v.busca);
            const status = encontrado ? '✅' : '❌';
            console.log(`      ${status} ${v.nome}`);
        });
        
        // Verificar se a função toggleRecurringFields existe
        if (indexContent.includes('toggleRecurringFields')) {
            console.log('\n   🔍 LOCALIZANDO FUNÇÃO toggleRecurringFields:');
            const funcMatch = indexContent.match(/function toggleRecurringFields\(\)[^}]*{[^}]*}/);
            if (funcMatch) {
                console.log('      ✅ Função encontrada no HTML');
                console.log('      📝 Trecho da função:');
                console.log('         ' + funcMatch[0].substring(0, 100) + '...');
            } else {
                console.log('      ❌ Função não implementada corretamente');
            }
        }
        
        return indexContent.includes('input-parcelas') && indexContent.includes('input-recurrent');
        
    } catch (error) {
        console.log(`   ❌ Erro ao analisar modal: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 2. ANALISAR FUNÇÃO addDonation (Backend/Frontend)
// ============================================================================

function analisarFuncaoAddDonation() {
    console.log('\n2️⃣ ANALISANDO FUNÇÃO addDonation (Backend/Frontend)...');
    
    try {
        const appContent = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Procurar pela função addDonation
        const addDonationMatch = appContent.match(/function addDonation\(\)[^}]*{[\s\S]*?(?=\nfunction|\nwindow\.|$)/);
        
        if (addDonationMatch) {
            console.log('   ✅ Função addDonation encontrada');
            
            const funcaoConteudo = addDonationMatch[0];
            
            // Verificar se coleta dados das parcelas
            const verificacoesParcelas = [
                { nome: 'Checkbox recorrente', busca: 'input-recurrent' },
                { nome: 'Número de parcelas', busca: 'input-parcelas' },
                { nome: 'Próxima parcela', busca: 'input-proxima-parcela' },
                { nome: 'Campo "recorrente"', busca: 'recorrente' },
                { nome: 'Campo "parcelas"', busca: 'parcelas' }
            ];
            
            console.log('\n   📋 VERIFICANDO COLETA DE DADOS DAS PARCELAS:');
            verificacoesParcelas.forEach(v => {
                const encontrado = funcaoConteudo.includes(v.busca);
                const status = encontrado ? '✅' : '❌';
                console.log(`      ${status} ${v.nome}`);
            });
            
            // Verificar se envia dados para o backend
            if (funcaoConteudo.includes('fetch') && funcaoConteudo.includes('/api/doacoes')) {
                console.log('\n   ✅ Função faz requisição para /api/doacoes');
                
                // Verificar estrutura dos dados enviados
                const fetchMatch = funcaoConteudo.match(/fetch\([^}]*\{[\s\S]*?\}\)/);
                if (fetchMatch) {
                    console.log('   📦 DADOS ENVIADOS:');
                    console.log('      ' + fetchMatch[0].substring(0, 200) + '...');
                }
            } else {
                console.log('\n   ❌ Função não faz requisição para API');
            }
            
            return true;
        } else {
            console.log('   ❌ Função addDonation NÃO ENCONTRADA');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao analisar função: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 3. ANALISAR ROTA DO BACKEND (server.js)
// ============================================================================

function analisarRotaBackend() {
    console.log('\n3️⃣ ANALISANDO ROTA DO BACKEND (server.js)...');
    
    try {
        const serverContent = fs.readFileSync('./server.js', 'utf-8');
        
        // Procurar pela rota POST /api/doacoes
        const rotaMatch = serverContent.match(/app\.post\(['"]/api/doacoes['"][^}]*{[\s\S]*?(?=app\.|$)/);
        
        if (rotaMatch) {
            console.log('   ✅ Rota POST /api/doacoes encontrada');
            
            const rotaConteudo = rotaMatch[0];
            
            // Verificar se processa campos de parcelas
            const verificacoesCampos = [
                { nome: 'Campo "recorrente"', busca: 'recorrente' },
                { nome: 'Campo "parcelas"', busca: 'parcelas' },
                { nome: 'Validação de parcelas', busca: 'parcelas' },
                { nome: 'INSERT na tabela doacoes', busca: 'INSERT INTO doacoes' }
            ];
            
            console.log('\n   📋 VERIFICANDO PROCESSAMENTO DAS PARCELAS:');
            verificacoesCampos.forEach(v => {
                const encontrado = rotaConteudo.includes(v.busca);
                const status = encontrado ? '✅' : '❌';
                console.log(`      ${status} ${v.nome}`);
            });
            
            // Verificar estrutura do INSERT
            const insertMatch = rotaConteudo.match(/INSERT INTO doacoes[^;]*;/);
            if (insertMatch) {
                console.log('\n   📝 ESTRUTURA DO INSERT:');
                console.log('      ' + insertMatch[0]);
            }
            
            return true;
        } else {
            console.log('   ❌ Rota POST /api/doacoes NÃO ENCONTRADA');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao analisar rota: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 4. ANALISAR ESTRUTURA DO BANCO DE DADOS
// ============================================================================

function analisarEstruturaBanco() {
    console.log('\n4️⃣ ANALISANDO ESTRUTURA DO BANCO DE DADOS...');
    
    try {
        const serverContent = fs.readFileSync('./server.js', 'utf-8');
        
        // Procurar pela criação da tabela doacoes
        const tabelaMatch = serverContent.match(/CREATE TABLE IF NOT EXISTS doacoes[\s\S]*?\);/);
        
        if (tabelaMatch) {
            console.log('   ✅ Estrutura da tabela doacoes encontrada');
            console.log('\n   📝 ESTRUTURA DA TABELA DOACOES:');
            
            const estrutura = tabelaMatch[0];
            console.log('      ' + estrutura.replace(/\n/g, '\n      '));
            
            // Verificar se tem campos para parcelas
            const camposParcelas = [
                'recorrente',
                'parcelas',
                'proxima_parcela'
            ];
            
            console.log('\n   📋 VERIFICANDO CAMPOS PARA PARCELAS:');
            camposParcelas.forEach(campo => {
                const encontrado = estrutura.includes(campo);
                const status = encontrado ? '✅' : '❌';
                console.log(`      ${status} Campo "${campo}"`);
            });
            
            return camposParcelas.every(campo => estrutura.includes(campo));
        } else {
            console.log('   ❌ Estrutura da tabela doacoes NÃO ENCONTRADA');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao analisar banco: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 5. ANALISAR FUNÇÃO generateCarne
// ============================================================================

function analisarFuncaoGenerateCarne() {
    console.log('\n5️⃣ ANALISANDO FUNÇÃO generateCarne...');
    
    try {
        const appContent = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Procurar pela função generateCarne
        const carneMatch = appContent.match(/function generateCarne\([^}]*{[\s\S]*?(?=\nfunction|\nwindow\.|$)/);
        
        if (carneMatch) {
            console.log('   ✅ Função generateCarne encontrada');
            
            const funcaoConteudo = carneMatch[0];
            
            // Verificar se usa dados de parcelas
            const verificacoesCarne = [
                { nome: 'Busca dados da doação', busca: '/api/doacoes/' },
                { nome: 'Usa campo "parcelas"', busca: 'parcelas' },
                { nome: 'Usa campo "recorrente"', busca: 'recorrente' },
                { nome: 'Gera múltiplas parcelas', busca: 'for' },
                { nome: 'Calcula vencimentos', busca: 'Date' }
            ];
            
            console.log('\n   📋 VERIFICANDO USO DAS PARCELAS NO CARNÊ:');
            verificacoesCarne.forEach(v => {
                const encontrado = funcaoConteudo.includes(v.busca);
                const status = encontrado ? '✅' : '❌';
                console.log(`      ${status} ${v.nome}`);
            });
            
            // Verificar se tem lógica para múltiplas parcelas
            if (funcaoConteudo.includes('for') && funcaoConteudo.includes('parcelas')) {
                console.log('\n   ✅ Função tem lógica para múltiplas parcelas');
            } else {
                console.log('\n   ❌ Função NÃO tem lógica para múltiplas parcelas');
            }
            
            return true;
        } else {
            console.log('   ❌ Função generateCarne NÃO ENCONTRADA');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao analisar função: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 6. TESTAR DADOS EXISTENTES NO BANCO
// ============================================================================

function sugerirTesteBanco() {
    console.log('\n6️⃣ SUGESTÃO DE TESTE DO BANCO DE DADOS...');
    
    console.log('\n   🧪 PARA TESTAR DADOS NO BANCO:');
    console.log('      1. Inicie o servidor: npm start');
    console.log('      2. Abra o browser em: http://localhost:3001');
    console.log('      3. Abra DevTools (F12) → Console');
    console.log('      4. Execute:');
    console.log('         fetch("/api/doacoes").then(r=>r.json()).then(console.log)');
    console.log('      5. Verifique se as doações têm campos "parcelas" e "recorrente"');
    console.log('');
    console.log('   📋 PARA VERIFICAR ESTRUTURA DA TABELA:');
    console.log('      1. No console do DevTools, execute:');
    console.log('         fetch("/api/debug/schema").then(r=>r.text()).then(console.log)');
    console.log('      2. Ou acesse diretamente: http://localhost:3001/api/debug/schema');
}

// ============================================================================
// 7. GERAR RELATÓRIO COMPLETO
// ============================================================================

function gerarRelatorioCompleto(modal, addDonation, rota, banco, carne) {
    console.log('\n📊 RELATÓRIO COMPLETO DA ANÁLISE');
    console.log('═'.repeat(60));
    
    console.log('\n🎯 RESUMO DOS PROBLEMAS ENCONTRADOS:');
    console.log(`   ${modal ? '✅' : '❌'} 1. Modal com campos de parcelas`);
    console.log(`   ${addDonation ? '✅' : '❌'} 2. Função addDonation coleta parcelas`);
    console.log(`   ${rota ? '✅' : '❌'} 3. Rota backend processa parcelas`);
    console.log(`   ${banco ? '✅' : '❌'} 4. Banco tem campos para parcelas`);
    console.log(`   ${carne ? '✅' : '❌'} 5. Carnê usa dados das parcelas`);
    
    const pontuacao = [modal, addDonation, rota, banco, carne].filter(Boolean).length;
    const percentual = Math.round((pontuacao / 5) * 100);
    
    console.log(`\n📊 PONTUAÇÃO GERAL: ${pontuacao}/5 (${percentual}%)`);
    
    if (percentual < 60) {
        console.log('\n🚨 PROBLEMA CRÍTICO IDENTIFICADO!');
        console.log('   📋 AÇÕES NECESSÁRIAS:');
        
        if (!modal) console.log('      🔧 Corrigir modal com campos de parcelas');
        if (!addDonation) console.log('      🔧 Atualizar função addDonation');
        if (!rota) console.log('      🔧 Corrigir rota do backend');
        if (!banco) console.log('      🔧 Atualizar estrutura do banco');
        if (!carne) console.log('      🔧 Corrigir função generateCarne');
        
    } else if (percentual < 80) {
        console.log('\n⚠️ PROBLEMAS PARCIAIS IDENTIFICADOS');
        console.log('   💡 Ajustes necessários em algumas partes');
        
    } else {
        console.log('\n✅ SISTEMA APARENTEMENTE CORRETO');
        console.log('   🔍 Problema pode ser em dados específicos ou lógica');
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS RECOMENDADOS:');
    console.log('   1️⃣ Execute o teste do banco sugerido acima');
    console.log('   2️⃣ Teste criar nova doação recorrente');
    console.log('   3️⃣ Verifique se dados são salvos corretamente');
    console.log('   4️⃣ Teste geração do carnê');
    console.log('   5️⃣ Com base nos resultados, aplicar correções específicas');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando análise completa...\n');
    
    // Executar todas as análises
    const modal = analisarModalFrontend();
    const addDonation = analisarFuncaoAddDonation();
    const rota = analisarRotaBackend();
    const banco = analisarEstruturaBanco();
    const carne = analisarFuncaoGenerateCarne();
    
    // Sugestões de teste
    sugerirTesteBanco();
    
    // Relatório final
    gerarRelatorioCompleto(modal, addDonation, rota, banco, carne);
    
    console.log('\n✨ ANÁLISE COMPLETA FINALIZADA!');
    console.log('📌 Execute os testes sugeridos para confirmar diagnóstico');
}

// Executar análise
main();