// Correção definitiva do backend baseada no debug
const fs = require('fs');

console.log('Corrigindo backend baseado no debug...');
console.log('Problema: Frontend envia dados corretos, backend não processa');

try {
    let serverContent = fs.readFileSync('./server.js', 'utf-8');
    
    // Backup
    const backup = `./server_backup_final_${Date.now()}.js`;
    fs.writeFileSync(backup, serverContent);
    console.log('Backup criado:', backup);
    
    // Localizar rota POST /api/doacoes
    const rotaInicio = serverContent.indexOf("app.post('/api/doacoes'");
    if (rotaInicio === -1) {
        console.log('Rota POST não encontrada');
        process.exit(1);
    }
    
    // Localizar destructuring
    const destructStart = serverContent.indexOf('const {', rotaInicio);
    if (destructStart === -1) {
        console.log('Destructuring não encontrado');
        process.exit(1);
    }
    
    // Encontrar final do destructuring
    let destructEnd = destructStart;
    let braces = 0;
    
    for (let i = destructStart; i < serverContent.length; i++) {
        if (serverContent[i] === '{') braces++;
        if (serverContent[i] === '}') {
            braces--;
            if (braces === 0) {
                destructEnd = serverContent.indexOf(';', i) + 1;
                break;
            }
        }
    }
    
    const destructCurrent = serverContent.substring(destructStart, destructEnd);
    console.log('Destructuring atual encontrado');
    
    // Verificar se já tem os campos
    if (destructCurrent.includes('recorrente') && destructCurrent.includes('parcelas')) {
        console.log('Campos já existem no destructuring');
        
        // Verificar INSERT
        const insertStart = serverContent.indexOf('INSERT INTO doacoes', rotaInicio);
        if (insertStart !== -1) {
            const insertEnd = serverContent.indexOf(';', insertStart) + 1;
            const insertCurrent = serverContent.substring(insertStart, insertEnd);
            
            if (!insertCurrent.includes('recorrente') || !insertCurrent.includes('parcelas')) {
                console.log('Corrigindo INSERT...');
                
                const newInsert = `INSERT INTO doacoes (
                    doador_id, valor, tipo, data_doacao, observacoes,
                    recorrente, parcelas, proxima_parcela
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                
                serverContent = serverContent.substring(0, insertStart) + 
                               newInsert + 
                               serverContent.substring(insertEnd);
                
                // Corrigir parâmetros
                const dbRunStart = serverContent.indexOf('db.run(', insertStart);
                const arrayStart = serverContent.indexOf('[', dbRunStart);
                const arrayEnd = serverContent.indexOf(']', arrayStart) + 1;
                
                const newParams = `[
                    doadorId, valor, tipo, data, observacoes,
                    recorrente ? 1 : 0, parcelas || 1, proxima_parcela || null
                ]`;
                
                serverContent = serverContent.substring(0, arrayStart) + 
                               newParams + 
                               serverContent.substring(arrayEnd);
                
                console.log('INSERT e parâmetros corrigidos');
            }
        }
        
    } else {
        console.log('Adicionando campos ao destructuring...');
        
        // Adicionar campos
        const lastBrace = destructCurrent.lastIndexOf('}');
        const beforeBrace = destructCurrent.substring(0, lastBrace);
        const needsComma = !beforeBrace.trim().endsWith(',');
        
        const newFields = `${needsComma ? ',' : ''}
        recorrente, parcelas, proxima_parcela`;
        
        const newDestruct = beforeBrace + newFields + destructCurrent.substring(lastBrace);
        
        serverContent = serverContent.substring(0, destructStart) + 
                       newDestruct + 
                       serverContent.substring(destructEnd);
        
        console.log('Campos adicionados ao destructuring');
    }
    
    // Salvar arquivo corrigido
    fs.writeFileSync('./server.js', serverContent);
    
    console.log('✅ Backend corrigido!');
    console.log('✅ Agora processa campos: recorrente, parcelas, proxima_parcela');
    console.log('');
    console.log('TESTE AGORA:');
    console.log('1. Pare o servidor (Ctrl+C)');
    console.log('2. Reinicie: npm start');
    console.log('3. Teste nova doação recorrente');
    console.log('4. Deve salvar como "Sim" na coluna RECORRENTE');
    
} catch (error) {
    console.error('Erro:', error.message);
}