const fs = require('fs');

console.log('CORREÇÃO CIRÚRGICA: Conectar botões às funções');
console.log('Problema identificado: botões btn-save e btn-cancel sem onclick');
console.log('');

try {
    let htmlContent = fs.readFileSync('./public/index.html', 'utf-8');
    
    // Backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync('./public/index.html', `./public/index_backup_${timestamp}.html`);
    console.log('Backup do HTML criado');
    
    let modificado = false;
    
    // Corrigir botão Salvar (btn-save)
    if (htmlContent.includes('id="btn-save"')) {
        // Procurar a linha do btn-save e adicionar onclick
        const linhas = htmlContent.split('\n');
        
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            if (linha.includes('id="btn-save"') && !linha.includes('onclick=')) {
                // Adicionar onclick na tag button
                const novaLinha = linha.replace('<button id="btn-save"', '<button id="btn-save" onclick="addDonation()"');
                linhas[i] = novaLinha;
                console.log('✓ Adicionado onclick="addDonation()" ao btn-save');
                modificado = true;
                break;
            }
        }
        
        htmlContent = linhas.join('\n');
    }
    
    // Corrigir botão Cancelar (btn-cancel)
    if (htmlContent.includes('id="btn-cancel"')) {
        const linhas = htmlContent.split('\n');
        
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            if (linha.includes('id="btn-cancel"') && !linha.includes('onclick=')) {
                const novaLinha = linha.replace('<button id="btn-cancel"', '<button id="btn-cancel" onclick="closeModal()"');
                linhas[i] = novaLinha;
                console.log('✓ Adicionado onclick="closeModal()" ao btn-cancel');
                modificado = true;
                break;
            }
        }
        
        htmlContent = linhas.join('\n');
    }
    
    // Também corrigir btn-close-modal se existir
    if (htmlContent.includes('id="btn-close-modal"')) {
        const linhas = htmlContent.split('\n');
        
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            if (linha.includes('id="btn-close-modal"') && !linha.includes('onclick=')) {
                const novaLinha = linha.replace('<button id="btn-close-modal"', '<button id="btn-close-modal" onclick="closeModal()"');
                linhas[i] = novaLinha;
                console.log('✓ Adicionado onclick="closeModal()" ao btn-close-modal');
                modificado = true;
                break;
            }
        }
        
        htmlContent = linhas.join('\n');
    }
    
    if (modificado) {
        fs.writeFileSync('./public/index.html', htmlContent);
        console.log('');
        console.log('✅ HTML CORRIGIDO COM SUCESSO');
        console.log('✅ Botões agora conectados às funções JavaScript');
        
        console.log('');
        console.log('TESTE IMEDIATAMENTE:');
        console.log('1. Recarregue a página (F5)');
        console.log('2. Clique "Nova Doação"');
        console.log('3. Preencha campos obrigatórios');
        console.log('4. Clique "Salvar" - deve funcionar agora');
        console.log('5. Teste "Cancelar" - deve fechar modal');
        
    } else {
        console.log('Nenhuma modificação necessária ou botões não encontrados');
    }
    
} catch (error) {
    console.error('Erro:', error.message);
}