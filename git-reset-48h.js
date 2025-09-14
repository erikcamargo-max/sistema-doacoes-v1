const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n👉 Executando: ${cmd}`);
  const output = execSync(cmd, { stdio: "pipe" }).toString().trim();
  console.log(output);
  return output;
}

try {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║    RESET FORÇADO - VOLTAR 24 HORAS         ║");
  console.log("╚════════════════════════════════════════════╝\n");

  // 1. Achar commit válido antes de 24h (pega só o hash com --format)
  const commitId = run(`git log --before="48 hours ago" -1 --format=%H`);

  if (!commitId) {
    console.error("❌ Nenhum commit encontrado antes de 24 horas!");
    process.exit(1);
  }

  console.log(`✅ Último commit válido encontrado: ${commitId}`);

  // 2. Reset local
  run(`git reset --hard ${commitId}`);

  // 3. Forçar push no remoto
  run(`git push origin main --force`);

  console.log("\n🎉 Reset concluído com sucesso!");
  console.log("⚠️ Atenção: Todos os commits das últimas 24h foram apagados do GitHub.");
} catch (err) {
  console.error("❌ Erro durante execução:");
  console.error(err.message);
  process.exit(1);
}
