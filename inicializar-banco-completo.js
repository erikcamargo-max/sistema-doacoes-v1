// Inicializar banco de dados completo com todas as tabelas
const sqlite3 = require('sqlite3').verbose();

console.log('Inicializando banco de dados completo...');

const db = new sqlite3.Database('./donations.db', (err) => {
    if (err) {
        console.error('Erro ao conectar:', err.message);
        return;
    }
    console.log('Conectado ao banco donations.db');
});

// Criar tabela doadores
db.run(`CREATE TABLE IF NOT EXISTS doadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone1 TEXT,
    telefone2 TEXT,
    email TEXT,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.log('Erro ao criar tabela doadores:', err.message);
    } else {
        console.log('✅ Tabela doadores criada');
    }
});

// Criar tabela doacoes COM CAMPOS DE PARCELAS
db.run(`CREATE TABLE IF NOT EXISTS doacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doador_id INTEGER NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL,
    data_doacao DATE NOT NULL,
    observacoes TEXT,
    recorrente INTEGER DEFAULT 0,
    parcelas INTEGER DEFAULT 1,
    proxima_parcela DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doador_id) REFERENCES doadores (id)
)`, (err) => {
    if (err) {
        console.log('Erro ao criar tabela doacoes:', err.message);
    } else {
        console.log('✅ Tabela doacoes criada COM CAMPOS DE PARCELAS');
    }
});

// Criar tabela pagamentos
db.run(`CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doacao_id INTEGER NOT NULL,
    valor REAL NOT NULL,
    data_pagamento DATE NOT NULL,
    metodo_pagamento TEXT,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doacao_id) REFERENCES doacoes (id)
)`, (err) => {
    if (err) {
        console.log('Erro ao criar tabela pagamentos:', err.message);
    } else {
        console.log('✅ Tabela pagamentos criada');
    }
});

// Verificar se tudo foi criado corretamente
setTimeout(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error('Erro ao verificar tabelas:', err.message);
        } else {
            console.log('\nTabelas criadas:');
            tables.forEach(table => {
                console.log(`- ${table.name}`);
            });
            
            // Verificar estrutura da tabela doacoes
            db.all("PRAGMA table_info(doacoes)", (err, columns) => {
                if (!err) {
                    console.log('\nColunas da tabela doacoes:');
                    columns.forEach(col => {
                        console.log(`- ${col.name} (${col.type})`);
                    });
                    
                    const temRecorrente = columns.some(c => c.name === 'recorrente');
                    const temParcelas = columns.some(c => c.name === 'parcelas');
                    
                    if (temRecorrente && temParcelas) {
                        console.log('\n🎉 BANCO INICIALIZADO COM SUCESSO!');
                        console.log('✅ Todas as tabelas criadas');
                        console.log('✅ Campos de parcelas incluídos');
                        console.log('\nPRÓXIMOS PASSOS:');
                        console.log('1. Reinicie o servidor: npm start');
                        console.log('2. Teste criação de doação recorrente');
                        console.log('3. Verifique se aparece na dashboard');
                    } else {
                        console.log('\n⚠️ Campos de parcelas não encontrados');
                    }
                }
                
                db.close();
            });
        }
    });
}, 1000);