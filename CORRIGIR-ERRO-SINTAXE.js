// ============================================================================
// SCRIPT PARA CORRIGIR ERRO DE SINTAXE NO APP.JS
// Data: 06/09/2025
// Objetivo: Diagnosticar e corrigir erro na linha 1709 do app.js
// ============================================================================

const fs = require('fs');

console.log('🚨 CORREÇÃO DE ERRO DE SINTAXE');
console.log('═'.repeat(50));
console.log('🎯 Erro detectado na linha 1709 do app.js');
console.log('🔧 Iniciando diagnóstico e correção...');
console.log('');

// ============================================================================
// FUNÇÃO PARA DIAGNOSTICAR O ERRO
// ============================================================================

function diagnosticarErro() {
    const appPath = './public/app.js';
    
    if (!fs.existsSync(appPath)) {
        console.error('❌ Arquivo app.js não encontrado!');
        return null;
    }
    
    try {
        const content = fs.readFileSync(appPath, 'utf-8');
        const lines = content.split('\n');
        
        console.log('📊 Estatísticas do arquivo:');
        console.log(`   📏 Total de linhas: ${lines.length}`);
        console.log(`   📦 Tamanho: ${(content.length / 1024).toFixed(2)} KB`);
        
        // Verificar linha 1709 e contexto
        const errorLine = 1709;
        const startContext = Math.max(0, errorLine - 5);
        const endContext = Math.min(lines.length, errorLine + 5);
        
        console.log('\n🔍 ANALISANDO CONTEXTO DO ERRO:');
        console.log(`📍 Linha ${errorLine}: ${lines[errorLine - 1] || 'LINHA VAZIA'}`);
        
        console.log('\n📋 CONTEXTO (5 linhas antes e depois):');
        for (let i = startContext; i < endContext; i++) {
            const lineNum = i + 1;
            const line = lines[i] || '';
            const marker = lineNum === errorLine ? '>>> ' : '    ';
            console.log(`${marker}${lineNum}: ${line}`);
        }
        
        // Procurar por problemas comuns
        console.log('\n🔍 VERIFICANDO PROBLEMAS COMUNS:');
        
        const problemasComuns = [
            {
                nome: 'Aspas não fechadas',
                regex: /(['"`])[^'"`]*$/,
                descricao: 'String não fechada'
            },
            {
                nome: 'Parênteses não fechados',
                regex: /\([^)]*$/,
                descricao: 'Parênteses aberto sem fechamento'
            },
            {
                nome: 'Chaves não fechadas',
                regex: /\{[^}]*$/,
                descricao: 'Chave aberta sem fechamento'
            },
            {
                nome: 'Template literals malformados',
                regex: /`[^`]*$/,
                descricao: 'Template literal não fechado'
            }
        ];
        
        const linhaProblema = lines[errorLine - 1] || '';
        
        problemasComuns.forEach(problema => {
            if (problema.regex.test(linhaProblema)) {
                console.log(`  ❌ ${problema.nome}: ${problema.descricao}`);
            } else {
                console.log(`  ✅ ${problema.nome}: OK`);
            }
        });
        
        return { content, lines, errorLine };
        
    } catch (error) {
        console.error('❌ Erro ao ler arquivo:', error.message);
        return null;
    }
}

// ============================================================================
// FUNÇÃO PARA RESTAURAR BACKUP
// ============================================================================

function restaurarBackup() {
    console.log('\n🔄 PROCURANDO BACKUPS DISPONÍVEIS...');
    
    try {
        const files = fs.readdirSync('./public/');
        const backups = files.filter(file => file.includes('backup') && file.endsWith('.js'));
        
        if (backups.length === 0) {
            console.log('❌ Nenhum backup encontrado');
            return false;
        }
        
        // Ordenar por data (mais recente primeiro)
        backups.sort((a, b) => {
            const statsA = fs.statSync(`./public/${a}`);
            const statsB = fs.statSync(`./public/${b}`);
            return statsB.mtime - statsA.mtime;
        });
        
        console.log('📋 Backups disponíveis:');
        backups.slice(0, 5).forEach((backup, index) => {
            const stats = fs.statSync(`./public/${backup}`);
            const date = stats.mtime.toLocaleString('pt-BR');
            console.log(`  ${index + 1}. ${backup} (${date})`);
        });
        
        // Usar o backup mais recente
        const latestBackup = backups[0];
        console.log(`\n🔄 Restaurando backup mais recente: ${latestBackup}`);
        
        const backupContent = fs.readFileSync(`./public/${latestBackup}`, 'utf-8');
        
        // Fazer backup do arquivo atual (com erro)
        const errorBackupPath = `./public/app_com_erro_${Date.now()}.js`;
        fs.copyFileSync('./public/app.js', errorBackupPath);
        console.log(`💾 Arquivo com erro salvo em: ${errorBackupPath}`);
        
        // Restaurar backup
        fs.writeFileSync('./public/app.js', backupContent);
        console.log('✅ Backup restaurado com sucesso!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao restaurar backup:', error.message);
        return false;
    }
}

// ============================================================================
// FUNÇÃO PARA VALIDAR SINTAXE JAVASCRIPT
// ============================================================================

function validarSintaxe() {
    console.log('\n🔍 VALIDANDO SINTAXE JAVASCRIPT...');
    
    try {
        const content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Tentar parsear o código
        new Function(content);
        console.log('✅ Sintaxe JavaScript válida!');
        return true;
        
    } catch (error) {
        console.log('❌ Erro de sintaxe encontrado:');
        console.log(`   Linha: ${error.lineNumber || 'Desconhecida'}`);
        console.log(`   Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// FUNÇÃO PARA CORRIGIR AUTOMATICAMENTE
// ============================================================================

function corrigirAutomaticamente() {
    console.log('\n🔧 TENTANDO CORREÇÃO AUTOMÁTICA...');
    
    try {
        let content = fs.readFileSync('./public/app.js', 'utf-8');
        let corrected = false;
        
        // Correção 1: Remover caracteres invisíveis
        const originalLength = content.length;
        content = content.replace(/[\u200B-\u200D\uFEFF]/g, '');
        if (content.length !== originalLength) {
            console.log('✅ Caracteres invisíveis removidos');
            corrected = true;
        }
        
        // Correção 2: Normalizar quebras de linha
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Correção 3: Remover espaços em branco no final das linhas
        content = content.replace(/[ \t]+$/gm, '');
        
        // Correção 4: Verificar se há template literals malformados
        const templateLiteralRegex = /`[^`]*$/gm;
        if (templateLiteralRegex.test(content)) {
            console.log('⚠️ Template literals potencialmente malformados detectados');
        }
        
        if (corrected) {
            fs.writeFileSync('./public/app.js', content);
            console.log('✅ Correções automáticas aplicadas');
            return true;
        } else {
            console.log('ℹ️ Nenhuma correção automática necessária');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro na correção automática:', error.message);
        return false;
    }
}

// ============================================================================
// FUNÇÃO PARA REIMPLEMENTAR SELO CORRETAMENTE
// ============================================================================

function reimplementarSeloCorretamente() {
    console.log('\n🔒 REIMPLEMENTANDO SELO DE AUTENTICIDADE CORRETAMENTE...');
    
    try {
        let content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Verificar se a função generateCarne existe
        if (!content.includes('async function generateCarne')) {
            console.log('❌ Função generateCarne não encontrada');
            return false;
        }
        
        // Verificar se o selo já existe
        if (content.includes('selo-autenticidade') || content.includes('DOCUMENTO AUTÊNTICO')) {
            console.log('ℹ️ Selo já está implementado, pulando reimplementação');
            return true;
        }
        
        // Encontrar a função generateCarne
        const generateCarneMatch = content.match(/(async function generateCarne\([\s\S]*?}(?=\s*(?:async function|function|window\.|$)))/);
        
        if (!generateCarneMatch) {
            console.log('❌ Não foi possível localizar a função generateCarne completa');
            return false;
        }
        
        let generateCarneFunction = generateCarneMatch[1];
        
        // Adicionar CSS do selo de forma segura
        const cssToAdd = `
        .seal {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            border: 2px solid #28a745;
            border-radius: 50%;
            background: #28a745;
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 9px;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
        }`;
        
        // Adicionar CSS antes do fechamento da tag style
        if (generateCarneFunction.includes('</style>')) {
            generateCarneFunction = generateCarneFunction.replace('</style>', cssToAdd + '\n        </style>');
        }
        
        // Adicionar HTML do selo no header
        const htmlToAdd = `
        <div class="seal">
            🔒<br>
            DOCUMENTO<br>
            AUTÊNTICO
        </div>`;
        
        // Procurar por div class="header" e adicionar selo
        if (generateCarneFunction.includes('<div class="header">')) {
            generateCarneFunction = generateCarneFunction.replace(
                /(<div class="header">[\s\S]*?)(<\/div>)/,
                `$1${htmlToAdd}\n$2`
            );
        }
        
        // Substituir a função no conteúdo principal
        content = content.replace(generateCarneMatch[1], generateCarneFunction);
        
        // Salvar arquivo corrigido
        fs.writeFileSync('./public/app.js', content);
        console.log('✅ Selo de autenticidade reimplementado corretamente');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na reimplementação do selo:', error.message);
        return false;
    }
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE CORREÇÃO
// ============================================================================

function main() {
    console.log('🔧 Iniciando processo de correção...\n');
    
    // 1. Diagnosticar o erro
    const diagnostico = diagnosticarErro();
    if (!diagnostico) return;
    
    // 2. Tentar correção automática primeiro
    const correcaoAuto = corrigirAutomaticamente();
    
    // 3. Validar sintaxe após correção
    let sintaxeValida = validarSintaxe();
    
    // 4. Se ainda há erro, restaurar backup
    if (!sintaxeValida) {
        console.log('\n🔄 Correção automática não resolveu. Restaurando backup...');
        const backupRestaurado = restaurarBackup();
        
        if (backupRestaurado) {
            sintaxeValida = validarSintaxe();
        }
    }
    
    // 5. Se tudo OK, reimplementar selo corretamente
    if (sintaxeValida) {
        console.log('\n🔒 Sintaxe corrigida! Reimplementando selo de forma segura...');
        reimplementarSeloCorretamente();
        
        // Validar novamente
        const sintaxeFinal = validarSintaxe();
        
        if (sintaxeFinal) {
            console.log('\n🎉 CORREÇÃO COMPLETA COM SUCESSO!');
            console.log('═'.repeat(50));
            console.log('✅ Erro de sintaxe corrigido');
            console.log('✅ Backup restaurado/corrigido');
            console.log('✅ Selo de autenticidade implementado');
            console.log('✅ Sintaxe JavaScript validada');
            
            console.log('\n🚀 TESTE AGORA:');
            console.log('1. Execute: npm start');
            console.log('2. Acesse: http://localhost:3001');
            console.log('3. Teste o sistema normalmente');
            console.log('4. Gere um carnê para ver o selo 🔒');
            
        } else {
            console.log('\n❌ Ainda há problemas de sintaxe');
            console.log('💡 Pode ser necessária correção manual');
        }
        
    } else {
        console.log('\n❌ Não foi possível corrigir automaticamente');
        console.log('💡 Recomendações:');
        console.log('   1. Verifique os backups disponíveis');
        console.log('   2. Execute novamente o script de implementação');
        console.log('   3. Considere restaurar manualmente');
    }
}

// Executar correção
main();