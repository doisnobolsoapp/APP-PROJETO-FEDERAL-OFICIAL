import './style.css';

// 🚀 Inicialização segura
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 MAIN INICIADO");

  try {
    const app = document.getElementById('app');

    // ❌ ERRO CRÍTICO
    if (!app) {
      console.error("❌ ERRO CRÍTICO: div #app não encontrada");
      document.body.innerHTML = "<h1 style='color:red;text-align:center;margin-top:50px;'>Erro: #app não encontrada</h1>";
      return;
    }

    console.log("✅ #app encontrada");

    // 🔥 Limpa conteúdo inicial (loading)
    app.innerHTML = "";

    // 🔥 Importa app principal
    await import('./app.js');

    console.log("✅ app.js carregado com sucesso");

  } catch (error) {
    console.error("❌ ERRO ao carregar app.js:", error);

    document.getElementById('app').innerHTML = `
      <div style="text-align:center; margin-top:50px;">
        <h1>Erro ao iniciar aplicação</h1>
        <p>Verifique o console</p>
      </div>
    `;
  }
});


// ✅ SERVICE WORKER CONTROLADO (produção apenas)
if ('serviceWorker' in navigator && location.hostname !== "localhost") {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ SW registrado:', registration);
      })
      .catch(error => {
        console.log('❌ Erro no SW:', error);
      });
  });
}
