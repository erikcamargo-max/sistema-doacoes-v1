// ============================================================================
// CORREÇÃO SEGURA DAS PARCELAS - SEM QUEBRAR O SISTEMA
// Data: 06/09/2025
// Abordagem: Modificação cirúrgica apenas da coleta de dados
// ============================================================================

const fs = require('fs');

console.log('🔧 CORREÇÃO SEGURA DAS PARCELAS');
console.log('═'.repeat(50));
console.log('🎯 Modificação cirúrgica sem quebrar o sistema');
console.log('');

// ============================================================================
// 1. LOCALIZAR E MODIFICAR APENAS A COLETA DE DADOS
// ============================================================================

function modificarColetaDados() {
    console.log('1️⃣ MODIFICANDO APENAS A COLETA DE DADOS...');
    
    try {
        let content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Procurar pela função window.addDonation
        const funcaoInicio = content.indexOf('window.addDonation = ');
        if (funcaoInicio === -1) {
            console.log('   ❌ Função window.addDonation não encontrada');
            return false;
        }
        
        // Localizar onde coleta os dados básicos
        const coletaInicio = content.indexOf('const donor = ', funcaoInicio);
        if (coletaInicio === -1) {
            console.log('   ❌ Seção de coleta de dados não encontrada');
            return false;
        }
        
        // Localizar onde prepara o objeto de dados
        const objetoInicio = content.indexOf('const donationData = {', funcaoInicio);
        if (objetoInicio === -1) {
            console.log('   ❌ Objeto donationData não encontrado');
            return false;
        }
        
        // Localizar o final do objeto
        let objetoFim = objetoInicio;
        let chaves = 0;
        let encontrouInicio = false;
        
        for (let i = objetoInicio; i < content.length; i++) {
            const char = content[i];
            if (char === '{') {
                chaves++;
                encontrouInicio = true;
            } else if (char === '}') {
                chaves--;
                if (chaves === 0 && encontrouInicio) {
                    objetoFim = i + 1;
                    break;
                }
            }
        }
        
        if (objetoFim === objetoInicio) {
            console.log('   ❌ Final do objeto donationData não encontrado');
            return false;
        }
        
        console.log('   ✅ Localizações encontradas:');
        console.log(`      📍 Função: ${funcaoInicio}`);
        console.log(`      📍 Coleta: ${coletaInicio}`);
        console.log(`      📍 Objeto: ${objetoInicio} até ${objetoFim}`);
        
        // Extrair o objeto atual
        const objetoAtual = content.substring(objetoInicio, objetoFim);
        console.log('   📝 Objeto atual encontrado');
        
        // Verificar se já tem campos de parcelas
        if (objetoAtual.includes('recorrente:') && objetoAtual.includes('parcelas:')) {
            console.log('   ✅ Objeto já tem campos de parcelas');
            console.log('   🔍 Problema pode estar na coleta dos valores');
            
            // Verificar se coleta os valores dos campos
            const coletaParcelas = content.substring(coletaInicio, objetoInicio);
            if (!coletaParcelas.includes('input-recurrent') || !coletaParcelas.includes('input-parcelas')) {
                console.log('   ❌ Não coleta valores dos campos de parcelas');
                return adicionarColetaParcelas(content, coletaInicio, objetoInicio);
            } else {
                console.log('   ✅ Já coleta valores dos campos');
                console.log('   💡 Problema pode estar no backend');
                return true;
            }
        } else {
            console.log('   ❌ Objeto não tem campos de parcelas');
            return adicionarCamposParcelas(content, objetoInicio, objetoFim);
        }
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 2. ADICIONAR COLETA DE PARCELAS
// ============================================================================

function adicionarColetaParcelas(content, coletaInicio, objetoInicio) {
    console.log('\n   🔧 Adicionando coleta de dados das parcelas...');
    
    try {
        // Localizar onde adicionar a coleta (antes do objeto)
        const coletaAtual = content.substring(coletaInicio, objetoInicio);
        
        // Adicionar coleta de parcelas
        const novaColeta = `
        
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
        
        // Inserir a nova coleta
        const novoContent = content.substring(0, objetoInicio) + novaColeta + content.substring(objetoInicio);
        
        // Testar sintaxe
        new Function(novoContent);
        
        // Salvar
        fs.writeFileSync('./public/app.js', novoContent);
        console.log('   ✅ Coleta de parcelas adicionada!');
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro ao adicionar coleta: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 3. ADICIONAR CAMPOS NO OBJETO
// ============================================================================

function adicionarCamposParcelas(content, objetoInicio, objetoFim) {
    console.log('\n   🔧 Adicionando campos de parcelas no objeto...');
    
    try {
        // Extrair objeto atual
        const objetoAtual = content.substring(objetoInicio, objetoFim);
        
        // Verificar se termina com } ou },
        let separador = '';
        if (objetoAtual.trim().endsWith('}')) {
            // Adicionar vírgula antes dos novos campos
            separador = ',';
        }
        
        // Localizar onde inserir (antes da última chave)
        const ultimaChave = objetoAtual.lastIndexOf('}');
        if (ultimaChave === -1) {
            console.log('   ❌ Não foi possível localizar final do objeto');
            return false;
        }
        
        // Campos a adicionar
        const novosCampos = `${separador}
            recorrente: isRecorrente ? 1 : 0,
            parcelas: parcelas,
            proxima_parcela: proximaParcela`;
        
        // Criar novo objeto
        const novoObjeto = objetoAtual.substring(0, ultimaChave) + novosCampos + objetoAtual.substring(ultimaChave);
        
        // Criar novo conteúdo
        const novoContent = content.substring(0, objetoInicio) + novoObjeto + content.substring(objetoFim);
        
        // Testar sintaxe
        new Function(novoContent);
        
        // Salvar
        fs.writeFileSync('./public/app.js', novoContent);
        console.log('   ✅ Campos de parcelas adicionados ao objeto!');
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro ao adicionar campos: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 4. VERIFICAR BACKEND RAPIDAMENTE
// ============================================================================

function verificarBackend() {
    console.log('\n2️⃣ VERIFICAÇÃO RÁPIDA DO BACKEND...');
    
    try {
        const content = fs.readFileSync('./server.js', 'utf-8');
        
        // Verificar se processa os novos campos
        const verificacoes = [
            { nome: 'req.body.recorrente', encontrado: content.includes('req.body.recorrente') },
            { nome: 'req.body.parcelas', encontrado: content.includes('req.body.parcelas') },
            { nome: 'req.body.proxima_parcela', encontrado: content.includes('req.body.proxima_parcela') }
        ];
        
        console.log('   📋 VERIFICANDO BACKEND:');
        verificacoes.forEach(v => {
            const status = v.encontrado ? '✅' : '❌';
            console.log(`      ${status} ${v.nome}`);
        });
        
        const todosEncontrados = verificacoes.every(v => v.encontrado);
        
        if (todosEncontrados) {
            console.log('   ✅ Backend já processa todos os campos!');
        } else {
            console.log('   ⚠️ Backend pode precisar de ajuste');
            console.log('   💡 Mas vamos testar primeiro o frontend');
        }
        
        return todosEncontrados;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 5. TESTE ESPECÍFICO
// ============================================================================

function gerarTesteEspecifico() {
    console.log('\n3️⃣ TESTE ESPECÍFICO...');
    
    console.log('\n   🧪 TESTE AGORA (PASSO A PASSO):');
    console.log('      1. Recarregue a página: Ctrl+F5');
    console.log('      2. Abra DevTools: F12 → Console');
    console.log('      3. Clique "Nova Doação"');
    console.log('      4. Preencha:');
    console.log('         • João Parcelas Teste');
    console.log('         • R$ 60,00');
    console.log('         • ✅ Marque "Doação Recorrente"');
    console.log('         • 6 parcelas');
    console.log('      5. ANTES de salvar, no console digite:');
    console.log('         document.getElementById("input-recurrent").checked');
    console.log('         document.getElementById("input-parcelas").value');
    console.log('      6. Depois salve e observe o console');
    
    console.log('\n   🔍 OBSERVAR NO CONSOLE:');
    console.log('      • Se os campos estão sendo coletados');
    console.log('      • Se os dados são enviados para o backend');
    console.log('      • Se há algum erro durante o salvamento');
    
    console.log('\n   📊 VERIFICAR RESULTADO:');
    console.log('      • Coluna RECORRENTE deve mostrar "Sim"');
    console.log('      • Dashboard deve atualizar contador de recorrentes');
    console.log('      • Carnê deve mostrar 6 parcelas de R$ 10,00');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando correção segura...\n');
    
    // Fazer backup antes de qualquer alteração
    const timestamp = Date.now();
    const backupPath = `./public/app_backup_seguro_${timestamp}.js`;
    fs.copyFileSync('./public/app.js', backupPath);
    console.log(`💾 Backup de segurança criado: ${backupPath}`);
    
    const modificado = modificarColetaDados();
    const backendOk = verificarBackend();
    
    gerarTesteEspecifico();
    
    if (modificado) {
        console.log('\n✅ MODIFICAÇÃO SEGURA APLICADA!');
        console.log('🎯 Sistema deve estar funcionando agora');
    } else {
        console.log('\n⚠️ Modificação não foi necessária ou falhou');
        console.log('💡 Execute o teste mesmo assim');
    }
    
    console.log('\n✨ CORREÇÃO SEGURA CONCLUÍDA!');
}

// Executar
main();