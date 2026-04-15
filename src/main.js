import './style.css';

window.addEventListener("load", async () => {
  console.log("🚀 MAIN INICIADO");

  try {
    const app = document.getElementById('app');

    if (!app) {
      console.error("❌ #app não encontrada");
      return;
    }

    console.log("✅ #app encontrada");

    // 🔥 AGORA GARANTE QUE DOM ESTÁ PRONTO MESMO
    await import('./app.js');

    console.log("✅ app.js carregado");

  } catch (error) {
    console.error("❌ Erro:", error);
  }
});

// SERVICE WORKER
if ('serviceWorker' in navigator && location.hostname !== "localhost") {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
