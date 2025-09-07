// Analisar estrutura real da função window.addDonation
const fs = require('fs');

console.log('Analisando estrutura real da função...');

try {
    const content = fs.readFileSync('./public/app.js', 'utf-8');
    
    // Localizar window.addDonation
    const funcStart = content.indexOf('window.addDonation = ');
    if (funcStart === -1) {
        console.log('Função window.addDonation não encontrada');
        
        // Procurar outras variações
        if (content.includes('function addDonation')) {
            console.log('Encontrada: function addDonation');
        } else if (content.includes('addDonation =')) {
            console.log('Encontrada: addDonation =');
        } else {
            console.log('Nenhuma função de adicionar doação encontrada');
        }
        process.exit(1);
    }
    
    // Encontrar final da função
    let funcEnd = funcStart;
    let braces = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = funcStart; i < content.length; i++) {
        const char = content[i];
        
        if (!inString) {
            if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                braces++;
            } else if (char === '}') {
                braces--;
                if (braces === 0) {
                    funcEnd = i + 1;
                    break;
                }
            }
        } else {
            if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        }
    }
    
    if (funcEnd === funcStart) {
        console.log('Não foi possível localizar o final da função');
        process.exit(1);
    }
    
    // Extrair função completa
    const funcContent = content.substring(funcStart, funcEnd);
    console.log('Função localizada, tamanho:', funcContent.length, 'caracteres');
    
    // Analisar conteúdo
    console.log('\nAnálise da função:');
    console.log('- Usa fetch?', funcContent.includes('fetch(') ? 'SIM' : 'NÃO');
    console.log('- Usa JSON.stringify?', funcContent.includes('JSON.stringify') ? 'SIM' : 'NÃO');
    console.log('- Acessa input-donor?', funcContent.includes('input-donor') ? 'SIM' : 'NÃO');
    console.log('- Acessa input-recurrent?', funcContent.includes('input-recurrent') ? 'SIM' : 'NÃO');
    console.log('- Acessa input-parcelas?', funcContent.includes('input-parcelas') ? 'SIM' : 'NÃO');
    console.log('- Tem campo recorrente?', funcContent.includes('recorrente') ? 'SIM' : 'NÃO');
    console.log('- Tem campo parcelas?', funcContent.includes('parcelas') ? 'SIM' : 'NÃO');
    
    // Mostrar trecho do fetch se existir
    if (funcContent.includes('fetch(')) {
        const fetchIndex = funcContent.indexOf('fetch(');
        const fetchEnd = funcContent.indexOf('});', fetchIndex) + 3;
        const fetchContent = funcContent.substring(fetchIndex, fetchEnd);
        
        console.log('\nTrecho do fetch:');
        console.log(fetchContent.substring(0, 300) + '...');
    }
    
    // Mostrar primeiras linhas para entender estrutura
    console.log('\nPrimeiras 10 linhas da função:');
    const lines = funcContent.split('\n').slice(0, 10);
    lines.forEach((line, index) => {
        console.log(`${index + 1}: ${line.trim()}`);
    });
    
} catch (error) {
    console.error('Erro:', error.message);
}