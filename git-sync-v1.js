const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configurações
const VERSAO_ATUAL = "v1.1.0";
const REPO_URL = "https://github.com/erikcamargo-max/sistema-doacoes-v1";

// Função para rodar comandos no shell
function run(cmd, ignoreError = false) {
  console.log(`\n👉 Executando: ${cmd}`);
  try {
    const output = execSync(cmd, { stdio: "pipe" }).toString();
    console.log(output);
    return output;
  } catch (err) {
    if (!ignoreError) {
      console.error(`❌ Erro ao executar: ${cmd}`);
      console.error(err.stdout?.toString() || err.message);
      process.exit(1);
    }
    return "";
  }
}

// Função para ler o resumo das alterações
function getChangesSummary() {
  try {
    const status = run("git status --porcelain", true);
    const lines = status.trim().split('\n').filter(l => l);
    
    let summary = {
      modified: [],
      added: [],
      deleted: []
    };
    
    lines.forEach(line => {
      const [type, ...fileParts] = line.trim().split(' ');
      const file = fileParts.join(' ');
      
      if (type === 'M' || type === 'MM') summary.modified.push(file);
      else if (type === 'A' || type === '??') summary.added.push(file);
      else if (type === 'D') summary.deleted.push(file);
    });
    
    return summary;
  } catch (err) {
    return null;
  }
}

// Função para criar mensagem de commit detalhada
function createCommitMessage() {
  const now = new Date();
  const dataFormatada = now.toLocaleDateString('pt-BR');
  const horaFormatada = now.toLocaleTimeString('pt-BR');
  
  const changes = getChangesSummary();
  let message = `[${VERSAO_ATUAL}] Atualização - ${dataFormatada} ${horaFormatada}\n\n`;
  
  if (changes) {
    if (changes.added.length > 0) {
      message += `✅ Arquivos adicionados:\n`;
      changes.added.forEach(f => message += `   - ${f}\n`);
    }
    
    if (changes.modified.length > 0) {
      message += `\n📝 Arquivos modificados:\n`;
      changes.modified.forEach(f => message += `   - ${f}\n`);
    }
    
    if (changes.deleted.length > 0) {
      message += `\n🗑️ Arquivos removidos:\n`;
      changes.deleted.forEach(f => message += `   - ${f}\n`);
    }
  }
  
  // Adicionar estatísticas do sistema se disponível
  if (fs.existsSync('./database/doacoes.db')) {
    const stats = fs.statSync('./database/doacoes.db');
    const dbSize = (stats.size / 1024).toFixed(2);
    message += `\n📊 Estatísticas:\n`;
    message += `   - Tamanho do banco: ${dbSize} KB\n`;
    message += `   - Versão do sistema: ${VERSAO_ATUAL}\n`;
  }
  
  return message;
}

// Função para criar backup antes do push
function createBackup() {
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  
  // Backup do banco se existir
  if (fs.existsSync('./database/doacoes.db')) {
    const backupPath = `${backupDir}/doacoes_${VERSAO_ATUAL}_${timestamp}.db`;
    fs.copyFileSync('./database/doacoes.db', backupPath);
    console.log(`💾 Backup do banco criado: ${backupPath}`);
  }
  
  // Backup do server.js
  if (fs.existsSync('./server.js')) {
    const backupPath = `${backupDir}/server_${VERSAO_ATUAL}_${timestamp}.js`;
    fs.copyFileSync('./server.js', backupPath);
    console.log(`💾 Backup do server.js criado: ${backupPath}`);
  }
}

// ========================================
// EXECUÇÃO PRINCIPAL
// ========================================

console.log('╔════════════════════════════════════════════════════╗');
console.log('║     SISTEMA DE DOAÇÕES - SINCRONIZAÇÃO GIT        ║');
console.log(`║     Versão: ${VERSAO_ATUAL}                                  ║`);
console.log('╚════════════════════════════════════════════════════╝\n');

// Passo 1: Verificar se é um repositório git
try {
  run("git status", true);
} catch (err) {
  console.log("⚠️  Não é um repositório Git. Inicializando...");
  run("git init");
  run(`git remote add origin ${REPO_URL}`, true);
}

// Passo 2: Criar backup local
console.log("\n📦 Criando backups locais...");
createBackup();

// Passo 3: Atualizar com remoto
console.log("\n🔄 Sincronizando com repositório remoto...");
run("git pull origin main --rebase", true);

// Passo 4: Adicionar mudanças
console.log("\n➕ Adicionando alterações...");
run("git add .");

// Passo 5: Verificar se há mudanças para commitar
const status = run("git status --porcelain");
if (status.trim().length === 0) {
  console.log("\n✅ Nenhuma alteração detectada. Sistema já está atualizado.");
  console.log(`📌 Versão atual: ${VERSAO_ATUAL}`);
} else {
  // Criar mensagem de commit detalhada
  const commitMessage = createCommitMessage();
  
  console.log("\n📝 Mensagem do commit:");
  console.log("─".repeat(50));
  console.log(commitMessage);
  console.log("─".repeat(50));
  
  // Fazer o commit
  const commitCmd = `git commit -m "${commitMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  run(commitCmd, true);

  // Captura o hash do último commit
  const commitHash = run("git rev-parse HEAD").trim();
  const shortHash = commitHash.substring(0, 7);

  // Fazer o push
  console.log("\n📤 Enviando para o GitHub...");
  run("git push origin main");

  // Montar o link para o commit no GitHub
  const commitUrl = `${REPO_URL}/commit/${commitHash}`;

  // Resumo final
  console.log("\n" + "═".repeat(60));
  console.log("🎉 SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!");
  console.log("═".repeat(60));
  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Versão: ${VERSAO_ATUAL}`);
  console.log(`   ✅ Commit: ${shortHash}`);
  console.log(`   ✅ Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`\n🔗 Visualizar no GitHub:`);
  console.log(`   ${commitUrl}`);
  console.log(`\n📁 Repositório:`);
  console.log(`   ${REPO_URL}`);
}

// Criar arquivo de log
const logFile = './git-sync.log';
const logEntry = `[${new Date().toISOString()}] Sincronização executada - Versão: ${VERSAO_ATUAL}\n`;
fs.appendFileSync(logFile, logEntry);

console.log("\n✨ Processo finalizado!\n");