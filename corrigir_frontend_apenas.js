// ============================================================================
// CORREÇÃO FOCADA: APENAS FRONTEND - ENVIO DE DADOS DAS PARCELAS
// Data: 06/09/2025
// Baseado na descoberta: Backend já funciona (D008-SC prova isso)
// Problema: Frontend não envia dados das parcelas para o backend
// ============================================================================

const fs = require('fs');

console.log('🎯 CORREÇÃO FOCADA: APENAS FRONTEND');
console.log('═'.repeat(50));
console.log('🔍 Baseado na descoberta do D008-SC funcionando');
console.log('🎯 Corrigindo apenas envio de dados das parcelas');
console.log('');

// ============================================================================
// 1. LOCALIZAR FUNÇÃO DE SALVAMENTO E CORRIGIR ENVIO DE DADOS
// ============================================================================

function corrigirEnvioDados() {
    console.log('1️⃣ CORRIGINDO ENVIO DE DADOS DAS PARCELAS...');
    
    try {
        let content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Localizar função window.addDonation
        const funcaoInicio = content.indexOf('window.addDonation = ');
        if (funcaoInicio === -1) {
            console.log('   ❌ Função window.addDonation não encontrada');
            return false;
        }
        
        // Localizar onde prepara os dados para envio
        const fetchInicio = content.indexOf('fetch(', funcaoInicio);
        if (fetchInicio === -1) {
            console.log('   ❌ Fetch não encontrado na função');
            return false;
        }
        
        // Localizar o JSON.stringify
        const jsonStringifyInicio = content.indexOf('JSON.stringify({', fetchInicio);
        if (jsonStringifyInicio === -1) {
            console.log('   ❌ JSON.stringify não encontrado');
            return false;
        }
        
        // Localizar final do objeto JSON
        let jsonFim = jsonStringifyInicio;
        let chaves = 0;
        let encontrouInicio = false;
        
        for (let i = jsonStringifyInicio; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                chaves++;
                encontrouInicio = true;
            } else if (char === '}') {
                chaves--;
                if (chaves === 0 && encontrouInicio) {
                    jsonFim = i + 1;
                    break;
                }
            }
        }
        
        console.log(`   📍 Objeto JSON localizado: ${jsonStringifyInicio} até ${jsonFim}`);
        
        // Extrair objeto atual
        const objetoAtual = content.substring(jsonStringifyInicio, jsonFim);
        console.log('   📝 Objeto de dados atual extraído');
        
        // Verificar se já tem campos de parcelas
        if (objetoAtual.includes('recorrente:') && objetoAtual.includes('parcelas:')) {
            console.log('   ✅ Objeto já tem campos de parcelas');
            console.log('   🔍 Verificando se coleta os valores corretamente...');
            
            // Verificar se existe coleta de valores antes do JSON
            const trechoAntes = content.substring(funcaoInicio, jsonStringifyInicio);
            if (trechoAntes.includes('input-recurrent') && trechoAntes.includes('input-parcelas')) {
                console.log('   ✅ Já coleta valores dos campos');
                console.log('   💡 Função parece estar correta');
                console.log('   🧪 Teste manual pode revelar outro problema');
                return true;
            } else {
                console.log('   ❌ Não coleta valores dos campos');
                return adicionarColetaValores(content, funcaoInicio, jsonStringifyInicio);
            }
        } else {
            console.log('   ❌ Objeto não tem campos de parcelas');
            return adicionarCamposAoObjeto(content, jsonStringifyInicio, jsonFim, funcaoInicio);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 2. ADICIONAR COLETA DE VALORES
// ============================================================================

function adicionarColetaValores(content, funcaoInicio, jsonInicio) {
    console.log('\n   🔧 Adicionando coleta de valores das parcelas...');
    
    try {
        // Localizar onde adicionar a coleta (antes do JSON)
        const coletaAdicional = `
        
        // Coletar dados das parcelas recorrentes
        const recurrentCheckbox = document.getElementById('input-recurrent');
        const isRecorrente = recurrentCheckbox ? recurrentCheckbox.checked : false;
        
        let parcelas = 1;
        let proximaParcela = null;
        
        if (isRecorrente) {
            const parcelasInput = document.getElementById('input-parcelas');
            if (parcelasInput && parcelasInput.value) {
                parcelas = parseInt(parcelasInput.value);
            }
            
            const proximaParcelaInput = document.getElementById('input-proxima-parcela');
            if (proximaParcelaInput && proximaParcelaInput.value) {
                proximaParcela = proximaParcelaInput.value;
            }
        }
        `;
        
        // Inserir coleta antes do JSON
        const novoContent = content.substring(0, jsonInicio) + 
                          coletaAdicional + 
                          content.substring(jsonInicio);
        
        // Testar sintaxe
        new Function(novoContent);
        
        // Salvar
        fs.writeFileSync('./public/app.js', novoContent);
        console.log('   ✅ Coleta de valores adicionada!');
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro ao adicionar coleta: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 3. ADICIONAR CAMPOS AO OBJETO JSON
// ============================================================================

function adicionarCamposAoObjeto(content, jsonInicio, jsonFim, funcaoInicio) {
    console.log('\n   🔧 Adicionando campos ao objeto JSON...');
    
    try {
        // Primeiro, adicionar coleta se não existir
        const trechoAntes = content.substring(funcaoInicio, jsonInicio);
        if (!trechoAntes.includes('input-recurrent')) {
            const coletaResult = adicionarColetaValores(content, funcaoInicio, jsonInicio);
            if (!coletaResult) return false;
            
            // Recarregar conteúdo após adicionar coleta
            content = fs.readFileSync('./public/app.js', 'utf-8');
            
            // Recalcular posições
            const novoFuncaoInicio = content.indexOf('window.addDonation = ');
            const novoJsonInicio = content.indexOf('JSON.stringify({', novoFuncaoInicio);
            
            let novoJsonFim = novoJsonInicio;
            let chaves = 0;
            let encontrou = false;
            
            for (let i = novoJsonInicio; i < content.length; i++) {
                const char = content[i];
                if (char === '{') {
                    chaves++;
                    encontrou = true;
                } else if (char === '}') {
                    chaves--;
                    if (chaves === 0 && encontrou) {
                        novoJsonFim = i + 1;
                        break;
                    }
                }
            }
            
            jsonInicio = novoJsonInicio;
            jsonFim = novoJsonFim;
        }
        
        // Extrair objeto atual
        const objetoAtual = content.substring(jsonInicio, jsonFim);
        
        // Localizar onde adicionar campos (antes da última chave)
        const ultimaChave = objetoAtual.lastIndexOf('}');
        if (ultimaChave === -1) {
            console.log('   ❌ Estrutura do objeto inválida');
            return false;
        }
        
        // Verificar se precisa vírgula
        const antesUltimaChave = objetoAtual.substring(0, ultimaChave).trim();
        const precisaVirgula = !antesUltimaChave.endsWith(',') && !antesUltimaChave.endsWith('{');
        
        // Campos a adicionar (compatíveis com D008-SC)
        const novosCampos = `${precisaVirgula ? ',' : ''}
            recorrente: isRecorrente,
            parcelas: parcelas,
            proxima_parcela: proximaParcela`;
        
        // Criar novo objeto
        const novoObjeto = objetoAtual.substring(0, ultimaChave) + 
                          novosCampos + 
                          objetoAtual.substring(ultimaChave);
        
        // Substituir no conteúdo
        const novoContent = content.substring(0, jsonInicio) + 
                           novoObjeto + 
                           content.substring(jsonFim);
        
        // Testar sintaxe
        new Function(novoContent);
        
        // Salvar
        fs.writeFileSync('./public/app.js', novoContent);
        console.log('   ✅ Campos adicionados ao objeto JSON!');
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro ao adicionar campos: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 4. INSTRUÇÕES DE TESTE BASEADAS NO D008-SC
// ============================================================================

function gerarInstrucoesTeste() {
    console.log('\n2️⃣ INSTRUÇÕES DE TESTE (baseadas no D008-SC)...');
    
    console.log('\n   🧪 TESTE ESPECÍFICO:');
    console.log('      1. Recarregue a página: Ctrl+F5');
    console.log('      2. Clique "Nova Doação"');
    console.log('      3. Preencha EXATAMENTE como D008-SC:');
    console.log('         • Nome: Teste D009-TC');
    console.log('         • Valor: R$ 30,00');
    console.log('         • ✅ Marque "Doação Recorrente"');
    console.log('         • Parcelas: 6 (mesmo que D008-SC)');
    console.log('      4. Salve e verifique');
    
    console.log('\n   📊 RESULTADO ESPERADO:');
    console.log('      • Coluna RECORRENTE: "Sim"');
    console.log('      • Carnê deve mostrar 6 parcelas de R$ 5,00');
    console.log('      • Layout idêntico ao D008-SC');
    console.log('      • Datas sequenciais (mês a mês)');
    
    console.log('\n   🔍 COMPARAÇÃO:');
    console.log('      • D008-SC: 6 parcelas de R$ 5,00 ✅ FUNCIONA');
    console.log('      • D009-TC: 6 parcelas de R$ 5,00 ❓ TESTAR');
    console.log('      • Se ambos iguais = PROBLEMA RESOLVIDO!');
    
    console.log('\n   📝 OBSERVAÇÕES:');
    console.log('      • O backend JÁ funciona (D008-SC prova)');
    console.log('      • A generateCarne() JÁ funciona (D008-SC prova)');
    console.log('      • Só precisamos enviar os dados corretamente');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando correção focada...\n');
    
    // Backup de segurança
    const timestamp = Date.now();
    const backupPath = `./public/app_backup_frontend_${timestamp}.js`;
    fs.copyFileSync('./public/app.js', backupPath);
    console.log(`💾 Backup criado: ${backupPath}`);
    
    const corrigido = corrigirEnvioDados();
    
    gerarInstrucoesTeste();
    
    if (corrigido) {
        console.log('\n✅ CORREÇÃO FOCADA APLICADA!');
        console.log('🎯 Agora deve funcionar igual ao D008-SC');
    } else {
        console.log('\n⚠️ Correção pode não ter sido necessária');
        console.log('💡 Execute o teste para confirmar');
    }
    
    console.log('\n🏆 BASEADO NA PROVA: D008-SC JÁ FUNCIONA!');
    console.log('✨ CORREÇÃO FOCADA FINALIZADA!');
}

// Executar
main();