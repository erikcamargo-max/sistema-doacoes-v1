const fs = require('fs');

console.log('CORRIGINDO FUNCAO ASYNC DIRETAMENTE');
console.log('');

try {
    let content = fs.readFileSync('./public/app.js', 'utf-8');
    
    // Backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync('./public/app.js', `./public/app_backup_${timestamp}.js`);
    console.log('Backup criado');
    
    // Encontrar e corrigir window.addDonation
    if (content.includes('window.addDonation = function()')) {
        content = content.replace('window.addDonation = function()', 'window.addDonation = async function()');
        console.log('Corrigido: window.addDonation agora e async');
    }
    
    // Procurar outras funcoes que precisam ser async
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Se a linha contem 'function' e proximas linhas tem 'await'
        if ((line.includes('window.') && line.includes('function')) || line.includes('function ')) {
            // Verificar se tem await nas proximas 20 linhas
            let hasAwait = false;
            for (let j = i; j < Math.min(i + 20, lines.length); j++) {
                if (lines[j].includes('await') && !lines[j].trim().startsWith('//')) {
                    hasAwait = true;
                    break;
                }
            }
            
            if (hasAwait && !line.includes('async')) {
                console.log(`Linha ${i + 1} precisa ser async: ${line.trim()}`);
                if (line.includes('= function')) {
                    lines[i] = line.replace('= function', '= async function');
                } else if (line.includes('function ')) {
                    lines[i] = line.replace('function ', 'async function ');
                }
                console.log(`Corrigido para: ${lines[i].trim()}`);
            }
        }
    }
    
    content = lines.join('\n');
    fs.writeFileSync('./public/app.js', content);
    
    console.log('Arquivo corrigido!');
    console.log('');
    console.log('Teste agora: npm start');
    
} catch (error) {
    console.error('Erro:', error.message);
}