import './style.css';

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 MAIN INICIADO");

  try {
    const app = document.getElementById('app');

    if (!app) {
      console.error("❌ ERRO CRÍTICO: div #app não encontrada");
      return;
    }

    console.log("✅ #app encontrada");

    // ❌ REMOVA ISSO (NUNCA MAIS USE)
    // app.innerHTML = "";

    // ✅ IMPORTA APP SEM DESTRUIR HTML
    await import('./app.js');

    console.log("✅ app.js carregado com sucesso");

  } catch (error) {
    console.error("❌ ERRO ao carregar app.js:", error);
  }
});

// SW
if ('serviceWorker' in navigator && location.hostname !== "localhost") {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ SW registrado:', reg))
      .catch(err => console.log('❌ Erro SW:', err));
  });
}
