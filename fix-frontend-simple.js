// Correção simples do frontend - baseada no D008-SC funcionando
const fs = require('fs');

console.log('Corrigindo frontend baseado no D008-SC...');

try {
    let content = fs.readFileSync('./public/app.js', 'utf-8');
    
    // Backup
    const backup = `./public/app_backup_${Date.now()}.js`;
    fs.writeFileSync(backup, content);
    console.log('Backup criado:', backup);
    
    // Localizar window.addDonation
    const funcStart = content.indexOf('window.addDonation = ');
    if (funcStart === -1) {
        console.log('Função window.addDonation não encontrada');
        process.exit(1);
    }
    
    // Localizar JSON.stringify
    const jsonStart = content.indexOf('JSON.stringify({', funcStart);
    if (jsonStart === -1) {
        console.log('JSON.stringify não encontrado');
        process.exit(1);
    }
    
    // Verificar se já tem os campos
    const funcContent = content.substring(funcStart, jsonStart + 500);
    
    if (funcContent.includes('recorrente:') && funcContent.includes('parcelas:')) {
        console.log('Campos já existem. Verificando coleta...');
        
        if (!funcContent.includes('input-recurrent') || !funcContent.includes('input-parcelas')) {
            console.log('Adicionando coleta de dados...');
            
            const coleta = `
            
        // Coletar dados das parcelas
        const recurrentEl = document.getElementById('input-recurrent');
        const isRecorrente = recurrentEl ? recurrentEl.checked : false;
        let parcelas = 1;
        let proximaParcela = null;
        
        if (isRecorrente) {
            const parcelasEl = document.getElementById('input-parcelas');
            if (parcelasEl && parcelasEl.value) {
                parcelas = parseInt(parcelasEl.value);
            }
            const proximaEl = document.getElementById('input-proxima-parcela');
            if (proximaEl && proximaEl.value) {
                proximaParcela = proximaEl.value;
            }
        }
        `;
            
            content = content.substring(0, jsonStart) + coleta + content.substring(jsonStart);
            fs.writeFileSync('./public/app.js', content);
            console.log('Coleta de dados adicionada!');
        } else {
            console.log('Sistema já parece estar correto');
        }
    } else {
        console.log('Sistema precisa de implementação completa de parcelas');
    }
    
    console.log('Correção concluída. Teste agora:');
    console.log('1. Recarregue a página (Ctrl+F5)');
    console.log('2. Crie doação com 6 parcelas de R$ 30,00');
    console.log('3. Compare com D008-SC');
    
} catch (error) {
    console.error('Erro:', error.message);
}