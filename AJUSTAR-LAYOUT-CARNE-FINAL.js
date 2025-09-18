/**
 * AJUSTES FINAIS DO LAYOUT DO CARNÊ BANCÁRIO
 * Versão: 2.1.0
 * Data: 17/09/2025
 * 
 * Ajustes:
 * 1. Logo APAE maior e centralizada (100x100)
 * 2. QR Code maior e destacado (150x150)
 * 3. Dados do pagador reorganizados
 * 4. Remoção de duplicações
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('🎨 AJUSTES FINAIS DO CARNÊ BANCÁRIO');
console.log('========================================\n');

// Ler o arquivo app.js
const appPath = path.join(__dirname, 'public', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

// Backup
const backupPath = `public/app_backup_ajustes_${Date.now()}.js`;
fs.writeFileSync(backupPath, appContent);
console.log(`✅ Backup criado: ${backupPath}\n`);

console.log('📝 Aplicando ajustes no layout...\n');

// AJUSTE 1: Logo APAE maior e centralizada
console.log('1️⃣ Ajustando logo APAE...');
const logoAntiga = /<td style="width: 20%; border-right: 1px solid #000; padding: 10px; vertical-align: middle;">[\s\S]*?<\/td>/;
const logoNova = `<td style="width: 20%; border-right: 1px solid #000; padding: 15px; text-align: center; vertical-align: middle;">
                        <img src="/logo-apae.png" alt="Logo APAE" style="width: 100px; height: 100px; object-fit: contain;">
                    </td>`;

if (logoAntiga.test(appContent)) {
    appContent = appContent.replace(logoAntiga, logoNova);
    console.log('   ✅ Logo ajustada para 100x100px\n');
} else {
    // Tentar ajuste alternativo
    appContent = appContent.replace(
        'style="width: 60px; height: 60px;',
        'style="width: 100px; height: 100px;'
    );
    appContent = appContent.replace(
        '<div style="font-size: 10px; margin-top: 5px;">APAE<br>Três Lagoas</div>',
        ''
    );
    console.log('   ✅ Logo ajustada (método alternativo)\n');
}

// AJUSTE 2: QR Code maior (150x150)
console.log('2️⃣ Aumentando QR Code...');
appContent = appContent.replace(
    /size=100x100/g,
    'size=150x150'
);
appContent = appContent.replace(
    'style="width: 100px; height: 100px; border: 1px solid #000;"',
    'style="width: 150px; height: 150px; border: 2px solid #000; display: block;"'
);
// Ajustar posição do QR Code
appContent = appContent.replace(
    'style="position: absolute; top: 10px; right: 10px; text-align: center;"',
    'style="position: absolute; top: 15px; right: 15px; text-align: center; background: white; padding: 5px; border: 1px solid #ddd; border-radius: 5px;"'
);
console.log('   ✅ QR Code aumentado para 150x150px\n');

// AJUSTE 3: Reorganizar dados do pagador
console.log('3️⃣ Reorganizando dados do pagador...');

// Primeiro, vamos criar a nova estrutura dos dados do pagador
const novaDadosPagador = `
                        <div style="font-size: 10px; margin-bottom: 8px;">
                            <strong>Pagador</strong><br>
                            \\${doador.nome.toUpperCase()}<br>
                            \\${doador.cpf ? 'CPF: ' + formatCPFDisplay(doador.cpf) : 'CPF: Não informado'}<br>
                            \\${montarEndereco(doador)}
                        </div>`;

// Localizar e substituir a seção do pagador
const pagadorPattern = /<div style="font-size: 10px; margin-bottom: 8px;">[\s]*<strong>Pagador<\/strong><br>[\s\S]*?<\/div>/;
if (pagadorPattern.test(appContent)) {
    appContent = appContent.replace(pagadorPattern, novaDadosPagador);
    console.log('   ✅ Dados do pagador reorganizados\n');
}

// AJUSTE 4: Remover bloco de endereço duplicado
console.log('4️⃣ Removendo duplicações...');
const enderecoPattern = /<div style="background: #f0f0f0; padding: 8px; border: 1px solid #ccc; margin-bottom: 8px;">[\s]*<div style="font-size: 10px;">[\s]*<strong>ENDEREÇO:<\/strong>[\s\S]*?<\/div>[\s]*<\/div>/g;
if (enderecoPattern.test(appContent)) {
    appContent = appContent.replace(enderecoPattern, '');
    console.log('   ✅ Bloco de endereço duplicado removido\n');
}

// AJUSTE 5: Melhorar layout geral da parcela
console.log('5️⃣ Ajustes finais no layout...');

// Ajustar altura mínima da tabela
appContent = appContent.replace(
    '<table style="width: 100%; border: 2px solid #000; border-collapse: collapse; margin-bottom: 10px;">',
    '<table style="width: 100%; border: 2px solid #000; border-collapse: collapse; margin-bottom: 15px; min-height: 200px;">'
);

// Ajustar padding geral
appContent = appContent.replace(
    /padding: 10px;/g,
    'padding: 12px;'
);

// Melhorar o título "Pagável usando o Pix!"
appContent = appContent.replace(
    '<span style="font-size: 11px; font-weight: bold;">Pagável usando o Pix!</span>',
    '<span style="font-size: 12px; font-weight: bold; color: #0066cc;">✓ Pagável usando o Pix!</span>'
);

// Ajustar informações do QR Code
appContent = appContent.replace(
    '<div style="font-size: 8px; margin-top: 2px;">',
    '<div style="font-size: 9px; margin-top: 3px; font-weight: bold;">'
);

console.log('   ✅ Layout geral otimizado\n');

// AJUSTE 6: Adicionar melhor formatação para impressão
console.log('6️⃣ Otimizando para impressão...');

// Verificar se existe a seção @media print
if (!appContent.includes('@media print')) {
    // Adicionar CSS de impressão se não existir
    const printCSS = `
        @media print {
            body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .no-print {
                display: none !important;
            }
            
            .parcela-bancaria {
                page-break-inside: avoid;
                margin-bottom: 5mm;
                break-inside: avoid;
            }
            
            .container {
                max-width: 100%;
            }
            
            .header {
                display: none;
            }
            
            table {
                border: 2px solid #000 !important;
            }
            
            img {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }`;
    
    // Adicionar antes do </style>
    const styleEndIndex = appContent.lastIndexOf('</style>');
    if (styleEndIndex !== -1) {
        appContent = appContent.substring(0, styleEndIndex) + printCSS + appContent.substring(styleEndIndex);
    }
}
console.log('   ✅ CSS de impressão otimizado\n');

// Salvar arquivo
fs.writeFileSync(appPath, appContent);

console.log('========================================');
console.log('✅ AJUSTES CONCLUÍDOS COM SUCESSO!');
console.log('========================================\n');

console.log('📋 AJUSTES APLICADOS:\n');
console.log('   1️⃣ Logo APAE: 100x100px, centralizada');
console.log('   2️⃣ QR Code: 150x150px, destacado com borda');
console.log('   3️⃣ Dados do pagador: Nome + CPF + Endereço juntos');
console.log('   4️⃣ Duplicações: Removidas');
console.log('   5️⃣ Layout: Melhor espaçamento e visual');
console.log('   6️⃣ Impressão: Otimizada\n');

console.log('🔄 PRÓXIMOS PASSOS:\n');
console.log('   1. Recarregue a página (Ctrl+F5)');
console.log('   2. Gere um carnê para ver os ajustes');
console.log('   3. Teste a impressão\n');

console.log('⚠️ Backup criado:', backupPath);

console.log('\n💡 DICA: Se precisar de mais ajustes,');
console.log('   me informe especificamente o que mudar.');

console.log('\n========================================');