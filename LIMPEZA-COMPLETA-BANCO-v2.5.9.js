/**
 * ================================================================
 * SCRIPT: Limpeza Completa do Banco de Dados
 * ================================================================
 * 
 * VERSÃO: 2.5.9-fix
 * DATA: 16/10/2025
 * CORREÇÃO: Erro de await fora de async resolvido
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║       LIMPEZA COMPLETA BANCO v2.5.9               ║');
console.log('║         ⚠️  SISTEMA EM PRODUÇÃO - ATENÇÃO ⚠️        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const dbPath = path.join(__dirname, 'database', 'doacoes.db');

// ================================================================
// CONFIRMAÇÃO DE SEGURANÇA
// ================================================================

function perguntarConfirmacao(pergunta) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(pergunta, (resposta) => {
            rl.close();
            resolve(resposta.toLowerCase() === 's' || resposta.toLowerCase() === 'sim');
        });
    });
}

// ================================================================
// CRIAR BACKUP
// ================================================================

async function criarBackup() {
    const timestamp = Date.now();
    const backupDir = path.join(__dirname, 'backups', 'pre-cleanup');
    const backupPath = path.join(backupDir, `backup_antes_limpeza_${timestamp}.db`);
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    try {
        fs.copyFileSync(dbPath, backupPath);
        const stats = fs.statSync(backupPath);
        console.log('\n💾 BACKUP CRIADO:');
        console.log(`   📁 ${backupPath}`);
        console.log(`   📊 Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
        return true;
    } catch (error) {
        console.log('\n⚠️ ERRO ao criar backup:', error.message);
        const continuar = await perguntarConfirmacao('\n❓ Continuar SEM backup? (s/n): ');
        if (!continuar) {
            console.log('\n🚫 Operação CANCELADA por segurança.');
            return false;
        }
        return true;
    }
}

// ================================================================
// FUNÇÃO PRINCIPAL DE LIMPEZA
// ================================================================

async function limparBanco() {
    // Confirmação de segurança
    console.log('⚠️  ATENÇÃO: Esta operação vai APAGAR TODOS OS DADOS do banco!');
    console.log('');
    console.log('📊 Antes de prosseguir:');
    console.log('   1. Certifique-se que é ambiente de TESTES');
    console.log('   2. Backup será criado automaticamente');
    console.log('   3. Operação não é reversível');
    console.log('');
    
    const confirmar = await perguntarConfirmacao('❓ Deseja REALMENTE limpar o banco? (s/n): ');
    
    if (!confirmar) {
        console.log('\n🚫 Operação CANCELADA pelo usuário.');
        console.log('✅ Nenhum dado foi alterado.\n');
        process.exit(0);
    }
    
    // Verificar se banco existe
    if (!fs.existsSync(dbPath)) {
        console.log('\n❌ Banco de dados não encontrado em:', dbPath);
        process.exit(1);
    }
    
    // Criar backup
    const backupOk = await criarBackup();
    if (!backupOk) {
        process.exit(0);
    }
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log('\n❌ Erro ao conectar:', err.message);
                reject(err);
                return;
            }
            
            console.log('\n✅ Conectado ao banco SQLite');
            console.log('\n🧹 INICIANDO LIMPEZA COMPLETA...\n');

            // Desabilitar foreign keys temporariamente
            db.run('PRAGMA foreign_keys = OFF', (err) => {
                if (err) {
                    console.log('⚠️ Erro ao desabilitar foreign keys:', err.message);
                }

                // Lista de tabelas (ORDEM IMPORTANTE: filhas → pais)
                const tabelas = [
                    'parcelas_futuras',
                    'historico_pagamentos',
                    'doacoes',
                    'doadores'
                ];

                let promises = [];

                tabelas.forEach(tabela => {
                    promises.push(new Promise((resolveTable) => {
                        db.get(`SELECT COUNT(*) as count FROM ${tabela}`, [], (err, result) => {
                            if (err) {
                                console.log(`❌ Erro ao contar ${tabela}:`, err.message);
                                resolveTable();
                                return;
                            }

                            const count = result.count;
                            console.log(`📊 ${tabela}: ${count} registros encontrados`);

                            if (count > 0) {
                                db.run(`DELETE FROM ${tabela}`, [], function(err) {
                                    if (err) {
                                        console.log(`❌ Erro ao limpar ${tabela}:`, err.message);
                                    } else {
                                        console.log(`🧹 ${tabela}: ${this.changes} registros REMOVIDOS`);
                                    }
                                    resolveTable();
                                });
                            } else {
                                console.log(`✅ ${tabela}: já estava vazia`);
                                resolveTable();
                            }
                        });
                    }));
                });

                Promise.all(promises).then(() => {
                    console.log('\n🔄 RESETANDO AUTO-INCREMENT...');
                    
                    db.run("DELETE FROM sqlite_sequence", [], function(err) {
                        if (err) {
                            console.log('⚠️ Erro ao resetar sequences:', err.message);
                        } else {
                            console.log(`✅ Sequences resetadas: ${this.changes} entradas`);
                        }

                        db.run('PRAGMA foreign_keys = ON', (err) => {
                            if (err) {
                                console.log('⚠️ Erro ao reabilitar foreign keys:', err.message);
                            }

                            verificarLimpeza(db).then(() => {
                                db.close();
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });
}

// ================================================================
// VERIFICAÇÃO FINAL
// ================================================================

function verificarLimpeza(db) {
    return new Promise((resolve) => {
        console.log('\n✅ VERIFICANDO LIMPEZA FINAL...\n');
        
        const tabelas = ['doadores', 'doacoes', 'historico_pagamentos', 'parcelas_futuras'];
        
        let promises = tabelas.map(tabela => {
            return new Promise((resolveVerify) => {
                db.get(`SELECT COUNT(*) as count FROM ${tabela}`, [], (err, result) => {
                    if (err) {
                        console.log(`❌ ${tabela}: erro na verificação`);
                    } else {
                        const status = result.count === 0 
                            ? '✅ LIMPA (0 registros)' 
                            : `⚠️ ${result.count} registros restantes`;
                        console.log(`   ${tabela}: ${status}`);
                    }
                    resolveVerify();
                });
            });
        });

        Promise.all(promises).then(() => {
            console.log('\n' + '═'.repeat(56));
            console.log('🎯 LIMPEZA CONCLUÍDA COM SUCESSO!');
            console.log('═'.repeat(56));
            console.log('');
            console.log('📋 ESTRUTURA DO BANCO (v2.5.9):');
            console.log('   📊 doadores: 14 campos + validação CPF único');
            console.log('   📊 doacoes: 10 campos + valor_parcelas_futuras');
            console.log('   📊 historico_pagamentos: 6 campos');
            console.log('   📊 parcelas_futuras: 8 campos + data_pagamento');
            console.log('');
            console.log('🎯 PRÓXIMOS PASSOS:');
            console.log('1. Iniciar servidor: npm start');
            console.log('2. Acessar: http://localhost:3001');
            console.log('3. Dashboard deve mostrar: 0 doações, R$ 0,00');
            console.log('4. Criar TESTE: Doação com CPF válido');
            console.log('5. Testar validação de CPF duplicado');
            console.log('');
            console.log('💡 TESTE SUGERIDO:');
            console.log('   Nome: Teste Sistema');
            console.log('   CPF: 123.456.789-09 (válido)');
            console.log('   Valor: R$ 50,00');
            console.log('   Tipo: PIX');
            console.log('');
            resolve();
        });
    });
}

// ================================================================
// EXECUTAR
// ================================================================

(async () => {
    try {
        await limparBanco();
        
        console.log('\n' + '='.repeat(56));
        console.log('✅ BANCO ZERADO E PRONTO PARA TESTES!');
        console.log('='.repeat(56));
        console.log('📍 Status: Sistema limpo');
        console.log('📍 Backup: Salvo em backups/pre-cleanup/');
        console.log('');
        
    } catch (error) {
        console.error('\n❌ Erro durante limpeza:', error.message);
        console.log('\n🔧 SOLUÇÃO:');
        console.log('1. Pare o servidor (Ctrl+C no npm start)');
        console.log('2. Verifique se database/doacoes.db existe');
        console.log('3. Tente novamente');
        console.log('');
    }
})();