/**
 * IMPLEMENTAÇÃO DO CARNÊ MODELO BANCÁRIO PROFISSIONAL
 * Versão: 2.0.0
 * Data: 13/09/2025
 * 
 * Este script substitui o layout do carnê pelo modelo bancário profissional
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('🏦 IMPLEMENTAÇÃO CARNÊ MODELO BANCÁRIO');
console.log('========================================\n');

// Ler o arquivo app.js
const appPath = path.join(__dirname, 'public', 'app.js');
let appContent = fs.readFileSync(appPath, 'utf8');

// Backup
const backupPath = `public/app_backup_bancario_${Date.now()}.js`;
fs.writeFileSync(backupPath, appContent);
console.log(`✅ Backup criado: ${backupPath}\n`);

// Nova função para gerar HTML do carnê bancário
const novaFuncaoHTML = `
// Função para gerar HTML do carnê modelo bancário
function gerarHTMLCarneProfissional(doacao, doador, historico) {
    const agora = new Date();
    const dataGeracao = agora.toLocaleDateString('pt-BR');
    const numeroDocumento = String(doacao.id).padStart(8, '0');
    const codigoDoador = doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0');
    
    // Calcular parcelas
    const totalParcelas = doacao.parcelas_totais || (doacao.recorrente ? 12 : 1);
    const valorParcela = doacao.valor;
    
    // Gerar HTML das parcelas
    let htmlParcelas = '';
    for (let i = 1; i <= totalParcelas; i++) {
        const dataVencimento = calcularVencimento(doacao.data_doacao, i - 1, doacao.recorrente);
        const pagamento = buscarPagamentoHistorico(historico, dataVencimento);
        const isPago = !!pagamento;
        
        // Estilo bancário compacto
        htmlParcelas += \`
        <div class="parcela-bancaria" style="page-break-inside: avoid;">
            <table style="width: 100%; border: 2px solid #000; border-collapse: collapse; margin-bottom: 10px;">
                <tr>
                    <!-- Logo e Banco -->
                    <td style="width: 20%; border-right: 1px solid #000; padding: 10px; vertical-align: middle;">
                        <img src="/logo-apae.png" alt="Logo APAE" style="width: 60px; height: 60px; object-fit: contain;">
                        <div style="font-size: 10px; margin-top: 5px;">APAE<br>Três Lagoas</div>
                    </td>
                    
                    <!-- Recibo do Pagador -->
                    <td style="width: 40%; border-right: 2px dashed #666; padding: 10px;">
                        <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px;">Recibo do Pagador</div>
                        
                        <div style="font-size: 10px; margin-bottom: 5px;">
                            <strong>Nº do Documento</strong><br>
                            \${numeroDocumento}
                        </div>
                        
                        <div style="font-size: 10px; margin-bottom: 5px;">
                            <strong>Vencimento</strong><br>
                            <span style="font-weight: bold; font-size: 12px;">\${formatDate(dataVencimento)}</span>
                        </div>
                        
                        <div style="font-size: 10px; margin-bottom: 5px;">
                            <strong>Valor</strong><br>
                            <span style="font-weight: bold; font-size: 14px; color: #000;">R$ \${valorParcela.toFixed(2).replace('.', ',')}</span>
                        </div>
                        
                        <div style="font-size: 10px;">
                            <strong>Valor Cobrado</strong><br>
                            _____________
                        </div>
                        
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
                            <div style="font-size: 10px;">
                                <strong>Pagador</strong><br>
                                \${doador.nome.toUpperCase()}<br>
                                \${doador.cpf ? 'CPF: ' + formatCPFDisplay(doador.cpf) : ''}<br>
                                TEL: \${doador.telefone1}
                            </div>
                        </div>
                    </td>
                    
                    <!-- Ficha de Compensação -->
                    <td style="width: 40%; padding: 10px; position: relative;">
                        <div style="background: #f0f0f0; padding: 5px; margin: -10px -10px 10px -10px; border-bottom: 1px solid #000;">
                            <span style="font-size: 11px; font-weight: bold;">Pagável usando o Pix!</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <div style="font-size: 10px;">
                                <strong>Beneficiário</strong><br>
                                APAE TRES LAGOAS
                            </div>
                            <div style="font-size: 10px; text-align: right;">
                                <strong>Vencimento</strong><br>
                                <span style="font-weight: bold; font-size: 12px;">\${formatDate(dataVencimento)}</span>
                            </div>
                        </div>
                        
                        <div style="font-size: 10px; margin-bottom: 8px;">
                            <strong>CNPJ do Beneficiário</strong><br>
                            03.689.866/0001-40
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <div style="font-size: 10px;">
                                <strong>Nº do documento</strong><br>
                                \${numeroDocumento}
                            </div>
                            <div style="font-size: 10px; text-align: right;">
                                <strong>Valor</strong><br>
                                <span style="font-weight: bold; font-size: 14px;">R$ \${valorParcela.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                        
                        <div style="font-size: 10px; margin-bottom: 8px;">
                            <strong>Instruções adicionais</strong><br>
                            <span style="font-size: 9px;">
                                Apoie vencimento: Multa 2,00% + R$0,80 Juros 0,033% a.d = R$0,01/dia<br>
                                PARCELA \${String(i).padStart(2, '0')}/\${String(totalParcelas).padStart(2, '0')}
                            </span>
                        </div>
                        
                        <div style="font-size: 10px; margin-bottom: 8px;">
                            <strong>Pagador</strong><br>
                            \${doador.nome.toUpperCase()} - \${doador.cpf ? formatCPFDisplay(doador.cpf) : 'CPF: Não informado'}
                        </div>
                        
                        <div style="background: #f0f0f0; padding: 8px; border: 1px solid #ccc; margin-bottom: 8px;">
                            <div style="font-size: 10px;">
                                <strong>ENDEREÇO:</strong> \${montarEndereco(doador)}
                            </div>
                        </div>
                        
                        <!-- QR Code -->
                        <div style="position: absolute; top: 10px; right: 10px; text-align: center;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=\${encodeURIComponent(gerarCodigoPix(valorParcela, i))}" 
                                 alt="QR Code PIX" 
                                 style="width: 100px; height: 100px; border: 1px solid #000;">
                            <div style="font-size: 8px; margin-top: 2px;">
                                Use o aplicativo do seu banco<br>
                                ou instituição financeira
                            </div>
                        </div>
                        
                        \${isPago ? \`
                        <div style="position: absolute; bottom: 10px; right: 10px; background: #28a745; color: white; padding: 5px 10px; border-radius: 3px; font-size: 10px;">
                            ✓ PAGO EM \${formatDate(pagamento.data_pagamento)}
                        </div>
                        \` : ''}
                    </td>
                </tr>
            </table>
        </div>
        \`;
    }
    
    return \`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Carnê Bancário - \${doador.nome}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            background: white;
            padding: 10px;
            color: #000;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            border: 2px solid #000;
            background: #f9f9f9;
        }
        
        .header h1 {
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .header-info {
            font-size: 12px;
            margin-top: 10px;
        }
        
        .header-info span {
            display: inline-block;
            margin: 0 10px;
        }
        
        .parcela-bancaria {
            margin-bottom: 10mm;
        }
        
        .no-print {
            margin: 20px 0;
            text-align: center;
        }
        
        .btn-imprimir {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 30px;
            font-size: 14px;
            cursor: pointer;
            border-radius: 3px;
        }
        
        .btn-imprimir:hover {
            background: #0056b3;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .no-print {
                display: none;
            }
            
            .parcela-bancaria {
                page-break-inside: avoid;
                margin-bottom: 5mm;
            }
            
            .container {
                max-width: 100%;
            }
            
            .header {
                display: none;
            }
        }
        
        /* Estilo para linha tracejada de corte */
        .linha-corte {
            border-top: 1px dashed #666;
            margin: 5px 0;
            position: relative;
        }
        
        .linha-corte::before {
            content: "✂";
            position: absolute;
            left: -20px;
            top: -10px;
            font-size: 16px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Cabeçalho (não imprime) -->
        <div class="header">
            <h1>CARNÊ DE PAGAMENTO - MODELO BANCÁRIO</h1>
            <div class="header-info">
                <span><strong>Contribuinte:</strong> \${doador.nome}</span>
                <span><strong>Código:</strong> \${codigoDoador}</span>
                <span><strong>Total de Parcelas:</strong> \${totalParcelas}</span>
            </div>
            <div class="header-info">
                <span><strong>Documento:</strong> \${numeroDocumento}</span>
                <span><strong>Gerado em:</strong> \${dataGeracao}</span>
            </div>
        </div>
        
        <!-- Parcelas -->
        \${htmlParcelas}
        
        <!-- Botão de Impressão -->
        <div class="no-print">
            <button class="btn-imprimir" onclick="window.print()">
                🖨️ IMPRIMIR CARNÊ
            </button>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                Configure a impressão para formato A4, orientação retrato, sem margens
            </p>
        </div>
    </div>
</body>
</html>\`;
}`;

// Localizar e substituir a função gerarHTMLCarneProfissional
console.log('🔍 Localizando função gerarHTMLCarneProfissional...');

const funcStartIndex = appContent.indexOf('function gerarHTMLCarneProfissional(doacao, doador, historico)');

if (funcStartIndex !== -1) {
    // Encontrar o fim da função (procurar pelo fechamento da função que retorna o HTML)
    let braceCount = 0;
    let inFunction = false;
    let funcEndIndex = funcStartIndex;
    
    for (let i = funcStartIndex; i < appContent.length; i++) {
        if (appContent[i] === '{') {
            braceCount++;
            inFunction = true;
        } else if (appContent[i] === '}') {
            braceCount--;
            if (inFunction && braceCount === 0) {
                funcEndIndex = i + 1;
                break;
            }
        }
    }
    
    // Substituir a função
    appContent = appContent.substring(0, funcStartIndex) + 
                 novaFuncaoHTML + '\n' +
                 appContent.substring(funcEndIndex);
    
    console.log('✅ Função gerarHTMLCarneProfissional substituída com sucesso!\n');
} else {
    console.log('⚠️ Função não encontrada no formato esperado');
    console.log('   Tentando adicionar antes de window.generateCarne...\n');
    
    const generateCarneIndex = appContent.indexOf('window.generateCarne = async function');
    if (generateCarneIndex !== -1) {
        appContent = appContent.substring(0, generateCarneIndex) + 
                     novaFuncaoHTML + '\n\n' +
                     appContent.substring(generateCarneIndex);
        console.log('✅ Função adicionada antes de generateCarne\n');
    }
}

// Salvar arquivo
fs.writeFileSync(appPath, appContent);

console.log('========================================');
console.log('✅ IMPLEMENTAÇÃO CONCLUÍDA!');
console.log('========================================\n');

console.log('🏦 MODELO BANCÁRIO IMPLEMENTADO:\n');
console.log('   ✅ Layout compacto tipo boleto bancário');
console.log('   ✅ Recibo do pagador destacável');
console.log('   ✅ QR Code PIX integrado');
console.log('   ✅ Informações completas do pagador');
console.log('   ✅ Instruções de pagamento');
console.log('   ✅ Otimizado para impressão A4\n');

console.log('📋 CARACTERÍSTICAS DO NOVO LAYOUT:\n');
console.log('   • Formato horizontal compacto');
console.log('   • 3 seções: Logo | Recibo | Ficha de Compensação');
console.log('   • QR Code posicionado no canto superior direito');
console.log('   • Visual limpo e profissional');
console.log('   • Linha tracejada para destacar\n');

console.log('🔄 PRÓXIMOS PASSOS:\n');
console.log('   1. Recarregue a página (Ctrl+F5)');
console.log('   2. Gere um carnê para ver o novo modelo');
console.log('   3. Teste a impressão\n');

console.log('⚠️ Backup criado em:', backupPath);
console.log('========================================');