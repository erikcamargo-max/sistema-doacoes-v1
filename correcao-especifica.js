// Correção específica baseada na análise real
const fs = require('fs');

console.log('Aplicando correção específica...');

try {
    let content = fs.readFileSync('./public/app.js', 'utf-8');
    
    // Backup
    const backup = `./public/app_backup_final_${Date.now()}.js`;
    fs.writeFileSync(backup, content);
    console.log('Backup criado:', backup);
    
    // Localizar window.addDonation
    const funcStart = content.indexOf('window.addDonation = async function() {');
    const formDataStart = content.indexOf('const formData = {', funcStart);
    
    if (formDataStart === -1) {
        console.log('formData não encontrado');
        process.exit(1);
    }
    
    // Encontrar final do formData
    let formDataEnd = formDataStart;
    let braces = 0;
    
    for (let i = formDataStart; i < content.length; i++) {
        const char = content[i];
        if (char === '{') braces++;
        if (char === '}') {
            braces--;
            if (braces === 0) {
                formDataEnd = i + 1;
                break;
            }
        }
    }
    
    // Extrair formData atual
    let formDataCurrent = content.substring(formDataStart, formDataEnd);
    
    // Verificar se já tem os campos
    if (formDataCurrent.includes('recorrente:') && formDataCurrent.includes('parcelas:')) {
        console.log('Campos já existem no formData');
        process.exit(0);
    }
    
    // Adicionar campos antes da última chave
    const lastBrace = formDataCurrent.lastIndexOf('}');
    const beforeBrace = formDataCurrent.substring(0, lastBrace);
    const needsComma = !beforeBrace.trim().endsWith(',');
    
    const newFields = `${needsComma ? ',' : ''}
        // Campos de parcelas recorrentes
        recorrente: document.getElementById('input-recurrent')?.checked || false,
        parcelas: parseInt(document.getElementById('input-parcelas')?.value || 1),
        proxima_parcela: document.getElementById('input-proxima-parcela')?.value || null`;
    
    const newFormData = beforeBrace + newFields + formDataCurrent.substring(lastBrace);
    
    // Substituir no content
    const newContent = content.substring(0, formDataStart) + newFormData + content.substring(formDataEnd);
    
    // Testar sintaxe
    try {
        new Function(newContent);
        console.log('Sintaxe válida');
    } catch (error) {
        console.log('Erro de sintaxe:', error.message);
        process.exit(1);
    }
    
    // Salvar
    fs.writeFileSync('./public/app.js', newContent);
    
    console.log('✅ Correção aplicada com sucesso!');
    console.log('✅ Campos recorrente, parcelas e proxima_parcela adicionados');
    console.log('');
    console.log('TESTE AGORA:');
    console.log('1. Recarregue a página (Ctrl+F5)');
    console.log('2. Nova Doação:');
    console.log('   - Valor: R$ 30,00');
    console.log('   - Marque "Doação Recorrente"'); 
    console.log('   - Parcelas: 6');
    console.log('3. Deve funcionar igual ao D008-SC');
    
} catch (error) {
    console.error('Erro:', error.message);
}