const fs = require('fs');

const novaSecao = `

## 🔄 SESSÃO 03/10/2025 - v2.5.3

### ✅ CONQUISTAS
**Carnê PDF Corrigido:**
- ✅ Valores diferenciados funcionando 100%
- ✅ Primeira parcela = R$ 100,00 (valor da doação)
- ✅ Parcelas futuras = R$ 25,00 (valor específico)
- ✅ Lógica frontend já estava correta (linha 2007-2017)

**Backend Corrigido:**
- ✅ Adicionada coluna \`valor_parcelas_futuras\` no banco
- ✅ INSERT atualizado para salvar o valor (linha ~200)
- ✅ SELECT retornando campo corretamente

**Limpeza:**
- ✅ Removida função \`generateCarne\` duplicada (linha 3154)
- ✅ Banco limpo para testes com dados corretos

### 🎯 RESUMO DA CORREÇÃO

**Problema:** Carnê mostrava R$ 100,00 em todas as parcelas  
**Causa:** Backend não salvava/retornava \`valor_parcelas_futuras\`  
**Solução:** Adicionar coluna + atualizar INSERT + criar nova doação

---

## 📌 VERSÃO ESTÁVEL - v2.5.3 (03/10/2025)

**Sistema totalmente funcional:**
- ✅ Modal histórico: valores corretos
- ✅ Carnê PDF: valores diferenciados
- ✅ Backend: campo valor_parcelas_futuras integrado
- ✅ Testes: aprovados com dados reais

**Status:** Pronto para produção
`;

const conteudoAtual = fs.readFileSync('CONTROLE_VERSAO.md', 'utf8');
fs.writeFileSync('CONTROLE_VERSAO.md', conteudoAtual + novaSecao);
console.log('✅ CONTROLE_VERSAO.md atualizado!');