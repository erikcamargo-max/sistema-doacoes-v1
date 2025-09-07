// Debug em tempo real - verificar o que está sendo enviado
const fs = require('fs');

console.log('Adicionando debug em tempo real...');

try {
    let appContent = fs.readFileSync('./public/app.js', 'utf-8');
    
    // Localizar a função window.addDonation
    const funcStart = appContent.indexOf('window.addDonation = async function() {');
    if (funcStart === -1) {
        console.log('Função não encontrada');
        process.exit(1);
    }
    
    // Localizar onde faz o fetch
    const fetchStart = appContent.indexOf('fetch(\'/api/doacoes\'', funcStart);
    if (fetchStart === -1) {
        console.log('Fetch não encontrado');
        process.exit(1);
    }
    
    // Localizar JSON.stringify(formData)
    const jsonStringifyPos = appContent.indexOf('JSON.stringify(formData)', fetchStart);
    if (jsonStringifyPos === -1) {
        console.log('JSON.stringify(formData) não encontrado');
        process.exit(1);
    }
    
    // Adicionar console.log antes do fetch para debug
    const debugCode = `
        
        // DEBUG: Mostrar dados que serão enviados
        console.log('=== DEBUG DADOS ENVIADOS ===');
        console.log('Checkbox recorrente:', document.getElementById('input-recurrent')?.checked);
        console.log('Campo parcelas:', document.getElementById('input-parcelas')?.value);
        console.log('FormData completo:', formData);
        console.log('JSON que será enviado:', JSON.stringify(formData, null, 2));
        console.log('==============================');
        `;
    
    // Inserir debug antes do fetch
    const novoContent = appContent.substring(0, fetchStart) + debugCode + appContent.substring(fetchStart);
    
    // Backup
    const backup = `./public/app_backup_debug_${Date.now()}.js`;
    fs.writeFileSync(backup, appContent);
    
    // Salvar com debug
    fs.writeFileSync('./public/app.js', novoContent);
    
    console.log('✅ Debug adicionado ao frontend');
    console.log('✅ Backup criado:', backup);
    
    console.log('\nTESTE AGORA:');
    console.log('1. Recarregue a página (Ctrl+F5)');
    console.log('2. Abra DevTools (F12) → Console');
    console.log('3. Crie nova doação recorrente');
    console.log('4. Veja no console exatamente o que está sendo enviado');
    console.log('5. Me informe os valores mostrados no debug');
    
} catch (error) {
    console.error('Erro:', error.message);
}