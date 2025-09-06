const fs = require('fs');

console.log('DIAGNÓSTICO PROFUNDO: Por que botões não funcionam');
console.log('');

try {
    // 1. Verificar se as funções existem no app.js
    const appContent = fs.readFileSync('./public/app.js', 'utf-8');
    
    console.log('1. VERIFICANDO FUNÇÕES NO APP.JS:');
    console.log(`   addDonation existe: ${appContent.includes('window.addDonation')}`);
    console.log(`   closeModal existe: ${appContent.includes('window.closeModal')}`);
    
    // 2. Verificar HTML do modal
    const htmlContent = fs.readFileSync('./public/index.html', 'utf-8');
    
    console.log('\n2. VERIFICANDO HTML DO MODAL:');
    
    // Procurar pelo modal
    if (htmlContent.includes('id="modal"')) {
        console.log('   ✓ Modal existe no HTML');
        
        // Procurar pelos botões
        const linhas = htmlContent.split('\n');
        let dentroModal = false;
        let botaoSalvar = null;
        let botaoFechar = null;
        
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            if (linha.includes('id="modal"')) {
                dentroModal = true;
                console.log(`   Modal encontrado na linha ${i + 1}`);
            }
            
            if (dentroModal && linha.includes('</div>') && linha.includes('modal')) {
                dentroModal = false;
            }
            
            if (dentroModal && linha.includes('<button')) {
                console.log(`   Botão na linha ${i + 1}: ${linha.trim()}`);
                
                if (linha.includes('Salvar') || linha.includes('salvar')) {
                    botaoSalvar = linha;
                }
                if (linha.includes('Fechar') || linha.includes('Cancelar') || linha.includes('fechar')) {
                    botaoFechar = linha;
                }
            }
        }
        
        console.log('\n3. ANÁLISE DOS BOTÕES:');
        
        if (botaoSalvar) {
            console.log('   BOTÃO SALVAR:');
            console.log(`   ${botaoSalvar.trim()}`);
            
            if (botaoSalvar.includes('onclick=')) {
                const onclick = botaoSalvar.match(/onclick="([^"]+)"/);
                console.log(`   onclick: ${onclick ? onclick[1] : 'não encontrado'}`);
            } else {
                console.log('   ❌ SEM ONCLICK - Este é o problema!');
            }
        } else {
            console.log('   ❌ Botão Salvar não encontrado no HTML');
        }
        
        if (botaoFechar) {
            console.log('\n   BOTÃO FECHAR:');
            console.log(`   ${botaoFechar.trim()}`);
            
            if (botaoFechar.includes('onclick=')) {
                const onclick = botaoFechar.match(/onclick="([^"]+)"/);
                console.log(`   onclick: ${onclick ? onclick[1] : 'não encontrado'}`);
            } else {
                console.log('   ❌ SEM ONCLICK - Este é o problema!');
            }
        } else {
            console.log('   ❌ Botão Fechar não encontrado no HTML');
        }
        
    } else {
        console.log('   ❌ Modal não encontrado no HTML');
    }
    
    console.log('\n4. DIAGNÓSTICO FINAL:');
    console.log('Se as funções existem no JS mas os botões não têm onclick,');
    console.log('o problema é que o HTML não está conectado às funções.');
    console.log('');
    console.log('SOLUÇÕES POSSÍVEIS:');
    console.log('A) Adicionar onclick nos botões do HTML');
    console.log('B) Adicionar event listeners no JavaScript');
    
} catch (error) {
    console.error('Erro:', error.message);
}