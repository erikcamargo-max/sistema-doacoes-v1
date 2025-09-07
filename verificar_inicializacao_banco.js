// Verificar inicialização do banco baseada no server.js
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('Verificando inicialização do banco...');

// 1. Verificar se server.js tem inicialização do banco
try {
    const serverContent = fs.readFileSync('./server.js', 'utf-8');
    
    console.log('Verificando server.js:');
    console.log('- Conecta ao banco?', serverContent.includes('new sqlite3.Database') ? 'SIM' : 'NÃO');
    console.log('- Cria tabelas?', serverContent.includes('CREATE TABLE') ? 'SIM' : 'NÃO');
    console.log('- Tabela doadores?', serverContent.includes('CREATE TABLE IF NOT EXISTS doadores') ? 'SIM' : 'NÃO');
    console.log('- Tabela doacoes?', serverContent.includes('CREATE TABLE IF NOT EXISTS doacoes') ? 'SIM' : 'NÃO');
    
    if (!serverContent.includes('CREATE TABLE')) {
        console.log('\n❌ Server.js não tem inicialização de tabelas!');
        console.log('💡 Precisa adicionar criação das tabelas');
        criarTabelasManualmente();
        return;
    }
    
} catch (error) {
    console.log('Erro ao ler server.js:', error.message);
}

// 2. Tentar criar tabelas manualmente
function criarTabelasManualmente() {
    console.log('\n🔧 Criando tabelas manualmente...');
    
    const db = new sqlite3.Database('./donations.db');
    
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
    
    // Criar tabela doacoes com campos de parcelas
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
            console.log('✅ Tabela doacoes criada com campos de parcelas');
        }
    });
    
    // Verificar se as tabelas foram criadas
    setTimeout(() => {
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (!err) {
                console.log('\nTabelas criadas:');
                tables.forEach(table => console.log(`- ${table.name}`));
                
                if (tables.length >= 2) {
                    console.log('\n✅ Banco inicializado com sucesso!');
                    console.log('🔄 Reinicie o servidor: npm start');
                    console.log('🧪 Teste novamente a criação de doação recorrente');
                }
            }
            db.close();
        });
    }, 1000);
}

criarTabelasManualmente();