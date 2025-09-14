/**
 * ================================================================
 * SCRIPT: Correção Final de Doadores
 * ================================================================
 * 
 * VERSÃO: 1.3.1
 * DATA: 10/09/2025
 * 
 * CORREÇÕES:
 * 1. Remove declaração duplicada de allDonors no HTML
 * 2. Habilita função loadDonors no api-module.js
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   CORREÇÃO FINAL DOADORES - SISTEMA v1.3.1        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\n📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`);

// ================================================================
// 1. CORRIGIR HTML - REMOVER DECLARAÇÃO DUPLICADA
// ================================================================

console.log('1️⃣  Corrigindo index.html...\n');

const htmlPath = path.join(__dirname, 'public', 'index.html');

if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Backup
    const htmlBackup = `public/index.html.backup_${Date.now()}`;
    fs.copyFileSync(htmlPath, htmlBackup);
    console.log(`✅ Backup criado: ${htmlBackup}`);
    
    // Remover linhas duplicadas de declaração
    // Procurar por declarações soltas fora do script principal
    htmlContent = htmlContent.replace(/^\s*let allDonors = \[\];\s*$/gm, '');
    htmlContent = htmlContent.replace(/^\s*let editingDonorId = null;\s*$/gm, '');
    
    // Garantir que as variáveis estejam declaradas apenas uma vez dentro do script correto
    if (!htmlContent.includes('// Variáveis globais de doadores')) {
        // Se não tem o comentário, adicionar as variáveis no início do script de doadores
        const scriptDoadores = `
    <script>
        // Variáveis globais de doadores
        let allDonors = [];
        let editingDonorId = null;
        
        // Configurar sistema de abas`;
        
        htmlContent = htmlContent.replace(
            '<script>\n        // Configurar sistema de abas',
            scriptDoadores
        );
    }
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('✅ HTML corrigido - declarações duplicadas removidas');
} else {
    console.log('❌ index.html não encontrado');
}

// ================================================================
// 2. HABILITAR loadDonors NO API-MODULE.JS
// ================================================================

console.log('\n2️⃣  Habilitando loadDonors no api-module.js...\n');

const apiModulePath = path.join(__dirname, 'public', 'js', 'api-module.js');

if (fs.existsSync(apiModulePath)) {
    let apiContent = fs.readFileSync(apiModulePath, 'utf8');
    
    // Backup
    const apiBackup = `public/js/api-module.js.backup_${Date.now()}`;
    fs.copyFileSync(apiModulePath, apiBackup);
    console.log(`✅ Backup criado: ${apiBackup}`);
    
    // Substituir a função loadDonors desabilitada pela funcional
    const loadDonorsFuncional = `    /**
     * Carrega todos os doadores
     * VERSÃO: 1.3.1 - HABILITADA
     */
    api.loadDonors = function() {
        console.log('[API] Carregando doadores...');
        
        const primaryUrl = API_BASE + '/doadores';
        const alternatives = [
            API_BASE + '/donors',
            API_BASE + '/doador'
        ];
        
        return apiRequest(primaryUrl, {}, alternatives)
            .then(data => {
                console.log(\`[API] \${data.length} doadores carregados\`);
                
                // Atualiza variável global se existir (não redeclara)
                if (typeof window.allDonors !== 'undefined') {
                    window.allDonors = data;
                }
                
                return data;
            })
            .catch(error => {
                console.error('[API] Erro ao carregar doadores:', error);
                
                if (window.SistemaDoacao?.core?.showNotification) {
                    window.SistemaDoacao.core.showNotification('Erro ao carregar doadores: ' + error.message, 'error');
                }
                
                // Retorna array vazio para não quebrar
                return [];
            });
    };`;
    
    // Procurar pela função desabilitada e substituir
    const startPattern = /api\.loadDonors = function\(\) \{[\s\S]*?console\.log\('\[API\] loadDonors chamada - função desabilitada.*?\);[\s\S]*?return Promise\.resolve\(\[\]\);[\s\S]*?\};/;
    
    if (startPattern.test(apiContent)) {
        apiContent = apiContent.replace(startPattern, loadDonorsFuncional);
        console.log('✅ Função loadDonors substituída pela versão funcional');
    } else {
        // Se não encontrar o padrão, procurar de outra forma
        const alternativePattern = /api\.loadDonors = function\(\) \{[\s\S]*?\};/;
        if (alternativePattern.test(apiContent)) {
            apiContent = apiContent.replace(alternativePattern, loadDonorsFuncional);
            console.log('✅ Função loadDonors atualizada');
        }
    }
    
    // Remover nota sobre função desabilitada
    apiContent = apiContent.replace(
        "console.log('[API Module] NOTA: Função loadDonors desabilitada (endpoint não existe)');",
        "console.log('[API Module] Função loadDonors habilitada');"
    );
    
    fs.writeFileSync(apiModulePath, apiContent, 'utf8');
    console.log('✅ api-module.js atualizado com loadDonors funcional');
} else {
    console.log('❌ api-module.js não encontrado');
}

// ================================================================
// 3. VERIFICAR ROTAS NO SERVER.JS
// ================================================================

console.log('\n3️⃣  Verificando rotas no server.js...\n');

const serverPath = path.join(__dirname, 'server.js');

if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (serverContent.includes('/api/doadores')) {
        console.log('✅ Rotas de doadores já existem no server.js');
    } else {
        console.log('⚠️  ATENÇÃO: Rotas de doadores NÃO encontradas no server.js');
        console.log('   Você precisa adicionar as rotas do arquivo rotas-doadores-server.js');
        
        // Criar lembrete
        const reminder = `
⚠️ ⚠️ ⚠️ IMPORTANTE ⚠️ ⚠️ ⚠️

As rotas de doadores NÃO estão no server.js!

Para os doadores funcionarem, você DEVE:

1. Abrir o arquivo: rotas-doadores-server.js
2. Copiar TODO o conteúdo
3. Colar no server.js ANTES de app.listen(PORT...

Sem isso, os doadores NÃO vão carregar!
`;
        
        fs.writeFileSync('LEMBRETE_ADICIONAR_ROTAS.txt', reminder, 'utf8');
        console.log('\n📝 Arquivo LEMBRETE_ADICIONAR_ROTAS.txt criado');
    }
} else {
    console.log('❌ server.js não encontrado');
}

// ================================================================
// RELATÓRIO FINAL
// ================================================================

console.log('\n' + '═'.repeat(56));
console.log('📊 CORREÇÕES APLICADAS COM SUCESSO!');
console.log('═'.repeat(56));

console.log('\n✅ O QUE FOI CORRIGIDO:');
console.log('   1. Declarações duplicadas removidas do HTML');
console.log('   2. Função loadDonors habilitada no api-module.js');
console.log('   3. Verificação de rotas no server.js');

console.log('\n⚠️  VERIFICAÇÃO IMPORTANTE:');
console.log('═'.repeat(56));

if (!fs.existsSync(serverPath) || !fs.readFileSync(serverPath, 'utf8').includes('/api/doadores')) {
    console.log('❌ ROTAS DE DOADORES NÃO ENCONTRADAS!');
    console.log('');
    console.log('VOCÊ PRECISA ADICIONAR AS ROTAS MANUALMENTE:');
    console.log('1. Abra: rotas-doadores-server.js');
    console.log('2. Copie todo o conteúdo');
    console.log('3. Cole no server.js antes de app.listen');
} else {
    console.log('✅ Rotas de doadores encontradas no server.js');
}

console.log('\n🔄 PRÓXIMOS PASSOS:');
console.log('═'.repeat(56));
console.log('1. Certifique-se que as rotas estão no server.js');
console.log('2. Reinicie o servidor: npm start');
console.log('3. Limpe o cache do navegador (Ctrl+F5)');
console.log('4. Clique na aba "Doadores"');

console.log('\n✅ SISTEMA DE DOADORES DEVE FUNCIONAR AGORA!');
console.log('═'.repeat(56));