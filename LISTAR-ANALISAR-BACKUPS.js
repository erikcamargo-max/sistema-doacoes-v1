/**
 * ANÁLISE COMPLETA DE BACKUPS
 * Versão: 2.4.1-ANALYZE-BACKUPS
 * Data: 25/09/2025
 */

const fs = require('fs');
const path = require('path');

console.log('📂 ANÁLISE COMPLETA DE BACKUPS');
console.log('============================\n');

const publicDir = 'public';

// Listar todos os arquivos .js
const files = fs.readdirSync(publicDir);
const jsFiles = files.filter(f => f.endsWith('.js'));

// Separar backups do arquivo atual
const backups = jsFiles.filter(f => f.includes('backup'));
const appJsAtual = jsFiles.find(f => f === 'app.js');

console.log(`📊 Total de arquivos: ${jsFiles.length}`);
console.log(`📦 Backups encontrados: ${backups.length}\n`);

// Analisar cada backup
const analises = [];

backups.forEach(backup => {
    const filePath = path.join(publicDir, backup);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar implementações
    const temEditCompleta = content.includes('window.editDonation') && 
                           !content.includes('Função de edição em desenvolvimento') &&
                           content.match(/window\.editDonation.*\{[\s\S]{500,}/);
    
    const temCarneCompleto = content.includes('window.generateCarne') && 
                            !content.includes('Função de carnê em desenvolvimento') &&
                            content.match(/window\.generateCarne.*\{[\s\S]{500,}/);
    
    analises.push({
        nome: backup,
        tamanho: stats.size,
        data: stats.mtime,
        temEditCompleta,
        temCarneCompleto,
        content: content
    });
});

// Ordenar por data (mais antigo primeiro)
analises.sort((a, b) => a.data - b.data);

// Mostrar análise
console.log('📋 ANÁLISE DOS BACKUPS (ordenados do mais antigo ao mais recente):\n');
console.log('═'.repeat(80));

analises.forEach((analise, index) => {
    console.log(`\n${index + 1}. ${analise.nome}`);
    console.log(`   Data: ${analise.data.toLocaleString('pt-BR')}`);
    console.log(`   Tamanho: ${Math.round(analise.tamanho / 1024)} KB`);
    console.log(`   editDonation completa: ${analise.temEditCompleta ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   generateCarne completo: ${analise.temCarneCompleto ? '✅ SIM' : '❌ NÃO'}`);
    
    if (analise.temEditCompleta || analise.temCarneCompleto) {
        console.log(`   🌟 CANDIDATO VÁLIDO!`);
    }
});

console.log('\n' + '═'.repeat(80));

// Encontrar melhor candidato
const candidatos = analises.filter(a => a.temEditCompleta || a.temCarneCompleto);

if (candidatos.length > 0) {
    console.log('\n✅ BACKUPS COM IMPLEMENTAÇÕES REAIS ENCONTRADOS:\n');
    
    candidatos.forEach((candidato, index) => {
        console.log(`${index + 1}. ${candidato.nome}`);
        if (candidato.temEditCompleta) console.log('   ✅ Tem editDonation completa');
        if (candidato.temCarneCompleto) console.log('   ✅ Tem generateCarne completo');
    });
    
    // Sugerir o melhor
    const melhor = candidatos[0]; // Mais antigo com implementações
    console.log(`\n🎯 RECOMENDAÇÃO: Usar "${melhor.nome}"`);
    console.log('   (É o mais antigo com implementações completas)\n');
    
    // Gerar comando para restaurar
    console.log('📝 PARA RESTAURAR, EXECUTE:\n');
    console.log(`node EXTRAIR-FUNCOES-BACKUP.js`);
    console.log(`Mas ANTES, edite o script e mude a linha:`);
    console.log(`const backupPath = 'public/${melhor.nome}';\n`);
    
} else {
    console.log('\n❌ NENHUM BACKUP COM IMPLEMENTAÇÕES COMPLETAS ENCONTRADO\n');
    console.log('💡 POSSÍVEIS SOLUÇÕES:\n');
    console.log('1. Verificar se há backups em outra pasta');
    console.log('2. Procurar arquivos com nomes diferentes (*.js.bak, etc)');
    console.log('3. Usar as implementações que criei (são funcionais, só com layout diferente)');
    console.log('4. Restaurar de um commit do Git se estiver usando controle de versão\n');
    
    console.log('📂 BACKUPS ANALISADOS (todos têm apenas stubs):\n');
    analises.forEach(a => {
        console.log(`   • ${a.nome} (${a.data.toLocaleDateString('pt-BR')})`);
    });
}

// Verificar se há mais backups em outras pastas
console.log('\n🔍 PROCURANDO BACKUPS EM OUTRAS PASTAS...\n');

const pastasProcurar = ['.', 'database', 'scripts'];

pastasProcurar.forEach(pasta => {
    if (fs.existsSync(pasta)) {
        try {
            const arquivos = fs.readdirSync(pasta);
            const backupsExtras = arquivos.filter(f => 
                (f.includes('backup') || f.includes('bak')) && 
                f.endsWith('.js')
            );
            
            if (backupsExtras.length > 0) {
                console.log(`📁 ${pasta}/`);
                backupsExtras.forEach(f => console.log(`   • ${f}`));
            }
        } catch (e) {
            // Ignorar erros de permissão
        }
    }
});

console.log('\n✅ ANÁLISE COMPLETA FINALIZADA');
