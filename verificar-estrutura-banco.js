// Verificar estrutura do banco donations.db
const sqlite3 = require('sqlite3').verbose();

console.log('Verificando estrutura do banco donations.db...');

const db = new sqlite3.Database('./donations.db', (err) => {
    if (err) {
        console.error('Erro ao conectar:', err.message);
        return;
    }
    console.log('Conectado ao banco donations.db');
});

// Listar todas as tabelas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('Erro ao listar tabelas:', err.message);
        db.close();
        return;
    }
    
    console.log('\nTabelas encontradas:');
    tables.forEach(table => {
        console.log(`- ${table.name}`);
    });
    
    // Verificar se existe tabela doadores
    const temDoadores = tables.some(t => t.name === 'doadores');
    const temDoacoes = tables.some(t => t.name === 'doacoes');
    
    if (temDoadores) {
        console.log('\n✅ Tabela doadores encontrada');
        
        // Verificar últimos doadores
        db.all("SELECT codigo, nome FROM doadores ORDER BY id DESC LIMIT 5", (err, rows) => {
            if (!err && rows) {
                console.log('\nÚltimos doadores:');
                rows.forEach(row => {
                    console.log(`${row.codigo} - ${row.nome}`);
                });
            }
            
            if (temDoacoes) {
                console.log('\n✅ Tabela doacoes encontrada');
                
                // Verificar estrutura da tabela doacoes
                db.all("PRAGMA table_info(doacoes)", (err, columns) => {
                    if (!err) {
                        console.log('\nColunas da tabela doacoes:');
                        columns.forEach(col => {
                            console.log(`- ${col.name} (${col.type})`);
                        });
                        
                        // Verificar se tem colunas de parcelas
                        const temRecorrente = columns.some(c => c.name === 'recorrente');
                        const temParcelas = columns.some(c => c.name === 'parcelas');
                        
                        console.log(`\nCampos de parcelas:`);
                        console.log(`- recorrente: ${temRecorrente ? 'SIM' : 'NÃO'}`);
                        console.log(`- parcelas: ${temParcelas ? 'SIM' : 'NÃO'}`);
                        
                        if (temRecorrente && temParcelas) {
                            // Consultar D022-JT agora
                            consultarD022JT();
                        } else {
                            console.log('\n❌ Tabela doacoes não tem campos de parcelas');
                            console.log('💡 Backend pode precisar de atualização');
                            db.close();
                        }
                    } else {
                        db.close();
                    }
                });
            } else {
                console.log('\n❌ Tabela doacoes não encontrada');
                db.close();
            }
        });
    } else {
        console.log('\n❌ Tabela doadores não encontrada');
        db.close();
    }
});

function consultarD022JT() {
    console.log('\n🔍 Procurando D022-JT...');
    
    db.get(`
        SELECT d.*, doadores.nome, doadores.codigo 
        FROM doacoes d 
        JOIN doadores ON d.doador_id = doadores.id 
        WHERE doadores.codigo LIKE '%D022%' OR doadores.nome LIKE '%TESTE IMEDIATO%'
        ORDER BY d.id DESC 
        LIMIT 1
    `, (err, row) => {
        if (err) {
            console.error('Erro na consulta:', err.message);
        } else if (row) {
            console.log('\n✅ ENCONTRADO:');
            console.log(`Código: ${row.codigo}`);
            console.log(`Nome: ${row.nome}`);
            console.log(`Valor: R$ ${row.valor}`);
            console.log(`Recorrente: ${row.recorrente}`);
            console.log(`Parcelas: ${row.parcelas}`);
            
            if (row.recorrente === 1 && row.parcelas === 8) {
                console.log('\n🎉 SUCESSO! Sistema funcionando!');
            } else {
                console.log('\n⚠️ Dados não salvos corretamente');
            }
        } else {
            console.log('\n❌ D022-JT não encontrado');
            console.log('💡 Pode ter outro código');
        }
        
        db.close();
    });
}