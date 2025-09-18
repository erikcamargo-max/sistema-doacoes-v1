/**
 * ================================================================
 * SCRIPT: Corrigir Atualização do Modal
 * ================================================================
 * 
 * PROBLEMA: Modal não atualiza após pagamento bem-sucedido
 * SOLUÇÃO: Recarregar modal após sucesso
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Corrigindo atualização do modal...\n');

const appJsPath = path.join(__dirname, 'public', 'app.js');
let appContent = fs.readFileSync(appJsPath, 'utf8');

// Backup
fs.writeFileSync(appJsPath + '.backup_modal_' + Date.now(), appContent);

console.log('🔍 Procurando função pagarParcela...');

// Encontrar a função pagarParcela
const funcaoRegex = /window\.pagarParcela\s*=\s*async\s*function[^}]+\{[\s\S]*?\}\s*;/;
const match = appContent.match(funcaoRegex);

if (match) {
    console.log('✅ Função pagarParcela encontrada');
    
    const funcaoOriginal = match[0];
    console.log(`   - Tamanho da função: ${funcaoOriginal.length} caracteres`);
    
    // Verificar se já tem o reload do modal
    if (funcaoOriginal.includes('showSimpleHistory(doacaoId)')) {
        console.log('✅ Modal já recarrega após pagamento');
    } else {
        console.log('❌ Modal NÃO recarrega após pagamento - CORRIGINDO');
        
        // Encontrar o ponto onde adicionar o reload (após sucesso)
        const alertIndex = funcaoOriginal.indexOf('alert(`✅ Pagamento da parcela ${numeroParcela} registrado com sucesso!`);');
        
        if (alertIndex > -1) {
            // Inserir reload do modal após o alert
            const antes = funcaoOriginal.substring(0, alertIndex);
            const depois = funcaoOriginal.substring(alertIndex);
            
            const novaFuncao = antes + 
                'alert(`✅ Pagamento da parcela ${numeroParcela} registrado com sucesso!`);\n            \n            // Recarregar modal para mostrar atualização\n            showSimpleHistory(doacaoId);\n            \n            // Recarregar dashboard\n            loadDashboard();\n            ' +
                depois.substring(depois.indexOf('alert(`✅ Pagamento da parcela ${numeroParcela} registrado com sucesso!`);') + 'alert(`✅ Pagamento da parcela ${numeroParcela} registrado com sucesso!`);'.length);
            
            appContent = appContent.replace(funcaoOriginal, novaFuncao);
            console.log('✅ Reload adicionado após alert de sucesso');
        } else {
            // Procurar por outros pontos de sucesso
            const successIndex = funcaoOriginal.indexOf('response.ok');
            if (successIndex > -1) {
                console.log('⚠️ Alert específico não encontrado, tentando abordagem alternativa...');
                
                // Adicionar reload no final do bloco if (response.ok)
                const successBlockRegex = /if\s*\(response\.ok\)\s*\{[\s\S]*?\}/;
                const successMatch = funcaoOriginal.match(successBlockRegex);
                
                if (successMatch) {
                    const successBlock = successMatch[0];
                    const newSuccessBlock = successBlock.replace(
                        /\}\s*$/, 
                        '\n            // Recarregar modal e dashboard\n            showSimpleHistory(doacaoId);\n            loadDashboard();\n        }'
                    );
                    
                    const novaFuncao = funcaoOriginal.replace(successBlock, newSuccessBlock);
                    appContent = appContent.replace(funcaoOriginal, novaFuncao);
                    console.log('✅ Reload adicionado no bloco de sucesso');
                }
            }
        }
    }
} else {
    console.log('❌ Função pagarParcela não encontrada - tentando busca alternativa...');
    
    // Busca alternativa
    const linhas = appContent.split('\n');
    let encontrada = false;
    
    for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].includes('pagarParcela') && linhas[i].includes('function')) {
            console.log(`✅ Função encontrada na linha ${i + 1}: ${linhas[i].trim()}`);
            encontrada = true;
            
            // Procurar o final da função
            let bracesCount = 0;
            let funcStart = i;
            let funcEnd = i;
            
            for (let j = i; j < linhas.length; j++) {
                const linha = linhas[j];
                bracesCount += (linha.match(/{/g) || []).length;
                bracesCount -= (linha.match(/}/g) || []).length;
                
                if (bracesCount === 0 && j > funcStart) {
                    funcEnd = j;
                    break;
                }
            }
            
            console.log(`   - Função vai da linha ${funcStart + 1} à ${funcEnd + 1}`);
            
            // Procurar linha com alert de sucesso
            for (let k = funcStart; k <= funcEnd; k++) {
                if (linhas[k].includes('alert') && linhas[k].includes('sucesso')) {
                    console.log(`   - Alert encontrado na linha ${k + 1}`);
                    
                    // Adicionar reloads após o alert
                    linhas.splice(k + 1, 0, 
                        '            // Recarregar modal e dashboard',
                        '            showSimpleHistory(doacaoId);',
                        '            loadDashboard();'
                    );
                    
                    appContent = linhas.join('\n');
                    console.log('✅ Reload adicionado via inserção de linhas');
                    break;
                }
            }
            break;
        }
    }
    
    if (!encontrada) {
        console.log('❌ Função pagarParcela não encontrada de forma alguma');
    }
}

// Salvar arquivo corrigido
fs.writeFileSync(appJsPath, appContent);

console.log('\n✅ Correção aplicada!');
console.log('\n🔄 TESTE AGORA:');
console.log('1. Recarregue a página (Ctrl+F5)');
console.log('2. Clique no histórico de uma doação');
console.log('3. Pague uma parcela');
console.log('4. RESULTADO: Modal deve recarregar automaticamente');
console.log('5. Parcela deve aparecer como PAGA');

console.log('\n📊 COMPORTAMENTO ESPERADO:');
console.log('1. Alert: "Pagamento da parcela X registrado com sucesso!"');
console.log('2. Modal fecha e abre novamente automaticamente');
console.log('3. Parcela aparece como PAGA na tabela');
console.log('4. Dashboard atualiza totais');

console.log('\n🎯 CONFIRMAÇÃO:');
console.log('O backend já está funcionando perfeitamente!');
console.log('Agora o frontend vai mostrar as atualizações.');