/**
 * ================================================================
 * SCRIPT: Limpeza Completa do Banco de Dados
 * ================================================================
 * 
 * VERSÃO: 2.1.3
 * DATA: 20/09/2025
 * OBJETIVO: Limpar completamente todas as tabelas para teste limpo
 * 
 * PROBLEMA IDENTIFICADO:
 * - 36 doadores órfãos
 * - 125 parcelas_futuras órfãs
 * - Dados inconsistentes que podem causar erros
 * 
 * AÇÃO: Limpar todas as tabelas para teste do zero
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('╔════════════════════════════════════════════════════╗');
console.log('║       LIMPEZA COMPLETA BANCO v2.1.3               ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

const dbPath = path.join(__dirname, 'database', 'doacoes.db');

function limparBanco() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(dbPath)) {
            console.log('❌ Banco de dados não encontrado');
            reject(new Error('Banco não encontrado'));
            return;
        }

        // Criar backup do banco antes de limpar
        const timestamp = Date.now();
        const backupPath = path.join(__dirname, 'database', `backup_antes_limpeza_${timestamp}.db`);
        
        try {
            fs.copyFileSync(dbPath, backupPath);
            console.log('💾 Backup criado:', path.basename(backupPath));
        } catch (error) {
            console.log('⚠️ Erro ao criar backup:', error.message);
        }

        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log('❌ Erro ao conectar:', err.message);
                reject(err);
                return;
            }
            
            console.log('✅ Conectado ao banco SQLite');
            console.log('\n🧹 INICIANDO LIMPEZA COMPLETA...\n');

            // Desabilitar foreign keys temporariamente
            db.run('PRAGMA foreign_keys = OFF', (err) => {
                if (err) {
                    console.log('⚠️ Erro ao desabilitar foreign keys:', err.message);
                }

                // Lista de tabelas para limpar (ordem importante)
                const tabelas = [
                    'parcelas_futuras',      // Primeiro: tabelas filhas
                    'historico_pagamentos',  
                    'doacoes',               // Depois: tabelas pais
                    'doadores'
                ];

                let promises = [];

                tabelas.forEach(tabela => {
                    promises.push(new Promise((resolveTable) => {
                        // Primeiro: contar registros
                        db.get(`SELECT COUNT(*) as count FROM ${tabela}`, [], (err, result) => {
                            if (err) {
                                console.log(`❌ Erro ao contar ${tabela}:`, err.message);
                                resolveTable();
                                return;
                            }

                            const count = result.count;
                            console.log(`📊 ${tabela}: ${count} registros encontrados`);

                            if (count > 0) {
                                // Limpar tabela
                                db.run(`DELETE FROM ${tabela}`, [], function(err) {
                                    if (err) {
                                        console.log(`❌ Erro ao limpar ${tabela}:`, err.message);
                                    } else {
                                        console.log(`🧹 ${tabela}: ${this.changes} registros removidos`);
                                    }
                                    resolveTable();
                                });
                            } else {
                                console.log(`✅ ${tabela}: já estava limpa`);
                                resolveTable();
                            }
                        });
                    }));
                });

                // Executar limpeza de todas as tabelas
                Promise.all(promises).then(() => {
                    // Resetar sequences
                    console.log('\n🔄 RESETANDO SEQUENCES...');
                    
                    db.run("DELETE FROM sqlite_sequence", [], function(err) {
                        if (err) {
                            console.log('⚠️ Erro ao resetar sequences:', err.message);
                        } else {
                            console.log(`✅ Sequences resetadas: ${this.changes} entradas removidas`);
                        }

                        // Reabilitar foreign keys
                        db.run('PRAGMA foreign_keys = ON', (err) => {
                            if (err) {
                                console.log('⚠️ Erro ao reabilitar foreign keys:', err.message);
                            }

                            // Verificar limpeza
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

function verificarLimpeza(db) {
    return new Promise((resolve) => {
        console.log('\n✅ VERIFICANDO LIMPEZA...\n');
        
        const tabelas = ['doadores', 'doacoes', 'historico_pagamentos', 'parcelas_futuras'];
        
        let promises = tabelas.map(tabela => {
            return new Promise((resolveVerify) => {
                db.get(`SELECT COUNT(*) as count FROM ${tabela}`, [], (err, result) => {
                    if (err) {
                        console.log(`❌ ${tabela}: erro na verificação`);
                    } else {
                        const status = result.count === 0 ? '✅ LIMPA' : `❌ ${result.count} registros restantes`;
                        console.log(`   ${tabela}: ${status}`);
                    }
                    resolveVerify();
                });
            });
        });

        Promise.all(promises).then(() => {
            console.log('\n📋 LIMPEZA CONCLUÍDA!');
            console.log('');
            console.log('🎯 PRÓXIMOS PASSOS:');
            console.log('1. Iniciar servidor: npm start');
            console.log('2. Criar DOAÇÃO ÚNICA primeiro (teste simples)');
            console.log('3. Verificar se funciona perfeitamente');
            console.log('4. Depois criar doação recorrente');
            console.log('5. Testar modal de histórico');
            console.log('');
            console.log('💡 TESTE SUGERIDO (DOAÇÃO ÚNICA):');
            console.log('   Nome: Teste Silva');
            console.log('   Valor: R$ 50,00');
            console.log('   Tipo: PIX');
            console.log('   Recorrente: NÃO (deixar desmarcado)');
            resolve();
        });
    });
}

// Executar limpeza
limparBanco().then(() => {
    console.log('\n' + '='.repeat(56));
    console.log('🎯 BANCO COMPLETAMENTE LIMPO!');
    console.log('='.repeat(56));
    console.log('📍 Status: Pronto para testes do zero');
}).catch((error) => {
    console.error('❌ Erro durante limpeza:', error.message);
});