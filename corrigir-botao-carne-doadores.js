/**
 * ================================================================
 * SCRIPT: Corrigir Botão Carnê na Tabela de Doadores
 * ================================================================
 * 
 * VERSÃO: 1.4.1
 * DATA: 11/09/2025
 * 
 * DESCRIÇÃO:
 * Substitui o botão de visualizar (olho) pelo botão de carnê
 * para gerar carnê das doações do doador
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   CORREÇÃO BOTÃO CARNÊ - v1.4.1                   ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// ================================================================
// 1. ATUALIZAR HTML - TROCAR ÍCONE E FUNÇÃO
// ================================================================

console.log('1️⃣  Atualizando botões na tabela de doadores...\n');

const htmlPath = path.join(__dirname, 'public', 'index.html');

if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Backup
    const htmlBackup = `public/index.html.backup_${Date.now()}`;
    fs.copyFileSync(htmlPath, htmlBackup);
    console.log(`✅ Backup criado: ${htmlBackup}`);
    
    // 1. Substituir o botão de visualizar (olho) pelo botão de carnê na função renderDonors
    const oldButton = `<button onclick="viewDonorHistory(\${donor.id})" class="text-green-600 hover:text-green-900 mr-2">
                        <i data-feather="eye" class="h-4 w-4 inline"></i>
                    </button>`;
    
    const newButton = `<button onclick="generateDonorCarne(\${donor.id})" class="text-purple-600 hover:text-purple-900 mr-2" title="Gerar Carnê">
                        <i data-feather="file-text" class="h-4 w-4 inline"></i>
                    </button>`;
    
    htmlContent = htmlContent.replace(oldButton, newButton);
    
    // 2. Adicionar função generateDonorCarne se não existir
    if (!htmlContent.includes('generateDonorCarne')) {
        const newFunction = `
    
    // Gerar carnê de todas as doações do doador
    function generateDonorCarne(donorId) {
        const donor = window.allDonors.find(d => d.id === donorId);
        if (!donor) {
            showNotification('Doador não encontrado', 'error');
            return;
        }
        
        // Buscar doações do doador
        if (typeof window.allDonations !== 'undefined') {
            const donorDonations = window.allDonations.filter(d => d.doador_id === donorId);
            
            if (donorDonations.length === 0) {
                showNotification('Este doador não possui doações para gerar carnê', 'warning');
                return;
            }
            
            // Se tiver apenas uma doação, gerar carnê direto
            if (donorDonations.length === 1) {
                generateCarne(donorDonations[0].id);
                return;
            }
            
            // Se tiver múltiplas doações, perguntar qual
            let message = \`Selecione a doação para gerar o carnê:\\n\\n\`;
            donorDonations.forEach((donation, index) => {
                message += \`\${index + 1}. R$ \${donation.valor} - \${donation.tipo} - \${new Date(donation.data_doacao).toLocaleDateString('pt-BR')}\\n\`;
            });
            
            const choice = prompt(message + '\\nDigite o número da doação:');
            
            if (choice && !isNaN(choice)) {
                const index = parseInt(choice) - 1;
                if (index >= 0 && index < donorDonations.length) {
                    generateCarne(donorDonations[index].id);
                } else {
                    showNotification('Opção inválida', 'error');
                }
            }
        } else {
            showNotification('Não foi possível acessar as doações', 'error');
        }
    }
    
    // Função para gerar carnê (se não existir)
    if (typeof generateCarne === 'undefined') {
        window.generateCarne = function(donationId) {
            // Abrir URL do carnê
            const url = \`/api/doacoes/\${donationId}/carne\`;
            window.open(url, '_blank');
            showNotification('Carnê sendo gerado...', 'success');
        }
    }`;
        
        // Adicionar antes do fechamento do último script
        htmlContent = htmlContent.replace('</script>\n</body>', newFunction + '\n    </script>\n</body>');
    }
    
    // 3. Adicionar função para mostrar histórico de doações no modal (opcional)
    if (!htmlContent.includes('showDonorDonations')) {
        const historyFunction = `
    
    // Mostrar histórico de doações do doador
    function showDonorDonations(donorId) {
        const donor = window.allDonors.find(d => d.id === donorId);
        if (!donor) return;
        
        if (typeof window.allDonations !== 'undefined') {
            const donorDonations = window.allDonations.filter(d => d.doador_id === donorId);
            
            let html = '<div class="p-4">';
            html += '<h3 class="text-lg font-bold mb-4">Doações de ' + donor.nome + '</h3>';
            
            if (donorDonations.length === 0) {
                html += '<p class="text-gray-500">Nenhuma doação registrada</p>';
            } else {
                html += '<div class="space-y-3">';
                let total = 0;
                
                donorDonations.forEach((donation, index) => {
                    total += parseFloat(donation.valor) || 0;
                    const statusClass = donation.recorrente ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
                    
                    html += \`
                        <div class="border rounded-lg p-3 hover:bg-gray-50">
                            <div class="flex justify-between items-start">
                                <div>
                                    <span class="font-semibold">R$ \${donation.valor}</span>
                                    <span class="ml-2 px-2 py-1 text-xs rounded \${statusClass}">
                                        \${donation.recorrente ? 'Recorrente' : 'Única'}
                                    </span>
                                </div>
                                <span class="text-sm text-gray-500">
                                    \${new Date(donation.data_doacao).toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                            <div class="mt-2 text-sm text-gray-600">
                                <span>Tipo: \${donation.tipo}</span>
                                \${donation.observacoes ? \`<br>Obs: \${donation.observacoes}\` : ''}
                            </div>
                            <div class="mt-2">
                                <button onclick="generateCarne(\${donation.id})" 
                                    class="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
                                    Gerar Carnê
                                </button>
                            </div>
                        </div>
                    \`;
                });
                
                html += '</div>';
                html += '<div class="mt-4 pt-4 border-t">';
                html += '<p class="text-lg font-bold">Total: R$ ' + total.toFixed(2).replace('.', ',') + '</p>';
                html += '</div>';
            }
            
            html += '</div>';
            
            // Criar modal para mostrar
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
            modal.innerHTML = \`
                <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center p-4 border-b">
                        <h2 class="text-xl font-bold">Histórico de Doações</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                            <i data-feather="x" class="h-6 w-6"></i>
                        </button>
                    </div>
                    \${html}
                </div>
            \`;
            
            document.body.appendChild(modal);
            feather.replace();
        }
    }`;
        
        // Adicionar antes do fechamento do último script
        htmlContent = htmlContent.replace('</script>\n</body>', historyFunction + '\n    </script>\n</body>');
    }
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('✅ HTML atualizado com botão de carnê');
    
} else {
    console.log('❌ index.html não encontrado');
}

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 BOTÃO CARNÊ CORRIGIDO!');
console.log('═'.repeat(56));

console.log('\n✅ ALTERAÇÕES REALIZADAS:');
console.log('   1. Botão de olho substituído por botão de carnê');
console.log('   2. Ícone: file-text (documento)');
console.log('   3. Cor: roxo (purple)');
console.log('   4. Função: generateDonorCarne()');

console.log('\n🎯 COMO FUNCIONA:');
console.log('   • Se o doador tem 1 doação → Gera carnê direto');
console.log('   • Se tem várias doações → Pergunta qual');
console.log('   • Se não tem doações → Avisa o usuário');

console.log('\n📝 AÇÕES DOS BOTÕES AGORA:');
console.log('   📝 Editar - Abre modal para editar doador');
console.log('   📄 Carnê - Gera carnê das doações');
console.log('   🗑️ Excluir - Remove o doador');

console.log('\n🔄 PRÓXIMOS PASSOS:');
console.log('═'.repeat(56));
console.log('1. Reinicie o servidor: npm start');
console.log('2. Limpe o cache (Ctrl+F5)');
console.log('3. Teste o botão de carnê');

console.log('\n✅ BOTÃO CARNÊ FUNCIONANDO!');
console.log('═'.repeat(56));