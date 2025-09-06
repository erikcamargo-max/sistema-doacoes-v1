// ============================================================================
// DEBUG ULTRA ESPECÍFICO - DESCOBRIR POR QUE NÃO APARECE
// Data: 06/09/2025
// Objetivo: Investigar linha por linha o que está impedindo
// ============================================================================

const fs = require('fs');

console.log('🔍 DEBUG ULTRA ESPECÍFICO');
console.log('═'.repeat(60));
console.log('🎯 Investigando exatamente por que não renderiza');
console.log('');

// ============================================================================
// ANALISAR A FUNÇÃO GENERATECARNE ATUAL
// ============================================================================

function analisarFuncaoAtual() {
    const appPath = './public/app.js';
    
    try {
        const content = fs.readFileSync(appPath, 'utf-8');
        const lines = content.split('\n');
        
        console.log('🔍 ANALISANDO FUNÇÃO GENERATECARNE ATUAL...');
        
        // Encontrar a função generateCarne
        let funcaoInicio = -1;
        let funcaoFim = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('async function generateCarne(doacaoId)')) {
                funcaoInicio = i;
                break;
            }
        }
        
        if (funcaoInicio === -1) {
            console.log('❌ Função generateCarne não encontrada!');
            return null;
        }
        
        // Encontrar o fim da função
        let nivelChaves = 0;
        for (let i = funcaoInicio; i < lines.length; i++) {
            const linha = lines[i];
            
            // Contar chaves
            for (let char of linha) {
                if (char === '{') nivelChaves++;
                if (char === '}') nivelChaves--;
            }
            
            // Se voltou ao nível 0, encontrou o fim
            if (nivelChaves === 0 && i > funcaoInicio) {
                funcaoFim = i;
                break;
            }
        }
        
        console.log(`✅ Função encontrada: linhas ${funcaoInicio + 1} até ${funcaoFim + 1}`);
        
        // Extrair o conteúdo da função
        const funcaoLinhas = lines.slice(funcaoInicio, funcaoFim + 1);
        const funcaoConteudo = funcaoLinhas.join('\n');
        
        console.log('\n🔍 VERIFICANDO CONTEÚDO DA FUNÇÃO:');
        
        const verificacoes = [
            {
                nome: 'HTML com selo',
                busca: 'class="selo"',
                presente: funcaoConteudo.includes('class="selo"')
            },
            {
                nome: 'CSS do selo',
                busca: '.selo {',
                presente: funcaoConteudo.includes('.selo {')
            },
            {
                nome: 'HTML com QR Code',
                busca: 'qr-pix',
                presente: funcaoConteudo.includes('qr-pix')
            },
            {
                nome: 'CSS do QR Code',
                busca: '.qr-pix {',
                presente: funcaoConteudo.includes('.qr-pix {')
            },
            {
                nome: 'printWindow.document.write',
                busca: 'printWindow.document.write',
                presente: funcaoConteudo.includes('printWindow.document.write')
            },
            {
                nome: 'position: fixed',
                busca: 'position: fixed',
                presente: funcaoConteudo.includes('position: fixed')
            }
        ];
        
        verificacoes.forEach(v => {
            const status = v.presente ? '✅' : '❌';
            console.log(`${status} ${v.nome}: ${v.presente}`);
        });
        
        // Mostrar as primeiras 10 linhas da função
        console.log('\n📋 PRIMEIRAS 10 LINHAS DA FUNÇÃO:');
        funcaoLinhas.slice(0, 10).forEach((linha, index) => {
            console.log(`${(funcaoInicio + index + 1).toString().padStart(4, ' ')}: ${linha}`);
        });
        
        return {
            funcaoInicio,
            funcaoFim,
            funcaoConteudo,
            verificacoes
        };
        
    } catch (error) {
        console.error('❌ Erro ao analisar função:', error.message);
        return null;
    }
}

// ============================================================================
// IMPLEMENTAR VERSÃO DE TESTE BÁSICA
// ============================================================================

function implementarVersaoTeste() {
    const appPath = './public/app.js';
    
    try {
        let content = fs.readFileSync(appPath, 'utf-8');
        
        console.log('\n🔧 IMPLEMENTANDO VERSÃO DE TESTE BÁSICA...');
        
        // Encontrar e substituir a função generateCarne
        const regex = /async function generateCarne\(doacaoId\) \{[\s\S]*?\n\}/;
        
        // Versão ULTRA básica para teste
        const funcaoTeste = `async function generateCarne(doacaoId) {
    try {
        alert('🔍 Iniciando geração do carnê...');
        
        // Buscar dados básicos
        const doacaoResponse = await fetch(\`/api/doacoes/\${doacaoId}\`);
        const doacao = await doacaoResponse.json();
        const doadorResponse = await fetch(\`/api/doadores/\${doacao.doador_id}\`);
        const doador = await doadorResponse.json();
        
        alert('📄 Dados carregados. Criando janela...');
        
        // Criar janela
        const novaJanela = window.open('', '_blank', 'width=900,height=700');
        
        // HTML MÍNIMO com selo e QR FORÇADOS
        const htmlTeste = \`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TESTE - Carnê com Selo e QR</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f0f0f0;
        }
        
        /* SELO TESTE - SUPER VISÍVEL */
        #selo-teste {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            width: 150px !important;
            height: 150px !important;
            background: red !important;
            color: white !important;
            border: 5px solid black !important;
            border-radius: 50% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            font-size: 14px !important;
            font-weight: bold !important;
            z-index: 99999 !important;
            box-shadow: 0 0 20px rgba(255,0,0,0.8) !important;
        }
        
        /* QR CODE TESTE - SUPER VISÍVEL */
        .qr-teste {
            width: 200px !important;
            height: 200px !important;
            background: blue !important;
            color: white !important;
            border: 5px solid black !important;
            margin: 20px auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            font-size: 16px !important;
            font-weight: bold !important;
        }
        
        .cabecalho {
            text-align: center;
            padding: 20px;
            background: yellow;
            border: 3px solid black;
            margin-bottom: 20px;
        }
        
        .parcela-teste {
            border: 3px solid black;
            padding: 20px;
            margin: 20px 0;
            background: white;
        }
    </style>
</head>
<body>
    <!-- SELO TESTE -->
    <div id="selo-teste">
        🔒<br>
        SELO<br>
        TESTE<br>
        VISÍVEL
    </div>
    
    <!-- CABEÇALHO -->
    <div class="cabecalho">
        <h1>🔍 TESTE - CARNÊ COM SELO E QR</h1>
        <h2>\${doador.nome}</h2>
        <p>Código: \${doador.codigo_doador || 'D' + doador.id}</p>
    </div>
    
    <!-- PARCELA TESTE -->
    <div class="parcela-teste">
        <h3>📄 PARCELA DE TESTE</h3>
        <p><strong>Valor:</strong> R$ \${doacao.valor.toFixed(2).replace('.', ',')}</p>
        <p><strong>Tipo:</strong> \${doacao.tipo}</p>
        
        <!-- QR CODE TESTE -->
        <div class="qr-teste">
            📱<br>
            QR CODE<br>
            TESTE<br>
            VISÍVEL
        </div>
        
        <p style="color: red; font-weight: bold;">
            ⚠️ Se você está vendo este texto, o carnê está sendo gerado!<br>
            ✅ Se você vê o SELO VERMELHO no canto, o CSS está funcionando!<br>
            ✅ Se você vê o QR CODE AZUL, tudo está OK!
        </p>
    </div>
    
    <div style="text-align: center; margin: 30px;">
        <button onclick="window.print()" style="
            padding: 15px 30px; 
            background: green; 
            color: white; 
            border: none; 
            font-size: 16px; 
            cursor: pointer;
        ">🖨️ Imprimir Teste</button>
    </div>
    
    <script>
        // Debug no console
        console.log('🔍 Carnê de teste carregado!');
        console.log('Selo:', document.getElementById('selo-teste'));
        console.log('QR Codes:', document.querySelectorAll('.qr-teste'));
        
        // Garantir que o selo seja visível
        setTimeout(() => {
            const selo = document.getElementById('selo-teste');
            if (selo) {
                selo.style.background = 'red';
                selo.style.display = 'flex';
                console.log('✅ Selo forçado como visível');
            }
        }, 100);
    </script>
</body>
</html>\`;
        
        // Escrever na janela
        novaJanela.document.write(htmlTeste);
        novaJanela.document.close();
        
        alert('✅ Carnê de teste criado! Verifique se o SELO VERMELHO e QR CODE AZUL estão visíveis.');
        
    } catch (error) {
        alert('❌ Erro no teste: ' + error.message);
        console.error('Erro:', error);
    }
}`;

        // Substituir a função
        if (regex.test(content)) {
            content = content.replace(regex, funcaoTeste);
            console.log('✅ Função generateCarne substituída por versão de TESTE');
        } else {
            console.log('❌ Não foi possível localizar a função generateCarne com regex');
            return false;
        }
        
        // Fazer backup
        const backupPath = `./public/app_backup_teste_${Date.now()}.js`;
        fs.writeFileSync(backupPath, fs.readFileSync(appPath, 'utf-8'));
        console.log(`💾 Backup criado: ${backupPath}`);
        
        // Salvar
        fs.writeFileSync(appPath, content);
        
        console.log('\n🎯 VERSÃO DE TESTE IMPLEMENTADA:');
        console.log('✅ Selo VERMELHO super visível');
        console.log('✅ QR Code AZUL super visível'); 
        console.log('✅ Cores berrantes para debug');
        console.log('✅ Console.log para debug');
        console.log('✅ JavaScript inline para garantir execução');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na implementação de teste:', error.message);
        return false;
    }
}

// ============================================================================
// VERIFICAR POSSÍVEIS CONFLITOS
// ============================================================================

function verificarConflitos() {
    const appPath = './public/app.js';
    
    try {
        const content = fs.readFileSync(appPath, 'utf-8');
        
        console.log('\n🔍 VERIFICANDO POSSÍVEIS CONFLITOS...');
        
        const conflitosComuns = [
            {
                nome: 'Múltiplas funções generateCarne',
                regex: /async function generateCarne/g,
                descricao: 'Pode haver múltiplas definições'
            },
            {
                nome: 'Redefinição de generateCarne',
                regex: /generateCarne\s*=/g,
                descricao: 'Função sendo redefinida'
            },
            {
                nome: 'Window.generateCarne',
                regex: /window\.generateCarne/g,
                descricao: 'Anexada ao objeto window'
            },
            {
                nome: 'Erros de sintaxe óbvios',
                regex: /\$\{[^}]*$/g,
                descricao: 'Template literals malformados'
            }
        ];
        
        conflitosComuns.forEach(conflito => {
            const matches = content.match(conflito.regex);
            const count = matches ? matches.length : 0;
            
            if (count > 0) {
                console.log(`⚠️ ${conflito.nome}: ${count} ocorrências - ${conflito.descricao}`);
                
                if (count > 1 && conflito.nome.includes('generateCarne')) {
                    console.log(`   📍 PROBLEMA: Múltiplas definições podem causar conflito`);
                }
            } else {
                console.log(`✅ ${conflito.nome}: OK`);
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar conflitos:', error.message);
    }
}

// ============================================================================
// INSTRUÇÕES DE TESTE ESPECÍFICAS
// ============================================================================

function instrucoesTestEspecificas() {
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 INSTRUÇÕES PARA TESTE DA VERSÃO DEBUG');
    console.log('═'.repeat(60));
    
    console.log('\n📋 EXECUTE ESTES PASSOS:');
    console.log('1. ❌ FECHE todas as janelas do carnê abertas');
    console.log('2. 🔄 RECARREGUE a página principal (Ctrl+F5)');
    console.log('3. ✅ Clique em "Gerar Carnê" em qualquer doação');
    console.log('4. 📱 Você deve ver 3 alertas sequenciais');
    console.log('5. 🔍 Na nova janela, procure por:');
    console.log('');
    
    console.log('🎯 O QUE VOCÊ DEVE VER NA VERSÃO DE TESTE:');
    console.log('   🔴 SELO VERMELHO grande no canto superior direito');
    console.log('   🔵 QR CODE AZUL grande no centro da parcela');
    console.log('   🟡 Fundo amarelo no cabeçalho');
    console.log('   ⚠️ Texto vermelho explicativo');
    console.log('');
    
    console.log('📊 RESULTADOS POSSÍVEIS:');
    console.log('   ✅ Se TUDO aparece = CSS funciona, problema na implementação anterior');
    console.log('   ❌ Se NADA aparece = Problema na geração da janela');
    console.log('   ⚠️ Se PARCIAL = Problema específico no CSS');
    console.log('');
    
    console.log('🔍 ABRA O CONSOLE (F12) e procure por:');
    console.log('   📝 Mensagens que começam com "🔍 Carnê de teste carregado!"');
    console.log('   ❌ Erros em vermelho');
    console.log('   ⚠️ Avisos em amarelo');
    console.log('');
    
    console.log('💡 ME INFORME:');
    console.log('   1. Você vê os alertas?');
    console.log('   2. A janela abre?');
    console.log('   3. Você vê o SELO VERMELHO?');
    console.log('   4. Você vê o QR CODE AZUL?');
    console.log('   5. Há erros no console?');
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    console.log('🔧 Iniciando debug ultra específico...\n');
    
    // 1. Analisar função atual
    const analise = analisarFuncaoAtual();
    if (!analise) return;
    
    // 2. Verificar conflitos
    verificarConflitos();
    
    // 3. Implementar versão de teste
    const implementado = implementarVersaoTeste();
    if (!implementado) return;
    
    // 4. Dar instruções específicas
    instrucoesTestEspecificas();
    
    console.log('\n🎉 VERSÃO DE TESTE IMPLEMENTADA!');
    console.log('📌 Esta versão vai mostrar EXATAMENTE onde está o problema');
}

// Executar
main();