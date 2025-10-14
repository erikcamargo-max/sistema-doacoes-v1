const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'doacoes.db');

console.log('Iniciando migracao...');

// Backup
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
const backup = path.join(backupDir, 'backup_' + Date.now() + '.db');
fs.copyFileSync(dbPath, backup);
console.log('Backup criado');

// Conectar
const db = new sqlite3.Database(dbPath);

// Adicionar coluna
db.run('ALTER TABLE parcelas_futuras ADD COLUMN data_pagamento TEXT', function(err) {
    if (err) {
        console.log('Erro:', err.message);
        db.close();
        return;
    }
    
    console.log('Coluna adicionada!');
    
    // Atualizar parcelas pagas
    db.run('UPDATE parcelas_futuras SET data_pagamento = data_vencimento WHERE status = "Pago"', function(err) {
        if (err) {
            console.log('Erro update:', err.message);
        } else {
            console.log('Parcelas atualizadas:', this.changes);
        }
        
        console.log('Migracao concluida!');
        db.close();
    });
});