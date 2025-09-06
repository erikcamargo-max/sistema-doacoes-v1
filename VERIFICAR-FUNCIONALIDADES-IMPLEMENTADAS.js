// ============================================================================
// SCRIPT PARA VERIFICAR FUNCIONALIDADES IMPLEMENTADAS
// Data: 06/09/2025
// Objetivo: Verificar se QR Code PIX e Selo de Autenticidade estão no código
// ============================================================================

const fs = require('fs');

console.log('🔍 VERIFICANDO FUNCIONALIDADES IMPLEMENTADAS');
console.log('═'.repeat(60));
console.log('🎯 Buscando: QR Code PIX e Selo de Autenticidade');
console.log('');

// ============================================================================
// VERIFICAR SE ARQUIVO APP.JS EXISTE
// ============================================================================

function verificarArquivo() {
    const appPath = './public/app.js';
    
    if (!fs.existsSync(appPath)) {
        console.error('❌ Arquivo ./public/app.js não encontrado!');
        console.log('💡 Certifique-se de estar na pasta raiz do projeto');
        return null;
    }
    
    console.log('✅ Arquivo app.js encontrado');
    return appPath;
}

// ============================================================================
// BUSCAR FUNCIONALIDADES ESPECÍFICAS
// ============================================================================

function buscarFuncionalidades() {
    const appPath = verificarArquivo();
    if (!appPath) return;
    
    try {
        const content = fs.readFileSync(appPath, 'utf-8');
        const lines = content.split('\n');
        
        console.log('📊 Estatísticas do arquivo:');
        console.log(`   📏 Linhas: ${lines.length}`);
        console.log(`   📦 Tamanho: ${(content.length / 1024).toFixed(2)} KB`);
        console.log('');
        
        // ============================================================================
        // BUSCAR: FUNÇÃO GENERATECARNE
        // ============================================================================
        
        console.log('🔍 Verificando função generateCarne():');
        
        const hasGenerateCarne = content.includes('generateCarne');
        const hasAsyncGenerateCarne = content.includes('async function generateCarne');
        
        if (hasAsyncGenerateCarne) {
            console.log('✅ Função generateCarne() ENCONTRADA (versão async)');
            
            // Buscar linha específica
            const generateCarneLineIndex = lines.findIndex(line => 
                line.includes('async function generateCarne')
            );
            
            if (generateCarneLineIndex !== -1) {
                console.log(`   📍 Localizada na linha: ${generateCarneLineIndex + 1}`);
                console.log(`   📝 Código: ${lines[generateCarneLineIndex].trim()}`);
            }
        } else if (hasGenerateCarne) {
            console.log('⚠️ Função generateCarne() encontrada mas pode estar incompleta');
        } else {
            console.log('❌ Função generateCarne() NÃO ENCONTRADA');
        }
        
        // ============================================================================
        // BUSCAR: QR CODE PIX
        // ============================================================================
        
        console.log('\n🔍 Verificando QR Code PIX:');
        
        const qrCodeSearches = [
            'QR CODE',
            'qr-code',
            'qrcode',
            'QR_CODE',
            'qr.code',
            'PIX'
        ];
        
        let qrCodeFound = false;
        let qrCodeDetails = [];
        
        qrCodeSearches.forEach(search => {
            if (content.toLowerCase().includes(search.toLowerCase())) {
                qrCodeFound = true;
                
                // Encontrar linhas que contêm a busca
                lines.forEach((line, index) => {
                    if (line.toLowerCase().includes(search.toLowerCase())) {
                        qrCodeDetails.push({
                            linha: index + 1,
                            codigo: line.trim(),
                            busca: search
                        });
                    }
                });
            }
        });
        
        if (qrCodeFound) {
            console.log('✅ Referências a QR Code/PIX ENCONTRADAS:');
            qrCodeDetails.slice(0, 5).forEach(detail => {
                console.log(`   📍 Linha ${detail.linha}: ${detail.codigo.substring(0, 80)}...`);
            });
            
            if (qrCodeDetails.length > 5) {
                console.log(`   📊 + ${qrCodeDetails.length - 5} outras referências encontradas`);
            }
        } else {
            console.log('❌ Referências a QR Code/PIX NÃO ENCONTRADAS');
        }
        
        // ============================================================================
        // BUSCAR: SELO DE AUTENTICIDADE
        // ============================================================================
        
        console.log('\n🔍 Verificando Selo de Autenticidade:');
        
        const seloSearches = [
            'selo',
            'autenticidade',
            'DOCUMENTO AUTÊNTICO',
            'documento autentico',
            'seal',
            'autenticacao',
            'certificado'
        ];
        
        let seloFound = false;
        let seloDetails = [];
        
        seloSearches.forEach(search => {
            if (content.toLowerCase().includes(search.toLowerCase())) {
                seloFound = true;
                
                lines.forEach((line, index) => {
                    if (line.toLowerCase().includes(search.toLowerCase())) {
                        seloDetails.push({
                            linha: index + 1,
                            codigo: line.trim(),
                            busca: search
                        });
                    }
                });
            }
        });
        
        if (seloFound) {
            console.log('✅ Referências a Selo de Autenticidade ENCONTRADAS:');
            seloDetails.slice(0, 3).forEach(detail => {
                console.log(`   📍 Linha ${detail.linha}: ${detail.codigo.substring(0, 80)}...`);
            });
            
            if (seloDetails.length > 3) {
                console.log(`   📊 + ${seloDetails.length - 3} outras referências encontradas`);
            }
        } else {
            console.log('❌ Referências a Selo de Autenticidade NÃO ENCONTRADAS');
        }
        
        // ============================================================================
        // BUSCAR: SISTEMA DE NOTIFICAÇÕES
        // ============================================================================
        
        console.log('\n🔍 Verificando Sistema de Notificações:');
        
        const hasShowNotification = content.includes('showNotification');
        const hasNotificationFunction = content.includes('function showNotification');
        
        if (hasNotificationFunction) {
            console.log('✅ Função showNotification() ENCONTRADA');
        } else if (hasShowNotification) {
            console.log('⚠️ Referências a showNotification encontradas mas função pode estar incompleta');
        } else {
            console.log('❌ Sistema de notificações NÃO ENCONTRADO');
        }
        
        // ============================================================================
        // RESUMO FINAL
        // ============================================================================
        
        console.log('\n' + '═'.repeat(60));
        console.log('📋 RESUMO DA VERIFICAÇÃO:');
        console.log('═'.repeat(60));
        
        const funcionalidades = [
            {
                nome: 'Função generateCarne()',
                status: hasAsyncGenerateCarne ? '✅ IMPLEMENTADA' : '❌ AUSENTE'
            },
            {
                nome: 'QR Code PIX',
                status: qrCodeFound ? '✅ REFERÊNCIAS ENCONTRADAS' : '❌ NÃO ENCONTRADO'
            },
            {
                nome: 'Selo de Autenticidade',
                status: seloFound ? '✅ REFERÊNCIAS ENCONTRADAS' : '❌ NÃO ENCONTRADO'
            },
            {
                nome: 'Sistema de Notificações',
                status: hasNotificationFunction ? '✅ IMPLEMENTADO' : '❌ AUSENTE'
            }
        ];
        
        funcionalidades.forEach(func => {
            console.log(`${func.status} ${func.nome}`);
        });
        
        // ============================================================================
        // RECOMENDAÇÕES
        // ============================================================================
        
        console.log('\n💡 RECOMENDAÇÕES:');
        
        if (!hasAsyncGenerateCarne) {
            console.log('   🔧 Execute: EXECUTAR-IMPLEMENTACAO-COMPLETA.js');
        }
        
        if (!qrCodeFound || !seloFound) {
            console.log('   📱 Execute o script de implementação para adicionar QR Code e Selo');
        }
        
        if (hasAsyncGenerateCarne && qrCodeFound && seloFound) {
            console.log('   🎉 Tudo implementado! Execute "npm start" e teste o sistema');
            console.log('   📌 Para ver QR Code e Selo: Clique em "Gerar Carnê" em qualquer doação');
        }
        
        // ============================================================================
        // INSTRUÇÕES DE TESTE
        // ============================================================================
        
        console.log('\n🚀 COMO TESTAR AS FUNCIONALIDADES:');
        console.log('1. Execute: npm start');
        console.log('2. Acesse: http://localhost:3001');
        console.log('3. Vá para uma doação na tabela');
        console.log('4. Clique no ícone 📄 "Gerar Carnê"');
        console.log('5. Procure por:');
        console.log('   🔒 Selo de autenticidade no canto superior direito');
        console.log('   📱 QR Code PIX na seção de pagamentos');
        console.log('   🎨 Design profissional e responsivo');
        
    } catch (error) {
        console.error('❌ Erro ao ler arquivo:', error.message);
        console.log('💡 Verifique as permissões do arquivo app.js');
    }
}

// ============================================================================
// VERIFICAR ÚLTIMA MODIFICAÇÃO
// ============================================================================

function verificarUltimaModificacao() {
    const appPath = './public/app.js';
    
    try {
        const stats = fs.statSync(appPath);
        const lastMod = stats.mtime.toLocaleString('pt-BR');
        const agora = new Date();
        const diferenca = Math.floor((agora - stats.mtime) / (1000 * 60)); // diferença em minutos
        
        console.log('\n📅 INFORMAÇÕES DO ARQUIVO:');
        console.log(`   ⏰ Última modificação: ${lastMod}`);
        console.log(`   🕐 Há ${diferenca} minutos atrás`);
        
        if (diferenca > 60) {
            console.log('   ⚠️ Arquivo parece ser antigo, pode precisar de atualização');
        } else {
            console.log('   ✅ Arquivo foi modificado recentemente');
        }
        
    } catch (error) {
        console.log('   ❌ Não foi possível verificar data de modificação');
    }
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

function main() {
    buscarFuncionalidades();
    verificarUltimaModificacao();
    
    console.log('\n✨ Verificação completa finalizada!');
    console.log('📌 Execute os scripts de implementação se necessário');
}

// Executar verificação
main();