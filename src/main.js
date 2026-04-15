import './style.css';

// 🚀 Inicialização segura
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 MAIN INICIADO");

  try {
    const app = document.getElementById('app');

    if (!app) {
      console.error("❌ ERRO: #app não encontrada");
      return;
    }

    console.log("✅ #app encontrada");

    // ❌ REMOVIDO: NÃO APAGA O HTML
    // app.innerHTML = "";

    // 🔥 Apenas importa o app
    await import('./app.js');

    console.log("✅ app.js carregado com sucesso");

  } catch (error) {
    console.error("❌ ERRO ao carregar app.js:", error);
  }
});


// ✅ SERVICE WORKER
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
