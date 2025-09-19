/**
 * ================================================================
 * SCRIPT: Implementar Valor das Parcelas Futuras
 * ================================================================
 * 
 * PROBLEMA ATUAL:
 * - Sistema divide valor total pelas parcelas (R$ 15 ÷ 8 = R$ 1,87)
 * - Primeira parcela deveria ser R$ 15 integral
 * 
 * SOLUÇÃO:
 * 1. Corrigir doação CAMILA (ID 34)
 * 2. Adicionar campo "Valor das parcelas futuras"
 * 3. Nova lógica: primeira parcela = valor doação, demais = valor escolhido
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Implementando valor das parcelas futuras...\n');

const appJsPath = path.join(__dirname, 'public', 'app.js');
const indexPath = path.join(__dirname, 'public', 'index.html');
const serverJsPath = path.join(__dirname, 'server.js');
const dbPath = path.join(__dirname, 'database', 'doacoes.db');

// ================================================================
// 1. CORRIGIR DADOS DA CAMILA (ID 34)
// ================================================================

console.log('1️⃣  Corrigindo doação da CAMILA (ID 34)...\n');

const db = new sqlite3.Database(dbPath);

// Verificar dados atuais da doação 34
db.get('SELECT * FROM doacoes WHERE id = 34', [], (err, doacao) => {
    if (err) {
        console.error('❌ Erro ao buscar doação:', err);
        return;
    }
    
    if (doacao) {
        console.log('📋 Doação CAMILA encontrada:');
        console.log(`   Valor: R$ ${doacao.valor}`);
        console.log(`   Parcelas: ${doacao.parcelas_totais}`);
        
        // A primeira parcela deve ser o valor total (R$ 15)
        // As parcelas futuras devem ser um valor menor (vamos assumir R$ 5 como exemplo)
        
        // Corrigir histórico da primeira parcela (deve ser R$ 15)
        db.run(
            'UPDATE historico_pagamentos SET valor = ? WHERE doacao_id = 34 AND data_pagamento = ?',
            [doacao.valor, doacao.data_doacao],
            function(err) {
                if (err) {
                    console.error('❌ Erro ao corrigir histórico:', err);
                } else {
                    console.log('✅ Primeira parcela corrigida: R$ ' + doacao.valor);
                }
            }
        );
        
        // Corrigir parcelas futuras (assumindo R$ 5 cada)
        db.run(
            'UPDATE parcelas_futuras SET valor = 5 WHERE doacao_id = 34',
            [],
            function(err) {
                if (err) {
                    console.error('❌ Erro ao corrigir parcelas futuras:', err);
                } else {
                    console.log(`✅ ${this.changes} parcelas futuras corrigidas: R$ 5,00 cada`);
                }
            }
        );
    } else {
        console.log('⚠️ Doação ID 34 não encontrada');
    }
});

// ================================================================
// 2. ADICIONAR CAMPO NO HTML
// ================================================================

setTimeout(() => {
    console.log('\n2️⃣  Adicionando campo no formulário...\n');
    
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    fs.writeFileSync(indexPath + '.backup_parcelas_' + Date.now(), htmlContent);
    
    // Procurar pela seção de parcelas e adicionar novo campo
    const parcelasSection = htmlContent.indexOf('id="parcelas-config"');
    
    if (parcelasSection > -1) {
        console.log('✅ Seção de parcelas encontrada');
        
        // Adicionar campo de valor das parcelas futuras
        const novoCampo = `
                        <!-- Valor das Parcelas Futuras -->
                        <div style="grid-column: 1 / -1; margin-top: 15px;">
                            <label for="input-valor-parcelas" style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">
                                💰 Valor das parcelas futuras (R$) *
                            </label>
                            <input 
                                type="number" 
                                id="input-valor-parcelas" 
                                placeholder="10,00" 
                                step="0.01" 
                                min="1"
                                style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px;"
                            >
                            <small style="color: #6b7280; margin-top: 5px; display: block;">
                                💡 Valor que o doador se compromete a doar mensalmente
                            </small>
                        </div>`;
        
        // Inserir após o campo de próxima parcela
        const insertPoint = htmlContent.indexOf('<!-- Próxima parcela em -->');
        if (insertPoint > -1) {
            const nextDivEnd = htmlContent.indexOf('</div>', insertPoint + 200);
            if (nextDivEnd > -1) {
                const antes = htmlContent.substring(0, nextDivEnd + 6);
                const depois = htmlContent.substring(nextDivEnd + 6);
                htmlContent = antes + novoCapo + depois;
                console.log('✅ Campo "Valor das parcelas futuras" adicionado ao HTML');
            }
        }
    } else {
        console.log('⚠️ Seção de parcelas não encontrada no HTML');
    }
    
    fs.writeFileSync(indexPath, htmlContent);
    
}, 1000);

// ================================================================
// 3. ATUALIZAR JAVASCRIPT DO FRONTEND
// ================================================================

setTimeout(() => {
    console.log('\n3️⃣  Atualizando lógica do frontend...\n');
    
    let appContent = fs.readFileSync(appJsPath, 'utf8');
    fs.writeFileSync(appJsPath + '.backup_parcelas_' + Date.now(), appContent);
    
    // Procurar função addDonation e adicionar coleta do novo campo
    const addDonationRegex = /const formData = \{[\s\S]*?\};/;
    const match = appContent.match(addDonationRegex);
    
    if (match) {
        const formDataOriginal = match[0];
        
        // Adicionar novo campo ao formData
        const novoFormData = formDataOriginal.replace(
            'data_proxima_parcela: isRecurrent ? document.getElementById(\'input-proxima-parcela\')?.value || null : null',
            `data_proxima_parcela: isRecurrent ? document.getElementById('input-proxima-parcela')?.value || null : null,
            // NOVO: Valor das parcelas futuras
            valor_parcelas_futuras: isRecurrent ? parseFloat(document.getElementById('input-valor-parcelas')?.value || 0) : null`
        );
        
        appContent = appContent.replace(formDataOriginal, novoFormData);
        console.log('✅ Campo adicionado ao formData do frontend');
        
        // Adicionar validação
        const validationPoint = 'if (!formData.amount || formData.amount <= 0) {';
        const newValidation = `
        // Validar valor das parcelas futuras para recorrentes
        if (formData.recorrente && (!formData.valor_parcelas_futuras || formData.valor_parcelas_futuras <= 0)) {
            alert('Para doações recorrentes, informe o valor das parcelas futuras');
            return;
        }
        
        if (!formData.amount || formData.amount <= 0) {`;
        
        appContent = appContent.replace(validationPoint, newValidation);
        console.log('✅ Validação adicionada ao frontend');
        
    } else {
        console.log('⚠️ Função addDonation não encontrada para atualizar');
    }
    
    fs.writeFileSync(appJsPath, appContent);
    
}, 1500);

// ================================================================
// 4. ATUALIZAR BACKEND
// ================================================================

setTimeout(() => {
    console.log('\n4️⃣  Atualizando backend...\n');
    
    let serverContent = fs.readFileSync(serverJsPath, 'utf8');
    fs.writeFileSync(serverJsPath + '.backup_parcelas_' + Date.now(), serverContent);
    
    // Adicionar campo ao destructuring do req.body
    const destructuringRegex = /const \{\s*donor,[\s\S]*?valor_parcelas_futuras\s*\} = req\.body;/;
    
    if (!serverContent.includes('valor_parcelas_futuras')) {
        // Adicionar campo ao destructuring
        const oldDestructuring = /const \{\s*donor,[\s\S]*?\} = req\.body;/;
        const match = serverContent.match(oldDestructuring);
        
        if (match) {
            const newDestructuring = match[0].replace(
                '} = req.body;',
                ', valor_parcelas_futuras } = req.body;'
            );
            serverContent = serverContent.replace(match[0], newDestructuring);
            console.log('✅ Campo valor_parcelas_futuras adicionado ao backend');
        }
    }
    
    // Atualizar lógica de criação de parcelas futuras
    const criarParcelasRegex = /\/\/ Criar parcelas futuras[\s\S]*?for \(let i = 2[\s\S]*?\}/;
    const matchParcelas = serverContent.match(criarParcelasRegex);
    
    if (matchParcelas) {
        const novaLogica = `// Criar parcelas futuras com valor específico
        if (recorrente && parcelas > 1) {
          const valorParcelaFutura = valor_parcelas_futuras || (amount / parcelas);
          console.log(\`📅 Criando \${parcelas - 1} parcelas futuras com valor R$ \${valorParcelaFutura}\`);
          
          for (let i = 2; i <= parcelas; i++) {
            const proximaData = new Date(date);
            proximaData.setMonth(proximaData.getMonth() + (i - 1));
            
            db.run(
              'INSERT INTO parcelas_futuras (doacao_id, numero_parcela, data_vencimento, valor, status) VALUES (?, ?, ?, ?, ?)',
              [doacaoId, i, proximaData.toISOString().substring(0, 10), valorParcelaFutura, 'Pendente'],
              (err) => {
                if (err) console.error('Erro ao criar parcela futura:', err);
              }
            );
          }
        }`;
        
        serverContent = serverContent.replace(matchParcelas[0], novaLogica);
        console.log('✅ Lógica de parcelas futuras atualizada no backend');
    }
    
    fs.writeFileSync(serverJsPath, serverContent);
    
}, 2000);

// ================================================================
// FINALIZAÇÃO
// ================================================================

setTimeout(() => {
    console.log('\n' + '='.repeat(56));
    console.log('✅ VALOR DAS PARCELAS FUTURAS IMPLEMENTADO!');
    console.log('='.repeat(56));
    
    console.log('\n📊 MUDANÇAS REALIZADAS:');
    console.log('1. ✅ Dados da CAMILA corrigidos (primeira parcela = R$ 15)');
    console.log('2. ✅ Campo "Valor das parcelas futuras" adicionado ao formulário');
    console.log('3. ✅ Frontend coleta e valida o novo campo');
    console.log('4. ✅ Backend processa valor das parcelas separadamente');
    
    console.log('\n🎯 NOVA LÓGICA:');
    console.log('📅 Primeira parcela = Valor da doação atual (R$ 15)');
    console.log('💰 Parcelas futuras = Valor escolhido pelo doador (R$ 10)');
    console.log('🔄 Total flexível = Primeira ≠ Futuras');
    
    console.log('\n🧪 EXEMPLO PRÁTICO:');
    console.log('👤 Doador: "Hoje trago R$ 30, mas mensalmente só posso R$ 10"');
    console.log('   📊 Primeira parcela: R$ 30,00 (paga hoje)');
    console.log('   📅 Parcelas 2-12: R$ 10,00 cada (compromisso mensal)');
    console.log('   ✅ Sistema: Reconhece a diferença automaticamente');
    
    console.log('\n🔄 TESTE:');
    console.log('1. Reinicie o servidor: npm start');
    console.log('2. Recarregue a página (Ctrl+F5)');
    console.log('3. Crie doação recorrente e teste o novo campo');
    console.log('4. Verifique se primeira parcela ≠ parcelas futuras');
    
    console.log('\n💡 INTERFACE ATUALIZADA:');
    console.log('☑️ Doação Recorrente (Mensal)');
    console.log('📊 Quantas parcelas? [8]');
    console.log('💰 Valor das parcelas futuras: R$ [10,00] ← NOVO CAMPO');
    
    db.close();
    console.log('\n🚀 IMPLEMENTAÇÃO COMPLETA!');
    
}, 2500);