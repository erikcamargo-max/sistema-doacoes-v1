// ============================================================================
// DIAGNÓSTICO RÁPIDO DE ERRO APÓS CORREÇÃO
// Data: 06/09/2025
// Objetivo: Identificar e corrigir erro que está travando o dashboard
// ============================================================================

const fs = require('fs');

console.log('🚨 DIAGNÓSTICO RÁPIDO DE ERRO');
console.log('═'.repeat(50));
console.log('🎯 Dashboard travado em "Carregando..." após correção');
console.log('');

// ============================================================================
// 1. TESTAR SINTAXE JAVASCRIPT
// ============================================================================

function testarSintaxe() {
    console.log('1️⃣ TESTANDO SINTAXE JAVASCRIPT...');
    
    try {
        const content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Testar sintaxe
        new Function(content);
        console.log('   ✅ Sintaxe JavaScript VÁLIDA');
        return true;
        
    } catch (error) {
        console.log('   ❌ ERRO DE SINTAXE DETECTADO:');
        console.log(`      💬 ${error.message}`);
        console.log(`      📍 Linha aproximada: ${error.lineNumber || 'Desconhecida'}`);
        return false;
    }
}

// ============================================================================
// 2. VERIFICAR FUNÇÃO ADDDONATION
// ============================================================================

function verificarAddDonation() {
    console.log('\n2️⃣ VERIFICANDO FUNÇÃO addDonation...');
    
    try {
        const content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Procurar pela função window.addDonation
        if (content.includes('window.addDonation = async function()')) {
            console.log('   ✅ Função window.addDonation encontrada');
            
            // Verificar se tem algum erro óbvio
            const funcaoMatch = content.match(/window\.addDonation = async function\(\)[\s\S]*?^\};/m);
            if (funcaoMatch) {
                const funcaoContent = funcaoMatch[0];
                
                // Verificar problemas comuns
                const problemas = [];
                
                if (!funcaoContent.includes('document.getElementById')) {
                    problemas.push('Não acessa elementos DOM');
                }
                
                if (!funcaoContent.includes('fetch(')) {
                    problemas.push('Não faz requisição HTTP');
                }
                
                if (funcaoContent.includes('$\\{') || funcaoContent.includes('`')) {
                    problemas.push('Template literals problemáticos');
                }
                
                const abreChaves = (funcaoContent.match(/\{/g) || []).length;
                const fechaChaves = (funcaoContent.match(/\}/g) || []).length;
                if (abreChaves !== fechaChaves) {
                    problemas.push(`Chaves não balanceadas: ${abreChaves} abre, ${fechaChaves} fecha`);
                }
                
                if (problemas.length === 0) {
                    console.log('   ✅ Função parece estar correta');
                } else {
                    console.log('   ⚠️ Problemas encontrados:');
                    problemas.forEach(p => console.log(`      • ${p}`));
                }
                
                return problemas.length === 0;
            }
        } else {
            console.log('   ❌ Função window.addDonation NÃO ENCONTRADA');
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 3. RESTAURAR BACKUP SE NECESSÁRIO
// ============================================================================

function restaurarBackupSeNecessario() {
    console.log('\n3️⃣ VERIFICANDO NECESSIDADE DE RESTAURAR BACKUP...');
    
    // Verificar se existe backup recente
    const backupPath = './public/app_backup_correcao_parcelas_1757206414389.js';
    
    if (fs.existsSync(backupPath)) {
        console.log('   ✅ Backup encontrado');
        console.log('   🔄 Restaurando backup funcional...');
        
        try {
            const backupContent = fs.readFileSync(backupPath, 'utf-8');
            
            // Testar sintaxe do backup
            new Function(backupContent);
            console.log('   ✅ Backup tem sintaxe válida');
            
            // Restaurar backup
            fs.writeFileSync('./public/app.js', backupContent);
            console.log('   ✅ Backup restaurado com sucesso!');
            
            return true;
            
        } catch (error) {
            console.log(`   ❌ Erro ao restaurar backup: ${error.message}`);
            return false;
        }
    } else {
        console.log('   ❌ Backup não encontrado');
        return false;
    }
}

// ============================================================================
// 4. CORRIGIR FUNÇÃO DE FORMA SIMPLES
// ============================================================================

function corrigirFuncaoSimples() {
    console.log('\n4️⃣ APLICANDO CORREÇÃO SIMPLES...');
    
    try {
        let content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Procurar pela função window.addDonation existente
        const funcaoInicio = content.indexOf('window.addDonation = ');
        if (funcaoInicio === -1) {
            console.log('   ❌ Função window.addDonation não encontrada');
            return false;
        }
        
        // Encontrar o final da função de forma mais segura
        let funcaoFim = funcaoInicio;
        let chaves = 0;
        let dentroString = false;
        let stringChar = '';
        
        for (let i = funcaoInicio; i < content.length; i++) {
            const char = content[i];
            
            if (!dentroString) {
                if (char === '"' || char === "'" || char === '`') {
                    dentroString = true;
                    stringChar = char;
                } else if (char === '{') {
                    chaves++;
                } else if (char === '}') {
                    chaves--;
                    if (chaves === 0 && i > funcaoInicio + 50) {
                        funcaoFim = i + 1;
                        break;
                    }
                }
            } else {
                if (char === stringChar && content[i-1] !== '\\\\') {
                    dentroString = false;
                }
            }
        }
        
        if (funcaoFim === funcaoInicio) {
            console.log('   ❌ Não foi possível localizar o final da função');
            return false;
        }
        
        console.log(`   📍 Função localizada: ${funcaoInicio} até ${funcaoFim}`);
        
        // Criar função simplificada que funciona
        const funcaoSimples = `window.addDonation = async function() {
    try {
        // Coletar dados básicos
        const doadorId = document.getElementById('input-donor').value;
        const valor = parseFloat(document.getElementById('input-amount').value);
        const tipo = document.getElementById('input-type').value;
        const data = document.getElementById('input-date').value;
        const observacoes = document.getElementById('input-observations').value || '';
        
        // Coletar dados das parcelas
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
        
        // Validações
        if (!doadorId || !valor || !data) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }
        
        // Preparar dados
        const dadosDoacao = {
            doador_id: parseInt(doadorId),
            valor: valor,
            tipo: tipo,
            data_doacao: data,
            observacoes: observacoes,
            recorrente: isRecorrente ? 1 : 0,
            parcelas: parcelas,
            proxima_parcela: proximaParcela
        };
        
        // Enviar para backend
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosDoacao)
        });
        
        if (!response.ok) {
            throw new Error('Erro do servidor');
        }
        
        // Sucesso
        alert('Doação salva com sucesso!');
        
        // Fechar modal
        const modal = document.getElementById('simple-modal');
        if (modal) modal.style.display = 'none';
        
        // Recarregar
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        } else {
            window.location.reload();
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar doação: ' + error.message);
    }
}`;
        
        // Substituir função
        const novoContent = content.substring(0, funcaoInicio) + funcaoSimples + content.substring(funcaoFim);
        
        // Testar sintaxe
        new Function(novoContent);
        console.log('   ✅ Nova função tem sintaxe válida');
        
        // Salvar
        fs.writeFileSync('./public/app.js', novoContent);
        console.log('   ✅ Função corrigida de forma simples!');
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro na correção: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 5. INSTRUÇÕES FINAIS
// ============================================================================

function instrucoesFinais() {
    console.log('\n5️⃣ INSTRUÇÕES FINAIS...');
    
    console.log('\n   🔄 TESTE AGORA:');
    console.log('      1. Recarregue a página (Ctrl+F5)');
    console.log('      2. Verifique se dashboard carrega normalmente');
    console.log('      3. Clique em "Nova Doação"');
    console.log('      4. Marque "Doação Recorrente"');
    console.log('      5. Preencha e teste o salvamento');
    
    console.log('\n   🔍 SE AINDA HOUVER PROBLEMA:');
    console.log('      1. Abra DevTools (F12) → Console');
    console.log('      2. Procure por erros em vermelho');
    console.log('      3. Me informe a mensagem exata');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando diagnóstico...\n');
    
    const sintaxeOk = testarSintaxe();
    
    if (!sintaxeOk) {
        console.log('\n🚨 ERRO DE SINTAXE DETECTADO!');
        console.log('🔄 Restaurando backup...');
        
        const backupRestaurado = restaurarBackupSeNecessario();
        
        if (backupRestaurado) {
            console.log('\n✅ Backup restaurado! Teste o sistema agora.');
        } else {
            console.log('\n❌ Não foi possível restaurar backup');
        }
    } else {
        const addDonationOk = verificarAddDonation();
        
        if (!addDonationOk) {
            console.log('\n⚠️ Problema na função addDonation');
            console.log('🔧 Aplicando correção simples...');
            
            const corrigido = corrigirFuncaoSimples();
            
            if (corrigido) {
                console.log('\n✅ Função corrigida! Teste agora.');
            }
        } else {
            console.log('\n✅ Sistema parece estar correto');
            console.log('💡 Problema pode ser cache do navegador');
        }
    }
    
    instrucoesFinais();
    
    console.log('\n✨ DIAGNÓSTICO CONCLUÍDO!');
}

// Executar
main();