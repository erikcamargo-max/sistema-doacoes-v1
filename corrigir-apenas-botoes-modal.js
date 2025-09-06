const fs = require('fs');

console.log('CORREÇÃO PONTUAL: Apenas botões do modal');
console.log('Problema: Botões Salvar e Fechar sem ação');
console.log('Solução: Adicionar APENAS as funções necessárias');
console.log('');

try {
    let content = fs.readFileSync('./public/app.js', 'utf-8');
    
    // Backup de segurança
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync('./public/app.js', `./public/app_backup_antes_botoes_${timestamp}.js`);
    console.log('Backup criado');
    
    // Verificar se as funções já existem
    const temAddDonation = content.includes('window.addDonation') || content.includes('function addDonation');
    const temCloseModal = content.includes('window.closeModal') || content.includes('function closeModal');
    
    console.log(`addDonation existe: ${temAddDonation}`);
    console.log(`closeModal existe: ${temCloseModal}`);
    
    // Adicionar apenas o que falta, no final do arquivo
    let adicionado = '';
    
    if (!temAddDonation) {
        adicionado += `

// ===============================================================================
// FUNÇÃO PARA SALVAR NOVA DOAÇÃO - Versão Simples
// ===============================================================================
window.addDonation = async function() {
    try {
        console.log('Salvando nova doação...');
        
        // Coletar dados básicos do formulário
        const formData = {
            donor: document.getElementById('input-donor')?.value?.trim() || '',
            phone1: document.getElementById('input-phone1')?.value?.trim() || '',
            amount: parseFloat(document.getElementById('input-amount')?.value || 0),
            date: document.getElementById('input-date')?.value || '',
            type: document.getElementById('input-type')?.value || 'DINHEIRO',
            recurring: document.getElementById('input-recurrent')?.checked || false,
            notes: document.getElementById('input-notes')?.value?.trim() || '',
            contact: document.getElementById('input-contact')?.value?.trim() || '',
            cpf: document.getElementById('input-cpf')?.value?.trim() || ''
        };
        
        // Validação básica
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
        
        // Enviar para servidor
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert('Doação salva com sucesso!');
            closeModal();
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        } else {
            const error = await response.json();
            alert('Erro ao salvar: ' + (error.error || 'Erro desconhecido'));
        }
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar doação: ' + error.message);
    }
};`;
    }
    
    if (!temCloseModal) {
        adicionado += `

// ===============================================================================
// FUNÇÃO PARA FECHAR MODAL - Versão Simples  
// ===============================================================================
window.closeModal = function() {
    try {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
            
            // Limpar campos básicos
            const campos = ['input-donor', 'input-phone1', 'input-amount', 'input-date', 'input-notes', 'input-contact', 'input-cpf'];
            campos.forEach(id => {
                const campo = document.getElementById(id);
                if (campo) campo.value = '';
            });
            
            const checkbox = document.getElementById('input-recurrent');
            if (checkbox) checkbox.checked = false;
            
            console.log('Modal fechado');
        }
    } catch (error) {
        console.error('Erro ao fechar modal:', error);
    }
};`;
    }
    
    if (adicionado) {
        content += adicionado;
        fs.writeFileSync('./public/app.js', content);
        console.log('Funções adicionadas com sucesso');
    } else {
        console.log('Todas as funções já existem');
    }
    
    console.log('');
    console.log('TESTE AGORA:');
    console.log('1. npm start (se não estiver rodando)');
    console.log('2. Clique em "Nova Doação"');
    console.log('3. Preencha os campos obrigatórios');
    console.log('4. Clique em "Salvar" - deve funcionar');
    console.log('5. Teste "Fechar" - deve fechar o modal');
    
} catch (error) {
    console.error('Erro:', error.message);
}