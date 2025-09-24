const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO CRÍTICA: Adicionando campo input-valor-parcelas ao HTML');
console.log('=====================================================================');

const htmlPath = path.join(__dirname, 'public', 'index.html');

try {
    // Ler o arquivo HTML atual
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Verificar se o campo já existe
    if (htmlContent.includes('input-valor-parcelas')) {
        console.log('✅ Campo input-valor-parcelas já existe no HTML');
        process.exit(0);
    }
    
    // Localizar a seção de campos recorrentes e substituir
    const oldRecurringSection = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Quantas parcelas? *
                                </label>
                                <input type="number" id="input-parcelas" min="2" max="60" placeholder="12" value="12"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Próxima parcela em: *
                                </label>
                                <input type="date" id="input-proxima-parcela"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>`;
    
    const newRecurringSection = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Quantas parcelas? *
                                </label>
                                <input type="number" id="input-parcelas" min="2" max="60" placeholder="12" value="12"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Valor das parcelas futuras (R$) *
                                </label>
                                <input type="number" id="input-valor-parcelas" step="0.01" min="0.01" placeholder="25.00"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-blue-700 mb-1">
                                    Próxima parcela em: *
                                </label>
                                <input type="date" id="input-proxima-parcela"
                                    class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>`;
    
    // Substituir a seção antiga pela nova
    if (htmlContent.includes(oldRecurringSection)) {
        htmlContent = htmlContent.replace(oldRecurringSection, newRecurringSection);
        
        // Melhorar a explicação também
        const oldExplanation = `<p class="text-xs text-blue-600">
                            💡 A primeira parcela será registrada na data da doação acima
                        </p>`;
        
        const newExplanation = `<div class="bg-blue-100 p-3 rounded-lg">
                            <p class="text-xs text-blue-700">
                                💡 <strong>Exemplo:</strong> Doação de R$ 100,00 com 5 parcelas:<br>
                                • 1ª parcela: R$ 100,00 (registrada hoje)<br>
                                • 4 parcelas futuras: R$ 25,00 cada
                            </p>
                        </div>`;
        
        if (htmlContent.includes(oldExplanation)) {
            htmlContent = htmlContent.replace(oldExplanation, newExplanation);
        }
        
        // Salvar o arquivo corrigido
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');
        
        console.log('✅ Correção aplicada com sucesso!');
        console.log('');
        console.log('📋 MUDANÇAS REALIZADAS:');
        console.log('• Adicionado campo input-valor-parcelas');
        console.log('• Layout alterado para 3 colunas (quantas + valor + próxima)');
        console.log('• Melhorada explicação com exemplo prático');
        console.log('');
        console.log('🧪 COMO TESTAR:');
        console.log('1. Abrir sistema: http://localhost:3001');
        console.log('2. Clicar em "Nova Doação"');
        console.log('3. Marcar "Doação Recorrente"');
        console.log('4. Verificar se aparecem 3 campos:');
        console.log('   - Quantas parcelas?');
        console.log('   - Valor das parcelas futuras (R$) ← NOVO CAMPO');
        console.log('   - Próxima parcela em:');
        console.log('');
        console.log('🎯 PRÓXIMO PASSO:');
        console.log('Reiniciar o servidor e testar a doação recorrente');
        
    } else {
        console.log('❌ Não foi possível localizar a seção de campos recorrentes');
        console.log('💡 Verifique se o HTML não foi modificado manualmente');
    }
    
} catch (error) {
    console.error('❌ Erro ao processar arquivo:', error.message);
    process.exit(1);
}

console.log('=====================================================================');