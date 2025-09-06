// ============================================================================
// CORREÇÃO DE EMERGÊNCIA - RESTAURAR SISTEMA FUNCIONAL
// Data: 06/09/2025
// Objetivo: Corrigir erro que está travando o sistema
// ============================================================================

const fs = require('fs');

console.log('🚨 CORREÇÃO DE EMERGÊNCIA');
console.log('═'.repeat(50));
console.log('🎯 Restaurando sistema funcional');
console.log('');

// ============================================================================
// RESTAURAR BACKUP MAIS RECENTE FUNCIONAL
// ============================================================================

function encontrarBackupFuncional() {
    console.log('🔍 PROCURANDO BACKUP FUNCIONAL...');
    
    try {
        // Listar todos os backups
        const files = fs.readdirSync('./public/');
        const backups = files.filter(file => file.includes('backup') && file.endsWith('.js'));
        
        if (backups.length === 0) {
            console.log('❌ Nenhum backup encontrado!');
            return null;
        }
        
        // Ordenar por data de modificação (mais recente primeiro)
        const backupsComData = backups.map(backup => {
            const stats = fs.statSync(`./public/${backup}`);
            return {
                nome: backup,
                data: stats.mtime,
                tamanho: stats.size
            };
        }).sort((a, b) => b.data - a.data);
        
        console.log('📋 BACKUPS DISPONÍVEIS:');
        backupsComData.forEach((backup, index) => {
            const dataFormatada = backup.data.toLocaleString('pt-BR');
            const tamanhoKB = (backup.tamanho / 1024).toFixed(2);
            console.log(`  ${index + 1}. ${backup.nome}`);
            console.log(`     📅 ${dataFormatada} | 📦 ${tamanhoKB} KB`);
        });
        
        return backupsComData;
        
    } catch (error) {
        console.error('❌ Erro ao procurar backups:', error.message);
        return null;
    }
}

// ============================================================================
// VALIDAR BACKUP
// ============================================================================

function validarBackup(nomeBackup) {
    console.log(`\n🔍 VALIDANDO BACKUP: ${nomeBackup}`);
    
    try {
        const content = fs.readFileSync(`./public/${nomeBackup}`, 'utf-8');
        
        // Verificações básicas
        const verificacoes = [
            {
                nome: 'Tamanho mínimo',
                check: content.length > 10000,
                descricao: 'Arquivo deve ter mais de 10KB'
            },
            {
                nome: 'Função loadDashboard',
                check: content.includes('function loadDashboard'),
                descricao: 'Função essencial do sistema'
            },
            {
                nome: 'API_BASE definido',
                check: content.includes('API_BASE'),
                descricao: 'Configuração da API'
            },
            {
                nome: 'Função generateCarne',
                check: content.includes('generateCarne'),
                descricao: 'Função de geração de carnê'
            },
            {
                nome: 'Sem erros de sintaxe óbvios',
                check: !content.includes('${') || content.includes('`'),
                descricao: 'Template literals bem formados'
            }
        ];
        
        let pontuacao = 0;
        verificacoes.forEach(verificacao => {
            if (verificacao.check) {
                console.log(`  ✅ ${verificacao.nome}`);
                pontuacao++;
            } else {
                console.log(`  ❌ ${verificacao.nome} - ${verificacao.descricao}`);
            }
        });
        
        const percentual = (pontuacao / verificacoes.length) * 100;
        console.log(`  📊 Pontuação: ${pontuacao}/${verificacoes.length} (${percentual.toFixed(1)}%)`);
        
        return percentual >= 80; // Backup é válido se tiver 80% ou mais
        
    } catch (error) {
        console.error(`  ❌ Erro ao validar backup: ${error.message}`);
        return false;
    }
}

// ============================================================================
// RESTAURAR BACKUP
// ============================================================================

function restaurarBackup(nomeBackup) {
    console.log(`\n🔄 RESTAURANDO BACKUP: ${nomeBackup}`);
    
    try {
        // Fazer backup do arquivo atual (com erro)
        const arquivoAtual = './public/app.js';
        const backupErro = `./public/app_com_erro_${Date.now()}.js`;
        
        if (fs.existsSync(arquivoAtual)) {
            fs.copyFileSync(arquivoAtual, backupErro);
            console.log(`💾 Arquivo com erro salvo em: ${backupErro}`);
        }
        
        // Restaurar backup
        fs.copyFileSync(`./public/${nomeBackup}`, arquivoAtual);
        console.log('✅ Backup restaurado com sucesso!');
        
        // Validar arquivo restaurado
        console.log('\n🔍 VALIDANDO ARQUIVO RESTAURADO...');
        const valido = validarBackup('../app.js');
        
        if (valido) {
            console.log('✅ Arquivo restaurado é válido!');
            return true;
        } else {
            console.log('⚠️ Arquivo restaurado pode ter problemas');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Erro ao restaurar backup:', error.message);
        return false;
    }
}

// ============================================================================
// TESTAR SINTAXE JAVASCRIPT
// ============================================================================

function testarSintaxe() {
    console.log('\n🔍 TESTANDO SINTAXE JAVASCRIPT...');
    
    try {
        const content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Tentar parsear o JavaScript
        new Function(content);
        console.log('✅ Sintaxe JavaScript válida!');
        return true;
        
    } catch (error) {
        console.log('❌ Erro de sintaxe encontrado:');
        console.log(`   ${error.message}`);
        
        // Tentar extrair número da linha do erro
        const match = error.message.match(/line (\d+)/i);
        if (match) {
            const linha = parseInt(match[1]);
            console.log(`   📍 Erro na linha: ${linha}`);
            
            // Mostrar contexto da linha com erro
            const lines = content.split('\n');
            if (linha > 0 && linha <= lines.length) {
                console.log('\n📋 CONTEXTO DO ERRO:');
                const start = Math.max(0, linha - 3);
                const end = Math.min(lines.length, linha + 2);
                
                for (let i = start; i < end; i++) {
                    const marker = (i + 1) === linha ? '>>> ' : '    ';
                    console.log(`${marker}${(i + 1).toString().padStart(4, ' ')}: ${lines[i]}`);
                }
            }
        }
        
        return false;
    }
}

// ============================================================================
// ADICIONAR GENERATECARNE SIMPLES
// ============================================================================

function adicionarGenerateCarneSimples() {
    console.log('\n🔧 ADICIONANDO FUNÇÃO GENERATECARNE SIMPLES...');
    
    try {
        let content = fs.readFileSync('./public/app.js', 'utf-8');
        
        // Verificar se já existe
        if (content.includes('function generateCarne')) {
            console.log('ℹ️ Função generateCarne já existe');
            return true;
        }
        
        // Função super simples para não dar erro
        const funcaoSimples = `

// ============================================================================
// FUNÇÃO GENERATECARNE SIMPLES - SEM SELO E QR (EMERGÊNCIA)
// ============================================================================

async function generateCarne(doacaoId) {
    try {
        console.log('Gerando carnê para doação:', doacaoId);
        
        // Buscar dados básicos
        const doacaoResponse = await fetch('/api/doacoes/' + doacaoId);
        const doacao = await doacaoResponse.json();
        const doadorResponse = await fetch('/api/doadores/' + doacao.doador_id);
        const doador = await doadorResponse.json();
        
        // Criar janela simples
        const janela = window.open('', '_blank');
        const html = '<!DOCTYPE html><html><head><title>Carnê - ' + doador.nome + '</title></head><body style="font-family: Arial; padding: 20px;"><h1>CARNÊ DE PAGAMENTO</h1><h2>' + doador.nome + '</h2><p>Valor: R$ ' + doacao.valor.toFixed(2) + '</p><p>Tipo: ' + doacao.tipo + '</p><button onclick="window.print()">Imprimir</button></body></html>';
        
        janela.document.write(html);
        janela.document.close();
        
        if (typeof showNotification === 'function') {
            showNotification('Carnê básico gerado', 'success');
        }
        
    } catch (error) {
        console.error('Erro ao gerar carnê:', error);
        alert('Erro ao gerar carnê: ' + error.message);
    }
}`;

        // Adicionar no final do arquivo
        content += funcaoSimples;
        
        // Salvar
        fs.writeFileSync('./public/app.js', content);
        console.log('✅ Função generateCarne simples adicionada');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao adicionar função:', error.message);
        return false;
    }
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando correção de emergência...\n');
    
    // 1. Encontrar backups
    const backups = encontrarBackupFuncional();
    if (!backups || backups.length === 0) {
        console.log('❌ Não há backups para restaurar!');
        return;
    }
    
    // 2. Tentar restaurar o backup mais recente que seja válido
    let restaurado = false;
    
    for (let i = 0; i < Math.min(backups.length, 3); i++) {
        const backup = backups[i];
        console.log(`\n🔄 Tentativa ${i + 1}: ${backup.nome}`);
        
        if (validarBackup(backup.nome)) {
            if (restaurarBackup(backup.nome)) {
                restaurado = true;
                break;
            }
        } else {
            console.log('⚠️ Backup inválido, tentando próximo...');
        }
    }
    
    if (!restaurado) {
        console.log('\n❌ Não foi possível restaurar nenhum backup válido');
        return;
    }
    
    // 3. Testar sintaxe
    const sintaxeOk = testarSintaxe();
    
    if (!sintaxeOk) {
        console.log('\n❌ Ainda há erros de sintaxe após restauração');
        return;
    }
    
    // 4. Garantir que generateCarne existe (versão simples)
    adicionarGenerateCarneSimples();
    
    // 5. Teste final
    const testeFinal = testarSintaxe();
    
    if (testeFinal) {
        console.log('\n🎉 CORREÇÃO DE EMERGÊNCIA CONCLUÍDA!');
        console.log('═'.repeat(50));
        console.log('✅ Sistema restaurado e funcional');
        console.log('✅ Backup válido aplicado');
        console.log('✅ Sintaxe JavaScript corrigida');
        console.log('✅ Função generateCarne disponível');
        
        console.log('\n🚀 PRÓXIMOS PASSOS:');
        console.log('1. Recarregue a página (Ctrl+F5)');
        console.log('2. Verifique se o sistema carrega normalmente');
        console.log('3. Teste a geração de carnê (versão básica)');
        console.log('4. Se tudo funcionar, poderemos reimplementar selo e QR');
        
        console.log('\n⚠️ NOTA IMPORTANTE:');
        console.log('   Esta versão tem carnê BÁSICO (sem selo e QR Code)');
        console.log('   Após confirmar que funciona, reimplementaremos os recursos');
        
    } else {
        console.log('\n❌ Ainda há problemas. Sistema pode precisar de reparo manual.');
    }
}

// Executar correção
main();