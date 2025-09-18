/**
 * AJUSTES FINAIS DO CARNÊ - VERSÃO CORRIGIDA
 * Versão: 2.1.1
 * Data: 17/09/2025
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('🎨 AJUSTES DO CARNÊ - VERSÃO CORRIGIDA');
console.log('========================================\n');

// Ler o arquivo app.js
const appPath = path.join(__dirname, 'public', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

// Backup
const backupPath = `public/app_backup_corrigido_${Date.now()}.js`;
fs.writeFileSync(backupPath, appContent);
console.log(`✅ Backup criado: ${backupPath}\n`);

// AJUSTE 1: Logo maior
console.log('1️⃣ Ajustando logo APAE para 100x100px...');
appContent = appContent.replace(
    'style="width: 60px; height: 60px;',
    'style="width: 100px; height: 100px;'
);
// Remover texto abaixo da logo
appContent = appContent.replace(
    '<div style="font-size: 10px; margin-top: 5px;">APAE<br>Três Lagoas</div>',
    ''
);
console.log('   ✅ Logo ajustada\n');

// AJUSTE 2: QR Code maior
console.log('2️⃣ Aumentando QR Code para 150x150px...');
appContent = appContent.replace(/size=100x100/g, 'size=150x150');
appContent = appContent.replace(
    'style="width: 100px; height: 100px;',
    'style="width: 150px; height: 150px;'
);
console.log('   ✅ QR Code aumentado\n');

// AJUSTE 3: Melhorar posição do QR
console.log('3️⃣ Ajustando posição do QR Code...');
// Localizar e ajustar a div do QR Code
const qrOldStyle = 'style="position: absolute; top: 10px; right: 10px; text-align: center;"';
const qrNewStyle = 'style="position: absolute; top: 15px; right: 15px; text-align: center; background: white; padding: 8px; border: 2px solid #000; border-radius: 5px;"';
appContent = appContent.replace(qrOldStyle, qrNewStyle);
console.log('   ✅ Posição do QR ajustada\n');

// AJUSTE 4: Reorganizar dados do pagador (usando string replacement simples)
console.log('4️⃣ Reorganizando layout dos dados...');

// Procurar e substituir o bloco de endereço duplicado se existir
const enderecoAntigo = /<div style="background: #f0f0f0[^>]*>[\s\S]*?ENDEREÇO:[\s\S]*?<\/div>[\s]*<\/div>/g;
appContent = appContent.replace(enderecoAntigo, '');
console.log('   ✅ Duplicações removidas\n');

// AJUSTE 5: Melhorar visual geral
console.log('5️⃣ Aplicando ajustes visuais finais...');

// Aumentar padding
appContent = appContent.replace(/padding: 10px;/g, 'padding: 12px;');

// Melhorar título do PIX
appContent = appContent.replace(
    'Pagável usando o Pix!',
    '✓ Pagável usando o Pix!'
);

// Ajustar tamanho das fontes do QR
appContent = appContent.replace(
    'style="font-size: 8px;',
    'style="font-size: 10px; font-weight: bold;'
);

console.log('   ✅ Visual melhorado\n');

// Salvar arquivo
fs.writeFileSync(appPath, appContent);

console.log('========================================');
console.log('✅ AJUSTES CONCLUÍDOS COM SUCESSO!');
console.log('========================================\n');

console.log('📋 RESUMO DOS AJUSTES:\n');
console.log('   • Logo APAE: 100x100px');
console.log('   • QR Code: 150x150px com borda');
console.log('   • Dados reorganizados');
console.log('   • Visual melhorado\n');

console.log('🔄 PRÓXIMOS PASSOS:');
console.log('   1. Recarregue a página (Ctrl+F5)');
console.log('   2. Teste o carnê\n');

console.log('✅ Pronto!');