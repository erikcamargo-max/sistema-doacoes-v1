const fs = require('fs');
const path = require('path');

console.log('🔧 CORREÇÃO JS: Adicionando input-valor-parcelas ao clearModalFields');
console.log('===================================================================');

const jsPath = path.join(__dirname, 'public', 'app.js');

try {
    // Ler arquivo JavaScript
    let jsContent = fs.readFileSync(jsPath, 'utf8');
    
    // Procurar pela função clearModalFields e o array de campos
    const oldFieldsArray = `const fields = [
        'input-donor', 'input-cpf', 'input-phone1', 'input-phone2', 'input-contact',
        'input-cep', 'input-logradouro', 'input-numero', 'input-complemento', 
        'input-bairro', 'input-cidade', 'input-estado',
        'input-amount', 'input-type', 'input-date', 'input-observations',
        'input-parcelas', 'input-proxima-parcela'
    ];`;

    const newFieldsArray = `const fields = [
        'input-donor', 'input-cpf', 'input-phone1', 'input-phone2', 'input-contact',
        'input-cep', 'input-logradouro', 'input-numero', 'input-complemento', 
        'input-bairro', 'input-cidade', 'input-estado',
        'input-amount', 'input-type', 'input-date', 'input-observations',
        'input-parcelas', 'input-valor-parcelas', 'input-proxima-parcela'
    ];`;
    
    if (jsContent.includes('input-valor-parcelas')) {
        console.log('✅ Campo input-valor-parcelas já existe no JavaScript');
    } else if (jsContent.includes(oldFieldsArray)) {
        // Substituir array de campos
        jsContent = jsContent.replace(oldFieldsArray, newFieldsArray);
        
        // Salvar arquivo
        fs.writeFileSync(jsPath, jsContent, 'utf8');
        
        console.log('✅ JavaScript corrigido com sucesso!');
        console.log('• Adicionado input-valor-parcelas ao clearModalFields');
    } else {
        console.log('⚠️  Array de campos não encontrado no formato esperado');
        console.log('💡 Pode ser que o arquivo já tenha sido modificado');
    }

} catch (error) {
    console.error('❌ Erro ao processar JavaScript:', error.message);
    process.exit(1);
}

console.log('===================================================================');