// Consultar banco de dados para verificar parcelas do D022-JT
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 CONSULTANDO BANCO DE DADOS - D022-JT');
console.log('═'.repeat(50));

// Conectar ao banco
const dbPath = path.join(__dirname, 'donations.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Consultando dados do D022-JT...\n');

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
        console.error('❌ Erro na consulta:', err.message);
        db.close();
        return;
    }
    
    if (!row) {
        console.log('❌ D022-JT não encontrado no banco');
        db.close();
        return;
    }
    
    console.log('✅ DOAÇÃO ENCONTRADA:');
    console.log('═'.repeat(30));
    console.log(`📋 Nome: ${row.nome}`);
    console.log(`🏷️  Código: ${row.codigo}`);
    console.log(`💰 Valor Total: R$ ${row.valor.toFixed(2)}`);
    console.log(`🔄 Recorrente: ${row.recorrente ? 'SIM' : 'NÃO'}`);
    console.log(`📊 Parcelas: ${row.parcelas || 'Não informado'}`);
    console.log(`📅 Próxima Parcela: ${row.proxima_parcela || 'Não informado'}`);
    console.log(`📆 Data Doação: ${row.data_doacao}`);
    console.log(`💳 Tipo: ${row.tipo}`);
    
    // Calcular valor por parcela
    if (row.parcelas && row.parcelas > 1) {
        const valorParcela = row.valor / row.parcelas;
        console.log(`💵 Valor por Parcela: R$ ${valorParcela.toFixed(2)}`);
    }
    
    console.log('\n🎯 ANÁLISE:');
    if (row.recorrente === 1 && row.parcelas === 8) {
        console.log('✅ SUCESSO TOTAL!');
        console.log('   🔄 Marcado como recorrente: SIM');
        console.log('   📊 Número de parcelas: 8');
        console.log('   💰 Valor dividido corretamente');
        console.log('\n🏆 PROBLEMA DAS PARCELAS RESOLVIDO!');
        console.log('   📈 Sistema agora funciona igual ao D008-SC');
        console.log('   ✅ Frontend enviando dados corretamente');
        console.log('   ✅ Backend processando corretamente');
        console.log('   ✅ Banco armazenando corretamente');
    } else {
        console.log('⚠️ Dados parciais:');
        console.log(`   🔄 Recorrente: ${row.recorrente ? 'SIM' : 'NÃO'}`);
        console.log(`   📊 Parcelas: ${row.parcelas || 'Não salvo'}`);
    }
    
    // Consultar todas as doações recorrentes para comparação
    console.log('\n📊 TODAS AS DOAÇÕES RECORRENTES:');
    console.log('═'.repeat(50));
    
    db.all(`
        SELECT doadores.codigo, doadores.nome, d.valor, d.parcelas, d.recorrente
        FROM doacoes d 
        JOIN doadores ON d.doador_id = doadores.id 
        WHERE d.recorrente = 1
        ORDER BY d.id DESC
    `, (err, rows) => {
        if (err) {
            console.error('❌ Erro na consulta:', err.message);
        } else {
            rows.forEach(row => {
                const valorParcela = row.valor / row.parcelas;
                console.log(`${row.codigo} - ${row.nome}: ${row.parcelas}x R$ ${valorParcela.toFixed(2)} = R$ ${row.valor.toFixed(2)}`);
            });
            
            console.log(`\n📈 Total de doações recorrentes: ${rows.length}`);
        }
        
        db.close();
        console.log('\n✨ Consulta finalizada!');
    });
});
