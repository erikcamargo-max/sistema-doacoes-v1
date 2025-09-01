const { execSync } = require("child_process");

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

// Gera data/hora para mensagem do commit
const now = new Date().toISOString().replace("T", " ").substring(0, 19);

// URL fixa do repositório v1
const repoUrl = "https://github.com/erikcamargo-max/sistema-doacoes-v1";

// Passo 1: atualizar com remoto
run("git pull origin main --rebase");

// Passo 2: adicionar mudanças
run("git add .");

// Passo 3: verificar se há mudanças para commitar
const status = run("git status --porcelain");
if (status.trim().length === 0) {
  console.log("\n✅ Nenhuma alteração detectada. Nada a commitar.");
} else {
  run(`git commit -m "Backup automático ${now}"`, true);

  // Captura o hash do último commit
  const commitHash = run("git rev-parse HEAD").trim();

  // Faz o push
  run("git push origin main");

  // Monta o link para o commit no GitHub
  const commitUrl = `${repoUrl}/commit/${commitHash}`;

  console.log("\n✅ Alterações commitadas e enviadas com sucesso!");
  console.log(`🔗 Link do commit: ${commitUrl}`);
}
