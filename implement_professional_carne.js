// implementar-carne-profissional-v1.1.5.js
// Versão: 1.1.5
// Data: 05/09/2025
// Objetivo: Implementar sistema PROFISSIONAL de geração de carnês com layout premium

const fs = require('fs');
const path = require('path');

console.log('🎨 IMPLEMENTAÇÃO: Carnê Profissional');
console.log('Versão: 1.1.5 - Sistema de Doações');
console.log('Fases: Layout Premium + Dados Completos + QR Code');
console.log('══════════════════════════════════════════════════\n');

// ==========================================
// 1. IMPLEMENTAR FUNÇÃO GENERATECARNE PROFISSIONAL
// ==========================================

function implementarGenerateCarne() {
    console.log('📝 Implementando função generateCarne() profissional...');
    
    const appPath = './public/app.js';
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Verificar se já existe alguma função generateCarne
    if (content.includes('function generateCarne') || content.includes('generateCarne =')) {
        console.log('⚠️ Função generateCarne já existe, será substituída');
        
        // Remover função existente
        const generateCarneRegex = /(?:async\s+)?function\s+generateCarne[\s\S]*?^}/m;
        const match = content.match(generateCarneRegex);
        if (match) {
            content = content.replace(match[0], '');
            console.log('🗑️ Função antiga removida');
        }
    }
    
    // Nova função generateCarne PROFISSIONAL
    const novaFuncaoGenerateCarne = `
// ===============================================================================
// GERAÇÃO DE CARNÊ PROFISSIONAL - Versão 1.1.5 PREMIUM
// ===============================================================================

async function generateCarne(doacaoId) {
    try {
        console.log('🎨 Gerando carnê profissional para doação:', doacaoId);
        showNotification('Gerando carnê profissional...', 'info');
        
        // Buscar dados completos
        const doacaoResponse = await fetch(\`/api/doacoes/\${doacaoId}\`);
        if (!doacaoResponse.ok) throw new Error('Erro ao buscar doação');
        const doacao = await doacaoResponse.json();
        
        const doadorResponse = await fetch(\`/api/doadores/\${doacao.doador_id}\`);
        if (!doadorResponse.ok) throw new Error('Erro ao buscar doador');
        const doador = await doadorResponse.json();
        
        const historicoResponse = await fetch(\`/api/doacoes/\${doacaoId}/historico\`);
        const historico = await historicoResponse.json();
        
        console.log('📊 Dados carregados:', { doacao, doador, historico });
        
        // Criar janela para o carnê
        const printWindow = window.open('', '_blank', 'width=1024,height=768');
        
        // HTML do carnê profissional
        const carneHTML = criarHTMLCarneProfissional(doacao, doador, historico);
        
        // Escrever HTML na janela
        printWindow.document.write(carneHTML);
        printWindow.document.close();
        
        // Auto-focar na nova janela
        printWindow.focus();
        
        showNotification('Carnê profissional gerado com sucesso!', 'success');
        console.log('✅ Carnê profissional criado');
        
    } catch (error) {
        console.error('❌ Erro ao gerar carnê:', error);
        showNotification('Erro ao gerar carnê: ' + error.message, 'error');
    }
}

// Função para criar HTML do carnê profissional
function criarHTMLCarneProfissional(doacao, doador, historico) {
    const agora = new Date();
    const dataGeracao = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
    const numeroDocumento = \`CRN-\${doacao.id.toString().padStart(6, '0')}\`;
    
    // Dados da organização (configuráveis)
    const organizacao = {
        nome: 'Sistema de Controle de Doações',
        cnpj: '00.000.000/0001-00',
        endereco: 'Rua das Organizações, 123 - Centro',
        cidade: 'São Paulo - SP - CEP: 01234-567',
        telefone: '(11) 3456-7890',
        email: 'contato@organizacao.org.br',
        site: 'www.organizacao.org.br',
        pix: 'pix@organizacao.org.br'
    };
    
    return \`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carnê de Doação - \${doador.nome}</title>
    <style>
        /* Reset e configurações básicas */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
        }
        
        /* Container principal */
        .carne-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
        }
        
        /* Watermark de fundo */
        .carne-container::before {
            content: 'DOCUMENTO OFICIAL';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 48px;
            font-weight: bold;
            color: rgba(59, 130, 246, 0.05);
            z-index: 1;
            pointer-events: none;
        }
        
        /* Cabeçalho com logo */
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            position: relative;
            z-index: 2;
        }
        
        .header-content {
            display: flex;
            justify-content: between;
            align-items: center;
            gap: 20px;
        }
        
        .logo-section {
            flex: 1;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 15px;
        }
        
        .org-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .org-details {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .documento-info {
            text-align: right;
            color: white;
        }
        
        .numero-documento {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .data-geracao {
            font-size: 14px;
            opacity: 0.9;
        }
        
        /* Seção de informações */
        .info-section {
            padding: 30px;
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
            position: relative;
            z-index: 2;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 20px;
        }
        
        .doador-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .doacao-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        
        .info-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .info-item {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .info-label {
            font-weight: 600;
            color: #6b7280;
            display: inline-block;
            min-width: 80px;
        }
        
        .info-value {
            color: #374151;
        }
        
        /* Resumo da doação */
        .resumo-doacao {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px 30px;
            margin: 0 30px;
            border-radius: 8px;
            position: relative;
            z-index: 2;
        }
        
        .valor-total {
            font-size: 28px;
            font-weight: bold;
        }
        
        .parcelas-info {
            text-align: right;
            font-size: 14px;
        }
        
        /* QR Code placeholder */
        .qr-section {
            background: white;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            color: #6b7280;
            margin-top: 15px;
        }
        
        /* Tabela de parcelas */
        .parcelas-section {
            padding: 30px;
            position: relative;
            z-index: 2;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .parcelas-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .parcelas-table th {
            background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        
        .parcelas-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        
        .parcelas-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .parcelas-table tr:hover {
            background: #f3f4f6;
        }
        
        .status-pago {
            background: #dcfce7;
            color: #166534;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        }
        
        .status-pendente {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
        }
        
        .valor-cell {
            font-weight: bold;
            color: #059669;
        }
        
        /* Instruções de pagamento */
        .instrucoes-section {
            background: #f1f5f9;
            padding: 30px;
            border-top: 2px solid #e2e8f0;
            position: relative;
            z-index: 2;
        }
        
        .instrucoes-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .instrucao-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .instrucao-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .instrucao-content {
            font-size: 14px;
            line-height: 1.5;
            color: #6b7280;
        }
        
        /* Footer */
        .footer {
            background: #374151;
            color: white;
            padding: 20px 30px;
            text-align: center;
            position: relative;
            z-index: 2;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .assinatura {
            flex: 1;
            text-align: left;
        }
        
        .assinatura-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .assinatura-info {
            font-size: 12px;
            opacity: 0.8;
        }
        
        .selo-autenticidade {
            background: rgba(255,255,255,0.1);
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .selo-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .selo-codigo {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            opacity: 0.8;
        }
        
        /* Botões de ação */
        .acoes-section {
            background: white;
            padding: 20px 30px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 15px;
            justify-content: center;
            position: relative;
            z-index: 2;
        }
        
        .btn-acao {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-imprimir {
            background: #3b82f6;
            color: white;
        }
        
        .btn-imprimir:hover {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .btn-salvar {
            background: #10b981;
            color: white;
        }
        
        .btn-salvar:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                text-align: center;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .instrucoes-grid {
                grid-template-columns: 1fr;
            }
            
            .footer-content {
                flex-direction: column;
                text-align: center;
            }
            
            .acoes-section {
                flex-direction: column;
            }
        }
        
        /* Estilos para impressão */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .carne-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .acoes-section {
                display: none;
            }
            
            .parcelas-table {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="carne-container">
        <!-- Cabeçalho -->
        <header class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo">💰</div>
                    <h1 class="org-name">\${organizacao.nome}</h1>
                    <div class="org-details">
                        📧 \${organizacao.email} | 📱 \${organizacao.telefone}<br>
                        🌐 \${organizacao.site}
                    </div>
                </div>
                <div class="documento-info">
                    <div class="numero-documento">\${numeroDocumento}</div>
                    <div class="data-geracao">Gerado em \${dataGeracao}</div>
                </div>
            </div>
        </header>
        
        <!-- Informações -->
        <section class="info-section">
            <div class="info-grid">
                <div class="doador-info">
                    <h3 class="info-title">👤 Dados do Doador</h3>
                    <div class="info-item">
                        <span class="info-label">Nome:</span>
                        <span class="info-value">\${doador.nome}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Código:</span>
                        <span class="info-value">\${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}</span>
                    </div>
                    \${doador.cpf ? \`<div class="info-item">
                        <span class="info-label">CPF:</span>
                        <span class="info-value">\${formatCPF(doador.cpf)}</span>
                    </div>\` : ''}
                    <div class="info-item">
                        <span class="info-label">Telefone:</span>
                        <span class="info-value">\${doador.telefone1}\${doador.telefone2 ? ' / ' + doador.telefone2 : ''}</span>
                    </div>
                    \${doador.email ? \`<div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">\${doador.email}</span>
                    </div>\` : ''}
                    \${montarEnderecoCompleto(doador) ? \`<div class="info-item">
                        <span class="info-label">Endereço:</span>
                        <span class="info-value">\${montarEnderecoCompleto(doador)}</span>
                    </div>\` : ''}
                </div>
                
                <div class="doacao-info">
                    <h3 class="info-title">💰 Dados da Doação</h3>
                    <div class="info-item">
                        <span class="info-label">Tipo:</span>
                        <span class="info-value">\${doacao.tipo}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Data:</span>
                        <span class="info-value">\${formatDate(doacao.data_doacao)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Recorrente:</span>
                        <span class="info-value">\${doacao.recorrente ? 'Sim' : 'Não'}</span>
                    </div>
                    \${doacao.observacoes ? \`<div class="info-item">
                        <span class="info-label">Obs:</span>
                        <span class="info-value">\${doacao.observacoes}</span>
                    </div>\` : ''}
                </div>
            </div>
            
            <div class="resumo-doacao">
                <div>
                    <div class="valor-total">R$ \${doacao.valor.toFixed(2).replace('.', ',')}</div>
                    <div>Valor da Doação</div>
                </div>
                <div class="parcelas-info">
                    <div>\${doacao.recorrente ? (doacao.parcelas_totais || 12) + ' parcelas mensais' : 'Doação única'}</div>
                    <div>Total pago: R$ \${calcularTotalPago(historico).toFixed(2).replace('.', ',')}</div>
                </div>
            </div>
            
            <div class="qr-section">
                <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
                <div><strong>QR Code PIX</strong></div>
                <div style="font-size: 12px; margin-top: 5px;">
                    PIX: \${organizacao.pix}<br>
                    Valor: R$ \${doacao.valor.toFixed(2).replace('.', ',')}
                </div>
            </div>
        </section>
        
        <!-- Tabela de Parcelas -->
        <section class="parcelas-section">
            <h2 class="section-title">📋 Carnê de Pagamentos</h2>
            <table class="parcelas-table">
                <thead>
                    <tr>
                        <th>Parcela</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Data Pagamento</th>
                    </tr>
                </thead>
                <tbody>
                    \${gerarLinhasParcelas(doacao, historico)}
                </tbody>
            </table>
        </section>
        
        <!-- Instruções -->
        <section class="instrucoes-section">
            <h2 class="section-title">💳 Instruções de Pagamento</h2>
            <div class="instrucoes-grid">
                <div class="instrucao-card">
                    <h3 class="instrucao-title">📱 PIX</h3>
                    <div class="instrucao-content">
                        <strong>Chave PIX:</strong> \${organizacao.pix}<br>
                        <strong>Favorecido:</strong> \${organizacao.nome}<br>
                        <strong>CNPJ:</strong> \${organizacao.cnpj}<br><br>
                        Utilize o QR Code acima para pagamento instantâneo via PIX.
                    </div>
                </div>
                
                <div class="instrucao-card">
                    <h3 class="instrucao-title">🏦 Outras Formas</h3>
                    <div class="instrucao-content">
                        <strong>Dinheiro:</strong> Entregar diretamente<br>
                        <strong>Contato:</strong> \${organizacao.telefone}<br>
                        <strong>Email:</strong> \${organizacao.email}<br><br>
                        Em caso de dúvidas, entre em contato conosco.
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="assinatura">
                    <div class="assinatura-title">✍️ Assinatura Digital</div>
                    <div class="assinatura-info">
                        Documento gerado automaticamente pelo<br>
                        \${organizacao.nome}
                    </div>
                </div>
                
                <div class="selo-autenticidade">
                    <div class="selo-title">🔒 Selo de Autenticidade</div>
                    <div class="selo-codigo">
                        SHA256: \${gerarHashAutenticidade(numeroDocumento)}<br>
                        Verificação: \${organizacao.site}/verificar
                    </div>
                </div>
            </div>
        </footer>
        
        <!-- Botões de Ação -->
        <div class="acoes-section">
            <button class="btn-acao btn-imprimir" onclick="window.print()">
                🖨️ Imprimir Carnê
            </button>
            <button class="btn-acao btn-salvar" onclick="window.print()">
                💾 Salvar PDF
            </button>
        </div>
    </div>
    
    <script>
        // Função para formatar CPF
        function formatCPF(cpf) {
            if (!cpf) return '';
            const numbers = cpf.replace(/\\D/g, '');
            return numbers.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
        }
        
        // Função para formatar data
        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('pt-BR');
        }
        
        // Função para montar endereço completo
        function montarEnderecoCompleto(doador) {
            const parts = [];
            if (doador.logradouro) parts.push(doador.logradouro);
            if (doador.numero) parts.push(doador.numero);
            if (doador.complemento) parts.push(doador.complemento);
            if (doador.bairro) parts.push(doador.bairro);
            if (doador.cidade) parts.push(doador.cidade);
            if (doador.estado) parts.push(doador.estado);
            if (doador.cep) parts.push(\`CEP: \${doador.cep}\`);
            return parts.length > 0 ? parts.join(', ') : '';
        }
        
        // Função para calcular total pago
        function calcularTotalPago(historico) {
            if (!historico || !Array.isArray(historico)) return 0;
            return historico.reduce((total, pagamento) => total + (pagamento.valor || 0), 0);
        }
        
        // Função para gerar linhas das parcelas
        function gerarLinhasParcelas(doacao, historico) {
            const parcelas = doacao.parcelas_totais || (doacao.recorrente ? 12 : 1);
            const valorParcela = doacao.valor / (doacao.recorrente ? parcelas : 1);
            let html = '';
            
            for (let i = 1; i <= parcelas; i++) {
                const dataVencimento = calcularDataVencimento(doacao.data_doacao, i - 1, doacao.recorrente);
                const pagamento = buscarPagamento(historico, dataVencimento);
                const isPago = !!pagamento;
                
                html += \`
                    <tr>
                        <td><strong>\${String(i).padStart(2, '0')}/\${String(parcelas).padStart(2, '0')}</strong></td>
                        <td>\${formatDate(dataVencimento)}</td>
                        <td class="valor-cell">R$ \${valorParcela.toFixed(2).replace('.', ',')}</td>
                        <td>
                            <span class="\${isPago ? 'status-pago' : 'status-pendente'}">
                                \${isPago ? '✅ PAGO' : '⏳ PENDENTE'}
                            </span>
                        </td>
                        <td>\${isPago ? formatDate(pagamento.data_pagamento) : '-'}</td>
                    </tr>
                \`;
            }
            
            return html;
        }
        
        // Função para calcular data de vencimento
        function calcularDataVencimento(dataInicial, mesesAdicionais, recorrente) {
            const data = new Date(dataInicial + 'T00:00:00');
            if (recorrente && mesesAdicionais > 0) {
                data.setMonth(data.getMonth() + mesesAdicionais);
            }
            return data.toISOString().substring(0, 10);
        }
        
        // Função para buscar pagamento
        function buscarPagamento(historico, dataVencimento) {
            if (!historico || !Array.isArray(historico)) return null;