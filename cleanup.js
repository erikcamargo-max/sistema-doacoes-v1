// cleanup.js - Script de limpeza e atualização do sistema
// Execute com: node cleanup.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando limpeza e atualização do sistema...\n');

// ========================================
// 1. ATUALIZAR VERSÃO NO PACKAGE.JSON
// ========================================
function atualizarVersao() {
    const packagePath = './package.json';
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const versaoAntiga = packageJson.version;
        packageJson.version = '1.1.0';
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`✅ Versão atualizada: ${versaoAntiga} → 1.1.0`);
    } catch (error) {
        console.error('❌ Erro ao atualizar versão:', error.message);
    }
}

// ========================================
// 2. REMOVER CONSOLE.LOGS DO APP.JS
// ========================================
function removerConsoleLogs() {
    const appPath = './public/app.js';
    
    if (!fs.existsSync(appPath)) {
        console.log('⚠️  app.js não encontrado');
        return;
    }
    
    try {
        let content = fs.readFileSync(appPath, 'utf8');
        const originalLength = content.length;
        
        // Fazer backup antes de modificar
        const backupPath = `./backups/app_${Date.now()}.js`;
        if (!fs.existsSync('./backups')) {
            fs.mkdirSync('./backups');
        }
        fs.writeFileSync(backupPath, content);
        console.log(`📦 Backup criado: ${backupPath}`);
        
        // Remover console.logs mantendo console.errors
        content = content.replace(/console\.log\([^)]*\);?/g, '// console.log removed');
        
        // Contar quantos foram removidos
        const matches = content.match(/console\.log removed/g);
        const removidos = matches ? matches.length : 0;
        
        fs.writeFileSync(appPath, content);
        console.log(`✅ ${removidos} console.logs removidos/comentados`);
        
    } catch (error) {
        console.error('❌ Erro ao processar app.js:', error.message);
    }
}

// ========================================
// 3. REMOVER MODAL DUPLICADO DO HTML
// ========================================
function removerModalDuplicado() {
    const htmlPath = './public/index.html';
    
    if (!fs.existsSync(htmlPath)) {
        console.log('⚠️  index.html não encontrado');
        return;
    }
    
    try {
        let content = fs.readFileSync(htmlPath, 'utf8');
        
        // Contar quantos modais de histórico existem
        const matches = content.match(/id="modal-history"/g);
        const count = matches ? matches.length : 0;
        
        if (count > 1) {
            // Fazer backup
            const backupPath = `./backups/index_${Date.now()}.html`;
            fs.writeFileSync(backupPath, content);
            console.log(`📦 Backup HTML criado: ${backupPath}`);
            
            // Estratégia: dividir o HTML em partes e remover o segundo modal
            const parts = content.split('id="modal-history"');
            if (parts.length > 2) {
                // Encontrar onde termina o segundo modal
                const segundoModal = parts[2];
                const fimModal = segundoModal.indexOf('</div>\n</div>');
                
                if (fimModal > -1) {
                    // Reconstruir sem o segundo modal
                    content = parts[0] + 'id="modal-history"' + parts[1] + 
                             'id="modal-history"' + segundoModal.substring(fimModal + 13);
                    
                    // Agora remover a segunda ocorrência
                    const firstIndex = content.indexOf('id="modal-history"');
                    const beforeFirst = content.substring(0, firstIndex);
                    const afterFirst = content.substring(firstIndex);
                    const secondIndex = afterFirst.indexOf('id="modal-history"', 20);
                    
                    if (secondIndex > -1) {
                        // Encontrar o fim do segundo modal
                        let divCount = 0;
                        let endIndex = secondIndex;
                        let inModal = false;
                        
                        for (let i = secondIndex; i < afterFirst.length; i++) {
                            if (afterFirst.substring(i, i + 4) === '<div') {
                                divCount++;
                                inModal = true;
                            } else if (afterFirst.substring(i, i + 6) === '</div>') {
                                divCount--;
                                if (inModal && divCount === 0) {
                                    endIndex = i + 6;
                                    break;
                                }
                            }
                        }
                        
                        // Remover o segundo modal
                        content = beforeFirst + afterFirst.substring(0, secondIndex - 50) + 
                                 afterFirst.substring(endIndex);
                    }
                }
                
                fs.writeFileSync(htmlPath, content);
                console.log('✅ Modal duplicado removido');
            }
        } else if (count === 1) {
            console.log('✓ Apenas um modal de histórico encontrado (correto)');
        } else {
            console.log('⚠️  Nenhum modal de histórico encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar HTML:', error.message);
    }
}

// ========================================
// 4. REMOVER REFERÊNCIA AO CHART.JS
// ========================================
function removerChartJS() {
    const htmlPath = './public/index.html';
    
    if (!fs.existsSync(htmlPath)) {
        return;
    }
    
    try {
        let content = fs.readFileSync(htmlPath, 'utf8');
        
        // Remover linha do Chart.js
        content = content.replace(
            /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/Chart\.js\/[^"]+"><\/script>\n?/g,
            ''
        );
        
        // Remover divs de gráficos
        const graficosRegex = /<div class="grid grid-cols-1 lg:grid-cols-2[^>]*>[\s\S]*?<canvas id="chart-[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
        
        if (content.match(graficosRegex)) {
            content = content.replace(graficosRegex, '<!-- Gráficos removidos -->');
            console.log('✅ Seção de gráficos removida do HTML');
        }
        
        fs.writeFileSync(htmlPath, content);
        console.log('✅ Referência ao Chart.js removida');
        
    } catch (error) {
        console.error('❌ Erro ao remover Chart.js:', error.message);
    }
}

// ========================================
// 5. CRIAR ARQUIVO DE VERSÃO
// ========================================
function criarArquivoVersao() {
    const versionContent = '1.1.0';
    fs.writeFileSync('./VERSAO.txt', versionContent);
    console.log('✅ Arquivo VERSAO.txt criado');
}

// ========================================
// EXECUTAR TODAS AS TAREFAS
// ========================================
console.log('📋 Executando tarefas de limpeza e atualização:\n');

atualizarVersao();
removerConsoleLogs();
removerModalDuplicado();
removerChartJS();
criarArquivoVersao();

console.log('\n' + '='.repeat(50));
console.log('🎉 PROCESSO DE LIMPEZA CONCLUÍDO!');
console.log('='.repeat(50));

console.log('\n✨ Resumo das alterações:');
console.log('   - Versão atualizada para 1.1.0');
console.log('   - Console.logs removidos/comentados');
console.log('   - Modal duplicado verificado');
console.log('   - Chart.js e gráficos removidos');
console.log('   - Arquivo de versão criado');

console.log('\n📌 Próximos passos:');
console.log('   1. Adicionar as novas rotas no server.js');
console.log('   2. Atualizar as funções no app.js');
console.log('   3. Testar geração de carnê e exportação PDF');
console.log('   4. Reiniciar o servidor: npm start');

console.log('\n✅ Sistema pronto para as novas funcionalidades!');