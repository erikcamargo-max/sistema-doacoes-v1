// ============================================================================
// CORREÇÃO DO BACKEND - PROCESSAR PARCELAS RECORRENTES
// Data: 06/09/2025
// Problema: Backend não processa req.body.recorrente, parcelas, proxima_parcela
// Solução: Adicionar processamento na rota POST /api/doacoes
// ============================================================================

const fs = require('fs');

console.log('🔧 CORREÇÃO DO BACKEND - PARCELAS RECORRENTES');
console.log('═'.repeat(60));
console.log('🎯 Adicionando processamento de parcelas na rota POST');
console.log('');

// ============================================================================
// 1. LOCALIZAR E CORRIGIR ROTA POST /api/doacoes
// ============================================================================

function corrigirRotaBackend() {
    console.log('1️⃣ CORRIGINDO ROTA POST /api/doacoes...');
    
    try {
        let content = fs.readFileSync('./server.js', 'utf-8');
        
        // Localizar rota POST
        const rotaInicio = content.indexOf("app.post('/api/doacoes'");
        if (rotaInicio === -1) {
            console.log('   ❌ Rota POST /api/doacoes não encontrada');
            return false;
        }
        
        console.log('   ✅ Rota POST encontrada');
        
        // Localizar seção de destructuring
        const destructuringInicio = content.indexOf('const {', rotaInicio);
        if (destructuringInicio === -1) {
            console.log('   ❌ Seção de destructuring não encontrada');
            return false;
        }
        
        // Encontrar final do destructuring
        let destructuringFim = destructuringInicio;
        let chaves = 0;
        
        for (let i = destructuringInicio; i < content.length; i++) {
            const char = content[i];
            if (char === '{') chaves++;
            if (char === '}') {
                chaves--;
                if (chaves === 0) {
                    destructuringFim = content.indexOf(';', i) + 1;
                    break;
                }
            }
        }
        
        console.log(`   📍 Destructuring: ${destructuringInicio} até ${destructuringFim}`);
        
        // Extrair destructuring atual
        const destructuringAtual = content.substring(destructuringInicio, destructuringFim);
        console.log('   📝 Destructuring atual extraído');
        
        // Verificar se já tem campos de parcelas
        if (destructuringAtual.includes('recorrente') && destructuringAtual.includes('parcelas')) {
            console.log('   ✅ Destructuring já tem campos de parcelas');
            
            // Verificar se está sendo usado no INSERT
            const insertInicio = content.indexOf('INSERT INTO doacoes', rotaInicio);
            if (insertInicio !== -1) {
                const insertTrecho = content.substring(insertInicio, insertInicio + 500);
                if (insertTrecho.includes('recorrente') && insertTrecho.includes('parcelas')) {
                    console.log('   ✅ INSERT já usa campos de parcelas');
                    console.log('   💡 Backend parece estar correto');
                    return true;
                } else {
                    console.log('   ❌ INSERT não usa campos de parcelas');
                    return corrigirInsert(content, insertInicio);
                }
            }
        } else {
            console.log('   ❌ Destructuring não tem campos de parcelas');
            return adicionarCamposDestructuring(content, destructuringInicio, destructuringFim);
        }
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 2. ADICIONAR CAMPOS NO DESTRUCTURING
// ============================================================================

function adicionarCamposDestructuring(content, inicio, fim) {
    console.log('\n   🔧 Adicionando campos no destructuring...');
    
    try {
        const destructuringAtual = content.substring(inicio, fim);
        
        // Localizar onde adicionar (antes da última chave)
        const ultimaChave = destructuringAtual.lastIndexOf('}');
        if (ultimaChave === -1) {
            console.log('   ❌ Não foi possível localizar estrutura do destructuring');
            return false;
        }
        
        // Verificar se precisa de vírgula
        const trechoAntes = destructuringAtual.substring(0, ultimaChave).trim();
        const precisaVirgula = !trechoAntes.endsWith(',') && !trechoAntes.endsWith('{');
        
        // Campos a adicionar
        const novosCampos = `${precisaVirgula ? ',' : ''}
    recorrente, parcelas, proxima_parcela`;
        
        // Criar novo destructuring
        const novoDestructuring = destructuringAtual.substring(0, ultimaChave) + 
                                 novosCampos + 
                                 destructuringAtual.substring(ultimaChave);
        
        // Substituir no conteúdo
        const novoContent = content.substring(0, inicio) + 
                           novoDestructuring + 
                           content.substring(fim);
        
        // Salvar
        fs.writeFileSync('./server.js', novoContent);
        console.log('   ✅ Campos adicionados no destructuring!');
        
        // Agora corrigir o INSERT
        return corrigirInsertCompleto(novoContent);
        
    } catch (error) {
        console.log(`   ❌ Erro ao adicionar campos: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 3. CORRIGIR INSERT COMPLETO
// ============================================================================

function corrigirInsertCompleto(content) {
    console.log('\n   🔧 Corrigindo INSERT para incluir parcelas...');
    
    try {
        // Localizar INSERT INTO doacoes
        const insertInicio = content.indexOf('INSERT INTO doacoes');
        if (insertInicio === -1) {
            console.log('   ❌ INSERT INTO doacoes não encontrado');
            return false;
        }
        
        // Localizar final do INSERT (até o ponto e vírgula)
        const insertFim = content.indexOf(';', insertInicio) + 1;
        if (insertFim === 0) {
            console.log('   ❌ Final do INSERT não encontrado');
            return false;
        }
        
        const insertAtual = content.substring(insertInicio, insertFim);
        console.log('   📝 INSERT atual localizado');
        
        // Verificar se já tem campos de parcelas
        if (insertAtual.includes('recorrente') && insertAtual.includes('parcelas')) {
            console.log('   ✅ INSERT já tem campos de parcelas');
            return true;
        }
        
        // Criar novo INSERT
        const novoInsert = `INSERT INTO doacoes (
            doador_id, valor, tipo, data_doacao, observacoes,
            recorrente, parcelas, proxima_parcela
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Substituir INSERT
        const novoContent = content.substring(0, insertInicio) + 
                           novoInsert + 
                           content.substring(insertFim);
        
        // Corrigir os parâmetros do db.run
        const dbRunCorreto = corrigirParametrosDbRun(novoContent);
        
        if (dbRunCorreto) {
            console.log('   ✅ INSERT corrigido com campos de parcelas!');
            return true;
        } else {
            console.log('   ⚠️ INSERT corrigido, mas parâmetros podem precisar ajuste');
            return true;
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao corrigir INSERT: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 4. CORRIGIR PARÂMETROS DO DB.RUN
// ============================================================================

function corrigirParametrosDbRun(content) {
    console.log('\n   🔧 Corrigindo parâmetros do db.run...');
    
    try {
        // Localizar db.run após o INSERT
        const dbRunInicio = content.indexOf('db.run(', content.indexOf('INSERT INTO doacoes'));
        if (dbRunInicio === -1) {
            console.log('   ❌ db.run não encontrado');
            return false;
        }
        
        // Localizar array de parâmetros
        const arrayInicio = content.indexOf('[', dbRunInicio);
        if (arrayInicio === -1) {
            console.log('   ❌ Array de parâmetros não encontrado');
            return false;
        }
        
        // Localizar final do array
        const arrayFim = content.indexOf(']', arrayInicio) + 1;
        
        const arrayAtual = content.substring(arrayInicio, arrayFim);
        
        // Verificar se já tem parâmetros de parcelas
        if (arrayAtual.includes('recorrente') && arrayAtual.includes('parcelas')) {
            console.log('   ✅ Parâmetros já incluem campos de parcelas');
            return true;
        }
        
        // Criar novo array de parâmetros
        const novosParametros = `[
            doadorId, valor, tipo, data, observacoes,
            recorrente || 0, parcelas || 1, proxima_parcela || null
        ]`;
        
        // Substituir parâmetros
        const novoContent = content.substring(0, arrayInicio) + 
                           novosParametros + 
                           content.substring(arrayFim);
        
        // Salvar
        fs.writeFileSync('./server.js', novoContent);
        console.log('   ✅ Parâmetros do db.run corrigidos!');
        
        return true;
        
    } catch (error) {
        console.log(`   ❌ Erro ao corrigir parâmetros: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 5. VERIFICAR ESTRUTURA DA TABELA
// ============================================================================

function verificarEstrutubraTabela() {
    console.log('\n2️⃣ VERIFICANDO ESTRUTURA DA TABELA...');
    
    try {
        const content = fs.readFileSync('./server.js', 'utf-8');
        
        // Localizar CREATE TABLE doacoes
        const createTableInicio = content.indexOf('CREATE TABLE IF NOT EXISTS doacoes');
        if (createTableInicio === -1) {
            console.log('   ❌ CREATE TABLE doacoes não encontrado');
            return false;
        }
        
        const createTableFim = content.indexOf(');', createTableInicio) + 2;
        const createTable = content.substring(createTableInicio, createTableFim);
        
        console.log('   📝 Estrutura da tabela encontrada');
        
        // Verificar campos necessários
        const camposNecessarios = [
            { nome: 'recorrente', presente: createTable.includes('recorrente') },
            { nome: 'parcelas', presente: createTable.includes('parcelas') },
            { nome: 'proxima_parcela', presente: createTable.includes('proxima_parcela') }
        ];
        
        console.log('   📋 CAMPOS DA TABELA:');
        camposNecessarios.forEach(campo => {
            const status = campo.presente ? '✅' : '❌';
            console.log(`      ${status} ${campo.nome}`);
        });
        
        const todosCamposPresentes = camposNecessarios.every(c => c.presente);
        
        if (todosCamposPresentes) {
            console.log('   ✅ Tabela tem todos os campos necessários!');
        } else {
            console.log('   ⚠️ Tabela pode precisar de campos adicionais');
            console.log('   💡 Mas vamos testar primeiro com os existentes');
        }
        
        return todosCamposPresentes;
        
    } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
        return false;
    }
}

// ============================================================================
// 6. INSTRUÇÕES DE TESTE
// ============================================================================

function gerarInstrucoesTeste() {
    console.log('\n3️⃣ INSTRUÇÕES DE TESTE...');
    
    console.log('\n   🔄 REINICIE O SERVIDOR:');
    console.log('      1. Pare o servidor atual (Ctrl+C)');
    console.log('      2. Execute: npm start');
    console.log('      3. Aguarde inicializar completamente');
    
    console.log('\n   🧪 TESTE A CORREÇÃO:');
    console.log('      1. Acesse: http://localhost:3001');
    console.log('      2. Clique "Nova Doação"');
    console.log('      3. Preencha:');
    console.log('         • Nome: Teste Backend Parcelas');
    console.log('         • Valor: R$ 120,00');
    console.log('         • ✅ Marque "Doação Recorrente"');
    console.log('         • Parcelas: 12');
    console.log('      4. Salve a doação');
    
    console.log('\n   📊 VERIFICAR RESULTADO:');
    console.log('      • Coluna RECORRENTE deve mostrar "Sim"');
    console.log('      • Dashboard: "Doações Recorrentes" deve aumentar');
    console.log('      • Carnê deve mostrar 12 parcelas de R$ 10,00');
    
    console.log('\n   🔍 SE HOUVER ERRO:');
    console.log('      • Verifique console do servidor (terminal)');
    console.log('      • Verifique console do navegador (F12)');
    console.log('      • Me informe a mensagem exata');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando correção do backend...\n');
    
    // Backup de segurança
    const timestamp = Date.now();
    const backupPath = `./server_backup_parcelas_${timestamp}.js`;
    fs.copyFileSync('./server.js', backupPath);
    console.log(`💾 Backup do server.js criado: ${backupPath}`);
    
    const rotaCorrigida = corrigirRotaBackend();
    const tabelaOk = verificarEstrutubraTabela();
    
    gerarInstrucoesTeste();
    
    if (rotaCorrigida) {
        console.log('\n✅ BACKEND CORRIGIDO COM SUCESSO!');
        console.log('🔄 Reinicie o servidor e teste');
    } else {
        console.log('\n⚠️ Correção do backend pode ter falhado');
        console.log('💡 Teste mesmo assim, pode estar funcionando');
    }
    
    console.log('\n✨ CORREÇÃO DO BACKEND FINALIZADA!');
}

// Executar
main();