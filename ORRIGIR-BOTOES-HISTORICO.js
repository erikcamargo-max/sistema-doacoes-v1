/**
 * ================================================================
 * SCRIPT: Corrigir Botões de Histórico
 * ================================================================
 * 
 * PROBLEMA IDENTIFICADO:
 * - Botões na tabela chamam viewHistory() 
 * - Precisa chamar showSimpleHistory() (que criamos)
 * 
 * SOLUÇÃO:
 * - Localizar onde os botões são criados
 * - Substituir viewHistory por showSimpleHistory
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo botões de histórico...\n');

const appJsPath = path.join(__dirname, 'public', 'app.js');

// Backup
const appContent = fs.readFileSync(appJsPath, 'utf8');
fs.writeFileSync(appJsPath + '.backup_botoes_' + Date.now(), appContent);

let correctedContent = appContent;

// Encontrar e substituir todas as chamadas viewHistory por showSimpleHistory
const patterns = [
    // Padrão 1: onclick="viewHistory(
    {
        old: /onclick="viewHistory\(/g,
        new: 'onclick="showSimpleHistory('
    },
    // Padrão 2: viewHistory(donation.id)
    {
        old: /viewHistory\(donation\.id\)/g,
        new: 'showSimpleHistory(donation.id)'
    },
    // Padrão 3: 'viewHistory(' + 
    {
        old: /'viewHistory\(' \+/g,
        new: "'showSimpleHistory(' +"
    },
    // Padrão 4: "viewHistory(" + 
    {
        old: /"viewHistory\(" \+/g,
        new: '"showSimpleHistory(" +'
    }
];

console.log('📊 Procurando padrões de viewHistory...\n');

patterns.forEach((pattern, index) => {
    const matches = correctedContent.match(pattern.old);
    if (matches) {
        console.log(`✅ Padrão ${index + 1}: ${matches.length} ocorrência(s) encontrada(s)`);
        correctedContent = correctedContent.replace(pattern.old, pattern.new);
    } else {
        console.log(`❌ Padrão ${index + 1}: Não encontrado`);
    }
});

// Verificar se houve mudanças
if (correctedContent !== appContent) {
    fs.writeFileSync(appJsPath, correctedContent);
    console.log('\n✅ Arquivo atualizado com sucesso!');
    
    // Mostrar diferenças
    const originalLines = appContent.split('\n');
    const newLines = correctedContent.split('\n');
    
    console.log('\n📋 Mudanças realizadas:');
    for (let i = 0; i < originalLines.length; i++) {
        if (originalLines[i] !== newLines[i]) {
            console.log(`Linha ${i + 1}:`);
            console.log(`  ANTES: ${originalLines[i].trim()}`);
            console.log(`  DEPOIS: ${newLines[i].trim()}`);
        }
    }
} else {
    console.log('\n⚠️ Nenhuma mudança necessária encontrada');
    console.log('Vamos procurar manualmente...\n');
    
    // Busca manual mais específica
    const searchTerms = ['viewHistory', 'onclick=', 'button'];
    searchTerms.forEach(term => {
        const lines = appContent.split('\n');
        const matchingLines = lines.filter((line, index) => {
            return line.includes(term) && line.includes('History');
        }).map((line, index) => {
            const lineNumber = lines.indexOf(line) + 1;
            return `Linha ${lineNumber}: ${line.trim()}`;
        });
        
        if (matchingLines.length > 0) {
            console.log(`🔍 Linhas com "${term}":`, matchingLines);
        }
    });
}

console.log('\n🔄 Teste agora:');
console.log('1. Recarregue a página (Ctrl+F5)');
console.log('2. Clique no ícone de histórico');
console.log('3. Deve aparecer o modal com parcelas!');