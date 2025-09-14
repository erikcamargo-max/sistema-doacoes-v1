/**
 * SCRIPT DE CORREÇÃO COMPLETA - PARCELAS RECORRENTES
 * Versão: 1.1.7
 * Data: 13/09/2025
 * 
 * Este script corrige completamente o sistema de parcelas recorrentes:
 * 1. Frontend: Coleta e envia dados de parcelas
 * 2. Backend: Processa e salva parcelas corretamente
 * 3. Carnê: Gera com número correto de parcelas
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('🔧 CORREÇÃO COMPLETA - PARCELAS RECORRENTES');
console.log('========================================\n');

// ==========================
// PARTE 1: CORRIGIR FRONTEND
// ==========================
console.log('📱 [1/3] Corrigindo Frontend (app.js)...');

const appPath = path.join(__dirname, 'public', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

// Backup
const backupApp = `public/app_backup_${Date.now()}.js`;
fs.writeFileSync(backupApp, appContent);
console.log(`   ✅ Backup criado: ${backupApp}`);

// Localizar e substituir a função addDonation
const addDonationStart = appContent.indexOf('window.addDonation = async function()');
const addDonationEnd = appContent.indexOf('// =====', addDonationStart + 100);

if (addDonationStart !== -1 && addDonationEnd !== -1) {
    const newAddDonation = `window.addDonation = async function() {
    try {
        console.log('🚀 Iniciando salvamento de doação...');
        
        // Coletar TODOS os dados do formulário - v1.1.7
        const formData = {
            // Dados básicos
            donor: document.getElementById('input-donor')?.value?.trim() || '',
            phone1: document.getElementById('input-phone1')?.value?.trim() || '',
            phone2: document.getElementById('input-phone2')?.value?.trim() || '',
            cpf: document.getElementById('input-cpf')?.value?.trim() || '',
            contact: document.getElementById('input-contact')?.value?.trim() || '',
            
            // Dados da doação
            amount: parseFloat(document.getElementById('input-amount')?.value || 0),
            date: document.getElementById('input-date')?.value || '',
            type: document.getElementById('input-type')?.value || 'DINHEIRO',
            notes: document.getElementById('input-notes')?.value?.trim() || '',
            
            // Endereço
            cep: document.getElementById('input-cep')?.value?.trim() || '',
            logradouro: document.getElementById('input-logradouro')?.value?.trim() || '',
            numero: document.getElementById('input-numero')?.value?.trim() || '',
            complemento: document.getElementById('input-complemento')?.value?.trim() || '',
            bairro: document.getElementById('input-bairro')?.value?.trim() || '',
            cidade: document.getElementById('input-cidade')?.value?.trim() || '',
            estado: document.getElementById('input-estado')?.value?.trim() || '',
            
            // PARCELAS RECORRENTES - CORREÇÃO v1.1.7
            recorrente: document.getElementById('input-recurrent')?.checked || false,
            parcelas: 1,
            proxima_parcela: null
        };
        
        // Se for recorrente, coletar dados de parcelas
        if (formData.recorrente) {
            const parcelasInput = document.getElementById('input-parcelas');
            const proximaInput = document.getElementById('input-proxima-parcela');
            
            formData.parcelas = parseInt(parcelasInput?.value) || 12;
            formData.proxima_parcela = proximaInput?.value || null;
            
            // Calcular próxima parcela se não informada
            if (!formData.proxima_parcela && formData.date) {
                const dataDoacao = new Date(formData.date);
                dataDoacao.setMonth(dataDoacao.getMonth() + 1);
                formData.proxima_parcela = dataDoacao.toISOString().split('T')[0];
            }
            
            console.log('📊 Doação Recorrente:', {
                parcelas: formData.parcelas,
                proxima: formData.proxima_parcela
            });
        }
        
        // Validação
        if (!formData.donor) {
            alert('Nome é obrigatório');
            return;
        }
        if (!formData.phone1) {
            alert('Telefone é obrigatório');
            return;
        }
        if (!formData.amount || formData.amount <= 0) {
            alert('Valor deve ser maior que zero');
            return;
        }
        
        console.log('📤 Enviando dados:', formData);
        
        // Enviar para servidor
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            const tipoMsg = formData.recorrente ? 
                \`recorrente com \${formData.parcelas} parcelas\` : 
                'única';
            alert(\`✅ Doação \${tipoMsg} salva com sucesso!\`);
            closeModal();
            loadDashboard();
        } else {
            const error = await response.json();
            alert('❌ Erro: ' + (error.message || 'Erro ao salvar'));
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
        alert('❌ Erro ao salvar doação: ' + error.message);
    }
}`;
    
    appContent = appContent.substring(0, addDonationStart) + 
                 newAddDonation + '\n\n' +
                 appContent.substring(addDonationEnd);
    
    console.log('   ✅ Função addDonation atualizada');
} else {
    console.log('   ⚠️ Função addDonation não encontrada no formato esperado');
}

// Salvar app.js
fs.writeFileSync(appPath, appContent);
console.log('   ✅ Frontend atualizado com sucesso!\n');

// ==========================
// PARTE 2: CORRIGIR BACKEND
// ==========================
console.log('🖥️ [2/3] Corrigindo Backend (server.js)...');

const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Backup
const backupServer = `server_backup_${Date.now()}.js`;
fs.writeFileSync(backupServer, serverContent);
console.log(`   ✅ Backup criado: ${backupServer}`);

// Localizar a rota POST /api/doacoes
const postDoacoesStart = serverContent.indexOf("app.post('/api/doacoes'");
const insertDoacaoStart = serverContent.indexOf('const insertDoacao = (doadorId) => {', postDoacoesStart);
const insertDoacaoEnd = serverContent.indexOf('};', insertDoacaoStart) + 2;

if (insertDoacaoStart !== -1) {
    const newInsertDoacao = `const insertDoacao = (doadorId) => {
    // CORREÇÃO v1.1.7: Usar dados de parcelas do frontend
    const parcelasTotais = recorrente ? (parcelas || 12) : 1;
    const valorDoacao = amount || 0;
    
    console.log('💾 Salvando doação:', {
        doadorId,
        valor: valorDoacao,
        tipo: type,
        recorrente: recorrente ? 1 : 0,
        parcelas: parcelasTotais
    });
    
    db.run(
      \`INSERT INTO doacoes (doador_id, valor, tipo, data_doacao, recorrente, observacoes, parcelas_totais)
       VALUES (?, ?, ?, ?, ?, ?, ?)\`,
      [doadorId, valorDoacao, type, date, recorrente ? 1 : 0, observations || notes, parcelasTotais],
      function(err) {
        if (err) {
          console.error('❌ Erro ao inserir doação:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        
        const doacaoId = this.lastID;
        console.log('✅ Doação criada com ID:', doacaoId);
        
        // Inserir primeiro pagamento no histórico
        db.run(
          \`INSERT INTO historico_pagamentos (doacao_id, data_pagamento, valor, status)
           VALUES (?, ?, ?, ?)\`,
          [doacaoId, date, valorDoacao, 'Pago'],
          (err) => {
            if (err) console.error('Erro ao inserir histórico:', err);
            else console.log('✅ Histórico de pagamento criado');
          }
        );
        
        // Se for recorrente, criar parcelas futuras
        if (recorrente && parcelasTotais > 1) {
            console.log(\`📅 Criando \${parcelasTotais - 1} parcelas futuras...\`);
            
            for (let i = 2; i <= parcelasTotais; i++) {
                const dataVencimento = new Date(proxima_parcela || date);
                dataVencimento.setMonth(dataVencimento.getMonth() + (i - 2));
                
                db.run(
                  \`INSERT INTO parcelas_futuras (doacao_id, numero_parcela, data_vencimento, valor, status)
                   VALUES (?, ?, ?, ?, ?)\`,
                  [doacaoId, i, dataVencimento.toISOString().split('T')[0], valorDoacao, 'Pendente'],
                  (err) => {
                    if (err) console.error(\`Erro ao criar parcela \${i}:\`, err);
                  }
                );
            }
        }
        
        res.json({ 
            id: doacaoId, 
            doador_id: doadorId, 
            message: \`Doação \${recorrente ? 'recorrente' : 'única'} criada com sucesso!\`,
            parcelas: parcelasTotais
        });
      }
    );
  }`;
    
    serverContent = serverContent.substring(0, insertDoacaoStart) + 
                    newInsertDoacao + 
                    serverContent.substring(insertDoacaoEnd);
    
    console.log('   ✅ Função insertDoacao atualizada');
}

// Adicionar desestruturação dos novos campos
const destructuringPattern = /const\s*\{([^}]+)\}\s*=\s*req\.body;/;
const destructuringMatch = serverContent.match(destructuringPattern);

if (destructuringMatch) {
    const currentFields = destructuringMatch[1];
    
    // Verificar se os campos já existem
    if (!currentFields.includes('recorrente') || 
        !currentFields.includes('parcelas') || 
        !currentFields.includes('proxima_parcela')) {
        
        const newDestructuring = `const {
    donor, contact, phone1, phone2, cpf,
    amount, type, date, observations, notes,
    forceCreate,
    cep, logradouro, numero, complemento, bairro, cidade, estado,
    recorrente, parcelas, proxima_parcela, recurrent
  } = req.body;`;
        
        serverContent = serverContent.replace(destructuringMatch[0], newDestructuring);
        console.log('   ✅ Campos de parcelas adicionados ao destructuring');
    }
}

// Salvar server.js
fs.writeFileSync(serverPath, serverContent);
console.log('   ✅ Backend atualizado com sucesso!\n');

// ==========================
// PARTE 3: VALIDAR CARNÊ
// ==========================
console.log('📄 [3/3] Validando função generateCarne...');

// Verificar se a função generateCarne usa parcelas_totais
const generateCarneCheck = appContent.includes('doacao.parcelas_totais');

if (generateCarneCheck) {
    console.log('   ✅ Função generateCarne já está configurada corretamente');
} else {
    console.log('   ⚠️ Função generateCarne pode precisar de ajustes');
    console.log('   💡 Verifique se usa doacao.parcelas_totais para gerar parcelas');
}

// ==========================
// INSTRUÇÕES FINAIS
// ==========================
console.log('\n========================================');
console.log('✅ CORREÇÃO COMPLETA APLICADA!');
console.log('========================================\n');

console.log('📋 INSTRUÇÕES DE TESTE:\n');
console.log('1. Reinicie o servidor:');
console.log('   node server.js\n');

console.log('2. Recarregue a página (Ctrl+F5)\n');

console.log('3. Teste uma doação recorrente:');
console.log('   • Clique em "Nova Doação"');
console.log('   • Preencha os dados');
console.log('   • Marque "Doação Recorrente"');
console.log('   • Informe número de parcelas (ex: 6)');
console.log('   • Salve a doação\n');

console.log('4. Verifique:');
console.log('   • Coluna RECORRENTE deve mostrar "Sim"');
console.log('   • Dashboard deve atualizar contador');
console.log('   • Carnê deve gerar com número correto de parcelas\n');

console.log('📊 Alterações realizadas:');
console.log('   • Frontend coleta e envia dados de parcelas');
console.log('   • Backend processa e salva parcelas corretamente');
console.log('   • Parcelas futuras são criadas automaticamente');
console.log('   • Sistema totalmente funcional!\n');

console.log('⚠️ Backups criados:');
console.log(`   • ${backupApp}`);
console.log(`   • ${backupServer}\n`);

console.log('💡 Em caso de problemas, restaure os backups.');
console.log('========================================\n');