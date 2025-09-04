const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ========================================
// Função auxiliar para executar comandos
// ========================================
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

// ========================================
// Controle de versão automática
// ========================================
function getVersion() {
  const versionFile = "./VERSAO.txt";
  if (fs.existsSync(versionFile)) {
    return fs.readFileSync(versionFile, "utf-8").trim();
  }

  const packageFile = "./package.json";
  if (fs.existsSync(packageFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageFile, "utf-8"));
      if (pkg.version) return pkg.version;
    } catch {}
  }

  return "v1.0.0";
}

const VERSAO_ATUAL = getVersion();
const REPO_URL = "https://github.com/erikcamargo-max/sistema-doacoes-v1";

// ========================================
// Função para ler entrada do usuário
// ========================================
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase());
    })
  );
}

// ========================================
// Resumo das alterações
// ========================================
function getChangesSummary() {
  try {
    const status = run("git status --porcelain", true);
    const lines = status.trim().split("\n").filter((l) => l);

    let summary = { modified: [], added: [], deleted: [] };

    lines.forEach((line) => {
      const [type, ...fileParts] = line.trim().split(" ");
      const file = fileParts.join(" ");

      if (type === "M" || type === "MM") summary.modified.push(file);
      else if (type === "A" || type === "??") summary.added.push(file);
      else if (type === "D") summary.deleted.push(file);
    });

    return summary;
  } catch (err) {
    return null;
  }
}

// ========================================
// Mensagem de commit detalhada
// ========================================
function createCommitMessage() {
  const now = new Date();
  const dataFormatada = now.toLocaleDateString("pt-BR");
  const horaFormatada = now.toLocaleTimeString("pt-BR");

  const changes = getChangesSummary();
  let message = `[${VERSAO_ATUAL}] Atualização - ${dataFormatada} ${horaFormatada}\n\n`;

  if (changes) {
    if (changes.added.length > 0) {
      message += `✅ Arquivos adicionados:\n`;
      changes.added.forEach((f) => (message += `   - ${f}\n`));
    }

    if (changes.modified.length > 0) {
      message += `\n📝 Arquivos modificados:\n`;
      changes.modified.forEach((f) => (message += `   - ${f}\n`));
    }

    if (changes.deleted.length > 0) {
      message += `\n🗑️ Arquivos removidos:\n`;
      changes.deleted.forEach((f) => (message += `   - ${f}\n`));
    }
  }

  if (fs.existsSync("./database/doacoes.db")) {
    const stats = fs.statSync("./database/doacoes.db");
    const dbSize = (stats.size / 1024).toFixed(2);
    message += `\n📊 Estatísticas:\n`;
    message += `   - Tamanho do banco: ${dbSize} KB\n`;
    message += `   - Versão do sistema: ${VERSAO_ATUAL}\n`;
  }

  return message;
}

// ========================================
// Backup automático (database, server.js, public)
// ========================================
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const backupDir = path.join("./backups", timestamp);

  fs.mkdirSync(backupDir, { recursive: true });

  const itemsToBackup = [
    { src: "./database/doacoes.db", dest: `doacoes_${VERSAO_ATUAL}.db` },
    { src: "./server.js", dest: `server_${VERSAO_ATUAL}.js` },
  ];

  itemsToBackup.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
      const backupPath = path.join(backupDir, dest);
      fs.copyFileSync(src, backupPath);
      console.log(`💾 Backup criado: ${backupPath}`);
    }
  });

  const publicPath = "./public";
  if (fs.existsSync(publicPath)) {
    const destPublic = path.join(backupDir, "public");
    fs.cpSync(publicPath, destPublic, { recursive: true });
    console.log(`💾 Backup da pasta public/ criado: ${destPublic}`);
  }
}

// ========================================
// Garantir .gitignore
// ========================================
function ensureGitignore() {
  const gitignorePath = ".gitignore";
  const defaults = ["node_modules/", "backups/", "*.log", "*.tmp", ".env", ".DS_Store"];

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, defaults.join("\n") + "\n");
    console.log("🛡️  .gitignore criado.");
  } else {
    let content = fs.readFileSync(gitignorePath, "utf-8");
    let updated = false;
    defaults.forEach((line) => {
      if (!content.includes(line)) {
        content += `\n${line}`;
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(gitignorePath, content);
      console.log("🛡️  .gitignore atualizado.");
    }
  }
}

// ========================================
// Execução principal
// ========================================
(async () => {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║     SISTEMA DE DOAÇÕES - SINCRONIZAÇÃO GIT        ║");
  console.log(`║     Versão: ${VERSAO_ATUAL}                                  ║`);
  console.log("╚════════════════════════════════════════════════════╝\n");

  try {
    run("git status", true);
  } catch (err) {
    console.log("⚠️  Não é um repositório Git. Inicializando...");
    run("git init");
    run(`git remote add origin ${REPO_URL}`, true);
  }

  console.log("\n📦 Criando backups locais...");
  createBackup();

  ensureGitignore();

  console.log("\n🔄 Sincronizando com repositório remoto...");
  run("git pull origin main --rebase", true);

  console.log("\n➕ Adicionando alterações...");
  run("git add .");

  const status = run("git status --porcelain");
  if (status.trim().length === 0) {
    console.log("\n✅ Nenhuma alteração detectada. Sistema já está atualizado.");
    console.log(`📌 Versão atual: ${VERSAO_ATUAL}`);
  } else {
    const commitMessage = createCommitMessage();
    const tmpFile = path.join(__dirname, "commit-msg.txt");
    fs.writeFileSync(tmpFile, commitMessage);

    console.log("\n📝 Mensagem do commit:");
    console.log("─".repeat(50));
    console.log(commitMessage);
    console.log("─".repeat(50));

    run(`git commit -F "${tmpFile}"`, true);

    const commitHash = run("git rev-parse HEAD").trim();
    const commitUrl = `${REPO_URL}/commit/${commitHash}`;

    const answer = await askQuestion("\n❓ Deseja enviar para o GitHub agora? (y/n): ");
    if (answer === "y" || answer === "sim") {
      run("git push origin main");
      console.log("\n🎉 SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!");
      console.log(`🔗 Commit: ${commitUrl}`);
    } else {
      console.log("\n🚫 Push cancelado pelo usuário. Alterações ficaram apenas locais.");
    }
  }

  const logFile = "./git-sync.log";
  const logEntry = `[${new Date().toISOString()}] Sincronização executada - Versão: ${VERSAO_ATUAL}\n`;
  fs.appendFileSync(logFile, logEntry);

  console.log("\n✨ Processo finalizado!\n");
})();
