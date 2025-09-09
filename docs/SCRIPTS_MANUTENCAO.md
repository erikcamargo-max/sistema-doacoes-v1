# 📚 DOCUMENTAÇÃO DOS SCRIPTS DE MANUTENÇÃO

## Sistema de Doações v1.1.5
**Data de Organização:** 09/09/2025

---

## 📁 ESTRUTURA DE SCRIPTS

```
scripts/
├── init-database.js          # Inicialização do banco
├── upgrade-database.js        # Upgrade de estrutura
└── maintenance/
    ├── fase1-estabilizacao/   # Scripts da Fase 1
    │   ├── backup-sistema-completo.js
    │   ├── diagnostico-erros-sintaxe.js
    │   ├── corrigir-erros-sintaxe.js
    │   ├── unificar-banco-dados-v2.js
    │   └── consolidar-scripts-correcao.js
    └── utils/                 # Scripts utilitários
        ├── repair.js
        ├── fix-codigo-doador.js
        └── [outros scripts anteriores]
```

---

## 🔧 FASE 1 - ESTABILIZAÇÃO

### 1. backup-sistema-completo.js
**Função:** Cria backup completo do sistema
**Uso:** `node scripts/maintenance/fase1-estabilizacao/backup-sistema-completo.js`

### 2. diagnostico-erros-sintaxe.js
**Função:** Analisa app.js e identifica problemas
**Uso:** `node scripts/maintenance/fase1-estabilizacao/diagnostico-erros-sintaxe.js`

### 3. corrigir-erros-sintaxe.js
**Função:** Corrige erros identificados no diagnóstico
**Uso:** `node scripts/maintenance/fase1-estabilizacao/corrigir-erros-sintaxe.js`

### 4. unificar-banco-dados-v2.js
**Função:** Remove bancos duplicados e unifica referências
**Uso:** `node scripts/maintenance/fase1-estabilizacao/unificar-banco-dados-v2.js`

### 5. consolidar-scripts-correcao.js
**Função:** Organiza todos os scripts de correção
**Uso:** `node scripts/maintenance/fase1-estabilizacao/consolidar-scripts-correcao.js`

---

## 📋 ORDEM DE EXECUÇÃO RECOMENDADA

### Para Manutenção Completa:
1. `backup-sistema-completo.js` - Sempre fazer backup primeiro
2. `diagnostico-erros-sintaxe.js` - Identificar problemas
3. `corrigir-erros-sintaxe.js` - Aplicar correções
4. `unificar-banco-dados-v2.js` - Limpar bancos duplicados
5. Testar sistema: `npm start`

### Para Problemas Específicos:
- **Erro no banco:** `repair.js` ou `fix-codigo-doador.js`
- **Dashboard travado:** `fix-dashboard-error-corrected.js`
- **Funções faltando:** `restore-edit-carne-functions.js`

---

## ⚠️ AVISOS IMPORTANTES

1. **SEMPRE** faça backup antes de executar scripts de correção
2. **TESTE** o sistema após cada correção
3. **DOCUMENTE** qualquer novo script criado
4. **PRESERVE** scripts antigos em utils/ para referência

---

## 📊 ESTATÍSTICAS

- Total de scripts organizados: 6
- Scripts de correção da Fase 1: 6
- Scripts utilitários preservados: 0
- Arquivos temporários limpos: 0

---

**Última Atualização:** 2025-09-09T12:26:12.957Z
