const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO DEFINITIVA: Adicionando campo input-valor-parcelas');
console.log('=================================================================');

const htmlPath = path.join(__dirname, 'public', 'index.html');

try {
    // Ler arquivo HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Verificar se já tem o campo
    if (htmlContent.includes('input-valor-parcelas')) {
        console.log('✅ Campo input-valor-parcelas já existe');
        process.exit(0);
    }
    
    console.log('❌ Campo input-valor-parcelas NÃO encontrado');
    console.log('🔧 Aplicando correção...');
    
    // Localizar e substituir a seção completa de campos recorrentes
    const sectionStart = `<!-- CAMPOS RECORRENTES - v1.1.3 -->
                    <div id="recurring-fields" style="display: none;" 
                         class="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <h4 class="text-sm font-medium text-blue-800 flex items-center gap-2">
                            🔄 Configuração de Parcelas
                        </h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        
                        <p class="text-xs text-blue-600">
                            💡 A primeira parcela será registrada na data da doação acima
                        </p>
                    </div>`;

    const sectionEnd = `<!-- CAMPOS RECORRENTES - v2.4.0 CORRIGIDO -->
                    <div id="recurring-fields" style="display: none;" 
                         class="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <h4 class="text-sm font-medium text-blue-800 flex items-center gap-2">
                            🔄 Configuração de Parcelas
                        </h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        </div>
                        
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <p class="text-xs text-blue-700">
                                💡 <strong>Exemplo:</strong> Doação de R$ 100,00 com 5 parcelas:<br>
                                • 1ª parcela: R$ 100,00 (registrada hoje)<br>
                                • 4 parcelas futuras: R$ 25,00 cada
                            </p>
                        </div>
                    </div>`;

    // Aplicar substituição
    if (htmlContent.includes('grid-cols-1 md:grid-cols-2 gap-4')) {
        // Localizar toda a seção de campos recorrentes
        const startIndex = htmlContent.indexOf('<!-- CAMPOS RECORRENTES');
        const endIndex = htmlContent.indexOf('</div>', htmlContent.indexOf('💡 A primeira parcela será')) + 6;
        
        if (startIndex !== -1 && endIndex !== -1) {
            const beforeSection = htmlContent.substring(0, startIndex);
            const afterSection = htmlContent.substring(endIndex);
            
            // Reconstruir o HTML
            htmlContent = beforeSection + sectionEnd + afterSection;
            
            // Salvar arquivo
            fs.writeFileSync(htmlPath, htmlContent, 'utf8');
            
            console.log('✅ CORREÇÃO APLICADA COM SUCESSO!');
            console.log('');
            console.log('📋 MUDANÇAS REALIZADAS:');
            console.log('• Layout alterado de 2 para 3 colunas');
            console.log('• Adicionado campo: input-valor-parcelas');
            console.log('• Melhorada explicação com exemplo');
            console.log('');
            console.log('🧪 TESTE OBRIGATÓRIO:');
            console.log('1. Reiniciar servidor: Ctrl+C, depois npm start');
            console.log('2. Abrir http://localhost:3001');
            console.log('3. Clicar "Nova Doação"');
            console.log('4. Marcar "Doação Recorrente"');
            console.log('5. Verificar se aparecem 3 campos:');
            console.log('   - Quantas parcelas?');
            console.log('   - Valor das parcelas futuras (R$) ← NOVO');
            console.log('   - Próxima parcela em:');
            console.log('');
            console.log('🎯 RESULTADO ESPERADO:');
            console.log('Agora você poderá digitar R$ 25,00 no campo novo!');
            
        } else {
            console.log('❌ Não foi possível localizar seção para substituir');
            console.log('💡 HTML pode ter sido modificado. Verifique a estrutura.');
        }
    } else {
        console.log('❌ Padrão esperado não encontrado no HTML');
        console.log('💡 Arquivo pode ter estrutura diferente.');
    }

} catch (error) {
    console.error('❌ Erro ao processar arquivo:', error.message);
    process.exit(1);
}

console.log('=================================================================');