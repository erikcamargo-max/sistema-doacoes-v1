// Encontrar o banco de dados correto e consultar D022-JT
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('Procurando banco de dados...');

// Possíveis nomes do banco
const possiveisBancos = [
    './donations.db',
    './database.db',
    './doacoes.db',
    './sistema.db',
    './data/donations.db',
    './db/donations.db'
];

// Procurar arquivos .db no diretório
const arquivos = fs.readdirSync('.').filter(arquivo => arquivo.endsWith('.db'));
console.log('Arquivos .db encontrados:', arquivos);

// Adicionar arquivos encontrados à lista
arquivos.forEach(arquivo => {
    if (!possiveisBancos.includes('./' + arquivo)) {
        possiveisBancos.push('./' + arquivo);
    }
});

function testarBanco(dbPath) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                resolve(false);
                return;
            }
            
            // Testar se tem as tabelas corretas
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='doacoes'", (err, row) => {
                if (err || !row) {
                    db.close();
                    resolve(false);
                    return;
                }
                
                // Verificar se tem dados
                db.get("SELECT COUNT(*) as total FROM doacoes", (err, countRow) => {
                    db.close();
                    if (err) {
                        resolve(false);
                    } else {
                        resolve({
                            path: dbPath,
                            totalDoacoes: countRow.total
                        });
                    }
                });
            });
        });
    });
}

async function encontrarBanco() {
    console.log('Testando bancos...');
    
    for (const dbPath of possiveisBancos) {
        if (fs.existsSync(dbPath)) {
            console.log(`Testando: ${dbPath}`);
            const resultado = await testarBanco(dbPath);
            if (resultado) {
                console.log(`✅ Banco encontrado: ${resultado.path}`);
                console.log(`📊 Total de doações: ${resultado.totalDoacoes}`);
                return resultado.path;
            }
        }
    }
    
    console.log('❌ Nenhum banco válido encontrado');
    return null;
}

async function consultarD022JT() {
    const dbPath = await encontrarBanco();
    if (!dbPath) return;
    
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n🔍 Consultando D022-JT...');
    
    // Consultar doação específica
    db.get(`
        SELECT d.*, doadores.nome, doadores.codigo 
        FROM doacoes d 
        JOIN doadores ON d.doador_id = doadores.id 
        WHERE doadores.codigo = 'D022-JT'
        ORDER BY d.id DESC 
        LIMIT 1
    `, (err, row) => {
        if (err) {
            console.error('❌ Erro:', err.message);
            db.close();
            return;
        }
        
        if (!row) {
            console.log('❌ D022-JT não encontrado');
            
            // Mostrar códigos existentes para debug
            db.all("SELECT codigo, nome FROM doadores ORDER BY id DESC LIMIT 10", (err, rows) => {
                if (!err && rows) {
                    console.log('\nÚltimos doadores cadastrados:');
                    rows.forEach(r => console.log(`${r.codigo} - ${r.nome}`));
                }
                db.close();
            });
            return;
        }
        
        console.log('\n✅ D022-JT ENCONTRADO:');
        console.log(`Nome: ${row.nome}`);
        console.log(`Valor: R$ ${row.valor.toFixed(2)}`);
        console.log(`Recorrente: ${row.recorrente ? 'SIM' : 'NÃO'}`);
        console.log(`Parcelas: ${row.parcelas || 'Não informado'}`);
        console.log(`Tipo: ${row.tipo}`);
        console.log(`Data: ${row.data_doacao}`);
        
        if (row.recorrente === 1 && row.parcelas === 8) {
            console.log('\n🎉 SUCESSO TOTAL!');
            console.log('✅ Sistema funcionando perfeitamente');
            console.log('✅ Parcelas salvas corretamente');
            console.log('✅ Problema resolvido!');
        } else {
            console.log('\n⚠️ Verificar dados:');
            console.log(`Recorrente: ${row.recorrente}`);
            console.log(`Parcelas: ${row.parcelas}`);
        }
        
        db.close();
    });
}

consultarD022JT();