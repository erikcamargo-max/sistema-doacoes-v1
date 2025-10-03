/**
 * Verificar se rota parcelas-futuras existe no server.js
 */

const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════════');
console.log('  VERIFICAÇÃO DE ROTAS - SERVER.JS');
console.log('════════════════════════════════════════════════════════════\n');

const serverPath = path.join(__dirname, 'server.js');

console.log('📖 Lendo server.js...');
const serverContent = fs.readFileSync(serverPath, 'utf8');
const lines = serverContent.split('\n');
console.log(`✅ ${lines.length} linhas\n`);

console.log('🔍 PROCURANDO ROTAS DE PARCELAS:\n');

// Procurar todas as rotas relacionadas a parcelas
const rotasParcelas = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('/parcelas') && (line.includes('app.get') || line.includes('app.post'))) {
        rotasParcelas.push({
            linha: i + 1,
            codigo: line.trim()
        });
    }
}

console.log(`📊 Encontradas ${rotasParcelas.length} rotas:\n`);

rotasParcelas.forEach((rota, index) => {
    console.log(`${index + 1}. Linha ${rota.linha}:`);
    console.log(`   ${rota.codigo}\n`);
});

// Verificar especificamente parcelas-futuras
const temParcelasFuturas = serverContent.includes('/parcelas-futuras');
console.log(`${temParcelasFuturas ? '✅' : '❌'} Rota /parcelas-futuras existe: ${temParcelasFuturas}\n`);

if (!temParcelasFuturas) {
    console.log('⚠️  PROBLEMA: Rota não foi adicionada!\n');
    console.log('Possíveis causas:');
    console.log('1. Script anterior não funcionou corretamente');
    console.log('2. Arquivo foi revertido\n');
    console.log('SOLUÇÃO: Execute novamente o script de adicionar rota.\n');
} else {
    // Mostrar contexto da rota
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('/parcelas-futuras')) {
            console.log('📋 CONTEXTO DA ROTA (10 linhas):\n');
            const inicio = Math.max(0, i - 2);
            const fim = Math.min(lines.length, i + 10);
            
            for (let j = inicio; j < fim; j++) {
                const marcador = j === i ? '→' : ' ';
                console.log(`${marcador} ${j + 1}: ${lines[j]}`);
            }
            break;
        }
    }
}

console.log('\n════════════════════════════════════════════════════════════\n');
