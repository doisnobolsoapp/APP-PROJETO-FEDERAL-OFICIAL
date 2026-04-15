import './style.css';

// 🚀 Inicialização segura
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 MAIN INICIADO");

  try {
    const app = document.getElementById('app');

    // 🔥 Validação crítica
    if (!app) {
      console.error("❌ ERRO CRÍTICO: div #app não encontrada");
      document.body.innerHTML = `
        <h1 style="color:red;text-align:center;margin-top:50px;">
          Erro: #app não encontrada
        </h1>
      `;
      return;
    }

    console.log("✅ #app encontrada");

    // ❌ NUNCA limpar o HTML (isso quebrava tudo)
    // app.innerHTML = "";

    // 🔥 IMPORT DINÂMICO DO APP
    await import('./app.js');

    console.log("✅ app.js carregado com sucesso");

  } catch (error) {
    console.error("❌ ERRO ao carregar app.js:", error);

    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="text-align:center; margin-top:50px;">
          <h1>Erro ao iniciar aplicação</h1>
          <p>Verifique o console</p>
        </div>
      `;
    }
  }
});


// ✅ SERVICE WORKER (VERSÃO SEGURA)
if ('serviceWorker' in navigator && location.hostname !== "localhost") {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ SW registrado:', registration);

      // 🔥 força atualização automática
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

    } catch (error) {
      console.log('❌ Erro no SW:', error);
    }
  });
}
