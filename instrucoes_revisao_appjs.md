# 📋 INSTRUÇÕES PARA REVISÃO COMPLETA DO APP.JS

## 🎯 CONTEXTO DO PROJETO
- **Sistema**: Sistema de Doações APAE Três Lagoas
- **Versão Atual**: 2.3.4
- **Data**: 22/09/2025
- **Arquivo Principal**: `public/app.js`
- **Tamanho Aproximado**: 53KB
- **Linhas**: ~3500 linhas

## ❌ PROBLEMA PRINCIPAL ATUAL
**Parcelas Recorrentes não funcionam corretamente:**
1. Campo `input-valor-parcelas` existe no HTML
2. Usuário preenche o valor (ex: R$ 25,00)
3. Sistema diz que valor não foi preenchido
4. Sugere valor padrão mesmo com campo preenchido
5. Campo não está sendo coletado corretamente pelo JavaScript

## 🔍 ÁREAS CRÍTICAS PARA REVISAR

### 1. **Função addDonation() - PRIORIDADE MÁXIMA**
```javascript
// Localização: Aproximadamente linha 3400
window.addDonation = async function() {
    // REVISAR:
    // 1. Coleta do campo input-valor-parcelas
    // 2. Envio como valor_parcelas_futuras
    // 3. Validação quando recorrente = true
}
```

**Correção Necessária:**
- Garantir que `document.getElementById('input-valor-parcelas')` seja coletado
- Enviar como `valor_parcelas_futuras` no formData
- Não forçar valor padrão se campo estiver preenchido

### 2. **Campos de Parcelas Recorrentes**
Verificar se todos os campos estão sendo coletados:
- `input-recurrent` (checkbox)
- `input-parcelas` (número de parcelas)
- `input-valor-parcelas` (valor das parcelas futuras) ⚠️ PROBLEMA AQUI
- `input-proxima-parcela` (data da próxima)

### 3. **Estrutura do FormData**
```javascript
const formData = {
    // ... outros campos ...
    recorrente: isRecurrent,
    parcelas: parseInt(document.getElementById('input-parcelas')?.value || 1),
    valor_parcelas_futuras: parseFloat(document.getElementById('input-valor-parcelas')?.value || 0), // CRÍTICO
    proxima_parcela: document.getElementById('input-proxima-parcela')?.value
};
```

### 4. **Função showSimpleHistory()**
- Verificar erros de data ("Invalid time value")
- Garantir tratamento de datas nulas/inválidas
- Adicionar try-catch apropriado

### 5. **Funções ViaCEP**
- Funcionando corretamente ✅
- Manter como está

## 📝 CHECKLIST DE CORREÇÕES

### URGENTE:
- [ ] Corrigir coleta do campo `input-valor-parcelas`
- [ ] Garantir envio de `valor_parcelas_futuras`
- [ ] Remover validação que força valor padrão
- [ ] Adicionar logs de debug para parcelas

### IMPORTANTE:
- [ ] Revisar função `showSimpleHistory()`
- [ ] Tratar erros de data
- [ ] Verificar modal de nova doação
- [ ] Garantir limpeza de formulário após salvar

### MELHORIAS:
- [ ] Adicionar mais logs de debug
- [ ] Melhorar mensagens de erro
- [ ] Validar campos antes de enviar
- [ ] Otimizar performance

## 🧪 TESTES NECESSÁRIOS

### Teste 1: Doação Recorrente
1. Criar nova doação
2. Marcar "Doação Recorrente"
3. Preencher:
   - Valor: R$ 100,00
   - Parcelas: 5
   - Valor parcelas futuras: R$ 25,00
4. Verificar no console:
   ```javascript
   valor_parcelas_futuras: 25 // DEVE aparecer
   ```
5. Servidor deve criar 4 parcelas de R$ 25

### Teste 2: Campo Vazio
1. Deixar campo valor parcelas vazio
2. Sistema deve sugerir valor dividido
3. Poder aceitar ou recusar sugestão

## 🛠️ ESTRUTURA ESPERADA DO ARQUIVO

```javascript
// app.js - Estrutura Principal
// =============================

// 1. Configurações e Variáveis Globais
let allDonations = [];

// 2. Funções de Inicialização
window.addEventListener('DOMContentLoaded', init);

// 3. Funções de Dashboard
function loadDashboard() { }

// 4. Funções de Doações
window.addDonation = async function() { } // CRÍTICA - CORRIGIR AQUI

// 5. Funções de Modal
function openModal() { }
function closeModal() { }

// 6. Funções de Histórico
window.showSimpleHistory = async function() { } // VERIFICAR ERROS

// 7. Funções ViaCEP
function buscarCEP() { } // OK

// 8. Funções de Carnê
function generateCarne() { } // OK

// 9. Funções Auxiliares
function formatCurrency() { }
function formatDate() { }
```

## 💻 COMANDOS ÚTEIS

```bash
# Fazer backup antes de modificar
copy public\app.js public\app.js.backup

# Testar sintaxe
node -c public/app.js

# Iniciar servidor
npm start

# Verificar logs
# Console do navegador: F12
# Console do servidor: Terminal onde rodou npm start
```

## 🔧 SOLUÇÃO PROPOSTA

```javascript
// Correção da função addDonation
window.addDonation = async function() {
    try {
        // Verificar se é recorrente
        const isRecurrent = document.getElementById('input-recurrent')?.checked || false;
        
        // Coletar TODOS os dados incluindo valor_parcelas_futuras
        let valorParcelasFuturas = 0;
        if (isRecurrent) {
            const campoValor = document.getElementById('input-valor-parcelas');
            if (campoValor && campoValor.value) {
                valorParcelasFuturas = parseFloat(campoValor.value);
                console.log('✅ Valor das parcelas futuras coletado:', valorParcelasFuturas);
            } else {
                console.log('⚠️ Campo valor parcelas vazio ou não encontrado');
            }
        }
        
        const formData = {
            // ... outros campos ...
            recorrente: isRecurrent,
            parcelas: isRecurrent ? parseInt(document.getElementById('input-parcelas')?.value || 1) : 1,
            valor_parcelas_futuras: valorParcelasFuturas, // USAR VARIÁVEL
            proxima_parcela: isRecurrent ? document.getElementById('input-proxima-parcela')?.value : null
        };
        
        console.log('📤 Enviando dados:', formData);
        
        // ... resto do código ...
    } catch (error) {
        console.error('❌ Erro:', error);
    }
};
```

## 📌 INFORMAÇÕES ADICIONAIS

- **GitHub**: Sistema está versionado
- **Banco de Dados**: SQLite com 4 tabelas
- **Backend**: Node.js + Express (server.js funcionando)
- **Frontend**: Vanilla JavaScript (problema está aqui)
- **Dependências**: Nenhuma no frontend (puro JS)

## ⚠️ AVISOS IMPORTANTES

1. **NÃO QUEBRAR**: Funções ViaCEP, generateCarne, exportData
2. **MANTER**: Estrutura de eventos e listeners
3. **PRESERVAR**: Compatibilidade com server.js
4. **TESTAR**: Cada mudança antes de prosseguir

## 🎯 OBJETIVO FINAL

Sistema de doações 100% funcional com:
- ✅ Doações únicas funcionando
- ❌ Doações recorrentes com parcelas (CORRIGIR)
- ✅ Carnê com QR Code PIX
- ✅ Histórico de pagamentos
- ✅ Dashboard com totais

---

**PRÓXIMO PASSO**: No novo chat, peça para revisar o arquivo app.js focando na correção da coleta do campo `input-valor-parcelas` e garantir que `valor_parcelas_futuras` seja enviado corretamente ao servidor.