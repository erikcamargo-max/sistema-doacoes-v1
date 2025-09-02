// Passo 0: adicionar todas as alterações antes do pull
run("git add .");

// Passo 1: fazer pull com rebase
run("git pull origin main --rebase");

// Passo 2: verificar se há mudanças para commit (normalmente já adicionadas)
const status = run("git status --porcelain");
if (status.trim().length === 0) {
  console.log("\n✅ Nenhuma alteração detectada. Nada a commitar.");
} else {
  run(`git commit -m "Backup automático ${now}"`);
  run("git push origin main");
}
